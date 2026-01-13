/**
 * AI Recruitment Intelligence System - API Routes
 * 
 * Integrates all AI agents and provides endpoints for:
 * - Video processing
 * - Employer feedback
 * - Real-time rankings
 * - Continuous learning
 * - Performance analytics
 */

import express from 'express';
import { processVideo, saveVideoAnalysis } from '../agents/video_processing_agent.js';
import { triggerAutoLearning, getCurrentModelWeights, scheduleAutoLearning } from '../agents/continuous_learning_agent.js';
import {
    updateCandidateRankings,
    getRankingsForJob,
    getCandidateRanking,
    getTopCandidates,
    compareCandidates,
    triggerRankingUpdate
} from '../agents/ranking_engine.js';
import { analyzeSkillMapping, batchAnalyzeSkills } from '../agents/skill_mapping_agent.js';
import {
    updateDailyMetrics,
    getPerformanceMetrics,
    getPerformanceSummary,
    generatePerformanceReport
} from '../agents/performance_tracking_agent.js';

export function setupAIRoutes(app, supabase, decrypt) {

    // ==================== LIVE ASSESSMENT ====================

    /**
     * Analyze live assessment
     * POST /api/analyze-live-assessment
     */
    app.post('/api/analyze-live-assessment', async (req, res) => {
        try {
            const { userId, jobId, transcript, questionsAnswered, tabSwitches, totalDuration } = req.body;

            // Simple AI analysis (mock for now - integrate with actual AI later)
            const words = transcript.split(' ').length;
            const averageWordsPerQuestion = words / questionsAnswered;

            const communication = Math.min(100, Math.round(70 + (averageWordsPerQuestion / 10)));
            const knowledge = Math.min(100, Math.round(75 + Math.random() * 15));
            const confidence = Math.max(50, Math.min(100, 95 - (tabSwitches * 10)));
            const clarity = Math.min(100, Math.round(80 + Math.random() * 15));
            const professionalism = Math.max(60, Math.min(100, 90 - (tabSwitches * 5)));

            const overallScore = Math.round(
                (communication * 0.3) +
                (knowledge * 0.25) +
                (confidence * 0.25) +
                (clarity * 0.1) +
                (professionalism * 0.1)
            );

            const feedback = overallScore >= 85
                ? 'Excellent performance! You demonstrated strong communication skills and technical knowledge.'
                : overallScore >= 70
                    ? 'Good performance with room for improvement in some areas.'
                    : 'Fair performance. Consider practicing more before your next assessment.';

            res.json({
                success: true,
                overallScore,
                communication,
                knowledge,
                confidence,
                clarity,
                professionalism,
                feedback,
                tabViolations: tabSwitches
            });

        } catch (error) {
            console.error('Live assessment analysis error:', error);
            res.status(500).json({
                error: 'Failed to analyze assessment',
                details: error.message
            });
        }
    });

    // ==================== VIDEO PROCESSING ====================

    /**
     * Process and analyze video
     * POST /api/ai/video/process
     */
    app.post('/api/ai/video/process', async (req, res) => {
        try {
            const { candidateId, videoUrl } = req.body;

            if (!candidateId || !videoUrl) {
                return res.status(400).json({
                    error: 'candidateId and videoUrl are required'
                });
            }

            // Get API keys
            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);

            // Process video
            const analysisResults = await processVideo(videoUrl, apiKeys);

            // Save results to database
            if (supabase) {
                await saveVideoAnalysis(candidateId, videoUrl, analysisResults, supabase);
            }

            res.json({
                success: true,
                candidateId,
                analysis: analysisResults
            });

        } catch (error) {
            console.error('Video processing error:', error);
            res.status(500).json({
                error: 'Failed to process video',
                details: error.message
            });
        }
    });

    /**
     * Analyze video content (Frontend Direct)
     * POST /api/ai/analyze-video
     */
    app.post('/api/ai/analyze-video', async (req, res) => {
        try {
            const { candidateData, videoData } = req.body;

            // Mock AI Analysis based on transcript
            // In a real system, this would call a text analysis API
            const transcription = videoData.transcription || "";
            const wordCount = transcription.split(' ').length;

            // Generate some plausible scores
            const confidence = Math.min(95, 70 + (wordCount / 10)); // More words = more confidence?
            const communication = Math.min(98, 75 + (Math.random() * 20));
            const knowledge = Math.min(90, 60 + (candidateData.skills?.length || 0) * 5);

            const keywords = ['React', 'Communication', 'Teamwork', 'Growth', 'Scalability', 'Innovation']
                .filter(() => Math.random() > 0.5);

            res.json({
                score: Math.round((confidence + communication + knowledge) / 3),
                communication: Math.round(communication),
                confidence: Math.round(confidence),
                knowledge: Math.round(knowledge),
                tone: 'Professional & Enthusiastic',
                keywords: keywords.length > 0 ? keywords : ['Professionalism'],
                feedback: 'Good clear speech. Consider elaborating more on technical challenges you have faced.',
                detailedReport: {
                    strengths: ['Clear voice', 'Good pacing'],
                    weaknesses: ['Could use more technical terms'],
                    sentiment: 'Positive'
                }
            });
        } catch (error) {
            console.error('Video analysis error:', error);
            res.status(500).json({ error: 'Failed to analyze video' });
        }
    });

    /**
     * Get video analysis results
     * GET /api/ai/video/analysis/:candidateId
     */
    app.get('/api/ai/video/analysis/:candidateId', async (req, res) => {
        try {
            const { candidateId } = req.params;

            const { data, error } = await supabase
                .from('video_analysis_results')
                .select('*')
                .eq('candidate_id', candidateId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            res.json({
                success: true,
                analysis: data && data.length > 0 ? data[0] : null
            });

        } catch (error) {
            console.error('Error fetching video analysis:', error);
            res.status(500).json({ error: 'Failed to fetch analysis' });
        }
    });

    // ==================== EMPLOYER FEEDBACK ====================

    /**
     * Submit employer feedback (mandatory)
     * POST /api/ai/feedback/submit
     */
    app.post('/api/ai/feedback/submit', async (req, res) => {
        try {
            const {
                interviewId,
                candidateId,
                employerId,
                technicalRating,
                communicationRating,
                cultureFitRating,
                overallRating,
                strengths,
                weaknesses,
                detailedComments,
                hiringDecision,
                rejectionReason
            } = req.body;

            // Validate required fields
            if (!candidateId || !employerId || !hiringDecision) {
                return res.status(400).json({
                    error: 'candidateId, employerId, and hiringDecision are required'
                });
            }

            // Save feedback
            const { data, error } = await supabase
                .from('employer_feedback')
                .insert([{
                    interview_id: interviewId,
                    candidate_id: candidateId,
                    employer_id: employerId,
                    technical_rating: technicalRating,
                    communication_rating: communicationRating,
                    culture_fit_rating: cultureFitRating,
                    overall_rating: overallRating,
                    strengths: strengths || [],
                    weaknesses: weaknesses || [],
                    detailed_comments: detailedComments,
                    hiring_decision: hiringDecision,
                    rejection_reason: rejectionReason,
                    is_mandatory: true,
                    submitted_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;

            // Trigger continuous learning if it's a hire/reject decision
            if (hiringDecision === 'hire' || hiringDecision === 'reject') {
                triggerAutoLearning('feedback_received', supabase)
                    .catch(err => console.error('Auto-learning trigger failed:', err));
            }

            // Trigger ranking update
            const { data: evaluation } = await supabase
                .from('candidate_evaluations')
                .select('job_id')
                .eq('candidate_id', candidateId)
                .limit(1);

            if (evaluation && evaluation.length > 0) {
                triggerRankingUpdate(candidateId, evaluation[0].job_id, supabase)
                    .catch(err => console.error('Ranking update failed:', err));
            }

            res.json({
                success: true,
                feedback: data[0],
                message: 'Feedback submitted successfully'
            });

        } catch (error) {
            console.error('Error submitting feedback:', error);
            res.status(500).json({
                error: 'Failed to submit feedback',
                details: error.message
            });
        }
    });

    /**
     * Get feedback for a candidate
     * GET /api/ai/feedback/:candidateId
     */
    app.get('/api/ai/feedback/:candidateId', async (req, res) => {
        try {
            const { candidateId } = req.params;

            const { data, error } = await supabase
                .from('employer_feedback')
                .select('*')
                .eq('candidate_id', candidateId)
                .order('submitted_at', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                feedback: data || []
            });

        } catch (error) {
            console.error('Error fetching feedback:', error);
            res.status(500).json({ error: 'Failed to fetch feedback' });
        }
    });

    // ==================== REAL-TIME RANKINGS ====================

    /**
     * Get real-time rankings for a job
     * GET /api/ai/rankings/:jobId
     */
    app.get('/api/ai/rankings/:jobId', async (req, res) => {
        try {
            const { jobId } = req.params;

            const rankings = await getRankingsForJob(jobId, supabase);

            res.json({
                success: true,
                jobId,
                rankings,
                totalCandidates: rankings.length,
                lastUpdated: rankings.length > 0 ? rankings[0].last_updated : null
            });

        } catch (error) {
            console.error('Error fetching rankings:', error);
            res.status(500).json({ error: 'Failed to fetch rankings' });
        }
    });

    /**
     * Update rankings for a job
     * POST /api/ai/rankings/update
     */
    app.post('/api/ai/rankings/update', async (req, res) => {
        try {
            const { jobId } = req.body;

            if (!jobId) {
                return res.status(400).json({ error: 'jobId is required' });
            }

            const rankings = await updateCandidateRankings(jobId, supabase);

            res.json({
                success: true,
                message: 'Rankings updated successfully',
                rankings
            });

        } catch (error) {
            console.error('Error updating rankings:', error);
            res.status(500).json({ error: 'Failed to update rankings' });
        }
    });

    /**
     * Get top candidates for a job
     * GET /api/ai/rankings/:jobId/top
     */
    app.get('/api/ai/rankings/:jobId/top', async (req, res) => {
        try {
            const { jobId } = req.params;
            const limit = parseInt(req.query.limit) || 10;

            const topCandidates = await getTopCandidates(jobId, limit, supabase);

            res.json({
                success: true,
                topCandidates
            });

        } catch (error) {
            console.error('Error fetching top candidates:', error);
            res.status(500).json({ error: 'Failed to fetch top candidates' });
        }
    });

    /**
     * Compare two candidates
     * GET /api/ai/rankings/compare
     */
    app.get('/api/ai/rankings/compare', async (req, res) => {
        try {
            const { candidate1, candidate2, jobId } = req.query;

            if (!candidate1 || !candidate2 || !jobId) {
                return res.status(400).json({
                    error: 'candidate1, candidate2, and jobId are required'
                });
            }

            const comparison = await compareCandidates(candidate1, candidate2, jobId, supabase);

            res.json({
                success: true,
                comparison
            });

        } catch (error) {
            console.error('Error comparing candidates:', error);
            res.status(500).json({ error: 'Failed to compare candidates' });
        }
    });

    // ==================== SKILL MAPPING ====================

    /**
     * Analyze skill mapping for a candidate
     * POST /api/ai/skills/analyze
     */
    app.post('/api/ai/skills/analyze', async (req, res) => {
        try {
            const { candidateData, jobRole } = req.body;

            if (!candidateData || !jobRole) {
                return res.status(400).json({
                    error: 'candidateData and jobRole are required'
                });
            }

            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);

            const skillAnalysis = await analyzeSkillMapping(
                candidateData,
                jobRole,
                apiKeys,
                supabase
            );

            res.json({
                success: true,
                analysis: skillAnalysis
            });

        } catch (error) {
            console.error('Error analyzing skills:', error);
            res.status(500).json({ error: 'Failed to analyze skills' });
        }
    });

    /**
     * Batch analyze skills for multiple candidates
     * POST /api/ai/skills/batch-analyze
     */
    app.post('/api/ai/skills/batch-analyze', async (req, res) => {
        try {
            const { candidates, jobRole } = req.body;

            if (!candidates || !jobRole) {
                return res.status(400).json({
                    error: 'candidates array and jobRole are required'
                });
            }

            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);

            const results = await batchAnalyzeSkills(candidates, jobRole, apiKeys, supabase);

            res.json({
                success: true,
                results,
                totalAnalyzed: results.length
            });

        } catch (error) {
            console.error('Error in batch skill analysis:', error);
            res.status(500).json({ error: 'Failed to analyze skills' });
        }
    });

    // ==================== CONTINUOUS LEARNING ====================

    /**
     * Trigger manual model retraining
     * POST /api/ai/learning/trigger
     */
    app.post('/api/ai/learning/trigger', async (req, res) => {
        try {
            const result = await triggerAutoLearning('manual', supabase);

            res.json({
                success: true,
                result
            });

        } catch (error) {
            console.error('Error triggering learning:', error);
            res.status(500).json({ error: 'Failed to trigger learning' });
        }
    });

    /**
     * Get current model weights
     * GET /api/ai/learning/weights
     */
    app.get('/api/ai/learning/weights', async (req, res) => {
        try {
            const weights = await getCurrentModelWeights(supabase);

            res.json({
                success: true,
                weights
            });

        } catch (error) {
            console.error('Error fetching model weights:', error);
            res.status(500).json({ error: 'Failed to fetch weights' });
        }
    });

    /**
     * Get training history
     * GET /api/ai/learning/history
     */
    app.get('/api/ai/learning/history', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 20;

            const { data, error } = await supabase
                .from('model_training_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            res.json({
                success: true,
                history: data || []
            });

        } catch (error) {
            console.error('Error fetching training history:', error);
            res.status(500).json({ error: 'Failed to fetch history' });
        }
    });

    // ==================== PERFORMANCE ANALYTICS ====================

    /**
     * Update daily metrics
     * POST /api/ai/analytics/update
     */
    app.post('/api/ai/analytics/update', async (req, res) => {
        try {
            const metrics = await updateDailyMetrics(supabase);

            res.json({ success: true, metrics });
        } catch (error) {
            console.error('Performance analytics error:', error);
            res.status(500).json({ error: 'Failed to update performance metrics' });
        }
    });

    // ==================== JOB & SKILLS AI ====================

    /**
     * Get suggested job titles
     * GET /api/ai/job-titles
     */
    app.get('/api/ai/job-titles', async (req, res) => {
        try {
            const titles = [
                "Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer",
                "Product Manager", "Data Scientist", "UI/UX Designer", "DevOps Engineer",
                "Marketing Manager", "Sales Executive", "HR Manager", "Project Manager"
            ];
            res.json({ success: true, titles });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch job titles' });
        }
    });

    /**
     * Suggest skills for a job title
     * POST /api/ai/skills/suggest
     */
    app.post('/api/ai/skills/suggest', async (req, res) => {
        try {
            const { jobTitle } = req.body;
            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);

            let skills = [];
            try {
                skills = await generateSkillsUsingAI(jobTitle, apiKeys);
            } catch (err) {
                skills = getFallbackSkills(jobTitle);
            }

            res.json({ success: true, skills });
        } catch (error) {
            res.status(500).json({ error: 'Failed to suggest skills' });
        }
    });

    /**
     * Generate Job Description
     * POST /api/ai/job-description/generate
     */
    app.post('/api/ai/job-description/generate', async (req, res) => {
        try {
            const { jobTitle, company, skills, experience } = req.body;
            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);

            let description = "";
            try {
                description = await generateJobDescriptionWithAI(jobTitle, company, skills, experience, apiKeys);
            } catch (err) {
                description = generateFallbackJobDescription(jobTitle, company, skills);
            }

            res.json({ success: true, description });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate description' });
        }
    });
    /**
     * Get performance metrics for date range
     * GET /api/ai/analytics/metrics
     */
    app.get('/api/ai/analytics/metrics', async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: 'startDate and endDate are required'
                });
            }

            const metrics = await getPerformanceMetrics(startDate, endDate, supabase);

            res.json({
                success: true,
                metrics
            });

        } catch (error) {
            console.error('Error fetching metrics:', error);
            res.status(500).json({ error: 'Failed to fetch metrics' });
        }
    });

    /**
     * Get performance summary
     * GET /api/ai/analytics/summary
     */
    app.get('/api/ai/analytics/summary', async (req, res) => {
        try {
            const summary = await getPerformanceSummary(supabase);

            res.json({
                success: true,
                summary
            });

        } catch (error) {
            console.error('Error fetching summary:', error);
            res.status(500).json({ error: 'Failed to fetch summary' });
        }
    });

    /**
     * Generate performance report
     * GET /api/ai/analytics/report
     */
    app.get('/api/ai/analytics/report', async (req, res) => {
        try {
            const report = await generatePerformanceReport(supabase);

            res.json({
                success: true,
                report
            });

        } catch (error) {
            console.error('Error generating report:', error);
            res.status(500).json({ error: 'Failed to generate report' });
        }
    });

    // ==================== SYSTEM STATUS ====================

    /**
     * Get AI system status
     * GET /api/ai/status
     */
    app.get('/api/ai/status', async (req, res) => {
        try {
            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);

            const status = {
                agents: {
                    videoProcessing: 'operational',
                    continuousLearning: 'operational',
                    rankingEngine: 'operational',
                    skillMapping: 'operational',
                    performanceTracking: 'operational'
                },
                aiProviders: {
                    gemini: apiKeys.gemini ? 'configured' : 'not_configured',
                    gpt4: apiKeys.gpt4 ? 'configured' : 'not_configured'
                },
                database: supabase ? 'connected' : 'not_connected',
                timestamp: new Date().toISOString()
            };

            res.json(status);

        } catch (error) {
            console.error('Error fetching status:', error);
            res.status(500).json({ error: 'Failed to fetch status' });
        }
    });

    // ==================== CANDIDATE RECOMMENDATIONS ====================

    /**
     * Get recommended candidates for a job with fair rotation
     * GET /api/ai/candidates/recommend/:jobId
     */
    app.get('/api/ai/candidates/recommend/:jobId', async (req, res) => {
        try {
            const { jobId } = req.params;
            const { rotationOffset = 0, limit = 20 } = req.query;

            // Fetch job details
            const { data: job, error: jobError } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (jobError) throw jobError;

            // Fetch all candidates
            const { data: candidates, error: candidatesError } = await supabase
                .from('candidates')
                .select('*')
                .limit(100);

            if (candidatesError) throw candidatesError;

            // Apply fair rotation algorithm
            const seed = parseInt(rotationOffset) || 0;
            const scoredCandidates = candidates.map((candidate, index) => {
                // Skill match score
                const candidateSkills = candidate.skills || [];
                const jobSkills = job.skills || [];
                const matchingSkills = candidateSkills.filter(skill =>
                    jobSkills.some(js => js.toLowerCase().includes(skill.toLowerCase()))
                );
                const skillScore = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 100 : 50;

                // Experience score
                const experienceScore = Math.min(100, (candidate.experience_years || 0) * 10);

                // Rotation fairness score (ensures everyone gets visibility)
                const rotationBoost = ((index + seed) % 10) * 5;

                // Composite score with rotation fairness
                const compositeScore = Math.round(
                    (skillScore * 0.5) +
                    (experienceScore * 0.3) +
                    (rotationBoost * 0.2)
                );

                return {
                    ...candidate,
                    matchScore: compositeScore,
                    rotationIndex: (index + seed) % candidates.length,
                    matchingSkills: matchingSkills.length
                };
            });

            // Sort by composite score with rotation fairness
            const sortedCandidates = scoredCandidates.sort((a, b) => {
                // Mix top performers with rotating candidates
                const aScore = a.matchScore + (a.rotationIndex % 3 === 0 ? 15 : 0);
                const bScore = b.matchScore + (b.rotationIndex % 3 === 0 ? 15 : 0);
                return bScore - aScore;
            });

            // Return top N candidates
            const recommendedCandidates = sortedCandidates.slice(0, parseInt(limit));

            res.json({
                success: true,
                jobId,
                candidates: recommendedCandidates,
                rotationSeed: seed,
                totalCandidates: candidates.length
            });

        } catch (error) {
            console.error('Error getting candidate recommendations:', error);
            res.status(500).json({
                error: 'Failed to get recommendations',
                details: error.message
            });
        }
    });

    /**
     * Get job pipeline statistics
     * GET /api/ai/job/:jobId/pipeline
     */
    app.get('/api/ai/job/:jobId/pipeline', async (req, res) => {
        try {
            const { jobId } = req.params;

            // Get application counts by status
            const { data: applications, error } = await supabase
                .from('applications')
                .select('status')
                .eq('job_id', jobId);

            if (error) throw error;

            // Calculate pipeline counts
            const pipeline = {
                applied: applications.filter(a => a.status === 'applied' || a.status === 'pending').length,
                screened: applications.filter(a => a.status === 'screened').length,
                shortlisted: applications.filter(a => a.status === 'shortlisted').length,
                interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
                hired: applications.filter(a => a.status === 'hired').length
            };

            res.json({
                success: true,
                jobId,
                pipeline,
                total: applications.length
            });

        } catch (error) {
            console.error('Error fetching pipeline stats:', error);
            res.status(500).json({
                error: 'Failed to fetch pipeline statistics',
                details: error.message
            });
        }
    });

    // ==================== JOB TITLE MANAGEMENT ====================

    /**
     * Get all job titles
     * GET /api/ai/job-titles
     */
    app.get('/api/ai/job-titles', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('job_titles')
                .select('title')
                .order('title', { ascending: true });

            if (error) throw error;

            const titles = data ? data.map(item => item.title) : [];

            res.json({
                success: true,
                titles
            });

        } catch (error) {
            console.error('Error fetching job titles:', error);
            // Return default list if table doesn't exist
            res.json({
                success: true,
                titles: []
            });
        }
    });

    /**
     * Add new job title
     * POST /api/ai/job-titles/add
     */
    app.post('/api/ai/job-titles/add', async (req, res) => {
        try {
            const { title } = req.body;

            if (!title) {
                return res.status(400).json({
                    error: 'title is required'
                });
            }

            // Check if title already exists
            const { data: existing } = await supabase
                .from('job_titles')
                .select('id')
                .eq('title', title)
                .single();

            if (existing) {
                return res.json({
                    success: true,
                    message: 'Job title already exists'
                });
            }

            // Insert new title
            const { error } = await supabase
                .from('job_titles')
                .insert([{ title }]);

            if (error) throw error;

            res.json({
                success: true,
                message: 'Job title added successfully',
                title
            });

        } catch (error) {
            console.error('Error adding job title:', error);
            res.status(500).json({
                error: 'Failed to add job title',
                details: error.message
            });
        }
    });

    // ==================== AI SKILL SUGGESTIONS ====================

    /**
     * Get AI-powered skill suggestions for a job title
     * POST /api/ai/skills/suggest
     */
    app.post('/api/ai/skills/suggest', async (req, res) => {
        try {
            const { jobTitle } = req.body;

            if (!jobTitle) {
                return res.status(400).json({
                    error: 'jobTitle is required'
                });
            }

            // First check if we have cached skills for this job title
            const { data: cachedSkills } = await supabase
                .from('job_title_skills')
                .select('skills')
                .eq('job_title', jobTitle)
                .single();

            if (cachedSkills && cachedSkills.skills) {
                return res.json({
                    success: true,
                    skills: cachedSkills.skills,
                    source: 'cache'
                });
            }

            // If not cached, use AI to generate skills
            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);
            const skills = await generateSkillsUsingAI(jobTitle, apiKeys);

            // Cache the results
            if (skills.length > 0) {
                await supabase
                    .from('job_title_skills')
                    .upsert([{
                        job_title: jobTitle,
                        skills: skills
                    }]);
            }

            res.json({
                success: true,
                skills,
                source: 'ai'
            });

        } catch (error) {
            console.error('Error generating skill suggestions:', error);
            // Return fallback skills
            res.json({
                success: true,
                skills: getFallbackSkills(req.body.jobTitle),
                source: 'fallback'
            });
        }
    });

    // ==================== AI JOB DESCRIPTION GENERATION ====================

    /**
     * Generate AI-powered job description
     * POST /api/ai/job-description/generate
     */
    app.post('/api/ai/job-description/generate', async (req, res) => {
        try {
            const { jobTitle, company, skills, experience } = req.body;

            if (!jobTitle) {
                return res.status(400).json({
                    error: 'jobTitle is required'
                });
            }

            // Get API keys
            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);
            const description = await generateJobDescriptionWithAI(jobTitle, company, skills, experience, apiKeys);

            res.json({
                success: true,
                description,
                source: description.includes('AI-generated') ? 'ai' : 'fallback'
            });

        } catch (error) {
            console.error('Error generating job description:', error);
            // Return fallback description
            res.json({
                success: true,
                description: generateFallbackJobDescription(req.body.jobTitle, req.body.company, req.body.skills),
                source: 'fallback'
            });
        }
    });
    // ==================== LIVE ASSESSMENT ANALYSIS ====================

    /**
     * Analyze live assessment recording/transcript
     * POST /api/analyze-live-assessment
     */
    app.post('/api/analyze-live-assessment', async (req, res) => {
        try {
            const { transcript, questionsAnswered, tabSwitches, totalDuration } = req.body;

            if (!transcript) {
                // Mock response if no transcript just to test flow, or error
                // return res.status(400).json({ error: 'Transcript is required' });
            }

            const apiKeys = await getDecryptedApiKeys(supabase, decrypt);

            // Construct prompt for AI
            const prompt = `Analyze the following interview transcript for a candidate. 
            Transcript: "${transcript || 'No transcript provided'}"
            Context: Questions Answered: ${questionsAnswered}, Tab Switches: ${tabSwitches}, Duration: ${totalDuration}s.
            
            Provide a JSON response with the following fields:
            - overallScore (0-100)
            - communication (0-100)
            - knowledge (0-100)
            - confidence (0-100)
            - feedback (string, summary of performance)
            - strengths (array of strings)
            - improvements (array of strings)
            
            Factor in that ${tabSwitches} tab switches suggests potential cheating if high (>2).
            `;

            let analysis = null;

            // Try OpenAI
            if (apiKeys.openai) {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKeys.openai}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'You are an expert interviewer and evaluator. Return ONLY JSON.' },
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.5
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    try {
                        analysis = JSON.parse(data.choices[0].message.content);
                    } catch (e) { console.error('Error parsing AI response', e); }
                }
            }

            // Fallback (or if OpenAI failed)
            if (!analysis) {
                // Mock analysis based on inputs
                const penalty = Math.min(tabSwitches * 10, 40);
                const baseScore = transcript ? 80 : 0;

                analysis = {
                    overallScore: Math.max(0, baseScore - penalty),
                    communication: 85,
                    knowledge: 75,
                    confidence: 80,
                    feedback: "Candidate showed good potential but analysis is based on limited data.",
                    strengths: ["Clear speech", "Good pacing"],
                    improvements: ["Elaborate more on technical details"]
                };
            }

            res.json(analysis);

        } catch (error) {
            console.error('Error analyzing assessment:', error);
            res.status(500).json({ error: 'Failed to analyze assessment' });
        }
    });

}

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate job description using AI (OpenAI/Deepseek)
 */
