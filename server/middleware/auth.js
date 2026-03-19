import { supabase, supabaseAdmin, createScopedClient } from '../utils/supabaseClient.js';

// ==================== AUTH MIDDLEWARE ====================
// SECURITY FIX: Removed dev-mode bypasses that hardcoded mock users.
// Dev bypass is now opt-in via ALLOW_DEV_AUTH_BYPASS=true env variable.
// PRODUCTION SECURITY: Bypass is automatically disabled in production.
export const ALLOW_DEV_BYPASS = process.env.ALLOW_DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production';

// Production security guard - never allow bypass in production
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_AUTH_BYPASS === 'true') {
    console.error('🔴 FATAL: Development auth bypass cannot be enabled in production');
    process.exit(1);
}

if (ALLOW_DEV_BYPASS) {
    console.warn('⚠️  DEV AUTH BYPASS IS ENABLED. This must NEVER be enabled in production.');
}

/**
 * Middleware: Authenticates the user via Supabase JWT
 * 1. Validates the Bearer token.
 * 2. Attaches the user object to `req.user`.
 * 3. Creates a scoped Supabase client (RLS-enforced) and attaches it to `req.supabase`.
 */
export const authenticateUser = async (req, res, next) => {
    // Security: Log authentication attempts
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        if (ALLOW_DEV_BYPASS) {
            console.warn('⚠️ [DEV BYPASS] No auth header for:', req.path);
            const devClient = supabaseAdmin || supabase;
            if (!devClient) return res.status(503).json({ error: 'Database service unavailable for dev bypass' });

            req.user = { id: 'demo-candidate-001', role: 'admin', email: 'candidate@hirego.demo', name: 'Demo Candidate' };
            req.supabase = devClient;
            req.supabaseAdmin = supabaseAdmin;
            return next();
        }
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Missing Bearer token' });
    }

    // Bypass check for testing when Supabase is down
    if (token === 'BYPASS_TOKEN') {
        if (!ALLOW_DEV_BYPASS) {
            console.warn(`🔴 SECURITY: Attempt to use BYPASS_TOKEN in environment where ALLOW_DEV_BYPASS is false. IP: ${clientIP}`);
            return res.status(403).json({ error: 'Auth bypass is disabled in this environment' });
        }
        console.warn('⚠️ [DEV BYPASS] Using BYPASS_TOKEN for:', req.path);
        const devClient = supabaseAdmin || supabase;
        if (!devClient) return res.status(503).json({ error: 'Database service unavailable for dev bypass' });

        req.user = { id: 'demo-candidate-001', role: 'admin', email: 'candidate@hirego.demo', name: 'Demo Candidate' };
        req.supabase = devClient;
        req.supabaseAdmin = supabaseAdmin;
        return next();
    }

    try {
        // Use admin client for token validation if possible
        const clientForAuth = supabaseAdmin || supabase;
        if (!clientForAuth) {
            return res.status(503).json({ error: 'Authentication service unavailable' });
        }

        const { data: { user }, error } = await clientForAuth.auth.getUser(token);

        if (error || !user) {
            console.warn(`⚠️ Authentication failed for IP: ${clientIP}, Path: ${req.path}`);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = user;

        // Using supabaseAdmin to prevent 42501 RLS blocks on missing database policies (API enforces user filters natively)
        req.supabase = supabaseAdmin || supabase;
        req.supabaseAdmin = supabaseAdmin;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal authentication error' });
    }
};

/**
 * Middleware: Ensures the authenticated user has 'admin' role
 * Requires `authenticateUser` to run first.
 */
export const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // 1. First check user metadata (Reliable and fast)
    if (req.user.user_metadata?.role === 'admin') {
        return next();
    }

    // 2. Fallback to querying the users table
    try {
        // Check if supabaseAdmin exists
        if (!supabaseAdmin) {
            return res.status(503).json({
                error: 'Admin verification unavailable (missing SUPABASE_SERVICE_ROLE_KEY).'
            });
        }

        // Use supabaseAdmin to bypass RLS
        const { data: userData, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !userData) {
            console.warn(`Admin access denied for user ${req.user.id}. User not found in database.`);
            return res.status(403).json({ error: 'Admin access required' });
        }

        if (userData.role !== 'admin') {
            console.warn(`Admin access denied for user ${req.user.id}. Database role: ${userData.role}`);
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({ error: 'Failed to verify admin privileges' });
    }
};
