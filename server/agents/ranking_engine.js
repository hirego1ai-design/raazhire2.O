/**
 * Real-Time Candidate Ranking Engine
 * 
 * Responsibilities:
 * - Dynamically rank candidates as new data arrives
 * - Multi-factor scoring algorithm
 * - Real-time updates based on interviews, feedback, and evaluations
 * - Percentile calculations
 * - Comparative analysis
 */

import { getCurrentModelWeights } from './continuous_learning_agent.js';

/**
 * Calculate and update rankings for all candidates for a specific job
 * @param {string} jobId - Job ID to rank candidates for
 * @param {object} supabase - Supabase client
 * @returns {array} Ranked candidates
 */
export async function updateCandidateRankings(jobId, supabase) {
    console.log(`[Ranking Engine] Updating rankings for job: ${jobId}`);

    try {
        // Step 1: Get all candidates for this job
        const candidates = await getCandidatesForJob(jobId, supabase);

        if (candidates.length === 0) {
            console.log('[Ranking Engine] No candidates found for this job');
            return [];
        }

        // Step 2: Get current model weights
        const modelWeights = await getCurrentModelWeights(supabase);

        // Step 3: Calculate composite score for each candidate
        const scoredCandidates = await Promise.all(
            candidates.map(candidate => calculateCompositeScore(candidate, modelWeights, supabase))
        );

        // Step 4: Sort by composite score (descending)
        scoredCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

        // Step 5: Assign ranks and percentiles
        const rankedCandidates = assignRanksAndPercentiles(scoredCandidates);

        // Step 6: Save rankings to database
        await saveRankings(jobId, rankedCandidates, supabase);

        console.log(`[Ranking Engine] Ranked ${rankedCandidates.length} candidates`);
        return rankedCandidates;

    } catch (error) {
        console.error('[Ranking Engine] Error updating rankings:', error);
        throw error;
    }
}

/**
 * Get all candidates who applied for a specific job
 */
async function getCandidatesForJob(jobId, supabase) {
    // Get evaluations for this job
    const { data: evaluations } = await supabase
        .from('candidate_evaluations')
        .select('*')
        .eq('job_id', jobId);

    if (!evaluations || evaluations.length === 0) {
        return [];
    }

    // Get unique candidates
    const candidateIds = [...new Set(evaluations.map(e => e.candidate_id))];

    return candidateIds.map(candidateId => {
        // Get the most recent evaluation for this candidate
        const latestEval = evaluations
            .filter(e => e.candidate_id === candidateId)
            .sort((a, b) => new Date(b.evaluation_date) - new Date(a.evaluation_date))[0];

        return {
            candidateId,
            candidateName: latestEval.candidate_name,
            candidateEmail: latestEval.candidate_email,
            evaluation: latestEval
        };
    });
}

/**
 * Calculate composite score for a candidate
 */
async function calculateCompositeScore(candidate, modelWeights, supabase) {
    const { candidateId, evaluation } = candidate;

    // Component 1: Skill Match Score (from evaluation)
    const skillMatchScore = await calculateSkillMatchScore(candidateId, evaluation.job_id, supabase);

    // Component 2: Experience Score (from evaluation)
    const experienceScore = calculateExperienceScore(evaluation);

    // Component 3: Interview Score (from evaluation)
    const interviewScore = evaluation.final_score || 0;

    // Component 4: Feedback Score (from employer feedback)
    const feedbackScore = await calculateFeedbackScore(candidateId, supabase);

    // Component 5: Past Success Score (from historical data)
    const pastSuccessScore = await calculatePastSuccessScore(candidateId, supabase);

    // Weighted composite score
    const compositeScore = (
        skillMatchScore * 0.25 +
        experienceScore * 0.15 +
        interviewScore * 0.35 +
        feedbackScore * 0.15 +
        pastSuccessScore * 0.10
    );

    return {
        ...candidate,
        compositeScore: Math.round(compositeScore * 100) / 100,
        scoreComponents: {
            skillMatchScore,
            experienceScore,
            interviewScore,
            feedbackScore,
            pastSuccessScore
        }
    };
}

/**
 * Calculate skill match score
 */
async function calculateSkillMatchScore(candidateId, jobId, supabase) {
    // Get skill mapping for the job role
    const { data: evaluation } = await supabase
        .from('candidate_evaluations')
        .select('screening_details')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .order('evaluation_date', { ascending: false })
        .limit(1);

    if (!evaluation || evaluation.length === 0) {
        return 50; // Default
    }

    const screeningDetails = evaluation[0].screening_details;
    return screeningDetails?.keywordMatch || 50;
}

/**
 * Calculate experience score
 */
function calculateExperienceScore(evaluation) {
    // Extract experience from screening details
    const screeningDetails = evaluation.screening_details;
    return screeningDetails?.completeness || 50;
}

/**
 * Calculate feedback score from employer ratings
 */
async function calculateFeedbackScore(candidateId, supabase) {
    const { data: feedback } = await supabase
        .from('employer_feedback')
        .select('overall_rating')
        .eq('candidate_id', candidateId);

    if (!feedback || feedback.length === 0) {
        return 50; // Neutral score if no feedback
    }

    // Average of all feedback ratings (1-5 scale, convert to 0-100)
    const avgRating = feedback.reduce((sum, fb) => sum + (fb.overall_rating || 3), 0) / feedback.length;
    return (avgRating / 5) * 100;
}

