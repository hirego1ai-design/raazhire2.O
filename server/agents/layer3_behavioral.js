import { generateAIResponse } from './ai_utils.js';

// Layer 3: Behavioral & Soft Skills Agent
// Role: Evaluates non-technical attributes crucial for culture fit.

export async function analyzeBehavioral(candidateData, videoMetadata, transcription, apiKeys) {
    console.log(`[Layer 3] Starting Behavioral Analysis...`);

    const systemPrompt = `
        You are an expert Behavioral Psychologist and HR Specialist.
        Analyze the candidate's communication style, emotional tone, and soft skills based on their speech.
        
        Transcription: "${transcription}"
        Video Metadata: ${JSON.stringify(videoMetadata)}

        Return a JSON object ONLY (no markdown) with this structure:
        {
            "score": number (0-100),
            "traits": string[] (e.g., "Confident", "Anxious", "Articulate"),
            "communicationStyle": string,
            "emotionalTone": "Positive" | "Neutral" | "Negative" | "Professional",
            "details": string[] (3-4 bullet points on soft skills)
        }
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            "Analyze the behavioral traits of this candidate.",
            systemPrompt,
            'gpt4' // Prefer GPT-4 for nuance, fallback to Gemini
        );

        if (!aiResponse) throw new Error("AI returned empty response");

        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.warn("[Layer 3] AI Analysis Failed, falling back to mock:", error.message);

        // Fallback
        return {
            score: 80,
            traits: ['Professional', 'Calm'],
            communicationStyle: 'Clear',
            emotionalTone: 'Positive',
            details: ['AI Analysis failed, using fallback scoring.', 'Tone appears professional.']
        };
    }
}
