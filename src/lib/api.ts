export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const endpoints = {
    health: `${API_BASE_URL}/health`,
    test: `${API_BASE_URL}/api/test`,
    logs: `${API_BASE_URL}/api/logs`,
    analyzeVideo: `${API_BASE_URL}/api/analyze-video`,
    generateJobDescription: `${API_BASE_URL}/api/generate-job-description`,
};
