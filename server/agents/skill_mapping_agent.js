import { generateAIResponse } from './ai_utils.js';

/**
 * Role-Based Skill Mapping Engine
 * 
 * Responsibilities:
 * - Automatically map and score candidate skills for each job role
 * - Detect skill gaps
 * - Predict role suitability
 * - Generate skill recommendations
 */

/**
 * Analyze and map skills for a candidate against a job role
 * @param {object} candidateData - Candidate information
 * @param {string} jobRole - Job role/title
 * @param {object} apiKeys - API keys for AI services
 * @param {object} supabase - Supabase client
 * @returns {object} Skill mapping analysis
 */
export async function analyzeSkillMapping(candidateData, jobRole, apiKeys, supabase) {
    console.log(`[Skill Mapping Agent] Analyzing skills for role: ${jobRole}`);

    try {
        // Step 1: Get or create skill requirements for the role
        const roleRequirements = await getRoleRequirements(jobRole, apiKeys, supabase);

        // Step 2: Extract candidate skills
        const candidateSkills = extractCandidateSkills(candidateData);

        // Step 3: Calculate skill match scores
        const skillMatchAnalysis = calculateSkillMatches(candidateSkills, roleRequirements);

        // Step 4: Identify skill gaps
        const skillGaps = identifySkillGaps(candidateSkills, roleRequirements);

        // Step 5: Calculate role suitability score
        const suitabilityScore = calculateRoleSuitability(skillMatchAnalysis, roleRequirements);

        // Step 6: Generate recommendations
        const recommendations = generateRecommendations(skillGaps, suitabilityScore);

        const result = {
            jobRole,
            candidateId: candidateData.id || candidateData.candidate_id,
            candidateName: candidateData.name || candidateData.candidate_name,

            // Skill Analysis
            totalSkills: candidateSkills.length,
            matchedSkills: skillMatchAnalysis.matched.length,
            missingSkills: skillGaps.critical.length + skillGaps.optional.length,

            // Scores
            technicalScore: skillMatchAnalysis.technicalScore,
            softSkillsScore: skillMatchAnalysis.softSkillsScore,
            domainScore: skillMatchAnalysis.domainScore,
            overallSuitability: suitabilityScore,

            // Detailed Analysis
            matchedSkills: skillMatchAnalysis.matched,
            partialMatches: skillMatchAnalysis.partial,
            skillGaps,
            recommendations,

            // Metadata
            analyzedAt: new Date().toISOString()
        };

        console.log(`[Skill Mapping Agent] Analysis complete. Suitability: ${suitabilityScore}%`);
        return result;

    } catch (error) {
        console.error('[Skill Mapping Agent] Error:', error);
        throw error;
    }
}

/**
 * Get skill requirements for a job role
 */
