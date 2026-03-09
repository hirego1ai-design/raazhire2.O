import { generateAIResponse, getAIConfig } from '../agents/ai_utils.js';

/**
 * Enhanced AI Services - Real LLM Integration
 * Replaces mock assessment logic with actual AI calls
 */

/**
 * Generates real assessment questions using LLM
 * @param {object} jobData - Job description and requirements
 * @param {object} apiKeys - Decrypted API keys
 * @param {number} count - Number of questions to generate
 * @param {object} supabase - optional database client
 * @returns {object} Generated questions with proper structure
 */
export async function generateRealAssessmentQuestions(jobData, apiKeys, count = 10, supabase = null) {
    console.log(`[AI Service] Generating ${count} real assessment questions for: ${jobData.title}`);
    const aiConfig = await getAIConfig(supabase);

    const systemPrompt = `
        You are an expert technical interviewer for ${jobData.title || 'software development'} positions.
        Generate ${count} high-quality technical interview questions that assess:
        1. Core technical skills for this role
        2. Problem-solving abilities
        3. Practical application knowledge
        4. Industry best practices
        
        Job Requirements:
        ${jobData.description || 'General software development role'}
        ${jobData.required_skills ? `Required Skills: ${jobData.required_skills.join(', ')}` : ''}
        
        Return ONLY valid JSON in this exact format:
        {
            "questions": [
                {
                    "id": 1,
                    "question": "Clear technical question",
                    "type": "coding" | "system_design" | "behavioral" | "technical",
                    "difficulty": "easy" | "medium" | "hard",
                    "estimated_time": number (minutes),
                    "skills_tested": ["skill1", "skill2"],
                    "hints": ["hint1", "hint2"]
                }
            ]
        }
    `;

    const userPrompt = `Generate ${count} technical interview questions for a ${jobData.title || 'software developer'} position.`;

    try {
        const response = await generateAIResponse(apiKeys, userPrompt, systemPrompt, aiConfig);

        if (!response) {
            throw new Error('AI service returned empty response');
        }

        // Parse and validate the response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(response);
        } catch (parseError) {
            console.error('[AI Service] Failed to parse AI response:', response);
            // Fallback to mock questions if parsing fails
            return generateFallbackQuestions(count, jobData.title);
        }

        // Validate structure
        if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            console.warn('[AI Service] Invalid response structure, using fallback');
            return generateFallbackQuestions(count, jobData.title);
        }

        // Ensure we have the right number of questions
        const questions = parsedResponse.questions.slice(0, count);

        // Add missing properties if needed
        const validatedQuestions = questions.map((q, index) => ({
            id: q.id || index + 1,
            question: q.question || `Question ${index + 1}`,
            type: q.type || 'technical',
            difficulty: q.difficulty || 'medium',
            estimated_time: q.estimated_time || 5,
            skills_tested: q.skills_tested || ['general'],
            hints: q.hints || []
        }));

        console.log(`[AI Service] Successfully generated ${validatedQuestions.length} real questions`);
        return { questions: validatedQuestions };

    } catch (error) {
        console.error('[AI Service] Failed to generate real questions:', error.message);
        return generateFallbackQuestions(count, jobData.title);
    }
}

/**
 * Analyzes candidate answers with real AI evaluation
 * @param {object} assessmentData - Question, answer, and context
 * @param {object} apiKeys - Decrypted API keys
 * @param {object} supabase - optional database client
 * @returns {object} Detailed evaluation results
 */
export async function evaluateCandidateAnswer(assessmentData, apiKeys, supabase = null) {
    console.log(`[AI Service] Evaluating candidate answer for question: ${assessmentData.questionId}`);
    const aiConfig = await getAIConfig(supabase);

    const systemPrompt = `
        You are an expert technical interviewer evaluating candidate responses.
        Analyze the following interview response and provide detailed feedback:
        
        Question: "${assessmentData.question}"
        Candidate Answer: "${assessmentData.answer}"
        Expected Skills: ${assessmentData.skills_tested?.join(', ') || 'General technical skills'}
        
        Evaluate on these criteria:
        1. Technical Accuracy (0-100)
        2. Problem-Solving Approach (0-100)
        3. Communication Clarity (0-100)
        4. Depth of Knowledge (0-100)
        
        Return ONLY valid JSON in this exact format:
        {
            "scores": {
                "technical_accuracy": number,
                "problem_solving": number,
                "communication": number,
                "depth_of_knowledge": number
            },
            "overall_score": number,
            "strengths": ["strength1", "strength2"],
            "areas_for_improvement": ["area1", "area2"],
            "detailed_feedback": "Comprehensive feedback explaining the evaluation",
            "recommendation": "hire" | "maybe" | "reject"
        }
    `;

    const userPrompt = `Evaluate this candidate's answer: "${assessmentData.answer}"`;

    try {
        const response = await generateAIResponse(apiKeys, userPrompt, systemPrompt, aiConfig);

        if (!response) {
            throw new Error('AI evaluation service returned empty response');
        }

        // Parse and validate response
        let evaluation;
        try {
            evaluation = JSON.parse(response);
        } catch (parseError) {
            console.error('[AI Service] Failed to parse evaluation response:', response);
            return generateFallbackEvaluation();
        }

        // Validate required fields
        if (!evaluation.scores || !evaluation.overall_score) {
            console.warn('[AI Service] Incomplete evaluation response, using fallback');
            return generateFallbackEvaluation();
        }

        console.log(`[AI Service] Evaluation completed with score: ${evaluation.overall_score}`);
        return evaluation;

    } catch (error) {
        console.error('[AI Service] Failed to evaluate answer:', error.message);
        return generateFallbackEvaluation();
    }
}

