/**
 * ============================================
 * DEEPSEEK AI AGENT
 * Handles AI-powered recommendations and course suggestions
 * ============================================
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export class DeepSeekAgent {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.model = 'deepseek-chat';
    }

    /**
     * Generate course recommendations based on user profile and history
     */
    async generateCourseRecommendations(userProfile, availableCourses, enrolledCourses) {
        try {
            const prompt = `You are an AI career advisor for the HireGo AI platform. Based on the user's profile and learning history, recommend the most suitable courses.

USER PROFILE:
- Current Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Career Goal: ${userProfile.careerGoal || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Beginner'}
- Completed Courses: ${enrolledCourses?.filter(c => c.status === 'completed').map(c => c.title).join(', ') || 'None'}
- Currently Enrolled: ${enrolledCourses?.filter(c => c.status === 'active').map(c => c.title).join(', ') || 'None'}

AVAILABLE COURSES:
${availableCourses.map(c => `- ${c.title} (${c.category}, ${c.difficulty}): ${c.description}`).join('\n')}

Provide recommendations in JSON format:
{
    "recommendations": [
        {
            "courseId": "course_id",
            "courseTitle": "Title",
            "reason": "Why this course is recommended",
            "relevanceScore": 85,
            "learningPath": "Suggested learning path position",
            "estimatedImpact": "Career impact description"
        }
    ],
    "learningPathSuggestion": "Overall learning path recommendation",
    "skillGaps": ["skill1", "skill2"],
    "careerInsights": "Personalized career advice"
}

Return ONLY valid JSON, no markdown or explanation.`;

            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: 'You are an expert AI career advisor. Respond only with valid JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            try {
                return JSON.parse(content);
            } catch (parseError) {
                // Try to extract JSON from the response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                throw parseError;
            }
        } catch (error) {
            console.error('DeepSeek recommendation error:', error);
            // Return fallback recommendations
            return this.getFallbackRecommendations(availableCourses, enrolledCourses);
        }
    }

    /**
     * Generate personalized learning insights
     */
    async generateLearningInsights(userProgress, completedAssessments) {
        try {
            const prompt = `Analyze the learner's progress and provide personalized insights.

LEARNER PROGRESS:
- Total Courses Enrolled: ${userProgress.totalCoursesEnrolled || 0}
- Courses Completed: ${userProgress.coursesCompleted || 0}
- Total Hours Learned: ${userProgress.totalHoursLearned || 0}
- Current Streak: ${userProgress.currentStreakDays || 0} days
- Skills Acquired: ${userProgress.skillsAcquired?.join(', ') || 'None'}
- XP Points: ${userProgress.xpPoints || 0}

ASSESSMENT SCORES:
${completedAssessments?.map(a => `- ${a.courseName}: ${a.score}%`).join('\n') || 'No assessments completed'}

Provide insights in JSON format:
{
    "overallAnalysis": "Brief analysis of learning journey",
    "strengths": ["strength1", "strength2"],
    "areasForImprovement": ["area1", "area2"],
    "nextMilestones": [
        {
            "milestone": "Description",
            "actionItems": ["action1", "action2"],
            "estimatedTimeframe": "1 week"
        }
    ],
    "motivationalMessage": "Personalized encouragement",
    "predictedCareerReadiness": 75
}

Return ONLY valid JSON.`;

            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: 'You are an expert learning analytics advisor. Respond only with valid JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            try {
                return JSON.parse(content);
            } catch (parseError) {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                throw parseError;
            }
        } catch (error) {
            console.error('DeepSeek insights error:', error);
            return this.getFallbackInsights(userProgress);
        }
    }

    /**
     * Generate live class recommendations
     */
    async generateLiveClassRecommendations(userProfile, upcomingClasses) {
        try {
            const prompt = `Recommend the best upcoming live classes for this learner.

USER PROFILE:
- Skills: ${userProfile.skills?.join(', ') || 'General'}
- Level: ${userProfile.experienceLevel || 'Beginner'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}

UPCOMING LIVE CLASSES:
${upcomingClasses.map(c => `- ${c.title} by ${c.instructor} on ${c.scheduledAt}: ${c.description}`).join('\n')}

Provide recommendations in JSON format:
{
    "recommendedClasses": [
        {
            "classId": "id",
            "priority": 1,
            "reason": "Why this class is recommended",
            "expectedOutcome": "What the learner will gain"
        }
    ],
    "weeklyScheduleSuggestion": "Best time allocation advice"
}

Return ONLY valid JSON.`;

            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: 'You are an expert learning scheduler. Respond only with valid JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.6,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            try {
                return JSON.parse(content);
            } catch (parseError) {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                throw parseError;
            }
        } catch (error) {
            console.error('DeepSeek live class recommendation error:', error);
            return {
                recommendedClasses: upcomingClasses.slice(0, 3).map((c, i) => ({
                    classId: c.id,
                    priority: i + 1,
                    reason: 'Recommended based on your profile',
                    expectedOutcome: 'Skill enhancement'
                }))
            };
        }
    }

    /**
     * Fallback recommendations when API fails
     */
    getFallbackRecommendations(availableCourses, enrolledCourses) {
        const enrolledIds = new Set(enrolledCourses?.map(c => c.courseId) || []);
        const notEnrolled = availableCourses.filter(c => !enrolledIds.has(c.id));

        return {
            recommendations: notEnrolled.slice(0, 5).map((course, index) => ({
                courseId: course.id,
                courseTitle: course.title,
                reason: `Trending course in ${course.category}`,
                relevanceScore: 90 - (index * 5),
                learningPath: `Step ${index + 1}`,
                estimatedImpact: 'High career growth potential'
            })),
            learningPathSuggestion: 'Start with foundational courses and progress to advanced topics',
            skillGaps: ['Advanced Programming', 'Data Analysis', 'Communication'],
            careerInsights: 'Focus on building practical skills through project-based learning'
        };
    }

    /**
     * Fallback insights when API fails
     */
    getFallbackInsights(userProgress) {
        return {
            overallAnalysis: 'You are making great progress on your learning journey!',
            strengths: ['Consistent learning', 'Good assessment scores'],
            areasForImprovement: ['Increase learning frequency', 'Explore new topics'],
            nextMilestones: [
                {
                    milestone: 'Complete 5 courses',
                    actionItems: ['Finish current courses', 'Enroll in recommended courses'],
                    estimatedTimeframe: '2 weeks'
                }
            ],
            motivationalMessage: 'Keep up the great work! Every lesson brings you closer to your goals.',
            predictedCareerReadiness: Math.min((userProgress.coursesCompleted || 0) * 15 + 30, 95)
        };
    }
}

export default DeepSeekAgent;
