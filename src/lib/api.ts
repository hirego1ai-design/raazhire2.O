export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const endpoints = {
    health: `${API_BASE_URL}/health`,
    test: `${API_BASE_URL}/api/test`,
    logs: `${API_BASE_URL}/api/logs`,
    analyzeVideo: `${API_BASE_URL}/api/analyze-video`,
    generateJobDescription: `${API_BASE_URL}/api/generate-job-description`,

    // Portal Endpoints
    jobs: `${API_BASE_URL}/api/jobs`,
    applications: `${API_BASE_URL}/api/applications`,
    profile: `${API_BASE_URL}/api/profile`,
    gamification: `${API_BASE_URL}/api/gamification`,

    // Admin Endpoints
    admin: {
        apiKeys: `${API_BASE_URL}/api/admin/api-keys`,
        testApiKey: `${API_BASE_URL}/api/admin/test-api-key`,
        proctoringConfig: `${API_BASE_URL}/api/admin/proctoring-config`,
        aiConfig: `${API_BASE_URL}/api/admin/ai-config`,
        youtubeConfig: `${API_BASE_URL}/api/admin/youtube-config`,
        emailConfig: `${API_BASE_URL}/api/admin/email-config`,
        creditConfig: `${API_BASE_URL}/api/admin/credit-config`,
        jobPricing: `${API_BASE_URL}/api/admin/job-pricing`,
        upskill: {
            courses: `${API_BASE_URL}/api/admin/upskill/courses`,
            learners: `${API_BASE_URL}/api/admin/upskill/learners`,
            gamification: `${API_BASE_URL}/api/admin/upskill/gamification`,
            badges: `${API_BASE_URL}/api/admin/upskill/badges`,
            stats: `${API_BASE_URL}/api/admin/upskill/stats`,
        }
    }
};