async function generateJobDescriptionWithAI(jobTitle, company, skills, experience, apiKeys) {
    try {
        const skillsText = skills && skills.length > 0 ? skills.slice(0, 5).join(', ') : 'relevant skills';
        const companyName = company || 'our company';
        const expLevel = experience || 'appropriate';

        const prompt = `Generate a professional, well-formatted job description for a ${jobTitle} position at ${companyName}. Requirements: ${expLevel} experience level, skills in ${skillsText}. 

Format the output as HTML with:
- <h2> for main sections (Role Summary, Key Responsibilities, Requirements, What We Offer)
- <h3> for subsections
- <strong> for important terms
- <ul><li> for bullet lists
- Keep it detailed but scannable
- Make it ATS-friendly

Return ONLY the HTML formatted job description, no additional text.`;

        // Try OpenAI first
        if (apiKeys.openai) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeys.openai}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert HR recruiter who writes compelling, professional job descriptions in HTML format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
        }

        // Try Deepseek as fallback
        if (apiKeys.deepseek) {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeys.deepseek}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert HR recruiter who writes compelling, professional job descriptions in HTML format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
        }

        return generateFallbackJobDescription(jobTitle, company, skills);

    } catch (error) {
        console.error('AI job description generation error:', error);
        return generateFallbackJobDescription(jobTitle, company, skills);
    }
}

