/**
 * HireGo AI — Autonomous Workflow Engine
 * 
 * Event-driven automation for the entire hiring pipeline:
 * - Profile completeness calculation
 * - Skill gap detection (on profile create)
 * - Interview readiness scoring
 * - Auto-screening on application submit
 * - Auto-shortlisting (score >= 75)
 * - Ranking engine trigger
 * - Employer notification on new application
 * - Stuck-record watchdog (5-min interval)
 */

import { generateAIResponse, safeParseJSON } from '../agents/ai_utils.js';
import { runMasterEvaluation } from '../agents/master_agent.js';
import { updateCandidateRankings } from '../agents/ranking_engine.js';

// ============================================================
// HELPER: Log workflow event
// ============================================================
async function logWorkflowEvent(supabase, entityType, entityId, eventName, status = 'success', payload = {}, errorMsg = null) {
    try {
        await supabase.from('workflow_events').insert({
            entity_type: entityType,
            entity_id: String(entityId),
            event_name: eventName,
            event_status: status,
            payload,
            error_message: errorMsg,
            triggered_at: new Date().toISOString(),
            completed_at: status === 'success' ? new Date().toISOString() : null
        });
    } catch (e) {
        console.error('[Workflow] Failed to log event:', e.message);
    }
}

// ============================================================
// HELPER: Log audit entry
// ============================================================
async function logAudit(supabase, actorType, actorId, action, targetTable, targetId, beforeState = null, afterState = null) {
    try {
        await supabase.from('audit_logs').insert({
            actor_type: actorType,
            actor_id: actorId,
            action,
            target_table: targetTable,
            target_id: String(targetId),
            before_state: beforeState,
            after_state: afterState
        });
    } catch (e) {
        console.error('[Audit] Failed to log:', e.message);
    }
}

// ============================================================
// PHASE 3: CANDIDATE ONBOARDING FLOW
// ============================================================

/**
 * Calculate profile completeness score (server-side, persistent)
 */
function calculateProfileCompleteness(candidate) {
    const fields = {
        full_name: 10, name: 10, email: 10, phone: 5,
        current_job_title: 8, job_profile: 8, total_experience_years: 5,
        technical_skills: 10, soft_skills: 5, degree: 5, university: 5,
        city: 3, linkedin_url: 3, github_url: 3,
        resume_url: 8, video_resume_url: 10, bio: 5
    };
    let score = 0;
    for (const [field, weight] of Object.entries(fields)) {
        const val = candidate[field];
        if (val && val !== '' && val !== '[]' && val !== '{}') {
            if (Array.isArray(val) || (typeof val === 'string' && val.startsWith('['))) {
                const arr = Array.isArray(val) ? val : JSON.parse(val || '[]');
                if (arr.length > 0) score += weight;
            } else {
                score += weight;
            }
        }
    }
    return Math.min(100, score);
}

/**
 * Calculate interview readiness score
 */
function calculateReadiness(completeness, hasVideo, aiScore) {
    return Math.round(
        (completeness * 0.3) +
        (hasVideo ? 30 : 0) +
        ((aiScore || 0) * 0.4)
    );
}

/**
 * TRIGGER: Run on candidate profile creation/update
 */
