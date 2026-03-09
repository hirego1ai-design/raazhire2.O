import { generateAIResponse, safeParseJSON, validateTranscript } from './ai_utils.js';

// Layer 2: Technical & Content Agent
// Role: Deep analysis of the candidate's actual skills and knowledge.

export async function analyzeTechnical(candidateData, transcription, apiKeys, aiConfig = {}) {
    console.log(`[Layer 2] Starting Technical Analysis...`);

    // ---- STEP 3: Validate transcript before calling AI ----
    const validation = validateTranscript(transcription);
    if (!validation.valid) {
        console.warn(`[Layer 2] Transcript invalid: ${validation.reason}`);
        return {
            score: 0,
            detectedTerms: [],
            accuracy: 0,
            domainKnowledge: 'Unknown',
            details: [`Transcript missing or too short: ${validation.reason}`],
            error: true,
            message: validation.reason
        };
    }

    // ---- STEP 4: Force strict JSON response with low temperature ----
    const systemPrompt = `
        You are an expert Technical Interviewer AI.
        Analyze the following candidate transcription for technical accuracy, depth of knowledge, and terminology usage.
        
        Candidate Role: ${candidateData.appliedJobTitle || 'Software Engineer'}
        Skills to Verify: ${candidateData.skills ? candidateData.skills.join(', ') : 'General Technical Skills'}

        You MUST respond with ONLY a valid JSON object, no extra text, no markdown.
        Return this exact structure:
        {
            "score": <number 0-100>,
            "detectedTerms": [<array of detected technical terms>],
            "accuracy": <number 0-100>,
            "domainKnowledge": "<Basic|Intermediate|Advanced|Expert>",
            "details": [<3-4 bullet point strings justifying the score>]
        }
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            `Transcription to Analyze:\n"${transcription}"`,
            systemPrompt,
            aiConfig
        );

        // ---- STEP 5: Safe JSON parsing ----
        if (!aiResponse) {
            console.warn("[Layer 2] AI returned empty response after all retries");
            throw new Error("AI returned empty response");
        }

        const result = safeParseJSON(aiResponse);
        if (!result) {
            console.warn("[Layer 2] Failed to parse AI response as JSON");
            console.warn("[Layer 2] Raw response:", aiResponse.substring(0, 300));
            throw new Error("AI response could not be parsed as JSON");
        }

        // Ensure required fields exist
        result.score = typeof result.score === 'number' ? result.score : 50;
        result.detectedTerms = Array.isArray(result.detectedTerms) ? result.detectedTerms : [];
        result.accuracy = typeof result.accuracy === 'number' ? result.accuracy : 50;
        result.domainKnowledge = result.domainKnowledge || 'Intermediate';
        result.details = Array.isArray(result.details) ? result.details : ['Analysis completed.'];

        console.log(`[Layer 2] ✅ Technical Analysis Complete. Score: ${result.score}`);
        return result;

    } catch (error) {
        console.error("[Layer 2] AI Analysis Failed:", error.message);

        // ---- STEP 5: Return fallback instead of throwing ----
        // Extract basic keywords from transcription manually
        const techKeywords = [
            'React', 'Node', 'JavaScript', 'TypeScript', 'Python', 'Java',
            'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
            'API', 'REST', 'GraphQL', 'Angular', 'Vue', 'CSS', 'HTML',
            'Machine Learning', 'AI', 'Data', 'Cloud', 'DevOps', 'CI/CD',
            'Agile', 'Scrum', 'Testing', 'TDD', 'Microservices', 'Security'
        ];

        const lowerTranscript = (transcription || '').toLowerCase();
        const detectedTerms = techKeywords.filter(kw =>
            lowerTranscript.includes(kw.toLowerCase())
        );

        const fallbackScore = Math.min(100, Math.max(20, detectedTerms.length * 12 + 20));

        return {
            score: fallbackScore,
            detectedTerms,
            accuracy: fallbackScore,
            domainKnowledge: detectedTerms.length >= 5 ? 'Advanced' :
                detectedTerms.length >= 3 ? 'Intermediate' : 'Basic',
            details: [
                `Fallback analysis: AI service unavailable (${error.message})`,
                `Detected ${detectedTerms.length} technical terms in transcription`,
                `Keywords found: ${detectedTerms.join(', ') || 'None detected'}`,
                'Score based on keyword density analysis'
            ],
            fallback: true
        };
    }
}
