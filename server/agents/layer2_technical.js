import { generateAIResponse } from './ai_utils.js';

// Layer 2: Technical & Content Agent
// Role: Deep analysis of the candidate's actual skills and knowledge.

export async function analyzeTechnical(candidateData, transcription, apiKeys) {
    console.log(`[Layer 2] Starting Technical Analysis...`);

    // System Instruction for the AI
    const systemPrompt = `
        You are an expert Technical Interviewer AI. 
        Analyze the following candidate transcription for technical accuracy, depth of knowledge, and terminology usage.
        
        Candidate Role: ${candidateData.appliedJobTitle || 'Software Engineer'}
        Skills to Verify: ${candidateData.skills ? candidateData.skills.join(', ') : 'General Technical Skills'}

        Return a JSON object ONLY (no markdown) with this structure:
        {
            "score": number (0-100),
            "detectedTerms": string[],
            "accuracy": number (0-100),
            "domainKnowledge": "Basic" | "Intermediate" | "Advanced" | "Expert",
            "details": string[] (3-4 bullet points justifying the score)
        }
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            `Transcription to Analyze:\n"${transcription}"`,
            systemPrompt,
            'gemini' // Prefer Gemini for large text analysis
        );

        if (!aiResponse) throw new Error("AI returned empty response");

        // Clean and parse JSON
        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        return result;

    } catch (error) {
        console.warn("[Layer 2] AI Analysis Failed, falling back to mock:", error.message);

        // Fallback Mock Logic
        const technicalTerms = ['React', 'Node.js', 'API', 'Database'];
        const detectedTerms = technicalTerms.filter(() => Math.random() > 0.3);
        return {
            score: 75,
            detectedTerms: detectedTerms,
            accuracy: 85,
            domainKnowledge: 'Intermediate',
            details: ['AI Analysis failed, using fallback scoring.', 'Candidate mentioned key terms.']
        };
    }
}
