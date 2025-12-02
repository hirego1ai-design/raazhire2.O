import { generateAIResponse } from './ai_utils.js';

// Layer 1: Screening Agent
// Role: Rapidly filters candidates based on fundamental criteria and profile analysis.

export async function analyzeScreening(candidateData, apiKeys) {
    console.log(`[Layer 1] Starting AI Screening for: ${candidateData.name || 'Unknown'}`);

    // System Instruction for the AI
    const systemPrompt = `
        You are an expert HR Screening Specialist.
        Analyze the provided candidate profile data to determine their suitability for a general software engineering role (or the specific role if mentioned).
        
        Candidate Data: ${JSON.stringify(candidateData)}

        Evaluate based on:
        1. Profile Completeness (Are key fields like skills, experience present?)
        2. Skill Relevance (Do the skills match modern tech stacks?)
        3. Experience Quality (If provided, does the experience look legitimate and relevant?)

        Return a JSON object ONLY (no markdown) with this structure:
        {
            "score": number (0-100),
            "completeness": number (0-100),
            "keywordMatch": number (0-100),
            "passed": boolean (score > 60),
            "details": string[] (3-4 bullet points explaining the evaluation)
        }
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            "Screen this candidate profile.",
            systemPrompt,
            'gemini' // Use Gemini for fast, cost-effective screening
        );

        if (!aiResponse) throw new Error("AI returned empty response");

        // Clean and parse JSON
        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        // Add audio quality check (still mocked as it requires file processing)
        result.audioQuality = 'High (Assumed)';

        console.log(`[Layer 1] AI Analysis Complete. Score: ${result.score}`);
        return result;

    } catch (error) {
        console.warn("[Layer 1] AI Analysis Failed, falling back to mock logic:", error.message);

        // Fallback Mock Logic (Preserved for robustness)
        const results = {
            completeness: 0,
            keywordMatch: 0,
            audioQuality: 'High (Fallback)',
            passed: false,
            score: 0,
            details: ['AI Service unavailable, using basic fallback check.']
        };

        // 1. Check Profile Completeness
        let filledFields = 0;
        const requiredFields = ['name', 'email', 'experience', 'skills'];
        requiredFields.forEach(field => {
            if (candidateData[field]) filledFields++;
        });
        results.completeness = Math.round((filledFields / requiredFields.length) * 100);
        results.details.push(`Profile Completeness: ${results.completeness}%`);

        // 2. Keyword Matching
        const targetKeywords = ['React', 'Node', 'JavaScript', 'TypeScript', 'Communication'];
        const candidateSkills = (candidateData.skills || []).map(s => s.toLowerCase());
        let matchCount = 0;
        targetKeywords.forEach(kw => {
            if (candidateSkills.some(s => s.includes(kw.toLowerCase()))) matchCount++;
        });
        results.keywordMatch = Math.round((matchCount / targetKeywords.length) * 100);
        results.details.push(`Keyword Match: ${results.keywordMatch}%`);

        // Calculate Score
        results.score = Math.round((results.completeness * 0.4) + (results.keywordMatch * 0.6));
        results.passed = results.score > 50;

        return results;
    }
}