export async function onCandidateProfileCreated(supabase, candidateId, apiKeys) {
    console.log(`[Workflow] 🎯 Candidate onboarding triggered: ${candidateId}`);

    try {
        // Fetch full candidate record
        const { data: candidate, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('user_id', candidateId)
            .single();

        if (error || !candidate) {
            console.error('[Workflow] Cannot find candidate:', error?.message);
            return;
        }

        // STEP 1: Calculate profile completeness
        const completeness = calculateProfileCompleteness(candidate);

        // STEP 2: Skill gap detection (AI)
        let improvements = [];
        if (apiKeys && candidate.technical_skills) {
            try {
                const skills = Array.isArray(candidate.technical_skills)
                    ? candidate.technical_skills
                    : JSON.parse(candidate.technical_skills || '[]');

                if (skills.length > 0) {
                    const prompt = `You are a skill gap detection expert. Given these skills: ${JSON.stringify(skills)}, job title: ${candidate.current_job_title || candidate.job_profile || 'Software Engineer'}, industry: ${candidate.industry || 'Technology'}, identify skill gaps and generate improvement suggestions. Return ONLY valid JSON: { "gaps": [], "suggestions": [], "priority_skills": [] }`;

                    const response = await generateAIResponse(apiKeys, prompt, 'You are an HR skill analysis expert. Return ONLY raw JSON.', 'gemini');
                    const parsed = safeParseJSON(response);
                    if (parsed && parsed.suggestions) {
                        improvements = parsed.suggestions;
                    }
                }
            } catch (e) {
                console.warn('[Workflow] Skill gap detection failed:', e.message);
            }
        }

        // STEP 3: Interview readiness
        const hasVideo = !!(candidate.video_resume_url);
        const readiness = calculateReadiness(completeness, hasVideo, candidate.ai_overall_score || 0);

        // Save all computed fields
        await supabase.from('candidates').update({
            profile_completeness_score: completeness,
            interview_readiness_score: readiness,
            ai_improvement_suggestions: improvements.length > 0 ? improvements : candidate.ai_improvement_suggestions || [],
            updated_at: new Date().toISOString()
        }).eq('user_id', candidateId);

        await logWorkflowEvent(supabase, 'candidate', candidateId, 'profile_created', 'success', { completeness, readiness });
        await logAudit(supabase, 'system', 'workflow_engine', 'profile_scored', 'candidates', candidateId, null, { completeness, readiness });

        console.log(`[Workflow] ✅ Candidate onboarding complete. Completeness: ${completeness}%, Readiness: ${readiness}%`);
    } catch (err) {
        console.error('[Workflow] Onboarding error:', err.message);
        await logWorkflowEvent(supabase, 'candidate', candidateId, 'profile_created', 'failed', {}, err.message);
    }
}

// ============================================================
// PHASE 4: VIDEO PIPELINE — Score Sync to DB
// ============================================================

/**
 * TRIGGER: After video analysis completes, sync all AI scores back to candidate record
 */
export async function syncAIScoresToCandidate(supabase, candidateId, report, applicationId = null) {
    console.log(`[Workflow] 📊 Syncing AI scores for candidate: ${candidateId}`);

    try {
        // Create ai_evaluations record
        const evaluationData = {
            candidate_id: candidateId,
            application_id: applicationId,
            model_a_output: report.layer1 || {},
            model_b_output: report.layer2 || {},
            model_c_output: report.layer3 || {},
            model_d_output: report.fraudDetection || {},
            model_e_output: { finalScore: report.finalScore, summary: report.summary, rank: report.rank },
            final_score_json: report,
            evaluation_status: 'complete',
            created_at: new Date().toISOString()
        };

        await supabase.from('ai_evaluations').insert(evaluationData);

        // Sync scores to candidates table
        const updateData = {
            ai_overall_score: report.finalScore || 0,
            ai_evaluation_status: 'complete',
            updated_at: new Date().toISOString()
        };

        // Extract granular scores from layers
        if (report.layer1) {
            updateData.communication_score = report.layer1.score || null;
        }
        if (report.layer2) {
            updateData.skill_match_score = report.layer2.score || null;
        }
        if (report.layer3) {
            updateData.behavioral_score = report.layer3.score || null;
            updateData.confidence_score = report.layer3.score || null;
        }
        if (report.summary) {
            updateData.ai_strengths = report.layer2?.detectedTerms || [];
        }

        // Fraud detection from any layer
        if (report.fraudDetection?.fraud_flag) {
            updateData.fraud_detection_flag = true;
        }

        await supabase.from('candidates').update(updateData).eq('user_id', candidateId);

        // Recalculate readiness
        const { data: candidate } = await supabase.from('candidates').select('profile_completeness_score, video_resume_url').eq('user_id', candidateId).single();
        if (candidate) {
            const readiness = calculateReadiness(
                candidate.profile_completeness_score || 0,
                !!candidate.video_resume_url,
                report.finalScore || 0
            );
            await supabase.from('candidates').update({ interview_readiness_score: readiness }).eq('user_id', candidateId);
        }

        await logWorkflowEvent(supabase, 'candidate', candidateId, 'ai_evaluation_complete', 'success', { finalScore: report.finalScore });
        console.log(`[Workflow] ✅ AI scores synced. Overall: ${report.finalScore}/100`);
    } catch (err) {
        console.error('[Workflow] Score sync error:', err.message);
        await logWorkflowEvent(supabase, 'candidate', candidateId, 'ai_evaluation_complete', 'failed', {}, err.message);
    }
}

// ============================================================
// PHASE 5: APPLICATION AUTOMATION
// ============================================================

/**
 * TRIGGER: New application submitted
 * Runs: video check → screening → scoring → shortlisting → ranking → notification
 */
export async function onApplicationSubmitted(supabase, applicationId, apiKeys) {
    console.log(`[Workflow] 📋 Application automation triggered: ${applicationId}`);

    try {
        // Fetch application with job and candidate data
        const { data: application, error } = await supabase
            .from('job_applications')
            .select('*, job:employer_job_posts(*)')
            .eq('id', applicationId)
            .single();

        if (error || !application) {
            console.error('[Workflow] Cannot find application:', error?.message);
            return;
        }

        const { data: candidate } = await supabase
            .from('candidates')
            .select('*')
            .eq('user_id', application.candidate_id)
            .single();

        if (!candidate) {
            console.warn('[Workflow] Candidate record not found');
            return;
        }

        const job = application.job;

        // STEP 1: Video Resume Check
        if (!candidate.video_resume_url) {
            await supabase.from('job_applications').update({
                status: 'pending',
                screening_agent_status: 'not_started',
                metadata: { ...(application.metadata || {}), video_pending: true }
            }).eq('id', applicationId);

            // Create notification for candidate
            await supabase.from('notifications').insert({
                user_id: application.candidate_id,
                title: 'Video Resume Required',
                message: 'Please upload your video resume to complete your application for ' + (job?.title || 'the position'),
                type: 'action_required',
                category: 'application',
                action_url: '/candidate/video-resume'
            });

            await logWorkflowEvent(supabase, 'application', applicationId, 'video_pending', 'success', { candidate_id: application.candidate_id });
            console.log(`[Workflow] ⏸️  Application paused — video pending`);
            return; // STOP — resume when video is uploaded
        }

        // STEP 2: Mark screening as running
        await supabase.from('job_applications').update({
            screening_agent_status: 'running'
        }).eq('id', applicationId);
        await logWorkflowEvent(supabase, 'application', applicationId, 'screening_started', 'processing');

        // STEP 3: Multi-Factor Screening
        let resumeScore = 50, videoScore = 50, skillMatchScore = 50, experienceScore = 50;

        // Video Score: from AI evaluation
        videoScore = candidate.ai_overall_score || 50;

        // Skill Match Score: intersection calculation
        const candidateSkills = Array.isArray(candidate.technical_skills)
            ? candidate.technical_skills.map(s => s.toLowerCase())
            : [];
        const jobSkills = Array.isArray(job?.skills || job?.required_skills)
            ? (job.skills || job.required_skills).map(s => typeof s === 'string' ? s.toLowerCase() : '')
            : [];

        if (jobSkills.length > 0 && candidateSkills.length > 0) {
            const matches = candidateSkills.filter(s => jobSkills.some(js => js.includes(s) || s.includes(js)));
            skillMatchScore = Math.round((matches.length / jobSkills.length) * 100);
        }

        // Experience Relevance
        const expYears = candidate.total_experience_years || 0;
        const expMin = job?.experience_min || 0;
        const expMax = job?.experience_max || 99;
        if (expYears >= expMin && expYears <= expMax) {
            experienceScore = 90;
        } else if (expYears >= expMin - 1) {
            experienceScore = 70;
        } else {
            experienceScore = Math.max(20, 50 - Math.abs(expYears - expMin) * 10);
        }

        // Resume Score via AI (if API keys available)
        if (apiKeys && candidate.transcript_text && job?.skills) {
            try {
                const prompt = `You are a recruiter. Job requires these skills: ${JSON.stringify(job.skills)}. Experience: ${expMin}-${expMax} years. Candidate resume summary: ${(candidate.transcript_text || '').substring(0, 1500)}. Skills: ${JSON.stringify(candidateSkills)}. Score resume relevance 0-100. Return ONLY valid JSON: { "resume_score": number, "match_reasons": [], "gap_reasons": [] }`;
                const response = await generateAIResponse(apiKeys, prompt, 'You are an expert recruiter. Return ONLY raw JSON, no markdown.', 'gemini');
                const parsed = safeParseJSON(response);
                if (parsed && typeof parsed.resume_score === 'number') {
                    resumeScore = parsed.resume_score;
                }
            } catch (e) {
                console.warn('[Workflow] AI resume scoring failed, using default:', e.message);
            }
        }

        // STEP 4: Composite Screening Score
        const screeningScore = Math.round(
            (resumeScore * 0.25) +
            (videoScore * 0.35) +
            (skillMatchScore * 0.25) +
            (experienceScore * 0.15)
        );

        // STEP 5: Auto-Shortlisting
        let newStatus = 'screened';
        let autoShortlisted = false;
        let shortlistReason = null;
        let rejectionReason = null;

        if (screeningScore >= 75) {
            newStatus = 'shortlisted';
            autoShortlisted = true;
            shortlistReason = `Auto-shortlisted: composite score ${screeningScore}/100 (resume:${resumeScore}, video:${videoScore}, skills:${skillMatchScore}, exp:${experienceScore})`;
        } else if (screeningScore >= 50) {
            newStatus = 'screened';
            shortlistReason = 'Manual review recommended';
        } else {
            newStatus = 'rejected';
            rejectionReason = `Score below threshold: ${screeningScore}/100`;
        }

        await supabase.from('job_applications').update({
            status: newStatus,
            screening_score: screeningScore,
            resume_score: resumeScore,
            video_score: videoScore,
            skill_match_score: skillMatchScore,
            experience_relevance_score: experienceScore,
            ai_screening_score: screeningScore,
            auto_shortlisted: autoShortlisted,
            shortlist_reason: shortlistReason,
            rejection_reason: rejectionReason,
            screening_agent_status: 'complete',
            screening_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).eq('id', applicationId);

        // Also create screening_results record
        await supabase.from('screening_results').insert({
            application_id: applicationId,
            candidate_id: application.candidate_id,
            job_id: application.job_id,
            screening_type: 'ai_resume',
            overall_score: screeningScore,
            skill_match_score: skillMatchScore,
            experience_match_score: experienceScore,
            score_breakdown: { resumeScore, videoScore, skillMatchScore, experienceScore },
            ai_summary: shortlistReason || rejectionReason || '',
            recommendation: screeningScore >= 75 ? 'strong_yes' : screeningScore >= 50 ? 'maybe' : 'no'
        });

        await logWorkflowEvent(supabase, 'application', applicationId, 'screening_complete', 'success', {
            screeningScore, newStatus, autoShortlisted
        });

        // STEP 6: Re-rank all applications for this job
        try {
            // Get all completed applications for ranking
            const { data: allApps } = await supabase
                .from('job_applications')
                .select('id, screening_score')
                .eq('job_id', application.job_id)
                .eq('screening_agent_status', 'complete')
                .order('screening_score', { ascending: false });

            if (allApps && allApps.length > 0) {
                for (let i = 0; i < allApps.length; i++) {
                    await supabase.from('job_applications').update({
                        ranking_position: i + 1
                    }).eq('id', allApps[i].id);
                }
                await logWorkflowEvent(supabase, 'job', application.job_id, 'ranking_updated', 'success', { totalRanked: allApps.length });
            }
        } catch (e) {
            console.warn('[Workflow] Ranking update failed:', e.message);
        }

        // STEP 7: Notify employer
        if (job?.employer_id) {
            await supabase.from('notifications').insert({
                user_id: job.employer_id,
                title: 'New Candidate Screened',
                message: `${candidate.name || candidate.full_name || 'A candidate'} scored ${screeningScore}/100 for "${job.title}". ${autoShortlisted ? '⭐ Auto-shortlisted!' : ''}`,
                type: autoShortlisted ? 'success' : 'info',
                category: 'application',
                action_url: `/employer/jobs/${job.id}/applicants`
            });
            await logWorkflowEvent(supabase, 'employer', job.employer_id, 'employer_notified', 'success');
        }

        console.log(`[Workflow] ✅ Application screening complete. Score: ${screeningScore}/100, Status: ${newStatus}`);
    } catch (err) {
        console.error('[Workflow] Application automation error:', err.message);
        await supabase.from('job_applications').update({
            screening_agent_status: 'failed'
        }).eq('id', applicationId);
        await logWorkflowEvent(supabase, 'application', applicationId, 'screening_complete', 'failed', {}, err.message);
    }
}

// ============================================================
// PHASE 6: EMPLOYER JOB CREATION — AI Enhancement
// ============================================================

/**
 * TRIGGER: After employer creates a job, generate AI screening criteria
 */
export async function onJobCreated(supabase, jobId, apiKeys) {
    console.log(`[Workflow] 🏢 Job creation automation triggered: ${jobId}`);

    try {
        const { data: job, error } = await supabase
            .from('employer_job_posts')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error || !job) return;

        // Only auto-enhance if AI fields are empty
        if (job.ai_screening_criteria && Object.keys(job.ai_screening_criteria).length > 0) {
            console.log('[Workflow] Job already has AI criteria, skipping');
            return;
        }

        if (!apiKeys) {
            console.warn('[Workflow] No API keys for job AI enhancement');
            return;
        }

        const skills = Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills || '[]');
        const prompt = `You are an expert talent acquisition specialist. Create screening criteria for: Role: ${job.title}, Skills: ${JSON.stringify(skills)}, Experience: ${job.experience_min || 0}-${job.experience_max || 10} years, Location: ${job.location || 'Remote'}. Return ONLY valid JSON: { "screening_criteria": { "must_have_skills": [], "nice_to_have_skills": [], "min_experience": number, "education_requirements": [], "key_competencies": [] }, "scoring_matrix": { "skills_weight": 0.3, "experience_weight": 0.25, "education_weight": 0.15, "behavioral_weight": 0.15, "communication_weight": 0.15 }, "interview_questions": [], "ideal_candidate_profile": "" }`;

        const response = await generateAIResponse(apiKeys, prompt, 'You are a senior recruiter. Return ONLY raw JSON.', 'gemini');
        const parsed = safeParseJSON(response);

        if (parsed) {
            await supabase.from('employer_job_posts').update({
                ai_screening_criteria: parsed.screening_criteria || {},
                ai_scoring_matrix: parsed.scoring_matrix || {},
                ai_interview_questions: parsed.interview_questions || [],
                ideal_candidate_profile: parsed.ideal_candidate_profile || '',
                updated_at: new Date().toISOString()
            }).eq('id', jobId);

            await logWorkflowEvent(supabase, 'job', jobId, 'ai_criteria_generated', 'success');
            console.log(`[Workflow] ✅ Job AI criteria generated for: ${job.title}`);
        }

        // STEP 4: Proactive Candidate Matching
        try {
            const { data: topCandidates } = await supabase
                .from('candidates')
                .select('user_id, name, full_name, technical_skills, ai_overall_score, total_experience_years')
                .eq('ai_evaluation_status', 'complete')
                .eq('fraud_detection_flag', false)
                .gte('ai_overall_score', 50)
                .order('ai_overall_score', { ascending: false })
                .limit(20);

            if (topCandidates && topCandidates.length > 0) {
                await logWorkflowEvent(supabase, 'job', jobId, 'proactive_matching_complete', 'success', {
                    matched_count: topCandidates.length,
                    top_candidates: topCandidates.map(c => ({ id: c.user_id, score: c.ai_overall_score }))
                });
            }
        } catch (e) {
            console.warn('[Workflow] Proactive matching failed:', e.message);
        }
    } catch (err) {
        console.error('[Workflow] Job creation automation error:', err.message);
        await logWorkflowEvent(supabase, 'job', jobId, 'ai_criteria_generated', 'failed', {}, err.message);
    }
}

