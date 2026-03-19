import { sanitizeInput, validateEmail, validatePassword } from '../utils/security.js';

/**
 * Recursively sanitizes all string values in an object or array.
 */
function sanitizeObject(obj) {
    if (typeof obj === 'string') return sanitizeInput(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }
    return obj;
}

/**
 * Middleware: Sanitizes req.body, req.query, and req.params.
 * Strips HTML tags and encodes special characters from all string fields.
 * Apply to all routes that accept user input.
 */
export function sanitizeRequest(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }
    next();
}

/**
 * Middleware factory: Validates that required fields are present in req.body.
 * @param {string[]} fields - Array of required field names.
 */
export function requireFields(...fields) {
    return (req, res, next) => {
        const missing = fields.filter(f => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');
        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }
        next();
    };
}

/**
 * Middleware: Validates email + password fields in req.body for auth endpoints.
 * Checks format and strength before allowing the request through.
 */
export function validateAuthInput(req, res, next) {
    const { email, password } = req.body;

    if (email !== undefined) {
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
    }

    if (password !== undefined) {
        const result = validatePassword(password);
        if (!result.valid) {
            return res.status(400).json({ error: result.message });
        }
    }

    next();
}