/**
 * Generate fallback job description
 */
function generateFallbackJobDescription(jobTitle, company, skills) {
    const skillsText = skills && skills.length > 0 ? `<li>Proficiency in: <strong>${skills.slice(0, 5).join(', ')}</strong></li>` : '';
    const companyName = company || 'our company';
    const title = jobTitle || 'Professional';

    return `<h2><strong>Role Summary</strong></h2><p>We are looking for a talented <strong>${title}</strong> to join our team at <strong>${companyName}</strong>. You will be responsible for driving innovation and delivering high-quality results in a dynamic, collaborative environment.</p><br/><h3><strong>Key Responsibilities:</strong></h3><ul><li>Collaborate with cross-functional teams to define, design, and ship new features</li><li>Ensure the performance, quality, and responsiveness of applications</li><li>Identify and correct bottlenecks and fix bugs</li><li>Participate in code reviews and contribute to team knowledge sharing</li><li>Stay up-to-date with emerging technologies and industry trends</li></ul><br/><h3><strong>Requirements:</strong></h3><ul><li>Proven experience in the relevant field</li><li>Strong problem-solving skills and attention to detail</li><li>Excellent communication and teamwork abilities</li>${skillsText}<li>Ability to work in a fast-paced, agile environment</li></ul><br/><h3><strong>What We Offer:</strong></h3><ul><li>Competitive salary and comprehensive benefits package</li><li>Flexible working hours and remote work options</li><li>Professional development and learning opportunities</li><li>Collaborative and innovative work environment</li><li>Career growth and advancement opportunities</li></ul>`;
}

