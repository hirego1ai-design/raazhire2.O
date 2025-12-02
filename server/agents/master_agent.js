// Master AI Agent - orchestrates the multi‑layer evaluation
import { analyzeScreening } from './layer1_screening.js';
import { analyzeTechnical } from './layer2_technical.js';
import { analyzeBehavioral } from './layer3_behavioral.js';

/**
 * Runs the full evaluation pipeline.
 * @param {object} candidateData – basic candidate info (name, skills, etc.)
 * @param {object} videoData – contains `transcription` and optional metadata
 * @param {object} apiKeys – decrypted API keys for external services
 * @returns {object} detailed report used by the frontend
 */
export async function runMasterEvaluation(candidateData, videoData, apiKeys) {
    const startTime = Date.now();

    // ----- Layer 1: Screening -----
    const screeningResult = await analyzeScreening(candidateData, apiKeys);

    // ----- Layer 2: Technical -----
    const technicalResult = await analyzeTechnical(candidateData, videoData.transcription, apiKeys);

    // ----- Layer 3: Behavioral -----
    const behavioralResult = await analyzeBehavioral(videoData.transcription, apiKeys);

    // Weighting for each layer (adjustable)
    const w1 = 0.3;
    const w2 = 0.4;
    const w3 = 0.3;

    // Composite score
    const finalScore = Math.round(
        screeningResult.score * w1 +
        technicalResult.score * w2 +
        behavioralResult.score * w3
    );

    // Build the final report object
    const report = {
        finalScore,
        rank: calculateRank(finalScore),
        status: finalScore > 75 ? 'Shortlisted' : 'On Hold',
        summary: generateSummary(candidateData.name, finalScore, technicalResult, behavioralResult),
        layer1: screeningResult,
        layer2: technicalResult,
        layer3: behavioralResult,
        processingTime: Date.now() - startTime
    };

    console.log(`[Master Agent] Evaluation Complete. Final Score: ${finalScore}/100`);
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
    const techTerms = (tech.detectedTerms || []).slice(0, 3).join(', ');
    const tone = (beh.emotionalTone || '').toLowerCase();
    return `${name || 'The candidate'} achieved a composite score of ${score}/100. ` +
        `They demonstrated strong technical knowledge in ${techTerms} ` +
        `and displayed a ${tone} attitude. ` +
        `Overall, they are a ${score > 80 ? 'strong' : 'potential'} fit for the role.`;
}
