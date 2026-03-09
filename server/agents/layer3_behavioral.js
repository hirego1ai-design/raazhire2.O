import { generateAIResponse, safeParseJSON, validateTranscript } from './ai_utils.js';

// Layer 3: Behavioral & Soft Skills Agent
// Role: Evaluates non-technical attributes crucial for culture fit.

export async function analyzeBehavioral(transcription, apiKeys, aiConfig = {}) {
    console.log(`[Layer 3] Starting Behavioral Analysis...`);

    // ---- Validate transcript ----
    const validation = validateTranscript(transcription);
    if (!validation.valid) {
        console.warn(`[Layer 3] Transcript invalid: ${validation.reason}`);
        return {
            score: 0,
            traits: ['Insufficient Data'],
            communicationStyle: 'Unknown',
            emotionalTone: 'Neutral',
            details: [`Transcript missing or too short: ${validation.reason}`],
            error: true,
            message: validation.reason
        };
    }

    // ---- Force strict JSON response ----
    const systemPrompt = `
        You are an expert Behavioral Psychologist and HR Specialist.
        Analyze the candidate's communication style, emotional tone, and soft skills based on their speech.

        You MUST respond with ONLY a valid JSON object, no extra text, no markdown.
        Return this exact structure:
        {
            "score": <number 0-100>,
            "traits": [<array of trait strings, e.g. "Confident", "Articulate">],
            "communicationStyle": "<descriptive string>",
            "emotionalTone": "<Positive|Neutral|Negative|Professional>",
            "details": [<3-4 bullet point strings about soft skills>]
        }
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            `Analyze the behavioral traits of this candidate based on the following transcription:\n\n"${transcription}"`,
            systemPrompt,
            aiConfig // Use dynamic config (admin control)
        );

        // ---- Safe JSON parsing ----
        if (!aiResponse) {
            console.warn("[Layer 3] AI returned empty response after all retries");
            throw new Error("AI returned empty response");
        }

        const result = safeParseJSON(aiResponse);
        if (!result) {
            console.warn("[Layer 3] Failed to parse AI response as JSON");
            console.warn("[Layer 3] Raw response:", aiResponse.substring(0, 300));
            throw new Error("AI response could not be parsed as JSON");
        }

        // Ensure required fields
        result.score = typeof result.score === 'number' ? result.score : 50;
        result.traits = Array.isArray(result.traits) ? result.traits : ['Neutral'];
        result.communicationStyle = result.communicationStyle || 'Conversational';
        result.emotionalTone = result.emotionalTone || 'Neutral';
        result.details = Array.isArray(result.details) ? result.details : ['Analysis completed.'];

        console.log(`[Layer 3] ✅ Behavioral Analysis Complete. Score: ${result.score}`);
        return result;

    } catch (error) {
        console.error("[Layer 3] AI Analysis Failed:", error.message);

        // ---- Fallback: Basic heuristic analysis ----
        const words = (transcription || '').split(/\s+/).length;
        const sentences = (transcription || '').split(/[.!?]+/).filter(s => s.trim()).length;
        const avgWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0;

        // Sentiment keywords
        const positiveWords = ['excited', 'passionate', 'love', 'great', 'excellent', 'achieved', 'success', 'proud', 'confident', 'team', 'leadership', 'growth'];
        const negativeWords = ['hate', 'terrible', 'failed', 'never', 'worst', 'boring', 'frustrated'];

        const lowerText = (transcription || '').toLowerCase();
        const posCount = positiveWords.filter(w => lowerText.includes(w)).length;
        const negCount = negativeWords.filter(w => lowerText.includes(w)).length;

        const sentimentScore = Math.min(100, Math.max(20, 50 + (posCount * 8) - (negCount * 10)));
        const tone = posCount > negCount ? 'Positive' : negCount > posCount ? 'Negative' : 'Neutral';

        const traits = [];
        if (words > 100) traits.push('Verbose');
        if (words > 50 && words <= 100) traits.push('Concise');
        if (avgWordsPerSentence > 15) traits.push('Detailed');
        if (posCount >= 3) traits.push('Enthusiastic');
        if (posCount >= 1) traits.push('Positive');
        if (traits.length === 0) traits.push('Neutral');

        return {
            score: sentimentScore,
            traits,
            communicationStyle: avgWordsPerSentence > 15 ? 'Detailed and thorough' : 'Clear and concise',
            emotionalTone: tone,
            details: [
                `Fallback analysis: AI service unavailable (${error.message})`,
                `Word count: ${words}, Sentences: ${sentences}, Avg words/sentence: ${avgWordsPerSentence}`,
                `Positive indicators: ${posCount}, Negative indicators: ${negCount}`,
                'Score based on sentiment keyword analysis'
            ],
            fallback: true
        };
    }
}