async function getRoleRequirements(jobRole, apiKeys, supabase) {
    // Check if we have cached requirements
    const { data: cached } = await supabase
        .from('skill_mappings')
        .select('*')
        .eq('job_role', jobRole)
        .single();

    if (cached) {
        console.log('[Skill Mapping Agent] Using cached role requirements');
        return {
            role: jobRole,
            requiredSkills: cached.required_skills,
            optionalSkills: cached.optional_skills,
            technicalSkills: cached.technical_skills,
            softSkills: cached.soft_skills,
            domainSkills: cached.domain_skills,
            weights: {
                technical: cached.technical_weight,
                soft: cached.soft_weight,
                domain: cached.domain_weight
            }
        };
    }

    // Generate requirements using AI
    console.log('[Skill Mapping Agent] Generating role requirements using AI...');

    const systemPrompt = `
        You are an expert HR and technical recruiter.
        Generate comprehensive skill requirements for the role: "${jobRole}"
        
        Return a JSON object ONLY (no markdown) with this structure:
        {
            "requiredSkills": {
                "skill_name": weight (0.0-1.0)
            },
            "optionalSkills": {
                "skill_name": weight (0.0-1.0)
            },
            "technicalSkills": ["skill1", "skill2", ...],
            "softSkills": ["skill1", "skill2", ...],
            "domainSkills": ["skill1", "skill2", ...]
        }
        
        Include 5-10 required skills, 5-10 optional skills.
        Technical skills: programming languages, frameworks, tools
        Soft skills: communication, leadership, teamwork, etc.
        Domain skills: industry-specific knowledge
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            `Generate skill requirements for: ${jobRole}`,
            systemPrompt,
            'gemini'
        );

        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const requirements = JSON.parse(cleanJson);

        // Save to database for future use
        await supabase
            .from('skill_mappings')
            .insert([{
                job_role: jobRole,
                required_skills: requirements.requiredSkills,
                optional_skills: requirements.optionalSkills,
                technical_skills: requirements.technicalSkills,
                soft_skills: requirements.softSkills,
                domain_skills: requirements.domainSkills,
                technical_weight: 0.40,
                soft_weight: 0.30,
                domain_weight: 0.30
            }]);

        return {
            role: jobRole,
            ...requirements,
            weights: {
                technical: 0.40,
                soft: 0.30,
                domain: 0.30
            }
        };

    } catch (error) {
        console.warn('[Skill Mapping Agent] AI generation failed, using fallback');
        return getFallbackRequirements(jobRole);
    }
}

/**
 * Fallback requirements for common roles
 */
function getFallbackRequirements(jobRole) {
    const commonRequirements = {
        requiredSkills: {
            'JavaScript': 0.9,
            'React': 0.8,
            'Node.js': 0.7,
            'TypeScript': 0.6,
            'Problem Solving': 0.9
        },
        optionalSkills: {
            'Python': 0.5,
            'Docker': 0.4,
            'AWS': 0.5,
            'GraphQL': 0.4
        },
        technicalSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
        domainSkills: ['Web Development', 'API Design'],
        weights: {
            technical: 0.40,
            soft: 0.30,
            domain: 0.30
        }
    };

    return {
        role: jobRole,
        ...commonRequirements
    };
}

/**
 * Extract skills from candidate data
 */
function extractCandidateSkills(candidateData) {
    const skills = [];

    // From skills array
    if (candidateData.skills && Array.isArray(candidateData.skills)) {
        skills.push(...candidateData.skills);
    }

    // From screening details
    if (candidateData.screening_details?.detectedSkills) {
        skills.push(...candidateData.screening_details.detectedSkills);
    }

    // From technical details
    if (candidateData.technical_details?.detectedTerms) {
        skills.push(...candidateData.technical_details.detectedTerms);
    }

    // Remove duplicates and normalize
    return [...new Set(skills.map(s => s.trim()))];
}

/**
 * Calculate skill matches
 */
function calculateSkillMatches(candidateSkills, roleRequirements) {
    const matched = [];
    const partial = [];

    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());

    // Check required skills
    for (const [skill, weight] of Object.entries(roleRequirements.requiredSkills)) {
        const skillLower = skill.toLowerCase();

        if (candidateSkillsLower.includes(skillLower)) {
            matched.push({ skill, weight, type: 'required' });
        } else {
            // Check for partial matches
            const partialMatch = candidateSkillsLower.find(cs =>
                cs.includes(skillLower) || skillLower.includes(cs)
            );
            if (partialMatch) {
                partial.push({ skill, weight: weight * 0.5, type: 'required' });
            }
        }
    }

    // Check optional skills
    for (const [skill, weight] of Object.entries(roleRequirements.optionalSkills)) {
        const skillLower = skill.toLowerCase();

        if (candidateSkillsLower.includes(skillLower)) {
            matched.push({ skill, weight, type: 'optional' });
        }
    }

    // Calculate category scores
    const technicalScore = calculateCategoryScore(
        candidateSkills,
        roleRequirements.technicalSkills
    );

    const softSkillsScore = calculateCategoryScore(
        candidateSkills,
        roleRequirements.softSkills
    );

    const domainScore = calculateCategoryScore(
        candidateSkills,
        roleRequirements.domainSkills
    );

    return {
        matched,
        partial,
        technicalScore,
        softSkillsScore,
        domainScore
    };
}

/**
 * Calculate score for a skill category
 */
function calculateCategoryScore(candidateSkills, categorySkills) {
    if (!categorySkills || categorySkills.length === 0) {
        return 50; // Neutral
    }

    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());

    let matchCount = 0;
    categorySkills.forEach(skill => {
        if (candidateSkillsLower.includes(skill.toLowerCase())) {
            matchCount++;
        }
    });

    return Math.round((matchCount / categorySkills.length) * 100);
}

/**
 * Identify skill gaps
 */
function identifySkillGaps(candidateSkills, roleRequirements) {
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());

    const critical = [];
    const optional = [];

    // Critical gaps (required skills)
    for (const [skill, weight] of Object.entries(roleRequirements.requiredSkills)) {
        if (!candidateSkillsLower.includes(skill.toLowerCase())) {
            critical.push({ skill, weight, priority: 'high' });
        }
    }

    // Optional gaps
    for (const [skill, weight] of Object.entries(roleRequirements.optionalSkills)) {
        if (!candidateSkillsLower.includes(skill.toLowerCase())) {
            optional.push({ skill, weight, priority: 'medium' });
        }
    }

    return {
        critical,
        optional,
        totalGaps: critical.length + optional.length
    };
}

/**
 * Calculate overall role suitability
 */
function calculateRoleSuitability(skillMatchAnalysis, roleRequirements) {
    const { technicalScore, softSkillsScore, domainScore } = skillMatchAnalysis;
    const weights = roleRequirements.weights;

    const suitability = (
        technicalScore * weights.technical +
        softSkillsScore * weights.soft +
        domainScore * weights.domain
    );

    return Math.round(suitability);
}

/**
 * Generate recommendations
 */
function generateRecommendations(skillGaps, suitabilityScore) {
    const recommendations = [];

    if (suitabilityScore >= 80) {
        recommendations.push({
            type: 'positive',
            message: 'Excellent fit for this role',
            action: 'Proceed to interview'
        });
    } else if (suitabilityScore >= 60) {
        recommendations.push({
            type: 'neutral',
            message: 'Good potential with some skill gaps',
            action: 'Consider for interview with skill development plan'
        });
    } else {
        recommendations.push({
            type: 'negative',
            message: 'Significant skill gaps identified',
            action: 'May require extensive training'
        });
    }

    // Specific skill recommendations
    if (skillGaps.critical.length > 0) {
        const topGaps = skillGaps.critical.slice(0, 3).map(g => g.skill);
        recommendations.push({
            type: 'skill_gap',
            message: `Focus on developing: ${topGaps.join(', ')}`,
            action: 'Provide training resources or mentorship'
        });
    }

    return recommendations;
}

/**
 * Batch analyze multiple candidates for a role
 */
export async function batchAnalyzeSkills(candidates, jobRole, apiKeys, supabase) {
    console.log(`[Skill Mapping Agent] Batch analyzing ${candidates.length} candidates for ${jobRole}`);

    const results = await Promise.all(
        candidates.map(candidate =>
            analyzeSkillMapping(candidate, jobRole, apiKeys, supabase)
        )
    );

    // Sort by suitability score
    results.sort((a, b) => b.overallSuitability - a.overallSuitability);

    return results;
}
