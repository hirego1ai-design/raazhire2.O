import { createLogger, format, transports } from 'winston';
import { supabase, supabaseAdmin, createScopedClient } from '../utils/supabaseClient.js';

// ==================== STRUCTURED LOGGER ====================
const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [new transports.Console()]
});

// ==================== AUTH MIDDLEWARE ====================

/**
 * Middleware: Authenticates the user via Supabase JWT.
 * - Validates the Bearer token via Supabase auth.getUser().
 * - Attaches the verified user object to req.user.
 * - Creates a scoped (RLS-enforced) Supabase client for req.supabase.
 * - Does NOT attach req.supabaseAdmin — that is reserved for requireAdmin.
 * - No bypass paths, no magic tokens, no mock users.
 */
export const authenticateUser = async (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Auth failed: missing Authorization header', { ip: clientIP, path: req.path });
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(401).json({ error: isProd ? 'Authentication required' : 'Missing or malformed Authorization header' });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    if (!token) {
        return res.status(401).json({ error: process.env.NODE_ENV === 'production' ? 'Authentication required' : 'Missing Bearer token' });
    }

    try {
        const clientForAuth = supabaseAdmin || supabase;
        if (!clientForAuth) {
            logger.error('Auth service unavailable: no Supabase client configured');
            return res.status(503).json({ error: 'Authentication service unavailable' });
        }

        const { data: { user }, error } = await clientForAuth.auth.getUser(token);

        if (error || !user) {
            logger.warn('Auth failed: invalid or expired token', { ip: clientIP, path: req.path });
            return res.status(401).json({ error: process.env.NODE_ENV === 'production' ? 'Authentication required' : 'Invalid or expired token' });
        }

        req.user = user;
        // Create a scoped client so all DB queries from this request respect RLS
        req.supabase = createScopedClient(token);
        // req.supabaseAdmin is intentionally NOT set here; only requireAdmin attaches it

        next();
    } catch (err) {
        logger.error('Auth middleware exception', { path: req.path, message: err.message });
        return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Authentication required' : 'Internal authentication error' });
    }
};

/**
 * Middleware: Ensures the authenticated user has 'admin' role.
 * - Requires authenticateUser to run first.
 * - Always verifies role against the public.users database table (never trusts user_metadata).
 * - Only after DB verification does it attach req.supabaseAdmin for use in admin routes.
 */
export const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!supabaseAdmin) {
        logger.error('requireAdmin: supabaseAdmin not available — missing SUPABASE_SERVICE_ROLE_KEY');
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
        return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Access denied' : 'Failed to verify user role' });
    }
};
