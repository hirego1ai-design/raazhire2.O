// Master AI Agent - orchestrates the multi-layer evaluation
import { analyzeScreening } from './layer1_screening.js';
import { analyzeTechnical } from './layer2_technical.js';
import { analyzeBehavioral } from './layer3_behavioral.js';
import { analyzeFraud } from './layer4_fraud_detection.js';
import { getAIConfig } from './ai_utils.js';

/**
 * Runs the full evaluation pipeline.
 * NO MOCK DATA: Throws error if critical analysis fails.
 *
 * @param {object} candidateData – basic candidate info (name, skills, etc.)
 * @param {object} videoData – contains `transcription` and optional metadata
 * @param {object} apiKeys – decrypted API keys for external services
 * @param {object} supabase – optional supabase client for config fetching
 * @returns {object} detailed report used by the frontend
 */
export async function runMasterEvaluation(candidateData, videoData, apiKeys, supabase = null) {
    const startTime = Date.now();
    const transcription = videoData?.transcription || '';

    console.log(`[Master Agent] Starting evaluation pipeline...`);

    // Fetch dynamic AI configuration (respects admin panel toggles)
    const aiConfig = await getAIConfig(supabase);
    console.log(`[Master Agent] Using Provider: ${aiConfig.primaryProvider}`);

    if (!apiKeys || Object.keys(apiKeys).length === 0) {
        throw new Error('No AI Provider API keys configured. Cannot perform analysis.');
    }

    if (!transcription || transcription.trim().length < 10) {
        throw new Error('Transcript is empty or too short. Audio may not have been captured correctly.');
    }

    // Run all layers in parallel for speed, but catch individual errors
    // If a CRITICAL layer fails, we should throw.

    // Layer 1: Screening (Reviewing candidate profile vs generic standards)
    const screeningPromise = analyzeScreening(candidateData, apiKeys, aiConfig)
        .catch(e => { throw new Error(`Layer 1 (Screening) Failed: ${e.message}`); });

    // Layer 2: Technical (CRITICAL - needs transcript)
    const technicalPromise = analyzeTechnical(candidateData, transcription, apiKeys, aiConfig)
        .catch(e => { throw new Error(`Layer 2 (Technical) Failed: ${e.message}`); });

    // Layer 3: Behavioral (CRITICAL - needs transcript)
    const behavioralPromise = analyzeBehavioral(transcription, apiKeys, aiConfig)
        .catch(e => { throw new Error(`Layer 3 (Behavioral) Failed: ${e.message}`); });

    // Layer 4: Fraud Detection
    const fraudPromise = analyzeFraud(transcription, apiKeys, aiConfig)
        .catch(e => { throw new Error(`Layer 4 (Fraud) Failed: ${e.message}`); });

    // Wait for all
    const [screeningResult, technicalResult, behavioralResult, fraudResult] = await Promise.all([
        screeningPromise,
        technicalPromise,
        behavioralPromise,
        fraudPromise
    ]);

    // Weighting for each layer (4-layer model)
    const w1 = 0.25;  // Screening
    const w2 = 0.35;  // Technical
    const w3 = 0.25;  // Behavioral
    const w4 = 0.15;  // Authenticity (inverted fraud)

    // Composite score
    let finalScore = Math.round(
        (screeningResult.score || 0) * w1 +
        (technicalResult.score || 0) * w2 +
        (behavioralResult.score || 0) * w3 +
        (fraudResult.authenticity_score || 80) * w4
    );

    // Penalty: if fraud detected, reduce score by 30%
    if (fraudResult.fraud_flag) {
        finalScore = Math.round(finalScore * 0.7);
        console.warn(`[Master Agent] ⚠️ Fraud flag detected! Score penalized: ${finalScore}`);
    }

    // Build the final report object — always valid JSON
    const report = {
        finalScore,
        rank: calculateRank(finalScore),
        status: fraudResult.fraud_flag ? 'Flagged' : (finalScore > 75 ? 'Shortlisted' : 'On Hold'),
        summary: generateSummary(candidateData.name, finalScore, technicalResult, behavioralResult),
        layer1: screeningResult,
        layer2: technicalResult,
        layer3: behavioralResult,
        fraudDetection: fraudResult,
        processingTime: Date.now() - startTime,
        usedFallback: false,
        transcription: transcription // Store transcript in report for debugging
    };

    console.log(`[Master Agent] ✅ Evaluation Complete. Final Score: ${finalScore}/100 (${Date.now() - startTime}ms)`);
    return report;
}

// ----- Helper utilities -----
function calculateRank(score) {
    if (score > 90) return "Top 5%";
    if (score > 80) return "Top 15%";
    if (score > 70) return "Top 30%";
    return "Average";
}

function generateSummary(name, score, tech, beh) {
    const techTerms = (tech?.detectedTerms || []).slice(0, 3).join(', ') || 'general skills';
    const tone = (beh?.emotionalTone || 'neutral').toLowerCase();

    let summary = `${name || 'The candidate'} achieved a composite score of ${score}/100. `;
    summary += `They demonstrated knowledge in ${techTerms} `;
    summary += `and displayed a ${tone} attitude. `;
    summary += `Overall, they are a ${score > 80 ? 'strong' : score > 60 ? 'potential' : 'developing'} fit for the role.`;

    if (techTerms === 'general skills' && score < 50) {
        summary += " (Note: Technical usage was low, try to use more industry-specific terms).";
    }

    return summary;
}
