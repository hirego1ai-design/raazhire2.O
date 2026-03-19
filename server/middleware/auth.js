import { supabase, supabaseAdmin, createScopedClient } from '../utils/supabaseClient.js';

// ==================== AUTH MIDDLEWARE ====================
// Dev bypass is opt-in via ALLOW_DEV_AUTH_BYPASS=true env variable.
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

// ==================== RATE LIMITING ====================
// Per-IP failed auth attempt tracking (5 failures per 15 minutes → 429)
// Note: This in-memory store is suitable for single-instance deployments.
// For multi-instance / load-balanced environments, replace with a shared store (e.g. Redis).
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_FAILURES = 5;
const failedAttempts = new Map(); // IP → { count, windowStart }

// Periodic cleanup to prevent unbounded memory growth
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of failedAttempts) {
        if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
            failedAttempts.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW_MS);

function isRateLimited(ip) {
    const now = Date.now();
    const entry = failedAttempts.get(ip);
    if (!entry) return false;
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        failedAttempts.delete(ip);
        return false;
    }
    return entry.count >= RATE_LIMIT_MAX_FAILURES;
}

function recordFailedAttempt(ip) {
    const now = Date.now();
    const entry = failedAttempts.get(ip);
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        failedAttempts.set(ip, { count: 1, windowStart: now });
    } else {
        entry.count += 1;
    }
}

function clearFailedAttempts(ip) {
    failedAttempts.delete(ip);
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Middleware: Authenticates the user via Supabase JWT
 * 1. Validates the Bearer token.
 * 2. Attaches the user object to `req.user`.
 * 3. Creates a scoped Supabase client (RLS-enforced) and attaches it to `req.supabase`.
 */
export const authenticateUser = async (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Rate limit check before processing any auth
    if (isRateLimited(clientIP)) {
        return res.status(429).json({ error: 'Too many failed authentication attempts. Please try again later.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        if (ALLOW_DEV_BYPASS) {
            console.warn('⚠️ [DEV BYPASS] No auth header for:', req.path);
            if (!supabase) return res.status(503).json({ error: 'Database service unavailable for dev bypass' });

            // SECURITY: Use least-privileged 'candidate' role and anon client to catch RLS bugs during development
            req.user = { id: 'demo-candidate-001', role: 'candidate', email: 'candidate@hirego.demo', name: 'Demo Candidate' };
            req.supabase = supabase;
            req.supabaseAdmin = null;
            return next();
        }
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Missing Bearer token' });
    }

    try {
        const clientForAuth = supabaseAdmin || supabase;
        if (!clientForAuth) {
            return res.status(503).json({ error: 'Authentication service unavailable' });
        }

        const { data: { user }, error } = await clientForAuth.auth.getUser(token);

        if (error || !user) {
            console.warn(`⚠️ Authentication failed for IP: ${clientIP}, Path: ${req.path}`);
            recordFailedAttempt(clientIP);
            const errMsg = IS_PRODUCTION ? 'Authentication failed' : 'Invalid or expired token';
            return res.status(401).json({ error: errMsg });
        }

        // Successful auth — clear any previous failed attempts for this IP
        clearFailedAttempts(clientIP);

        req.user = user;
        req.supabase = createScopedClient(token);
        req.supabaseAdmin = supabaseAdmin;

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        const errMsg = IS_PRODUCTION ? 'Authentication failed' : 'Internal authentication error';
        return res.status(500).json({ error: errMsg });
    }
};

/**
 * Middleware: Ensures the authenticated user has 'admin' role.
 * Always verifies against the database — user_metadata may be stale.
 * Requires `authenticateUser` to run first.
 */
export const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        if (!supabaseAdmin) {
            return res.status(503).json({
                error: 'Admin verification unavailable (missing SUPABASE_SERVICE_ROLE_KEY).'
            });
        }

        // Always verify against the database — metadata can be stale (e.g., after demotion)
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
    } catch (err) {
        console.error('Admin check error:', err);
        const errMsg = IS_PRODUCTION ? 'Admin verification failed' : 'Failed to verify admin privileges';
        return res.status(500).json({ error: errMsg });
    }
};
