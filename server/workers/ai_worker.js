import boss from '../services/queue_service.js';
import { analyzeVideoDirectly } from '../agents/gemini_video_agent.js';
import { syncAIScoresToCandidate, onApplicationSubmitted, onCandidateProfileCreated } from '../engine/workflow_engine.js';
import { supabaseAdmin } from '../utils/supabaseClient.js';
import { decrypt } from '../utils/encryption.js';
import fs from 'fs';

/**
 * Worker for Direct Video Analysis
 */
async function videoAnalysisWorker(job) {
    const { videoPath, candidateData, apiKeys, userId } = job.data;

    console.log(`[Worker] Starting background analysis for user: ${userId}`);

    try {
        // 1. Run the heavy AI analysis
        const report = await analyzeVideoDirectly(videoPath, candidateData, apiKeys);

        if (!report || !report.finalScore) {
            throw new Error('AI Provider returned invalid report');
        }

        // 2. Sync to DB using existing workflow engine
        await syncAIScoresToCandidate(supabaseAdmin, userId, report);

        console.log(`[Worker] ✅ Analysis complete for user: ${userId}`);

        // Clean up video file if desired (optional)
        // fs.unlinkSync(videoPath);

        return { success: true, score: report.finalScore };
    } catch (error) {
        console.error(`[Worker] ❌ Analysis failed for user: ${userId}:`, error.message);

        // Update candidate status to failed in DB
        await supabaseAdmin
            .from('candidates')
            .update({ ai_evaluation_status: 'failed' })
            .eq('user_id', userId);

        throw error; // Let pg-boss handle retry if configured
    }
}

/**
 * Worker for Application Screening
 */
async function applicationScreeningWorker(job) {
    const { applicationId } = job.data;
    console.log(`[Worker] Screening application: ${applicationId}`);
    try {
        // Fetch API keys within worker
        const { data: keys } = await supabaseAdmin.from('api_keys').select('*');
        const apiKeys = {};
        if (keys) {
            keys.forEach(k => { if (k.api_key) apiKeys[k.provider] = decrypt(k.api_key); });
        }

        await onApplicationSubmitted(supabaseAdmin, applicationId, apiKeys, { isWorker: true });
        console.log(`[Worker] ✅ Screening complete for app: ${applicationId}`);
        return { success: true };
    } catch (error) {
        console.error(`[Worker] ❌ Screening failed for app ${applicationId}:`, error.message);
        throw error;
    }
}

/**
 * Worker for Candidate Onboarding
 */
async function profileOnboardingWorker(job) {
    const { userId } = job.data;
    console.log(`[Worker] Processing onboarding for user: ${userId}`);
    try {
        await onCandidateProfileCreated(supabaseAdmin, userId, null, { isWorker: true });
        console.log(`[Worker] ✅ Onboarding complete for user: ${userId}`);
        return { success: true };
    } catch (error) {
        console.error(`[Worker] ❌ Onboarding failed for user ${userId}:`, error.message);
        throw error;
    }
}

/**
 * Registers all workers
 */
export async function registerWorkers() {
    if (!boss) return;

    console.log('[Queue] Registering workers...');

    // Register the video analysis job
    await boss.work('analyze-video-direct', { teamSize: 2, teamConcurrency: 1 }, videoAnalysisWorker);

    // Register the application screening job
    await boss.work('application-screening', { teamSize: 4, teamConcurrency: 2 }, applicationScreeningWorker);

    // Register the profile onboarding job
    await boss.work('profile-onboarding', { teamSize: 4, teamConcurrency: 2 }, profileOnboardingWorker);
}