/**
 * Calculate past success score (based on previous placements)
 */
async function calculatePastSuccessScore(candidateId, supabase) {
    const { data: pastFeedback } = await supabase
        .from('employer_feedback')
        .select('hiring_decision')
        .eq('candidate_id', candidateId);

    if (!pastFeedback || pastFeedback.length === 0) {
        return 50; // Neutral for new candidates
    }

    // Calculate success rate
    const hires = pastFeedback.filter(fb => fb.hiring_decision === 'hire').length;
    const total = pastFeedback.length;

    return (hires / total) * 100;
}

/**
 * Assign ranks and calculate percentiles
 */
function assignRanksAndPercentiles(scoredCandidates) {
    const totalCandidates = scoredCandidates.length;

    return scoredCandidates.map((candidate, index) => {
        const rank = index + 1;
        const percentile = ((totalCandidates - rank) / totalCandidates) * 100;

        return {
            ...candidate,
            rank,
            percentile: Math.round(percentile * 100) / 100,
            totalCandidates
        };
    });
}

/**
 * Save rankings to database
 */
async function saveRankings(jobId, rankedCandidates, supabase) {
    console.log('[Ranking Engine] Saving rankings to database...');

    const rankingRecords = rankedCandidates.map(candidate => ({
        candidate_id: candidate.candidateId,
        job_id: jobId,
        composite_score: candidate.compositeScore,
        rank_position: candidate.rank,
        percentile: candidate.percentile,
        skill_match_score: candidate.scoreComponents.skillMatchScore,
        experience_score: candidate.scoreComponents.experienceScore,
        interview_score: candidate.scoreComponents.interviewScore,
        feedback_score: candidate.scoreComponents.feedbackScore,
        past_success_score: candidate.scoreComponents.pastSuccessScore,
        total_candidates: candidate.totalCandidates,
        last_updated: new Date().toISOString()
    }));

    // Upsert rankings (insert or update)
    for (const record of rankingRecords) {
        await supabase
            .from('candidate_rankings')
            .upsert(record, {
                onConflict: 'candidate_id,job_id'
            });
    }

    console.log('[Ranking Engine] Rankings saved successfully');
}

/**
 * Get current rankings for a job
 */
export async function getRankingsForJob(jobId, supabase) {
    const { data, error } = await supabase
        .from('candidate_rankings')
        .select(`
            *,
            candidate_evaluations!inner(candidate_name, candidate_email)
        `)
        .eq('job_id', jobId)
        .order('rank_position', { ascending: true });

    if (error) {
        console.error('[Ranking Engine] Error fetching rankings:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get ranking for a specific candidate
 */
export async function getCandidateRanking(candidateId, jobId, supabase) {
    const { data, error } = await supabase
        .from('candidate_rankings')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .single();

    if (error) {
        console.error('[Ranking Engine] Error fetching candidate ranking:', error);
        return null;
    }

    return data;
}

/**
 * Trigger ranking update when new data arrives
 */
export async function triggerRankingUpdate(candidateId, jobId, supabase) {
    console.log(`[Ranking Engine] Triggered ranking update for candidate ${candidateId} in job ${jobId}`);

    try {
        // Update rankings for the entire job
        await updateCandidateRankings(jobId, supabase);

        // Get the updated ranking for this specific candidate
        const candidateRanking = await getCandidateRanking(candidateId, jobId, supabase);

        return candidateRanking;

    } catch (error) {
        console.error('[Ranking Engine] Error in triggered update:', error);
        throw error;
    }
}

/**
 * Get top N candidates for a job
 */
export async function getTopCandidates(jobId, limit = 10, supabase) {
    const { data, error } = await supabase
        .from('candidate_rankings')
        .select(`
            *,
            candidate_evaluations!inner(candidate_name, candidate_email, final_score)
        `)
        .eq('job_id', jobId)
        .order('rank_position', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('[Ranking Engine] Error fetching top candidates:', error);
        throw error;
    }

    return data || [];
}

/**
 * Compare two candidates
 */
export async function compareCandidates(candidateId1, candidateId2, jobId, supabase) {
    const ranking1 = await getCandidateRanking(candidateId1, jobId, supabase);
    const ranking2 = await getCandidateRanking(candidateId2, jobId, supabase);

    if (!ranking1 || !ranking2) {
        return null;
    }

    return {
        candidate1: {
            id: candidateId1,
            rank: ranking1.rank_position,
            score: ranking1.composite_score,
            percentile: ranking1.percentile
        },
        candidate2: {
            id: candidateId2,
            rank: ranking2.rank_position,
            score: ranking2.composite_score,
            percentile: ranking2.percentile
        },
        difference: {
            rankDiff: ranking1.rank_position - ranking2.rank_position,
            scoreDiff: ranking1.composite_score - ranking2.composite_score,
            percentileDiff: ranking1.percentile - ranking2.percentile
        }
    };
}
