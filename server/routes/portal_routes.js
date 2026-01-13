/**
 * Core Portal API Routes
 * 
 * Handles common functionality for candidates and employers:
 * - Job listings and search
 * - Application management
 * - Profile management
 */

import express from 'express';

export function setupPortalRoutes(app, supabase, authenticateUser) {

    // ==================== JOB MANAGEMENT ====================

    /**
     * Get all jobs with filtering
     * GET /api/jobs
     */
    app.get('/api/jobs', async (req, res) => {
        try {
            const { search, location, type, work_mode } = req.query;

            let query = supabase
                .from('jobs')
                .select(`
                    *,
                    employer:users(name, avatar_url)
                `)
                .eq('status', 'active');

            if (search) {
                query = query.ilike('title', `%${search}%`);
            }
            if (location) {
                query = query.ilike('location', `%${location}%`);
            }
            if (type) {
                query = query.eq('type', type);
            }
            if (work_mode) {
                query = query.eq('work_mode', work_mode);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                jobs: data || []
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            res.status(500).json({ error: 'Failed to fetch jobs' });
        }
    });

    /**
     * Get single job details
     * GET /api/jobs/:id
     */
    app.get('/api/jobs/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('jobs')
                .select(`
                    *,
                    employer:users(id, name, avatar_url, bio)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

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
            const { title, description, requirements, skills, location, work_mode, type, salary_min, salary_max, job_type } = req.body;
            const employer_id = req.user.id;

            const { data, error } = await supabase
                .from('jobs')
                .insert([{
                    employer_id,
                    title,
                    description,
                    requirements,
                    skills,
                    location,
                    work_mode,
                    type,
                    salary_min,
                    salary_max,
                    job_type,
                    status: 'active'
                }])
                .select();

            if (error) throw error;

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
     * Get jobs posted by current employer
     * GET /api/employer/jobs
     */
    app.get('/api/employer/jobs', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;

            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('employer_id', employer_id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                jobs: data || []
            });
        } catch (error) {
            console.error('Error fetching employer jobs:', error);
            res.status(500).json({ error: 'Failed to fetch your jobs' });
        }
    });

    // ==================== APPLICATION MANAGEMENT ====================

    /**
     * Submit an application
     * POST /api/applications
     */
    app.post('/api/applications', authenticateUser, async (req, res) => {
        try {
            const { job_id, resume_url, cover_letter } = req.body;
            const candidate_id = req.user.id;

            const { data, error } = await supabase
                .from('applications')
                .insert([{
                    job_id,
                    candidate_id,
                    resume_url,
                    cover_letter,
                    status: 'applied'
                }])
                .select();

            if (error) throw error;

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
     * Get applications for a candidate
     * GET /api/applications/candidate
     */
    app.get('/api/applications/candidate', authenticateUser, async (req, res) => {
        try {
            const candidate_id = req.user.id;

            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    job:jobs(id, title, location, status, employer:users(name, avatar_url))
                `)
                .eq('candidate_id', candidate_id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                applications: data || []
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ error: 'Failed to fetch applications' });
        }
    });

    /**
     * Get applications for an employer (all jobs)
     * GET /api/applications/employer
     */
    app.get('/api/applications/employer', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;

            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    job:jobs!inner(id, title, employer_id),
                    candidate:users!applications_candidate_id_fkey(id, name, avatar_url)
                `)
                .eq('jobs.employer_id', employer_id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                applications: data || []
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
            const { status } = req.body;
            const employer_id = req.user.id; // Verify employer owns the job

            // First check if employer owns the job this application is for
            const { data: application, error: fetchError } = await supabase
                .from('applications')
                .select('*, job:jobs(employer_id)')
                .eq('id', id)
                .single();

            if (fetchError || !application) return res.status(404).json({ error: 'Application not found' });
            if (application.job.employer_id !== employer_id) return res.status(403).json({ error: 'Unauthorized' });

            const { data, error } = await supabase
                .from('applications')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select();

            if (error) throw error;

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
     * Get employer dashboard stats
     * GET /api/employer/stats
     */
    app.get('/api/employer/stats', authenticateUser, async (req, res) => {
        try {
            const employer_id = req.user.id;

            // Get jobs count
            const { count: activeJobs } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('employer_id', employer_id)
                .eq('status', 'active');

            // Get total applications
            const { count: totalApps } = await supabase
                .from('applications')
                .select('*, job:jobs!inner(employer_id)', { count: 'exact', head: true })
                .eq('jobs.employer_id', employer_id);

            // Get shortlisted count
            const { count: shortlisted } = await supabase
                .from('applications')
                .select('*, job:jobs!inner(employer_id)', { count: 'exact', head: true })
                .eq('jobs.employer_id', employer_id)
                .eq('status', 'shortlisted');

            // Get interviews count
            const { count: interviews } = await supabase
                .from('interviews')
                .select('*', { count: 'exact', head: true })
                .eq('employer_id', employer_id)
                .eq('status', 'scheduled');

            res.json({
                success: true,
                stats: {
                    activeJobs: activeJobs || 0,
                    totalCandidates: totalApps || 0,
                    shortlisted: shortlisted || 0,
                    interviews: interviews || 0,
                    pending: (totalApps || 0) - (shortlisted || 0)
                }
            });
        } catch (error) {
            console.error('Error fetching employer stats:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    });

    /**
     * Get candidate interviews (My Interviews)
     * GET /api/interviews/candidate
     */
    app.get('/api/interviews/candidate', authenticateUser, async (req, res) => {
        try {
            const candidate_id = req.user.id;

            const { data, error } = await supabase
                .from('interviews')
                .select(`
                    *,
                    job:jobs(id, title, description, requirements, company, location),
                    employer:users!interviews_employer_id_fkey(name, avatar_url)
                `)
                .eq('candidate_id', candidate_id)
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

            const { data, error } = await supabase
                .from('interviews')
                .select(`
                    *,
                    candidate:candidates(name, email, phone, location),
                    job:jobs(title)
                `)
                .eq('employer_id', employer_id)
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

    // ==================== PROFILE MANAGEMENT ====================

    /**
     * Get user profile
     * GET /api/profile
     */
    app.get('/api/profile', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;

            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user_id)
                .single();

            if (userError) throw userError;

            let profileData = {};
            if (user.role === 'candidate') {
                const { data: candidate, error: candidateError } = await supabase
                    .from('candidates')
                    .select('*')
                    .eq('user_id', user_id)
                    .single();

                if (!candidateError) {
                    // Fetch experience and skills
                    const { data: experience } = await supabase.from('candidate_experience').select('*').eq('user_id', user_id);
                    const { data: skills } = await supabase.from('candidate_skills').select('*').eq('user_id', user_id);

                    profileData = {
                        ...candidate,
                        experience_details: experience || [],
                        skills_tech: skills || [],
                    };
                }
            }

            res.json({
                success: true,
                user: { ...user, profile: profileData }
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    });

    /**
     * Get gamification stats
     * GET /api/gamification
     */
    app.get('/api/gamification', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;

            // Fetch main stats
            let { data: stats, error } = await supabase
                .from('gamification_stats')
                .select('*')
                .eq('user_id', user_id)
                .single();

            if (error || !stats) {
                // Return default/empty stats if not found or error (graceful degradation)
                stats = {
                    level: 'Bronze',
                    points: 0,
                    next_level_points: 1000,
                    global_rank: 0,
                    skill_mastery: 0,
                    challenges_completed: 0
                };
            }

            // Fetch Badges
            const { data: userBadges } = await supabase
                .from('user_badges')
                .select('*, badge:badges(*)')
                .eq('user_id', user_id);

            // Fetch Suggested Challenges
            const { data: challenges } = await supabase
                .from('challenges')
                .select('*')
                .limit(3);

            // Fetch History
            const { data: history } = await supabase
                .from('gamification_history')
                .select('*')
                .eq('user_id', user_id)
                .order('date', { ascending: true })
                .limit(7);

            res.json({
                success: true,
                stats,
                badges: userBadges || [],
                challenges: challenges || [],
                history: history || []
            });

        } catch (error) {
            console.error('Error fetching gamification:', error);
            // Fallback to mock to prevent frontend crash
            res.json({
                success: true,
                stats: { level: 'Bronze', points: 0 },
                badges: [],
                challenges: [],
                history: []
            });
        }
    });

    /**
     * Update user profile
     * PUT /api/profile
     */
    app.put('/api/profile', authenticateUser, async (req, res) => {
        try {
            const user_id = req.user.id;
            const { name, phone, location, avatar_url, bio, role_specific_data } = req.body;

            // Update base user table
            const { data: user, error: userError } = await supabase
                .from('users')
                .update({
                    name,
                    phone,
                    location,
                    avatar_url,
                    bio,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user_id)
                .select();

            if (userError) throw userError;

            // Update candidate profile if applicable
            if (user[0].role === 'candidate' && role_specific_data) {
                const { error: profileError } = await supabase
                    .from('candidates')
                    .upsert({
                        user_id: user_id,
                        ...role_specific_data,
                        updated_at: new Date().toISOString()
                    });

                if (profileError) console.error('Error updating candidate profile:', profileError);
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

}
