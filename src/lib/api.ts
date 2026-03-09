export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const endpoints = {
    health: `${API_BASE_URL}/health`,
    test: `${API_BASE_URL}/api/test`,
    logs: `${API_BASE_URL}/api/logs`,
    generateJobDescription: `${API_BASE_URL}/api/generate-job-description`,
    videoResume: {
        upload: `${API_BASE_URL}/api/video-resume/upload`,
        transcribe: `${API_BASE_URL}/api/video-resume/transcribe`,
        analyze: `${API_BASE_URL}/api/video-resume/analyze`,
        submit: `${API_BASE_URL}/api/video-resume/submit`
    },
    generateQuestions: `${API_BASE_URL}/api/generate-questions`,
    uploadLiveAssessment: `${API_BASE_URL}/api/live-assessment/upload`,

    // Portal Endpoints
    jobs: `${API_BASE_URL}/api/jobs`,
    applications: `${API_BASE_URL}/api/applications`,
    profile: `${API_BASE_URL}/api/profile`,
    notifications: `${API_BASE_URL}/api/notifications`,
    connections: `${API_BASE_URL}/api/connections`,

    // Employer Endpoints
    employer: {
        jobs: `${API_BASE_URL}/api/employer/jobs`,
        stats: `${API_BASE_URL}/api/employer/stats`,
        profile: `${API_BASE_URL}/api/employer/profile`,
    },

    // Candidate Endpoints
    candidate: {
        stats: `${API_BASE_URL}/api/candidate/stats`,
        applications: `${API_BASE_URL}/api/applications/candidate`,
    },

    // Interview Endpoints
    interviews: {
        candidate: `${API_BASE_URL}/api/interviews/candidate`,
        employer: `${API_BASE_URL}/api/interviews/employer`,
        base: `${API_BASE_URL}/api/interviews`,
    },

    // Messaging
    messages: {
        conversations: `${API_BASE_URL}/api/conversations`,
        send: `${API_BASE_URL}/api/messages`
    },

    // Screening
    screening: `${API_BASE_URL}/api/screening`,

    // Gamification
    gamification: `${API_BASE_URL}/api/upskill/gamification`,

    // Admin Endpoints
    admin: {
        login: `${API_BASE_URL}/api/admin/login`,
        dashboard: `${API_BASE_URL}/api/admin/dashboard/stats`,
        users: `${API_BASE_URL}/api/admin/users`,
        apiKeys: `${API_BASE_URL}/api/admin/api-keys`,
        testApiKey: `${API_BASE_URL}/api/admin/test-api-key`,
        proctoringConfig: `${API_BASE_URL}/api/admin/proctoring-config`,
        aiConfig: `${API_BASE_URL}/api/admin/ai-config`,
        youtubeConfig: `${API_BASE_URL}/api/admin/youtube-config`,
        youtubeUploadTest: `${API_BASE_URL}/api/admin/youtube-upload-test`,
        youtubeOAuth: {
            authorize: `${API_BASE_URL}/api/youtube/oauth/authorize`,
            callback: `${API_BASE_URL}/api/youtube/oauth/callback`,
            status: `${API_BASE_URL}/api/youtube/oauth/status`,
        },
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

// Helper to get auth headers
export function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('sb-token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// Helper for authenticated GET
export async function apiGet(url: string) {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
}

// Helper for authenticated POST
export async function apiPost(url: string, body: any) {
    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
}

// Helper for authenticated PUT
export async function apiPut(url: string, body: any) {
    const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
}

// Helper for authenticated PATCH
export async function apiPatch(url: string, body?: any) {
    const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
}

// Helper for authenticated DELETE
export async function apiDelete(url: string) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
}
