import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Encryption key from environment variable
// SECURITY FIX: Block startup with default encryption key in production
// PRODUCTION SECURITY: Enforce strong key requirements
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';
const MIN_KEY_LENGTH = 64; // 512-bit hex string

// Production guard with enhanced validation
if (process.env.NODE_ENV === 'production') {
    // Check if key exists
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY === 'default-encryption-key-change-in-production') {
        console.error('🔴 FATAL: ENCRYPTION_KEY is missing or using default value in production');
        console.error('   Set a strong, unique ENCRYPTION_KEY in your environment variables');
        console.error('   Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
        process.exit(1);
    }
    
    // Check key length
    if (ENCRYPTION_KEY.length < MIN_KEY_LENGTH) {
        console.error('🔴 FATAL: ENCRYPTION_KEY is too short for production');
        console.error('   Required: 64 characters (512-bit hex)');
        console.error('   Provided:', ENCRYPTION_KEY.length, 'characters');
        process.exit(1);
    }
    
    // Check for common weak keys
    const weakKeys = [
        'default-encryption-key-change-in-production',
        'your_encryption_key_here',
        'sample_key',
        'weak_key',
        'test_key'
    ];
    
    if (weakKeys.includes(ENCRYPTION_KEY)) {
        console.error('🔴 FATAL: Using a known weak encryption key in production');
        console.error('   Generate a new secure key immediately');
        process.exit(1);
    }
    
    console.log('✅ Production encryption key validation passed');
}

export function encrypt(text) {
    if (!text) return null;
    try {
        // Fix #3: Use a unique random salt per encryption (stored in output)
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(ENCRYPTION_KEY, salt, 32);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Format: salt:iv:ciphertext
        return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption failed:', error.message);
        return null;
    }
}

export function decrypt(text) {
    if (!text) return null;
    try {
        const parts = text.split(':');
        // Fix #3: Support new format (salt:iv:ciphertext) and legacy (iv:ciphertext)
        if (parts.length === 3) {
            // New format: salt:iv:ciphertext
            const salt = Buffer.from(parts[0], 'hex');
            const iv = Buffer.from(parts[1], 'hex');
            const encryptedText = parts[2];
            const key = crypto.scryptSync(ENCRYPTION_KEY, salt, 32);
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } else if (parts.length === 2) {
            // Legacy format: iv:ciphertext (static salt — for backward compatibility only)
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedText = parts[1];
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        // Fix #4: Return null (not original text) on failure — never leak ciphertext as plaintext
        console.error('Decryption failed: unexpected ciphertext format');
        return null;
    } catch (error) {
        // Fix #4: Return null on error instead of leaking the raw ciphertext
        console.error('Decryption failed:', error.message);
        return null;
    }
}
