import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
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
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:5173', 'http://localhost:5179'];
    
    const productionDomains = process.env.PRODUCTION_DOMAINS 
        ? process.env.PRODUCTION_DOMAINS.split(',')
        : ['https://hirego-ai.vercel.app', 'https://www.hiregoai.com', 'https://hiregoai.com'];
    
    return {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
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

/**
 * Rate limiting middleware to prevent abuse
 */
export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests' } = {}) {
    const requestCounts = new Map();
    
    return (req, res, next) => {
        const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean up old requests
        if (requestCounts.has(clientId)) {
            const requests = requestCounts.get(clientId);
            const recentRequests = requests.filter(timestamp => timestamp > windowStart);
            requestCounts.set(clientId, recentRequests);
        }
        
        // Check limit
        const currentCount = requestCounts.has(clientId) ? requestCounts.get(clientId).length : 0;
        if (currentCount >= max) {
            return res.status(429).json({ error: message });
        }
        
        // Record request
        if (!requestCounts.has(clientId)) {
            requestCounts.set(clientId, []);
        }
        requestCounts.get(clientId).push(now);
        next();
    };
}

/**
 * Input sanitization to prevent injection attacks
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/vbscript:/gi, '') // Remove vbscript: protocol
        .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
        .replace(/on\w+='[^']*'/gi, '') // Remove event handlers (single quotes)
        .substring(0, 1000); // Limit length
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