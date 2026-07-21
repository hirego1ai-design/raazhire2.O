import { supabase } from './supabase';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined'
        ? (localStorage.getItem('token') || localStorage.getItem('supabase.auth.token') || '')
        : '';
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

export const endpoints = {
    jobs: `${API_BASE_URL}/api/jobs`,
    applications: `${API_BASE_URL}/api/applications`,
    profile: `${API_BASE_URL}/api/profile`,
    gamification: `${API_BASE_URL}/api/gamification`,
    connections: `${API_BASE_URL}/api/connections`,
    generateJobDescription: `${API_BASE_URL}/api/ai/generate-job-description`,
    generateQuestions: `${API_BASE_URL}/api/ai/generate-questions`,
    uploadLiveAssessment: `${API_BASE_URL}/api/candidate/live-assessment/upload`,
    test: `${API_BASE_URL}/api/test`,
    logs: `${API_BASE_URL}/api/admin/system-logs`,
    candidate: {
        applications: `${API_BASE_URL}/api/candidate/applications`,
        stats: `${API_BASE_URL}/api/candidate/stats`,
    },
    employer: {
        stats: `${API_BASE_URL}/api/employer/stats`,
    },
    interviews: {
        candidate: `${API_BASE_URL}/api/interviews/candidate`,
        employer: `${API_BASE_URL}/api/interviews/employer`,
    },
    videoResume: {
        upload: `${API_BASE_URL}/api/video-resume/upload`,
        transcribe: `${API_BASE_URL}/api/video-resume/transcribe`,
        analyze: `${API_BASE_URL}/api/video-resume/analyze`,
        submit: `${API_BASE_URL}/api/video-resume/submit`,
    },
    messages: {
        conversations: `${API_BASE_URL}/api/messages/conversations`,
        send: `${API_BASE_URL}/api/messages/send`,
    },
    admin: {
        youtubeConfig: `${API_BASE_URL}/api/admin/youtube-config`,
        youtubeUploadTest: `${API_BASE_URL}/api/admin/youtube-upload-test`,
        apiKeys: `${API_BASE_URL}/api/admin/api-keys`,
        testApiKey: `${API_BASE_URL}/api/admin/test-api-key`,
        upskill: {
            courses: `${API_BASE_URL}/api/admin/upskill/courses`,
            learners: `${API_BASE_URL}/api/admin/upskill/learners`,
            gamification: `${API_BASE_URL}/api/admin/upskill/gamification`,
            badges: `${API_BASE_URL}/api/admin/upskill/badges`,
        }
    }
};

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
    timeoutMs?: number;
    retries?: number;
}

export class APIError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Gets current Supabase JWT token if user is authenticated
 */
async function getAuthToken(): Promise<string | null> {
    if (!supabase) return null;
    try {
        const { data } = await supabase.auth.getSession();
        return data?.session?.access_token || null;
    } catch {
        return null;
    }
}

/**
 * Production-grade API Client with auth injection, timeouts, and automatic retry logic.
 */
export async function apiRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const {
        params,
        timeoutMs = 15000,
        retries = 1,
        headers: customHeaders,
        ...customConfig
    } = options;

    let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                searchParams.append(key, String(val));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
    }

    const token = await getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(customHeaders as Record<string, string>),
    };

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= retries) {
        attempt++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...customConfig,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const contentType = response.headers.get('content-type');
            let data: any = null;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (typeof data === 'object' && data?.error) || response.statusText || 'API Request Failed';
                throw new APIError(errorMessage, response.status, data);
            }

            return data as T;
        } catch (err: any) {
            clearTimeout(timeoutId);
            lastError = err;

            if (err.name === 'AbortError') {
                lastError = new APIError(`Request timed out after ${timeoutMs}ms`, 408);
            }

            // Only retry network errors or 5xx server errors
            const shouldRetry = (err.name === 'AbortError' || (err instanceof APIError && err.status >= 500)) && attempt <= retries;
            if (!shouldRetry) {
                break;
            }
            await new Promise(res => setTimeout(res, 500 * attempt));
        }
    }

    throw lastError;
}

export async function apiGet<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET', headers });
}

export async function apiPost<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined, headers });
}

export const api = {
    get: <T = any>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: <T = any>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
