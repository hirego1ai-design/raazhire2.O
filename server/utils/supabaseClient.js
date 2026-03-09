import { createClient } from '@supabase/supabase-js';

// ==================== SUPABASE CLIENTS ====================
// SECURITY FIX: Separate anon and admin clients
// - supabase (anon key): Respects RLS policies — used for user-facing operations
// - supabaseAdmin (service role key): Bypasses RLS — used ONLY for admin operations

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
        console.error('🔴 FATAL: Missing SUPABASE_URL or SUPABASE_ANON_KEY in production.');
        process.exit(1);
    } else {
        console.warn('⚠️  Missing Supabase credentials. Database features will be disabled.');
    }
}

// Global anon client (no user context)
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Admin client (bypasses RLS — for admin operations ONLY)
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null; // MUST NOT fallback to anon client

if (supabaseServiceKey) {
    // console.log('✅ Admin Supabase client initialized (service role)');
} else if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  No SUPABASE_SERVICE_ROLE_KEY found in production. Admin operations may fail.');
}

/**
 * Creates a new Supabase client scoped to the authenticated user.
 * This ensures RLS policies work correctly by passing the user's JWT.
 * @param {string} token - The raw JWT string
 */
export const createScopedClient = (token) => {
    if (!supabaseUrl || !supabaseAnonKey || !token) return supabase;

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });
};