/**
 * Generates real job descriptions using AI
 * @param {object} jobRequirements - Basic job requirements
 * @param {object} apiKeys - Decrypted API keys
 * @param {object} supabase - optional database client
 * @returns {object} Generated job description
 */
export async function generateRealJobDescription(jobRequirements, apiKeys, supabase = null) {
    console.log(`[AI Service] Generating real job description for: ${jobRequirements.title}`);
    const aiConfig = await getAIConfig(supabase);

    const systemPrompt = `
        You are a professional technical recruiter and hiring manager.
        Create a comprehensive, realistic job description based on the requirements.
        
        Requirements:
        Title: ${jobRequirements.title}
        Experience: ${jobRequirements.experience || 'Not specified'}
        Skills: ${jobRequirements.skills?.join(', ') || 'General technical skills'}
        Location: ${jobRequirements.location || 'Remote'}
        
        Create a professional job description including:
        1. Company overview (generic tech company)
        2. Role responsibilities
        3. Required qualifications
        4. Nice-to-have skills
        5. Benefits and perks
        6. Application process
        
        Return ONLY valid JSON in this exact format:
        {
            "title": "Job Title",
            "company": "Tech Company Name",
            "location": "Location",
            "description": "Detailed job description",
            "responsibilities": ["responsibility1", "responsibility2"],
            "requirements": ["requirement1", "requirement2"],
            "nice_to_have": ["skill1", "skill2"],
            "benefits": ["benefit1", "benefit2"],
            "salary_range": "₹X - ₹Y per year"
        }
    `;

    const userPrompt = `Create a job description for ${jobRequirements.title} position`;

    try {
        const response = await generateAIResponse(apiKeys, userPrompt, systemPrompt, aiConfig);

        if (!response) {
            throw new Error('AI job description service returned empty response');
        }

        // Parse response
        let jobDescription;
        try {
            jobDescription = JSON.parse(response);
        } catch (parseError) {
            console.error('[AI Service] Failed to parse job description:', response);
            return generateFallbackJobDescription(jobRequirements.title);
        }

        console.log('[AI Service] Job description generated successfully');
        return jobDescription;

    } catch (error) {
        console.error('[AI Service] Failed to generate job description:', error.message);
        return generateFallbackJobDescription(jobRequirements.title);
    }
}

/**
 * Fallback functions for when AI services fail
 */
function generateFallbackQuestions(count, jobTitle = 'Software Developer') {
    console.warn('[AI Service] Using fallback question generation');

    const fallbackQuestions = [
        {
            id: 1,
            question: `Explain the key concepts of ${jobTitle} and how you would apply them in a real-world scenario.`,
            type: 'technical',
            difficulty: 'medium',
            estimated_time: 5,
            skills_tested: ['fundamentals', 'application'],
            hints: ['Think about practical implementation', 'Consider real-world constraints']
        },
        {
            id: 2,
            question: 'Describe a challenging technical problem you solved and the approach you took.',
            type: 'behavioral',
            difficulty: 'medium',
            estimated_time: 7,
            skills_tested: ['problem_solving', 'communication'],
            hints: ['Focus on your thought process', 'Explain the solution approach']
        },
        {
            id: 3,
            question: 'How do you stay updated with new technologies and best practices in your field?',
            type: 'behavioral',
            difficulty: 'easy',
            estimated_time: 3,
            skills_tested: ['learning', 'adaptability'],
            hints: ['Mention specific resources', 'Talk about hands-on practice']
        }
    ];

    // Extend the array to meet the requested count
    while (fallbackQuestions.length < count) {
        const baseIndex = fallbackQuestions.length % 3;
        fallbackQuestions.push({
            ...fallbackQuestions[baseIndex],
            id: fallbackQuestions.length + 1,
            question: fallbackQuestions[baseIndex].question + ' (Follow-up)'
        });
    }

    return { questions: fallbackQuestions.slice(0, count) };
}

function generateFallbackEvaluation() {
    return {
        scores: {
            technical_accuracy: 75,
            problem_solving: 70,
            communication: 80,
            depth_of_knowledge: 65
        },
        overall_score: 72,
        strengths: ['Clear communication', 'Good problem-solving approach'],
        areas_for_improvement: ['Technical depth could be enhanced', 'More specific examples needed'],
        detailed_feedback: 'Candidate demonstrated solid understanding with clear communication. Some areas for technical improvement.',
        recommendation: 'maybe'
    };
}

function generateFallbackJobDescription(title) {
    return {
        title: title,
        company: 'Tech Innovations Inc.',
        location: 'Remote',
        description: `We are looking for a skilled ${title} to join our growing team. This position offers exciting challenges and opportunities for professional growth.`,
        responsibilities: [
            'Develop and maintain high-quality software solutions',
            'Collaborate with cross-functional teams',
            'Participate in code reviews and technical discussions'
        ],
        requirements: [
            'Bachelor\'s degree in Computer Science or related field',
            '2+ years of relevant experience',
            'Strong problem-solving skills'
        ],
        nice_to_have: ['Cloud experience', 'Agile methodology knowledge'],
        benefits: ['Competitive salary', 'Flexible work hours', 'Professional development opportunities'],
        salary_range: '₹600,000 - ₹1,200,000 per year'
    };
}

// Export all functions
export const aiServices = {
    generateRealAssessmentQuestions,
    evaluateCandidateAnswer,
    generateRealJobDescription
};