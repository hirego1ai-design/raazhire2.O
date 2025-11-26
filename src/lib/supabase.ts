import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if valid credentials are provided
const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
};

export const supabase = (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Log warning if Supabase is not configured
if (!supabase) {
    console.warn('Supabase is not configured. Social login will not work. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}
