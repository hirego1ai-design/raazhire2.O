import { supabase, supabaseAdmin, createScopedClient } from '../utils/supabaseClient.js';

// ==================== RATE LIMITING ====================
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_FAILURES = 5;
const failedAttempts = new Map();

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

export const authenticateUser = async (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';

    if (isRateLimited(clientIP)) {
        return res.status(429).json({ error: 'Too many failed authentication attempts. Please try again later.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        recordFailedAttempt(clientIP);
        return res.status(401).json({ error: IS_PRODUCTION ? 'Authentication failed' : 'Missing or malformed Authorization header' });
    }

    const token = authHeader.slice(7);
    if (!token) {
        recordFailedAttempt(clientIP);
        return res.status(401).json({ error: IS_PRODUCTION ? 'Authentication failed' : 'Missing Bearer token' });
    }

    try {
        const clientForAuth = supabaseAdmin || supabase;
        if (!clientForAuth) {
            console.error('Auth service unavailable: no Supabase client configured');
            return res.status(503).json({ error: 'Authentication service unavailable' });
        }

        const { data: { user }, error } = await clientForAuth.auth.getUser(token);

        if (error || !user) {
            recordFailedAttempt(clientIP);
            console.warn(`Auth failed for IP: ${clientIP}, Path: ${req.path}`);
            return res.status(401).json({ error: IS_PRODUCTION ? 'Authentication failed' : 'Invalid or expired token' });
        }

        clearFailedAttempts(clientIP);
        req.user = user;
        req.supabase = createScopedClient(token);
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        return res.status(500).json({ error: IS_PRODUCTION ? 'Authentication failed' : 'Internal authentication error' });
    }
};

export const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!supabaseAdmin) {
        console.error('requireAdmin: supabaseAdmin not available');
        return res.status(503).json({ error: 'Admin verification unavailable' });
    }

    try {
        const { data: userData, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !userData) {
            console.warn('Admin access denied: user not found in DB', req.user.id);
            return res.status(403).json({ error: IS_PRODUCTION ? 'Access denied' : 'Admin access required' });
        }

        if (userData.role !== 'admin') {
            console.warn('Admin access denied: insufficient role', req.user.id, userData.role);
            return res.status(403).json({ error: IS_PRODUCTION ? 'Access denied' : 'Admin access required' });
        }

        req.supabaseAdmin = supabaseAdmin;
        next();
    } catch (err) {
        console.error('requireAdmin exception:', err.message);
        return res.status(500).json({ error: IS_PRODUCTION ? 'Access denied' : 'Failed to verify admin privileges' });
    }
};

export const requireRole = (...allowedRoles) => async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!supabaseAdmin) {
        console.error('requireRole: supabaseAdmin not available');
        return res.status(503).json({ error: 'Role verification unavailable' });
    }

    try {
        const { data: userData, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        const userRole = (!error && userData?.role) ? userData.role : 'candidate';

        if (!allowedRoles.includes(userRole)) {
            console.warn('Role access denied', req.user.id, userRole, allowedRoles);
            return res.status(403).json({ error: IS_PRODUCTION ? 'Access denied' : `Access denied. Required role: ${allowedRoles.join(' or ')}` });
        }

        req.userRole = userRole;
        next();
    } catch (err) {
        console.error('requireRole exception:', err.message);
        return res.status(500).json({ error: IS_PRODUCTION ? 'Access denied' : 'Failed to verify role' });
    }
};