/**
 * Generate skills using AI (OpenAI/Deepseek)
 */
async function generateSkillsUsingAI(jobTitle, apiKeys) {
    try {
        // Try OpenAI first
        if (apiKeys.openai) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeys.openai}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a recruitment expert. Generate a list of 10-15 essential skills for the given job title. Return ONLY a JSON array of skill strings, no explanation.'
                        },
                        {
                            role: 'user',
                            content: `Generate essential skills for: ${jobTitle}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 200
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                // Parse the JSON array from the response
                const skills = JSON.parse(content);
                return skills;
            }
        }

        // Try Deepseek as fallback
        if (apiKeys.deepseek) {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeys.deepseek}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a recruitment expert. Generate a list of 10-15 essential skills for the given job title. Return ONLY a JSON array of skill strings, no explanation.'
                        },
                        {
                            role: 'user',
                            content: `Generate essential skills for: ${jobTitle}`
                        }
                    ],
                    temperature: 0.7
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                const skills = JSON.parse(content);
                return skills;
            }
        }

        return getFallbackSkills(jobTitle);

    } catch (error) {
        console.error('AI skill generation error:', error);
        return getFallbackSkills(jobTitle);
    }
}

/**
 * Get fallback skills based on job title keywords
 */
function getFallbackSkills(jobTitle) {
    const lowerTitle = jobTitle.toLowerCase();

    // Technical roles
    if (lowerTitle.includes('developer') || lowerTitle.includes('engineer') || lowerTitle.includes('software')) {
        return ['Programming', 'Problem Solving', 'Git', 'Agile', 'Code Review', 'Testing', 'Debugging', 'API Design', 'Database Management', 'Version Control'];
    }

    if (lowerTitle.includes('frontend') || lowerTitle.includes('front-end')) {
        return ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Responsive Design', 'UI/UX', 'State Management', 'Web Performance', 'Cross-browser Compatibility'];
    }

    if (lowerTitle.includes('backend') || lowerTitle.includes('back-end')) {
        return ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'REST API', 'GraphQL', 'Microservices', 'Security', 'Cloud Services'];
    }

    if (lowerTitle.includes('data')) {
        return ['Python', 'SQL', 'Data Analysis', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'Data Visualization', 'ETL', 'Big Data'];
    }

    if (lowerTitle.includes('devops')) {
        return ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Jenkins', 'Terraform', 'Monitoring', 'Scripting', 'Cloud Infrastructure'];
    }

    if (lowerTitle.includes('designer') || lowerTitle.includes('ux') || lowerTitle.includes('ui')) {
        return ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping', 'Wireframing', 'User Testing', 'Design Systems', 'Typography', 'Color Theory'];
    }

    if (lowerTitle.includes('product manager') || lowerTitle.includes('product owner')) {
        return ['Product Strategy', 'Agile', 'Roadmapping', 'User Stories', 'Stakeholder Management', 'Data Analysis', 'Market Research', 'Prioritization', 'Communication', 'Leadership'];
    }

    if (lowerTitle.includes('marketing')) {
        return ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Google Analytics', 'Campaign Management', 'Copywriting', 'Email Marketing', 'Brand Management', 'Market Analysis'];
    }

    if (lowerTitle.includes('sales')) {
        return ['CRM', 'Negotiation', 'Lead Generation', 'Sales Strategy', 'Communication', 'Presentation', 'Customer Relations', 'Pipeline Management', 'Cold Calling', 'Closing'];
    }

    // Default generic skills
    return ['Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Leadership', 'Adaptability', 'Critical Thinking', 'Attention to Detail', 'Organization', 'Collaboration'];
}

/**
 * Get decrypted API keys
 */
async function getDecryptedApiKeys(supabase, decrypt) {
    const apiKeys = {};

    if (supabase) {
        const { data: keys } = await supabase.from('api_keys').select('*');
        if (keys) {
            keys.forEach(k => {
                if (k.api_key) {
                    apiKeys[k.provider] = decrypt(k.api_key);
                }
            });
        }
    }

    return apiKeys;
}
