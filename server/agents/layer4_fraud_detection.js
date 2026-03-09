/**
 * Model D — Fraud & AI-Generated Content Detection Agent
 * 
 * Responsibilities:
 * - Detect AI-generated speech patterns
 * - Identify scripted memorization
 * - Flag unnatural phrasing
 * - Detect inconsistencies in candidate responses
 */

import { generateAIResponse, safeParseJSON } from './ai_utils.js';

/**
 * Analyze transcript for fraud and AI-generated content
 * @param {string} transcription - The candidate's transcribed speech
 * @param {object} apiKeys - Decrypted API keys
 * @returns {object} Fraud analysis results
 */
export async function analyzeFraud(transcription, apiKeys, aiConfig = {}) {
    console.log(`[Model D] Starting Fraud & Authenticity Analysis...`);

    if (!transcription || transcription.trim().length < 30) {
        console.warn('[Model D] Transcript too short for fraud analysis');
        return {
            fraud_flag: false,
            ai_generated_probability: 0,
            authenticity_score: 50,
            fraud_indicators: ['Insufficient data for analysis'],
            confidence: 0.3,
            details: ['Transcript too short to perform meaningful fraud analysis']
        };
    }

    const systemPrompt = `You are an AI content authenticity expert specializing in detecting AI-generated speech, scripted memorization, and fraudulent video interview responses.

Analyze this transcript for:
1. Signs of AI-generated speech (unnaturally perfect grammar, repetitive sentence structures, lack of filler words)
2. Scripted memorization patterns (robotic delivery indicators, lack of spontaneity markers)
3. Unnatural phrasing (corporate jargon overuse without context, copied text patterns)
4. Inconsistencies (contradictory statements, impossible experience claims)
5. Authenticity markers (natural hesitations "um", "uh", self-corrections, personal anecdotes)

You MUST respond with ONLY a valid JSON object:
{
    "fraud_flag": boolean,
    "ai_generated_probability": number (0-100),
    "authenticity_score": number (0-100, higher = more authentic),
    "fraud_indicators": [string array of specific concerns found],
    "confidence": number (0-1, your confidence in this assessment),
    "details": [string array of 3-5 analysis observations]
}`;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            `Analyze this candidate transcript for authenticity and fraud indicators:\n\n"${transcription.substring(0, 3000)}"`,
            systemPrompt,
            aiConfig
        );

        if (!aiResponse) throw new Error('AI returned empty response');

        const result = safeParseJSON(aiResponse);
        if (!result) throw new Error('Failed to parse fraud analysis response');

        // Validate and normalize
        result.fraud_flag = typeof result.fraud_flag === 'boolean' ? result.fraud_flag : false;
        result.ai_generated_probability = typeof result.ai_generated_probability === 'number'
            ? Math.max(0, Math.min(100, result.ai_generated_probability)) : 0;
        result.authenticity_score = typeof result.authenticity_score === 'number'
            ? Math.max(0, Math.min(100, result.authenticity_score)) : 80;
        result.fraud_indicators = Array.isArray(result.fraud_indicators) ? result.fraud_indicators : [];
        result.confidence = typeof result.confidence === 'number' ? result.confidence : 0.5;
        result.details = Array.isArray(result.details) ? result.details : ['Analysis completed'];

        // Auto-flag if AI probability is very high
        if (result.ai_generated_probability > 80 && !result.fraud_flag) {
            result.fraud_flag = true;
            result.fraud_indicators.push('High AI-generated probability detected (>80%)');
        }

        console.log(`[Model D] ✅ Fraud Analysis Complete. Authenticity: ${result.authenticity_score}%, AI probability: ${result.ai_generated_probability}%`);
        return result;

    } catch (error) {
        console.error('[Model D] AI Fraud Analysis Failed:', error.message);

        // Heuristic fallback
        const words = transcription.split(/\s+/);
        const fillerWords = ['um', 'uh', 'like', 'you know', 'honestly', 'actually', 'basically'];
        const fillerCount = fillerWords.reduce((c, f) => c + (transcription.toLowerCase().match(new RegExp(`\\b${f}\\b`, 'g')) || []).length, 0);
        const fillerRatio = fillerCount / words.length;

        // Natural speech typically has 5-8% filler words
        // AI-generated text has almost none
        const isLikelyNatural = fillerRatio > 0.02;
        const authenticity = isLikelyNatural ? 75 : 40;

        return {
            fraud_flag: !isLikelyNatural && words.length > 100,
            ai_generated_probability: isLikelyNatural ? 15 : 60,
            authenticity_score: authenticity,
            fraud_indicators: isLikelyNatural
                ? ['Natural speech patterns detected (fallback analysis)']
                : ['Very few filler words detected — possible scripted/AI content (fallback analysis)'],
            confidence: 0.3,
            details: [
                `Fallback analysis: AI service unavailable (${error.message})`,
                `Filler word ratio: ${(fillerRatio * 100).toFixed(1)}%`,
                `Total words: ${words.length}`,
                isLikelyNatural ? 'Speech patterns appear natural' : 'Low filler ratio may indicate scripted content'
            ],
            fallback: true
        };
    }
}