// ============================================================
// PHASE 10: WATCHDOG — Stuck Record Recovery (run every 5 mins)
// ============================================================

export async function runWatchdog(supabase) {
    const now = new Date();
    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    const twentyFourHrsAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    console.log(`[Watchdog] 🔍 Running stuck-record recovery at ${now.toISOString()}`);

    // CHECK 1: Stuck transcriptions
    try {
        const { data: stuckTranscriptions } = await supabase
            .from('candidates')
            .select('user_id')
            .eq('ai_evaluation_status', 'processing')
            .lt('updated_at', tenMinAgo);

        if (stuckTranscriptions && stuckTranscriptions.length > 0) {
            for (const c of stuckTranscriptions) {
                await supabase.from('candidates').update({
                    ai_evaluation_status: 'pending',
                    updated_at: new Date().toISOString()
                }).eq('user_id', c.user_id);
                await logWorkflowEvent(supabase, 'candidate', c.user_id, 'stuck_transcription_reset', 'success');
            }
            console.log(`[Watchdog] Reset ${stuckTranscriptions.length} stuck transcriptions`);
        }
    } catch (e) { console.error('[Watchdog] Check 1 failed:', e.message); }

    // CHECK 2: Stuck screenings
    try {
        const { data: stuckScreenings } = await supabase
            .from('job_applications')
            .select('id')
            .eq('screening_agent_status', 'running')
            .lt('updated_at', tenMinAgo);

        if (stuckScreenings && stuckScreenings.length > 0) {
            for (const a of stuckScreenings) {
                await supabase.from('job_applications').update({
                    screening_agent_status: 'not_started',
                    updated_at: new Date().toISOString()
                }).eq('id', a.id);
                await logWorkflowEvent(supabase, 'application', a.id, 'stuck_screening_reset', 'success');
            }
            console.log(`[Watchdog] Reset ${stuckScreenings.length} stuck screenings`);
        }
    } catch (e) { console.error('[Watchdog] Check 2 failed:', e.message); }

    // CHECK 3: Incomplete applications (video pending > 24h)
    try {
        const { data: staleApps } = await supabase
            .from('job_applications')
            .select('id, candidate_id, job_id')
            .eq('status', 'pending')
            .lt('applied_at', twentyFourHrsAgo);

        if (staleApps && staleApps.length > 0) {
            for (const app of staleApps) {
                await supabase.from('notifications').insert({
                    user_id: app.candidate_id,
                    title: 'Application Reminder',
                    message: 'Your application is incomplete. Please upload your video resume to proceed.',
                    type: 'action_required',
                    category: 'application',
                    action_url: '/candidate/video-resume'
                });
            }
            console.log(`[Watchdog] Sent ${staleApps.length} video reminder notifications`);
        }
    } catch (e) { console.error('[Watchdog] Check 3 failed:', e.message); }

    // CHECK 4: Orphaned evaluations
    try {
        const { data: orphanedEvals } = await supabase
            .from('ai_evaluations')
            .select('id, candidate_id')
            .eq('evaluation_status', 'queued')
            .lt('created_at', thirtyMinAgo);

        if (orphanedEvals && orphanedEvals.length > 0) {
            for (const ev of orphanedEvals) {
                await supabase.from('ai_evaluations').update({
                    evaluation_status: 'failed',
                    failure_reason: 'Orphaned — stuck in queue for 30+ minutes'
                }).eq('id', ev.id);
                await logWorkflowEvent(supabase, 'evaluation', ev.id, 'orphaned_evaluation_reset', 'success');
            }
            console.log(`[Watchdog] Reset ${orphanedEvals.length} orphaned evaluations`);
        }
    } catch (e) { console.error('[Watchdog] Check 4 failed:', e.message); }

    console.log(`[Watchdog] ✅ Sweep complete`);
}

// ============================================================
// EXPORTS for route integration
// ============================================================
export {
    logWorkflowEvent,
    logAudit,
    calculateProfileCompleteness,
    calculateReadiness
};
