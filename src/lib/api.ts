import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
