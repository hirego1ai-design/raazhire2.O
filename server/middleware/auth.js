import { createLogger, format, transports } from 'winston';
import { supabase, supabaseAdmin, createScopedClient } from '../utils/supabaseClient.js';

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [new transports.Console()],
});


// ==================== AUTH MIDDLEWARE ====================

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
}, RATE_LIMIT_WINDOW_MS).unref();

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
 * Middleware: Authenticates the user via Supabase JWT.
 * - Validates the Bearer token via Supabase auth.getUser().
 * - Attaches the verified user object to req.user.
 * - Creates a scoped (RLS-enforced) Supabase client for req.supabase.
 * - Does NOT attach req.supabaseAdmin — that is reserved for requireAdmin.
 * - No bypass paths, no magic tokens, no mock users.
 */
export const authenticateUser = async (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Rate limit check before processing any auth
    if (isRateLimited(clientIP)) {
        return res.status(429).json({ error: 'Too many failed authentication attempts. Please try again later.' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    if (!token) {
        return res.status(401).json({ error: 'Bearer token is empty' });
    }

    try {
        const clientForAuth = supabaseAdmin || supabase;
        if (!clientForAuth) {
            logger.error('Auth service unavailable: no Supabase client configured');
            return res.status(503).json({ error: 'Authentication service unavailable' });
        }

        const { data: { user }, error } = await clientForAuth.auth.getUser(token);

        if (error || !user) {
            recordFailedAttempt(clientIP);
            logger.warn('Authentication failed', { error: error?.message, ip: clientIP });
            return res.status(401).json({ error: IS_PRODUCTION ? 'Authentication failed' : (error?.message || 'Invalid token') });
        }

        clearFailedAttempts(clientIP);
        req.user = user;
        req.supabase = createScopedClient(token);
        // req.supabaseAdmin is intentionally NOT set here; only requireAdmin attaches it

        next();
    } catch (err) {
        logger.error('authenticateUser exception', { message: err.message, stack: err.stack });
        return res.status(500).json({ error: IS_PRODUCTION ? 'Authentication error' : err.message });
    }
};

/**
 * Middleware: Ensures the authenticated user has 'admin' role.

 */
export const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!supabaseAdmin) {
        logger.error('requireAdmin: supabaseAdmin not available');
        return res.status(503).json({ error: 'Admin verification unavailable' });
    }

    try {
        const { data: userData, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !userData) {
            logger.warn('Admin access denied: user not found in DB', { userId: req.user.id });
            return res.status(403).json({ error: process.env.NODE_ENV === 'production' ? 'Access denied' : 'Admin access required' });
        }

        if (userData.role !== 'admin') {
            logger.warn('Admin access denied: insufficient role', { userId: req.user.id, role: userData.role });
            return res.status(403).json({ error: process.env.NODE_ENV === 'production' ? 'Access denied' : 'Admin access required' });
        }

        // Only expose the admin client after the user has been verified as admin
        req.supabaseAdmin = supabaseAdmin;
        logger.info('Admin access granted', { userId: req.user.id, path: req.path });
        next();
    } catch (err) {
        logger.error('requireAdmin exception', { userId: req.user?.id, message: err.message });
        return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Access denied' : 'Failed to verify admin privileges' });
    }
};

/**
 * Middleware factory: Ensures the authenticated user has one of the allowed roles.
 * - Requires authenticateUser to run first.
 * - Always verifies role from the public.users database table.
 * - Defaults to 'candidate' if the user is not found in the DB.
 * @param {...string} allowedRoles - One or more roles that are permitted.
 */
export const requireRole = (...allowedRoles) => async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!supabaseAdmin) {
        logger.error('requireRole: supabaseAdmin not available');
        return res.status(503).json({ error: 'Role verification unavailable' });
    }

    try {
        const { data: userData, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        // Default to least privilege if user not found
        const userRole = (!error && userData?.role) ? userData.role : 'candidate';

        if (!allowedRoles.includes(userRole)) {
            logger.warn('Role access denied', { userId: req.user.id, role: userRole, required: allowedRoles, path: req.path });
            return res.status(403).json({ error: process.env.NODE_ENV === 'production' ? 'Access denied' : `Access denied. Required role: ${allowedRoles.join(' or ')}` });
        }

        req.userRole = userRole;
        next();
    } catch (err) {
        logger.error('requireRole exception', { userId: req.user?.id, message: err.message });
        return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Access denied' : 'Failed to verify role' });
    }
};
