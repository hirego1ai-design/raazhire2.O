import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Enhanced Security Utilities
 * Provides stronger security measures and validation
 */

// ==================== CONSTANTS ====================
const MIN_PASSWORD_LENGTH = 8;
const STRONG_ENCRYPTION_KEY_LENGTH = 64; // 512-bit hex string

// ==================== VALIDATION HELPERS ====================

/**
 * Validates that environment variables are properly configured for production
 */
export function validateProductionEnvironment() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
        // Check required production variables
        const required = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY', 
            'SUPABASE_SERVICE_ROLE_KEY',
            'ENCRYPTION_KEY'
        ];
        
        const missing = required.filter(key => !process.env[key]);
        if (missing.length > 0) {
            console.error('🔴 FATAL: Missing required production environment variables:', missing);
            process.exit(1);
        }
        
        // Validate encryption key strength
        const encKey = process.env.ENCRYPTION_KEY;
        if (encKey.length < STRONG_ENCRYPTION_KEY_LENGTH) {
            console.error('🔴 FATAL: ENCRYPTION_KEY is too short for production');
            console.error('   Expected: 64 characters (512-bit hex)');
            console.error('   Provided:', encKey.length, 'characters');
            process.exit(1);
        }
        
        // Ensure no default/dev values
        const forbiddenValues = [
            'default-encryption-key-change-in-production',
            'your_encryption_key_here',
            'sample_key'
        ];
        
        if (forbiddenValues.includes(encKey)) {
            console.error('🔴 FATAL: Using default/dev encryption key in production');
            process.exit(1);
        }
        
        console.log('✅ Production environment validation passed');
    }
}

/**
 * Generates a cryptographically secure random key
 */
export function generateSecureKey() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Validates email format
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function validatePassword(password) {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
        return {
            valid: false,
            message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
        };
    }
    
    // Check for basic complexity (this can be enhanced)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLetter || !hasNumber) {
        return {
            valid: false,
            message: 'Password must contain both letters and numbers'
        };
    }
    
    return { valid: true };
}

// ==================== CORS SECURITY ====================

/**
 * Creates secure CORS configuration
 */
export function createSecureCORSConfig() {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : ['http://localhost:5173', 'http://localhost:5179', 'https://hiregoai.vercel.app'];
    
    const productionDomains = process.env.PRODUCTION_DOMAINS 
        ? process.env.PRODUCTION_DOMAINS.split(',').map(o => o.trim())
        : ['https://hiregoai.vercel.app'];
    
    return {
        origin: function (origin, callback) {
            // In production, block requests with no Origin header (CSRF prevention)
            if (!origin) {
                if (process.env.NODE_ENV === 'production') {
                    return callback(new Error('Not allowed by CORS policy'));
                }
                return callback(null, true);
            }
            
            // Allow localhost in development
            if (process.env.NODE_ENV !== 'production') {
                if (origin.startsWith('http://localhost:')) {
                    return callback(null, true);
                }
            }
            
            // Check allowed origins
            const allAllowed = [...allowedOrigins, ...productionDomains];
            if (allAllowed.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`⚠️ CORS blocked: ${origin}`);
                callback(new Error('Not allowed by CORS policy'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID']
    };
}

// ==================== REQUEST VALIDATION ====================

// ==================== RATE LIMITING ====================

/**
 * Creates a rate limiter using express-rate-limit.
 * @param {object} options - windowMs, max, message
 */
export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: message },
        handler: (req, res, next, options) => {
            const retryAfter = Math.ceil(options.windowMs / 1000);
            res.set('Retry-After', String(retryAfter));
            res.status(429).json({ error: options.message?.error || message });
        }
    });
}

/**
 * Input sanitization to prevent XSS and injection attacks.
 * Encodes all HTML special characters, neutralizing any HTML tags and event handlers.
 * For rich-text content, use a dedicated library (e.g. sanitize-html) instead.
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        // Remove null bytes
        .replace(/\0/g, '')
        // Encode HTML special characters (neutralizes all HTML including tags/attributes)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        // Limit length
        .substring(0, 1000);
}

// ==================== AUDIT LOGGING ====================

/**
 * Logs security-relevant events
 */
export async function logSecurityEvent(supabase, eventType, userId, details = {}) {
    try {
        await supabase.from('security_logs').insert({
            event_type: eventType,
            user_id: userId,
            ip_address: details.ip || 'unknown',
            user_agent: details.userAgent || 'unknown',
            details: details,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to log security event:', error);
    }
}

// ==================== EXPORTS ====================
export const security = {
    validateProductionEnvironment,
    generateSecureKey,
    validateEmail,
    validatePassword,
    createSecureCORSConfig,
    createRateLimiter,
    sanitizeInput,
    logSecurityEvent
};