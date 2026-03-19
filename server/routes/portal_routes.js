/**
 * Core Portal API Routes
 * 
 * Complete Job Portal + Interview Management:
 * - Job listings, search, and CRUD (Employer)
 * - Application management (Candidate + Employer)
 * - Interview scheduling and feedback
 * - Profile management
 * - Dashboard stats
 * - Screening results
 */

import express from 'express';
import { requireRole } from '../middleware/auth.js';
import { sanitizeSearchParam } from '../utils/security.js';
import {
    onApplicationSubmitted,
    onJobCreated,
    onCandidateProfileCreated,
    logAudit
} from '../engine/workflow_engine.js';

const requireEmployer = requireRole('employer');
const requireCandidate = requireRole('candidate');

export function setupPortalRoutes(app, supabase, authenticateUser) {

    // ==================== JOB MANAGEMENT ====================

    /**
     * Get all jobs with filtering & pagination (Public)
     * GET /api/jobs
     */
    app.get('/api/jobs', async (req, res) => {
        try {
            const { search, location, type, work_mode, employment_type, category, salary_min, salary_max, experience_min, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('employer_job_posts')
                .select(`
                    *,
                    employer:users!employer_job_posts_employer_id_fkey(id, name, avatar_url)
                `, { count: 'exact' })
                .eq('status', 'active');

            if (search) {
                const safeSearch = sanitizeSearchParam(search);
                if (safeSearch) query = query.or(`title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`);
            }
            if (location) query = query.ilike('location', `%${location}%`);
            if (work_mode) query = query.eq('work_mode', work_mode);
            if (employment_type) query = query.eq('employment_type', employment_type);
            if (salary_min) query = query.gte('salary_min', parseFloat(salary_min));
            if (salary_max) query = query.lte('salary_max', parseFloat(salary_max));
            if (experience_min !== undefined) query = query.gte('experience_min', parseInt(experience_min));

            const { data, count, error } = await query
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                jobs: data || [],
                total: count || 0,
                page: parseInt(page),
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            res.status(500).json({ error: 'Failed to fetch jobs' });
        }
    });

    /**
     * Get single job details (Public)
     * GET /api/jobs/:id
     */
    app.get('/api/jobs/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('employer_job_posts')
                .select(`
                    *,
                    employer:users!employer_job_posts_employer_id_fkey(id, name, avatar_url)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            // Increment views count
            await supabase
                .from('employer_job_posts')
                .update({ views_count: (data.views_count || 0) + 1 })
                .eq('id', id);

            res.json({
                success: true,
                job: data
            });
        } catch (error) {
            console.error('Error fetching job details:', error);
            res.status(500).json({ error: 'Failed to fetch job details' });
        }
    });

    /**
     * Create a new job (Employer only)
     * POST /api/jobs
     */
    app.post('/api/jobs', authenticateUser, async (req, res) => {
        try {
            const {
                title, description, requirements, responsibilities,
                skills, location, country, work_mode, employment_type,
                experience_min, experience_max, salary_min, salary_max, salary_currency,
                education_required, benefits, job_type, is_featured, is_urgent, expires_at
            } = req.body;
            const employer_id = req.user.id;

            if (!title) return res.status(400).json({ error: 'Job title is required' });

            const JOB_COSTS = {
                'basic': 10,
                'standard': 15,
                'premium': 25,
                'urgent': 30,
                'interview': 40,
                'free': 0
            };

            const requiredCredits = JOB_COSTS[job_type] || 0;

            // Check Wallet Balance
            let { data: wallet } = await supabase
                .from('wallet')
                .select('id, balance')
                .eq('employer_id', employer_id)
                .single();

            let currentBalance = 0;
            let walletId = null;

            if (wallet) {
                currentBalance = wallet.balance;
                walletId = wallet.id;
            } else {
                // Check user table fallback
                const { data: user } = await supabase.from('users').select('wallet_balance').eq('id', employer_id).single();
                currentBalance = user?.wallet_balance || 0;
            }

            if (currentBalance < requiredCredits) {
                return res.status(402).json({ error: `Insufficient credits. Required: ${requiredCredits}, Available: ${currentBalance}` });
            }

            // Deduct Credits if cost > 0
            if (requiredCredits > 0) {
                if (walletId) {
                    const { error: walletError } = await supabase.from('wallet').update({ balance: currentBalance - requiredCredits }).eq('id', walletId);
                    if (walletError) throw walletError;
                } else {
                    const { error: userError } = await supabase.from('users').update({ wallet_balance: currentBalance - requiredCredits }).eq('id', employer_id);
                    if (userError) throw userError;
                }

                // Log Transaction
                await supabase.from('wallet_transactions').insert([{
                    employer_id,
                    amount: -requiredCredits,
                    type: 'debit',
                    status: 'completed',
                    description: `Job Posting: ${title} (${job_type})`,
                    metadata: { job_type }
                }]);
            }

            const { data, error } = await supabase
                .from('employer_job_posts')
                .insert([{
                    employer_id,
                    title,
                    description,
                    requirements,
                    responsibilities,
                    skills: skills || [],
                    location,
                    country: country || 'IN',
                    work_mode: work_mode || 'Remote',
                    employment_type: employment_type || 'Full-time',
                    experience_min: experience_min || 0,
                    experience_max,
                    salary_min,
                    salary_max,
                    salary_currency: salary_currency || 'INR',
                    education_required: education_required || [],
                    benefits: benefits || [],
                    job_type: job_type || 'free',
                    is_featured: is_featured || false,
                    is_urgent: is_urgent || false,
                    status: 'active',
                    expires_at
                }])
                .select();

            if (error) throw error;

            // Update employer job count
            await supabase.rpc('increment_employer_job_count', { emp_id: employer_id }).catch(() => {
                // RPC may not exist, manually update
                supabase.from('employers')
                    .update({ job_posts_count: supabase.raw('job_posts_count + 1') })
                    .eq('user_id', employer_id)
                    .then(() => { });
            });

            // [PHASE 6] Trigger AI screening criteria generation (async, non-blocking)
            if (data && data[0]) {
                onJobCreated(supabase, data[0].id, null).catch(e =>
                    console.error('[Workflow] Job AI enhancement failed:', e.message)
                );
                await logAudit(supabase, 'employer', employer_id, 'job_created', 'employer_job_posts', data[0].id);
            }

            res.json({
                success: true,
                job: data[0]
            });
        } catch (error) {
            console.error('Error creating job:', error);
            res.status(500).json({ error: 'Failed to create job' });
        }
    });

    /**
     * Update a job (Employer only)
     * PUT /api/jobs/:id
     */
    app.put('/api/jobs/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const employer_id = req.user.id;

            // Verify ownership
            const { data: existing, error: fetchError } = await supabase
                .from('employer_job_posts')
                .select('employer_id')
                .eq('id', id)
                .single();

            if (fetchError || !existing) return res.status(404).json({ error: 'Job not found' });
            if (existing.employer_id !== employer_id) return res.status(403).json({ error: 'Unauthorized' });

            const {
                title, description, requirements, responsibilities,
                skills, location, country, work_mode, employment_type,
                experience_min, experience_max, salary_min, salary_max, salary_currency,
                education_required, benefits, job_type, status, is_featured, is_urgent, expires_at
            } = req.body;

            const updateData = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (requirements !== undefined) updateData.requirements = requirements;
            if (responsibilities !== undefined) updateData.responsibilities = responsibilities;
            if (skills !== undefined) updateData.skills = skills;
            if (location !== undefined) updateData.location = location;
            if (country !== undefined) updateData.country = country;
            if (work_mode !== undefined) updateData.work_mode = work_mode;
            if (employment_type !== undefined) updateData.employment_type = employment_type;
            if (experience_min !== undefined) updateData.experience_min = experience_min;
            if (experience_max !== undefined) updateData.experience_max = experience_max;
            if (salary_min !== undefined) updateData.salary_min = salary_min;
            if (salary_max !== undefined) updateData.salary_max = salary_max;
            if (salary_currency !== undefined) updateData.salary_currency = salary_currency;
            if (education_required !== undefined) updateData.education_required = education_required;
            if (benefits !== undefined) updateData.benefits = benefits;
            if (job_type !== undefined) updateData.job_type = job_type;
            if (status !== undefined) updateData.status = status;
            if (is_featured !== undefined) updateData.is_featured = is_featured;
            if (is_urgent !== undefined) updateData.is_urgent = is_urgent;
            if (expires_at !== undefined) updateData.expires_at = expires_at;
            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('employer_job_posts')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;

            res.json({
                success: true,
                job: data[0]
            });
        } catch (error) {
            console.error('Error updating job:', error);
            res.status(500).json({ error: 'Failed to update job' });
        }
    });

    /**
     * Delete a job (Employer only)
     * DELETE /api/jobs/:id
     */
    app.delete('/api/jobs/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const employer_id = req.user.id;

            // Verify ownership
            const { data: existing, error: fetchError } = await supabase
                .from('employer_job_posts')
                .select('employer_id')
                .eq('id', id)
                .single();

            if (fetchError || !existing) return res.status(404).json({ error: 'Job not found' });
            if (existing.employer_id !== employer_id) return res.status(403).json({ error: 'Unauthorized' });

            const { error } = await supabase
                .from('employer_job_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.json({ success: true, message: 'Job deleted successfully' });
        } catch (error) {
            console.error('Error deleting job:', error);
            res.status(500).json({ error: 'Failed to delete job' });
        }
    });

    /**
     * Close/Archive a job (Employer only)
     * PATCH /api/jobs/:id/close
     */
    app.patch('/api/jobs/:id/close', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const employer_id = req.user.id;

            const { data: existing } = await supabase
                .from('employer_job_posts')
                .select('employer_id')
                .eq('id', id)
                .single();

            if (!existing || existing.employer_id !== employer_id) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const { data, error } = await supabase
                .from('employer_job_posts')
                .update({ status: 'closed', updated_at: new Date().toISOString() })
                .eq('id', id)
                .select();

            if (error) throw error;

            res.json({ success: true, job: data[0] });
        } catch (error) {
            console.error('Error closing job:', error);
            res.status(500).json({ error: 'Failed to close job' });
        }
    });

    /**
     * Duplicate a job (Employer only)
     * POST /api/jobs/:id/duplicate
     */
    app.post('/api/jobs/:id/duplicate', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const employer_id = req.user.id;

            const { data: original, error: fetchError } = await supabase
                .from('employer_job_posts')
                .select('*')
                .eq('id', id)
                .eq('employer_id', employer_id)
                .single();

            if (fetchError || !original) return res.status(404).json({ error: 'Job not found' });

            // Create duplicate with draft status
            const { id: _, created_at, updated_at, application_count, views_count, ...jobData } = original;
            const { data, error } = await supabase
                .from('employer_job_posts')
                .insert([{
                    ...jobData,
                    title: `${original.title} (Copy)`,
                    status: 'draft',
                    application_count: 0,
                    views_count: 0
                }])
                .select();

            if (error) throw error;

            res.json({ success: true, job: data[0] });
        } catch (error) {
            console.error('Error duplicating job:', error);
            res.status(500).json({ error: 'Failed to duplicate job' });
        }
    });

    /**
     * Get jobs posted by current employer
     * GET /api/employer/jobs
     */
    app.get('/api/employer/jobs', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;
            const { status, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('employer_job_posts')
                .select('*', { count: 'exact' })
                .eq('employer_id', employer_id);

            if (status) query = query.eq('status', status);

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                jobs: data || [],
                total: count || 0,
                page: parseInt(page),
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            });
        } catch (error) {
            console.error('Error fetching employer jobs:', error);
            res.status(500).json({ error: 'Failed to fetch your jobs' });
        }
    });

    /**
     * Get applicants for a specific job (Employer only)
     * GET /api/employer/jobs/:jobId/applicants
     */
    app.get('/api/employer/jobs/:jobId/applicants', authenticateUser, async (req, res) => {
        try {
            const { jobId } = req.params;
            const employer_id = req.user.id;

            // Verify ownership
            const { data: job } = await supabase
                .from('employer_job_posts')
                .select('employer_id')
                .eq('id', jobId)
                .single();

            if (!job || job.employer_id !== employer_id) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const { data, error } = await supabase
                .from('job_applications')
                .select(`
                    *,
                    candidate:users!job_applications_candidate_id_fkey(id, name, email, avatar_url, phone)
                `)
                .eq('job_id', jobId)
                .order('applied_at', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                applicants: data || []
            });
        } catch (error) {
            console.error('Error fetching applicants:', error);
            res.status(500).json({ error: 'Failed to fetch applicants' });
        }
    });

    // ==================== APPLICATION MANAGEMENT ====================

    /**
     * Submit an application (Candidate only)
     * POST /api/applications
     */
    app.post('/api/applications', authenticateUser, async (req, res) => {
        try {
            const { job_id, resume_url, cover_letter } = req.body;
            const candidate_id = req.user.id;

            if (!job_id) return res.status(400).json({ error: 'Job ID is required' });

            // Check if job exists and is active
            const { data: job, error: jobError } = await supabase
                .from('employer_job_posts')
                .select('id, status, title')
                .eq('id', job_id)
                .single();

            if (jobError || !job) return res.status(404).json({ error: 'Job not found' });
            if (job.status !== 'active') return res.status(400).json({ error: 'This job is no longer accepting applications' });

            // Check for duplicate application
            const { data: existingApp } = await supabase
                .from('job_applications')
                .select('id')
                .eq('job_id', job_id)
                .eq('candidate_id', candidate_id)
                .single();

            if (existingApp) return res.status(409).json({ error: 'You have already applied for this job' });

            const { data, error } = await supabase
                .from('job_applications')
                .insert([{
                    job_id,
                    candidate_id,
                    resume_url,
                    cover_letter,
                    status: 'applied',
                    applied_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;

            // Increment application count on the job
            await supabase
                .from('employer_job_posts')
                .update({ application_count: (job.application_count || 0) + 1 })
                .eq('id', job_id);

            // Log candidate activity
            await supabase.from('candidate_activity_log').insert([{
                user_id: candidate_id,
                action: 'applied_to_job',
                entity_type: 'job',
                entity_id: String(job_id),
                metadata: { job_title: job.title }
            }]).catch(() => { });

            // [PHASE 5] Trigger autonomous screening pipeline (async, non-blocking)
            if (data && data[0]) {
                onApplicationSubmitted(supabase, data[0].id, null).catch(e =>
                    console.error('[Workflow] Application automation failed:', e.message)
                );
                await logAudit(supabase, 'candidate', candidate_id, 'application_submitted', 'job_applications', data[0].id);
            }

            res.json({
                success: true,
                application: data[0]
            });
        } catch (error) {
            console.error('Error submitting application:', error);
            res.status(500).json({ error: 'Failed to submit application' });
        }
    });

    /**
     * Get Candidate Profile
     * GET /api/profile
     */
    app.get('/api/profile', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;
            const supabase = req.supabase;
            // Parallel fetches for performance
            let user = null;
            let candidate = null;
            let experience = [];
            let skills = [];

            // 1. Get User
            const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', user_id).single();
            if (userError) throw userError;
            user = userData;

            // 2. Get Extended Candidate Profile
            const { data: candidateData } = await supabase.from('candidates').select('*').eq('user_id', user_id).single();
            candidate = candidateData;

            // 3. Get Experience
            const { data: expData } = await supabase.from('candidate_experience').select('*').eq('user_id', user_id);
            experience = expData || [];

            // 4. Get Skills
            const { data: skillData } = await supabase.from('candidate_skills').select('*').eq('user_id', user_id);
            skills = skillData || [];

            // Merge data
            // Priority: candidate table > user table
            const profileData = {
                ...user,
                ...(candidate || {}), // Overrides user fields if present
                id: user.id,
                name: candidate?.name || user.name,
                email: user.email,
                avatar_url: candidate?.avatar_url || user.avatar_url,
                // Add legacy/convenience fields for frontend compatibility
                profile: {
                    title: candidate?.title || candidate?.job_profile || user.title || 'Job Seeker',
                },
                bio: candidate?.bio || user.bio || '',
                location: candidate?.location || user.location || 'Remote',
                video_resume_url: candidate?.video_resume_url || user.video_resume_url, // assuming consistent naming
                experience: experience,
                skills: skills ? skills.map(s => s.skill) : [],
                skills_detailed: skills,
                // [PHASE 7] New AI & Scoring Fields
                ai_overall_score: candidate?.ai_overall_score || 0,
                interview_readiness_score: candidate?.interview_readiness_score || 0,
                profile_completeness_score: candidate?.profile_completeness_score || 0,
                fraud_detection_flag: candidate?.fraud_detection_flag || false,
                ai_strengths: candidate?.ai_strengths || [],
                ai_weaknesses: candidate?.ai_weaknesses || [],
                ai_improvement_suggestions: candidate?.ai_improvement_suggestions || [],
                communication_score: candidate?.communication_score || 0,
                skill_match_score: candidate?.skill_match_score || 0,
                ai_evaluation_status: candidate?.ai_evaluation_status || 'pending'
            };

            res.json({
                success: true,
                user: profileData
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    });

    /**
     * Get applications for a candidate
     * GET /api/applications/candidate
     */
    app.get('/api/applications/candidate', authenticateUser, async (req, res) => {
        try {
            const candidate_id = req.user.id;
            const { status, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('job_applications')
                .select(`
                    *,
                    job:employer_job_posts(id, title, location, work_mode, employment_type, salary_min, salary_max, salary_currency, status, employer_id,
                        employer:users!employer_job_posts_employer_id_fkey(name, avatar_url)
                    )
                `, { count: 'exact' })
                .eq('candidate_id', candidate_id);

            if (status) query = query.eq('status', status);

            const { data, count, error } = await query
                .order('applied_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                applications: data || [],
                total: count || 0,
                page: parseInt(page),
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ error: 'Failed to fetch applications' });
        }
    });

    /**
     * Get all applications for an employer (all jobs)
     * GET /api/applications/employer
     */
    app.get('/api/applications/employer', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;
            const { status, job_id, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('job_applications')
                .select(`
                    *,
                    job:employer_job_posts!inner(id, title, employer_id),
                    candidate:users!job_applications_candidate_id_fkey(id, name, email, avatar_url, phone)
                `, { count: 'exact' })
                .eq('employer_job_posts.employer_id', employer_id);

            if (status) query = query.eq('status', status);
            if (job_id) query = query.eq('job_id', parseInt(job_id));

            const { data, count, error } = await query
                .order('applied_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                applications: data || [],
                total: count || 0,
                page: parseInt(page),
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            });
        } catch (error) {
            console.error('Error fetching employer applications:', error);
            res.status(500).json({ error: 'Failed to fetch applications' });
        }
    });

    /**
     * Update application status (Employer only)
     * PUT /api/applications/:id/status
     */
    app.put('/api/applications/:id/status', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const { status, rejection_reason, notes } = req.body;
            const employer_id = req.user.id;

            const validStatuses = ['applied', 'pending', 'screened', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            // Verify employer owns the job this application is for
            const { data: application, error: fetchError } = await supabase
                .from('job_applications')
                .select('*, job:employer_job_posts(employer_id)')
                .eq('id', id)
                .single();

            if (fetchError || !application) return res.status(404).json({ error: 'Application not found' });
            if (application.job.employer_id !== employer_id) return res.status(403).json({ error: 'Unauthorized' });

            const updateData = {
                status,
                updated_at: new Date().toISOString()
            };
            if (rejection_reason) updateData.rejection_reason = rejection_reason;
            if (notes) updateData.notes = notes;

            const { data, error } = await supabase
                .from('job_applications')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;

            // Log employer activity
            await supabase.from('employer_activity_log').insert([{
                employer_id,
                action: `application_${status}`,
                entity_type: 'application',
                entity_id: String(id),
                metadata: { new_status: status }
            }]).catch(() => { });

            res.json({
                success: true,
                application: data[0]
            });
        } catch (error) {
            console.error('Error updating application status:', error);
            res.status(500).json({ error: 'Failed to update status' });
        }
    });

    /**
     * Withdraw application (Candidate only)
     * PATCH /api/applications/:id/withdraw
     */
    app.patch('/api/applications/:id/withdraw', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const candidate_id = req.user.id;

            const { data: application } = await supabase
                .from('job_applications')
                .select('candidate_id, status')
                .eq('id', id)
                .single();

            if (!application || application.candidate_id !== candidate_id) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            if (['hired', 'withdrawn'].includes(application.status)) {
                return res.status(400).json({ error: 'Cannot withdraw this application' });
            }

            const { data, error } = await supabase
                .from('job_applications')
                .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
                .eq('id', id)
                .select();

            if (error) throw error;

            res.json({ success: true, application: data[0] });
        } catch (error) {
            console.error('Error withdrawing application:', error);
            res.status(500).json({ error: 'Failed to withdraw application' });
        }
    });

    // ==================== INTERVIEW MANAGEMENT ====================

    /**
     * Schedule an interview (Employer only)
     * POST /api/interviews
     */
    app.post('/api/interviews', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;
            const {
                application_id, candidate_id, job_id,
                scheduled_date, duration, round, type, meeting_link, notes
            } = req.body;

            if (!candidate_id || !scheduled_date) {
                return res.status(400).json({ error: 'Candidate ID and scheduled date are required' });
            }

            const { data, error } = await supabase
                .from('interviews')
                .insert([{
                    application_id,
                    candidate_id,
                    employer_id,
                    job_id,
                    scheduled_date,
                    duration: duration || 60,
                    round: round || 'screening',
                    type: type || 'Video',
                    meeting_link,
                    notes,
                    status: 'scheduled'
                }])
                .select();

            if (error) throw error;

            // Update application status
            if (application_id) {
                await supabase
                    .from('job_applications')
                    .update({ status: 'interview_scheduled', updated_at: new Date().toISOString() })
                    .eq('id', application_id);
            }

            // Create notification for candidate
            await supabase.from('notifications').insert([{
                user_id: candidate_id,
                title: 'Interview Scheduled',
                message: `You have a new ${round || 'screening'} interview scheduled for ${new Date(scheduled_date).toLocaleDateString()}`,
                type: 'action_required',
                category: 'interview',
                action_url: '/candidate/interviews'
            }]).catch(() => { });

            res.json({
                success: true,
                interview: data[0]
            });
        } catch (error) {
            console.error('Error scheduling interview:', error);
            res.status(500).json({ error: 'Failed to schedule interview' });
        }
    });

    /**
     * Update interview (Employer only)
     * PUT /api/interviews/:id
     */
    app.put('/api/interviews/:id', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const employer_id = req.user.id;

            const { data: existing } = await supabase
                .from('interviews')
                .select('employer_id')
                .eq('id', id)
                .single();

            if (!existing || existing.employer_id !== employer_id) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const { scheduled_date, duration, round, type, meeting_link, status, score, notes } = req.body;

            const updateData = { updated_at: new Date().toISOString() };
            if (scheduled_date !== undefined) updateData.scheduled_date = scheduled_date;
            if (duration !== undefined) updateData.duration = duration;
            if (round !== undefined) updateData.round = round;
            if (type !== undefined) updateData.type = type;
            if (meeting_link !== undefined) updateData.meeting_link = meeting_link;
            if (status !== undefined) updateData.status = status;
            if (score !== undefined) updateData.score = score;
            if (notes !== undefined) updateData.notes = notes;

            const { data, error } = await supabase
                .from('interviews')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;

            res.json({ success: true, interview: data[0] });
        } catch (error) {
            console.error('Error updating interview:', error);
            res.status(500).json({ error: 'Failed to update interview' });
        }
    });

    /**
     * Cancel interview
     * PATCH /api/interviews/:id/cancel
     */
    app.patch('/api/interviews/:id/cancel', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id;

            const { data: interview } = await supabase
                .from('interviews')
                .select('employer_id, candidate_id')
                .eq('id', id)
                .single();

            if (!interview || (interview.employer_id !== user_id && interview.candidate_id !== user_id)) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const { data, error } = await supabase
                .from('interviews')
                .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                .eq('id', id)
                .select();

            if (error) throw error;

            res.json({ success: true, interview: data[0] });
        } catch (error) {
            console.error('Error cancelling interview:', error);
            res.status(500).json({ error: 'Failed to cancel interview' });
        }
    });

    /**
     * Submit interview feedback (Employer/Interviewer)
     * POST /api/interviews/:id/feedback
     */
    app.post('/api/interviews/:id/feedback', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const interviewer_id = req.user.id;
            const {
                overall_rating, technical_score, communication_score,
                cultural_fit_score, problem_solving_score,
                strengths, weaknesses, recommendation, detailed_feedback, score_breakdown
            } = req.body;

            const { data, error } = await supabase
                .from('interview_feedback')
                .insert([{
                    interview_id: parseInt(id),
                    interviewer_id,
                    overall_rating,
                    technical_score,
                    communication_score,
                    cultural_fit_score,
                    problem_solving_score,
                    strengths,
                    weaknesses,
                    recommendation,
                    detailed_feedback,
                    score_breakdown: score_breakdown || {}
                }])
                .select();

            if (error) throw error;

            // Update interview status to completed and set score
            await supabase
                .from('interviews')
                .update({
                    status: 'completed',
                    score: overall_rating ? overall_rating * 20 : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            res.json({ success: true, feedback: data[0] });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            res.status(500).json({ error: 'Failed to submit feedback' });
        }
    });

    /**
     * Get feedback for an interview
     * GET /api/interviews/:id/feedback
     */
    app.get('/api/interviews/:id/feedback', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('interview_feedback')
                .select(`
                    *,
                    interviewer:users!interview_feedback_interviewer_id_fkey(name, avatar_url)
                `)
                .eq('interview_id', parseInt(id));

            if (error) throw error;

            res.json({ success: true, feedback: data || [] });
        } catch (error) {
            console.error('Error fetching feedback:', error);
            res.status(500).json({ error: 'Failed to fetch feedback' });
        }
    });

    /**
     * Get candidate interviews (My Interviews)
     * GET /api/interviews/candidate
     */
    app.get('/api/interviews/candidate', authenticateUser, async (req, res) => {
        try {
            const candidate_id = req.user.id;
            const { status } = req.query;

            let query = supabase
                .from('interviews')
                .select(`
                    *,
                    job:employer_job_posts(id, title, location, work_mode),
                    employer:users!interviews_employer_id_fkey(name, avatar_url)
                `)
                .eq('candidate_id', candidate_id);

            if (status) query = query.eq('status', status);

            const { data, error } = await query
                .order('scheduled_date', { ascending: true });

            if (error) throw error;

            res.json({
                success: true,
                interviews: data || []
            });
        } catch (error) {
            console.error('Error fetching candidate interviews:', error);
            res.status(500).json({ error: 'Failed to fetch interviews' });
        }
    });

    /**
     * Get employer interviews
     * GET /api/interviews/employer
     */
    app.get('/api/interviews/employer', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;
            const { status, job_id } = req.query;

            let query = supabase
                .from('interviews')
                .select(`
                    *,
                    candidate:users!interviews_candidate_id_fkey(id, name, email, avatar_url, phone),
                    job:employer_job_posts(id, title)
                `)
                .eq('employer_id', employer_id);

            if (status) query = query.eq('status', status);
            if (job_id) query = query.eq('job_id', parseInt(job_id));

            const { data, error } = await query
                .order('scheduled_date', { ascending: true });

            if (error) throw error;

            res.json({
                success: true,
                interviews: data || []
            });
        } catch (error) {
            console.error('Error fetching employer interviews:', error);
            res.status(500).json({ error: 'Failed to fetch interviews' });
        }
    });

    // ==================== SCREENING RESULTS ====================

    /**
     * Get screening results for an application
     * GET /api/screening/:applicationId
     */
    app.get('/api/screening/:applicationId', authenticateUser, async (req, res) => {
        try {
            const { applicationId } = req.params;

            const { data, error } = await supabase
                .from('screening_results')
                .select('*')
                .eq('application_id', parseInt(applicationId))
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.json({ success: true, results: data || [] });
        } catch (error) {
            console.error('Error fetching screening results:', error);
            res.status(500).json({ error: 'Failed to fetch screening results' });
        }
    });

    /**
     * Submit AI screening result
     * POST /api/screening
     */
    app.post('/api/screening', authenticateUser, async (req, res) => {
        try {
            const {
                application_id, candidate_id, job_id, screening_type,
                overall_score, skill_match_score, experience_match_score, education_match_score,
                score_breakdown, ai_summary, recommendation
            } = req.body;

            const { data, error } = await supabase
                .from('screening_results')
                .insert([{
                    application_id,
                    candidate_id,
                    job_id,
                    screening_type: screening_type || 'ai_resume',
                    overall_score,
                    skill_match_score,
                    experience_match_score,
                    education_match_score,
                    score_breakdown: score_breakdown || {},
                    ai_summary,
                    recommendation
                }])
                .select();

            if (error) throw error;

            // Update application with AI screening score
            if (application_id && overall_score) {
                await supabase
                    .from('job_applications')
                    .update({
                        ai_screening_score: overall_score,
                        status: 'screened',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', application_id);
            }

            res.json({ success: true, result: data[0] });
        } catch (error) {
            console.error('Error submitting screening result:', error);
            res.status(500).json({ error: 'Failed to submit screening result' });
        }
    });

    // ==================== DASHBOARD STATS ====================

    /**
     * Get employer dashboard stats
     * GET /api/employer/stats
     */
    app.get('/api/employer/stats', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;

            // Get jobs count
            const { count: activeJobs } = await supabase
                .from('employer_job_posts')
                .select('*', { count: 'exact', head: true })
                .eq('employer_id', employer_id)
                .eq('status', 'active');

            const { count: totalJobs } = await supabase
                .from('employer_job_posts')
                .select('*', { count: 'exact', head: true })
                .eq('employer_id', employer_id);

            // Get application counts (via job_id join)
            const { data: employerJobs } = await supabase
                .from('employer_job_posts')
                .select('id')
                .eq('employer_id', employer_id);

            const jobIds = (employerJobs || []).map(j => j.id);

            let totalApps = 0, shortlisted = 0, hired = 0, interviewsScheduled = 0;

            if (jobIds.length > 0) {
                const { count: appCount } = await supabase
                    .from('job_applications')
                    .select('*', { count: 'exact', head: true })
                    .in('job_id', jobIds);
                totalApps = appCount || 0;

                const { count: shortlistedCount } = await supabase
                    .from('job_applications')
                    .select('*', { count: 'exact', head: true })
                    .in('job_id', jobIds)
                    .eq('status', 'shortlisted');
                shortlisted = shortlistedCount || 0;

                const { count: hiredCount } = await supabase
                    .from('job_applications')
                    .select('*', { count: 'exact', head: true })
                    .in('job_id', jobIds)
                    .eq('status', 'hired');
                hired = hiredCount || 0;
            }

            // Get interviews count
            const { count: interviews } = await supabase
                .from('interviews')
                .select('*', { count: 'exact', head: true })
                .eq('employer_id', employer_id)
                .eq('status', 'scheduled');
            interviewsScheduled = interviews || 0;

            res.json({
                success: true,
                stats: {
                    activeJobs: activeJobs || 0,
                    totalJobs: totalJobs || 0,
                    totalApplications: totalApps,
                    shortlisted,
                    hired,
                    interviewsScheduled,
                    pending: totalApps - shortlisted - hired
                }
            });
        } catch (error) {
            console.error('Error fetching employer stats:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    });

    /**
     * Get candidate dashboard stats
     * GET /api/candidate/stats
     */
    app.get('/api/candidate/stats', authenticateUser, async (req, res) => {
        try {
            const candidate_id = req.user.id;

            const { count: totalApplications } = await supabase
                .from('job_applications')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_id', candidate_id);

            const { count: shortlisted } = await supabase
                .from('job_applications')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_id', candidate_id)
                .eq('status', 'shortlisted');

            const { count: interviewsScheduled } = await supabase
                .from('interviews')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_id', candidate_id)
                .eq('status', 'scheduled');

            const { count: offers } = await supabase
                .from('job_applications')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_id', candidate_id)
                .eq('status', 'offered');

            const { count: rejected } = await supabase
                .from('job_applications')
                .select('*', { count: 'exact', head: true })
                .eq('candidate_id', candidate_id)
                .eq('status', 'rejected');

            // Get assessments count (graceful if table doesn't exist yet)
            let assessments = 0;
            try {
                const { count: assessmentCount } = await supabase
                    .from('assessment_results')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', candidate_id);
                assessments = assessmentCount || 0;
            } catch (e) {
                console.warn('assessment_results table may not exist:', e.message);
            }

            res.json({
                success: true,
                stats: {
                    totalApplications: totalApplications || 0,
                    shortlisted: shortlisted || 0,
                    interviewsScheduled: interviewsScheduled || 0,
                    offers: offers || 0,
                    rejected: rejected || 0,
                    assessments: assessments || 0
                }
            });
        } catch (error) {
            console.error('Error fetching candidate stats:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    });



    /**
     * Update user profile
     * PUT /api/profile
     */
    app.put('/api/profile', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;
            const { name, phone, avatar_url, profile_data, role_data } = req.body;

            // Update base user table
            const userUpdate = { updated_at: new Date().toISOString() };
            if (name !== undefined) userUpdate.name = name;
            if (phone !== undefined) userUpdate.phone = phone;
            if (avatar_url !== undefined) userUpdate.avatar_url = avatar_url;

            const { data: user, error: userError } = await supabase
                .from('users')
                .update(userUpdate)
                .eq('id', user_id)
                .select();

            if (userError) throw userError;

            // Update user_profiles if profile_data provided
            if (profile_data) {
                await supabase
                    .from('user_profiles')
                    .upsert({
                        user_id,
                        ...profile_data,
                        updated_at: new Date().toISOString()
                    });
            }

            // Update role-specific data
            if (role_data && user[0].role === 'candidate') {
                await supabase
                    .from('candidates')
                    .upsert({
                        user_id,
                        ...role_data,
                        updated_at: new Date().toISOString()
                    });
            } else if (role_data && user[0].role === 'employer') {
                await supabase
                    .from('employers')
                    .upsert({
                        user_id,
                        ...role_data,
                        updated_at: new Date().toISOString()
                    });
            }

            res.json({
                success: true,
                user: user[0]
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    });

    /**
     * Get employer company profile
     * GET /api/employer/profile
     */
    app.get('/api/employer/profile', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;

            const { data, error } = await supabase
                .from('employers')
                .select('*')
                .eq('user_id', employer_id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            res.json({
                success: true,
                employer: data || null
            });
        } catch (error) {
            console.error('Error fetching employer profile:', error);
            res.status(500).json({ error: 'Failed to fetch employer profile' });
        }
    });

    /**
     * Update employer company profile
     * PUT /api/employer/profile
     */
    app.put('/api/employer/profile', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;
            const {
                company_name, company_logo, company_website, industry, company_size,
                description, hq_location, country, gst_number, pan_number,
                contact_person, contact_email, contact_phone, social_links
            } = req.body;

            const updateData = { updated_at: new Date().toISOString() };
            if (company_name !== undefined) updateData.company_name = company_name;
            if (company_logo !== undefined) updateData.company_logo = company_logo;
            if (company_website !== undefined) updateData.company_website = company_website;
            if (industry !== undefined) updateData.industry = industry;
            if (company_size !== undefined) updateData.company_size = company_size;
            if (description !== undefined) updateData.description = description;
            if (hq_location !== undefined) updateData.hq_location = hq_location;
            if (country !== undefined) updateData.country = country;
            if (gst_number !== undefined) updateData.gst_number = gst_number;
            if (pan_number !== undefined) updateData.pan_number = pan_number;
            if (contact_person !== undefined) updateData.contact_person = contact_person;
            if (contact_email !== undefined) updateData.contact_email = contact_email;
            if (contact_phone !== undefined) updateData.contact_phone = contact_phone;
            if (social_links !== undefined) updateData.social_links = social_links;

            const { data, error } = await supabase
                .from('employers')
                .upsert({
                    user_id: employer_id,
                    ...updateData
                })
                .select();

            if (error) throw error;

            res.json({ success: true, employer: data[0] });
        } catch (error) {
            console.error('Error updating employer profile:', error);
            res.status(500).json({ error: 'Failed to update employer profile' });
        }
    });

    // ==================== NOTIFICATIONS ====================

    /**
     * Get user notifications
     * GET /api/notifications
     */
    app.get('/api/notifications', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;
            const { unread_only, page = 1, limit = 20 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', user_id);

            if (unread_only === 'true') query = query.eq('is_read', false);

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                notifications: data || [],
                total: count || 0,
                unread: count || 0
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    });

    /**
     * Mark notification as read
     * PATCH /api/notifications/:id/read
     */
    app.patch('/api/notifications/:id/read', authenticateUser, async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id;

            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', user_id)
                .select();

            if (error) throw error;

            res.json({ success: true, notification: data[0] });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ error: 'Failed to update notification' });
        }
    });

    /**
     * Mark all notifications as read
     * PATCH /api/notifications/read-all
     */
    app.patch('/api/notifications/read-all', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('user_id', user_id)
                .eq('is_read', false);

            if (error) throw error;

            res.json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Error marking all as read:', error);
            res.status(500).json({ error: 'Failed to update notifications' });
        }
    });

}
