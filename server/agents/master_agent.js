// Master AI Agent - orchestrates the multi-layer evaluation
import { analyzeScreening } from './layer1_screening.js';
import { analyzeTechnical } from './layer2_technical.js';
import { analyzeBehavioral } from './layer3_behavioral.js';
import { analyzeFraud } from './layer4_fraud_detection.js';
import { getAIConfig, generateAIResponse, safeParseJSON } from './ai_utils.js';

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

    let screeningResult, technicalResult, behavioralResult, fraudResult;
    let usedFallback = false;

    // ---- STEP 1: Attempt Consolidated Evaluation Call (Fast & Cheap) ----
    try {
        console.log(`[Master Agent] Attempting consolidated evaluation...`);
        const consolidatedPrompt = `
            You are an expert HR Screener, Technical Lead, and Behavioral Psychologist.
            Perform a multi-layered recruitment evaluation on the candidate profile and video transcription.
            
            Candidate Profile:
            ${JSON.stringify(candidateData)}
            
            Applied Job: ${candidateData.appliedJobTitle || 'Software Engineer'}
            Target Skills: ${candidateData.skills ? candidateData.skills.join(', ') : 'General Technical'}

            Evaluate all four layers based on this transcript:
            "${transcription.substring(0, 4000)}"

            Evaluate:
            Layer 1 (Screening): Score 0-100, completeness 0-100, keyword match 0-100.
            Layer 2 (Technical): Score 0-100, verify knowledge of target skills, detect technical terms mentioned.
            Layer 3 (Behavioral): Score 0-100, evaluate communication style, traits, and emotional tone.
            Layer 4 (Fraud): Identify AI speech probability, check authenticity, set fraud flag if suspicious.

            You MUST respond with ONLY a valid JSON object matching this structure (do not return any other text, markdown, or markdown blocks):
            {
                "layer1": {
                    "score": 85,
                    "completeness": 90,
                    "keywordMatch": 80,
                    "passed": true,
                    "details": ["profile is detailed...", "skills are relevant..."]
                },
                "layer2": {
                    "score": 75,
                    "detectedTerms": ["React", "TypeScript"],
                    "accuracy": 80,
                    "domainKnowledge": "Advanced",
                    "details": ["technical terms are accurate..."]
                },
                "layer3": {
                    "score": 80,
                    "traits": ["Confident", "Articulate"],
                    "communicationStyle": "Clear and structured",
                    "emotionalTone": "Positive",
                    "details": ["excellent soft skills..."]
                },
                "layer4": {
                    "fraud_flag": false,
                    "ai_generated_probability": 10,
                    "authenticity_score": 90,
                    "fraud_indicators": [],
                    "confidence": 0.9,
                    "details": ["highly authentic spoken style..."]
                }
            }
        `;

        const aiResponse = await generateAIResponse(
            apiKeys,
            "Evaluate transcription and profile.",
            consolidatedPrompt,
            aiConfig
        );

        if (!aiResponse) throw new Error("Consolidated AI returned empty response");

        const parsed = safeParseJSON(aiResponse);
        if (!parsed || !parsed.layer1 || !parsed.layer2 || !parsed.layer3 || !parsed.layer4) {
            throw new Error("Parsed JSON structure does not contain all layers");
        }

        screeningResult = parsed.layer1;
        technicalResult = parsed.layer2;
        behavioralResult = parsed.layer3;
        fraudResult = parsed.layer4;

        console.log(`[Master Agent] ✅ Consolidated evaluation successful!`);
    } catch (e) {
        console.warn(`[Master Agent] Consolidated call failed (${e.message}). Falling back to parallel sub-agents.`);
        usedFallback = true;

        // ---- STEP 2: Fallback to Parallel Sub-agents (Robust & Backward-Compatible) ----
        const screeningPromise = analyzeScreening(candidateData, apiKeys, aiConfig)
            .catch(e => { throw new Error(`Layer 1 (Screening) Failed: ${e.message}`); });

        const technicalPromise = analyzeTechnical(candidateData, transcription, apiKeys, aiConfig)
            .catch(e => { throw new Error(`Layer 2 (Technical) Failed: ${e.message}`); });

        const behavioralPromise = analyzeBehavioral(transcription, apiKeys, aiConfig)
            .catch(e => { throw new Error(`Layer 3 (Behavioral) Failed: ${e.message}`); });

        const fraudPromise = analyzeFraud(transcription, apiKeys, aiConfig)
            .catch(e => { throw new Error(`Layer 4 (Fraud) Failed: ${e.message}`); });

        [screeningResult, technicalResult, behavioralResult, fraudResult] = await Promise.all([
            screeningPromise,
            technicalPromise,
            behavioralPromise,
            fraudPromise
        ]);
    }

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
        usedFallback: usedFallback,
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
