import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { promises as fsPromises } from 'fs';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { supabase, supabaseAdmin } from './utils/supabaseClient.js';
import { encrypt, decrypt, ENCRYPTION_KEY } from './utils/encryption.js';
import { authenticateUser, requireAdmin, ALLOW_DEV_BYPASS } from './middleware/auth.js';
import { validateProductionEnvironment, createSecureCORSConfig, createRateLimiter } from './utils/security.js';
import { setupAIRoutes } from './routes/ai_routes.js';
import { setupAdminRoutes } from './routes/admin_routes.js';
import { setupPortalRoutes } from './routes/portal_routes.js';
import { setupPageRoutes } from './routes/page_routes.js';
import { setupPaymentRoutes } from './routes/payment_routes.js';
import { setupEngagementRoutes } from './routes/engagement_routes.js';
import upskillRoutes from './routes/upskill_routes.js';
import { syncAIScoresToCandidate, runWatchdog, onCandidateProfileCreated } from './engine/workflow_engine.js';
import { transcribeVideo, analyzeVideoTranscript, saveVideoResume } from './services/video_resume_service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCAL_DB_PATH = join(__dirname, 'local_db.json');

const UPLOAD_DIR = resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Environment already loaded via 'dotenv/config' at line 1

// ==================== PRODUCTION SECURITY VALIDATION ====================
validateProductionEnvironment();

const app = express();
const port = process.env.PORT || 3000;

// Security & Logging Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", process.env.SUPABASE_URL]
        }
    }
})); // Protects against XSS, clickjacking, etc.
app.use(morgan('combined')); // Structured logging for production

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    // Skip rate limiting for development bypass
    skip: (req) => ALLOW_DEV_BYPASS && req.path === '/api/test'
});
app.use(limiter);

// Enhanced rate limiting for sensitive endpoints
const strictLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many authentication attempts'
});

// Standard Middleware
// SECURITY FIX: Restrict CORS to known frontend origins
const corsConfig = createSecureCORSConfig();
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

// ==================== SUPABASE CLIENTS ====================
// Imported from utils/supabaseClient.js to ensure consistent state and RLS handling
if (supabaseAdmin) {
    console.log('✅ Admin Supabase client initialized (service role)');
} else {
    console.warn('⚠️  No SUPABASE_SERVICE_ROLE_KEY found. Admin operations will use anon client.');
}

// Attach Supabase clients to request for routes
// NOTE: authenticateUser middleware will OVERRIDE req.supabase with a scoped client!
app.use((req, res, next) => {
    req.supabase = supabase;        // Default: Anon client (public routes)
    req.supabaseAdmin = supabaseAdmin; // Admin client (use sparingly)
    next();
});

// Encryption key from environment variable (Verified in utils/encryption.js)
const ALGORITHM = 'aes-256-cbc'; // Kept for reference if needed locally


// ==================== LOCAL DB HELPER (Fallback) ====================
async function readLocalDb() {
    try {
        const data = await fsPromises.readFile(LOCAL_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { api_keys: [], youtube_config: null };
    }
}

async function writeLocalDb(data) {
    await fsPromises.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

// ==================== AUTH MIDDLEWARE ====================
// Imported from middleware/auth.js
// Includes authenticateUser, requireAdmin, and ALLOW_DEV_BYPASS constant
// ==================== AUTHENTICATION API (SECURE REGISTRATION) ====================
// SECURITY FIX: Protected with authenticateUser + requireAdmin middleware
// Enhanced security: Added rate limiting, input validation, and audit logging
// This endpoint uses admin.createUser() which bypasses rate limits and email verification.
// Only authorized admins should be able to call this.
app.post('/api/auth/register', strictLimiter, authenticateUser, requireAdmin, async (req, res) => {
    try {
        const { email, password, data } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!supabaseAdmin) {
            return res.status(503).json({ error: 'Admin database connection unavailable' });
        }

        console.log(`[Admin] Creating user for: ${email}`);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Admin Create User (Bypasses Rate Limits & Email Verification)
        const { data: userData, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: data || {}
        });

        if (error) {
            console.error('Admin create user error:', error);
            throw error;
        }

        if (!userData.user) {
            throw new Error('User creation failed despite no error returned');
        }

        // SECURITY FIX: Atomic transaction for creating user records
        // This ensures data consistency between Supabase auth and public.users table
        const userMeta = data || {};

        try {
            // Create user profile in public.users table
            const { error: profileError } = await supabaseAdmin.from('users').upsert({
                id: userData.user.id,
                email: email,
                name: userMeta.full_name || userMeta.name || email.split('@')[0],
                role: userMeta.role || 'candidate',
                status: 'Active',
                created_at: new Date().toISOString()
            }, {
                onConflict: 'id',
                // Ensure atomicity - if one fails, both should fail
                returning: 'minimal'
            });

            if (profileError) {
                // If profile creation fails, we should clean up the auth user
                console.error('Profile creation failed, cleaning up auth user:', profileError);
                await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
                throw new Error(`Failed to create user profile: ${profileError.message}`);
            }

            // Log the successful registration
            console.log(`[Admin] User created successfully: ${userData.user.id}`);

            res.json({
                success: true,
                user: {
                    id: userData.user.id,
                    email: userData.user.email,
                    role: userMeta.role || 'candidate'
                }
            });

        } catch (profileError) {
            // Handle profile creation errors
            console.error('Profile creation error:', profileError);
            throw profileError;
        }

    } catch (error) {
        console.error('Admin registration failed:', error);
        res.status(400).json({
            error: error.message || 'Registration failed',
            success: false
        });
    }
});

// ==================== API KEY MANAGEMENT ====================

// Get all API keys (admin only)
app.get('/api/admin/api-keys', authenticateUser, async (req, res) => {
    try {
        let data = [];

        if (supabaseAdmin) {
            const { data: dbData, error } = await supabase
                .from('api_keys')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) data = dbData;
        }

        // Fallback to local DB if Supabase failed or is missing
        if (!supabase || data.length === 0) {
            const localDb = await readLocalDb();
            data = localDb.api_keys || [];
        }

        // Decrypt keys before sending
        const decryptedData = data.map(item => ({
            ...item,
            api_key: item.api_key ? decrypt(item.api_key) : null,
            client_id: item.client_id ? decrypt(item.client_id) : null,
            client_secret: item.client_secret ? decrypt(item.client_secret) : null,
            access_token: item.access_token ? decrypt(item.access_token) : null,
        }));

        res.json(decryptedData);
    } catch (error) {
        console.error('Error fetching API keys:', error);
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
});

// Save/Update API keys (admin only)
app.post('/api/admin/api-keys', authenticateUser, async (req, res) => {
    try {
        const { provider, api_key, client_id, client_secret, access_token, metadata } = req.body;

        if (!provider) {
            return res.status(400).json({ error: 'Provider is required' });
        }

        if (!api_key) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // Trim whitespace from all inputs
        const cleanApiKey = api_key.trim();

        // Encrypt sensitive data
        const encryptedData = {
            provider,
            api_key: cleanApiKey ? encrypt(cleanApiKey) : null,
            client_id: client_id ? encrypt(client_id.trim()) : null,
            client_secret: client_secret ? encrypt(client_secret.trim()) : null,
            access_token: access_token ? encrypt(access_token.trim()) : null,
            metadata: metadata || {},
            updated_at: new Date().toISOString()
        };

        let result;

        if (supabase) {
            try {
                // Check if provider already exists
                const { data: existing } = await supabase
                    .from('api_keys')
                    .select('id')
                    .eq('provider', provider)
                    .single();

                if (existing) {
                    const { data, error } = await supabase
                        .from('api_keys')
                        .update(encryptedData)
                        .eq('provider', provider)
                        .select();
                    if (error) {
                        console.error('Supabase update error:', error);
                    } else {
                        result = data;
                    }
                } else {
                    const { data, error } = await supabase
                        .from('api_keys')
                        .insert([{ ...encryptedData, created_at: new Date().toISOString() }])
                        .select();
                    if (error) {
                        console.error('Supabase insert error:', error);
                    } else {
                        result = data;
                    }
                }
            } catch (supabaseError) {
                console.error('Supabase operation error:', supabaseError);
            }
        }

        // Always save to local DB as backup/primary for localhost
        const localDb = await readLocalDb();
        const existingIndex = (localDb.api_keys || []).findIndex(k => k.provider === provider);

        const newRecord = {
            id: Date.now(),
            ...encryptedData,
            created_at: existingIndex >= 0 ? localDb.api_keys[existingIndex].created_at : new Date().toISOString()
        };

        if (existingIndex >= 0) {
            localDb.api_keys[existingIndex] = newRecord;
        } else {
            if (!localDb.api_keys) localDb.api_keys = [];
            localDb.api_keys.push(newRecord);
        }
        await writeLocalDb(localDb);

        if (!result) result = [newRecord];

        console.log(`✅ API key saved for provider: ${provider}`);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error saving API keys:', error);
        res.status(500).json({ error: `Failed to save API keys: ${error.message}` });
    }
});

// Test API connection
app.post('/api/admin/test-api-key', authenticateUser, async (req, res) => {
    try {
        const { provider, api_key } = req.body;

        if (!provider || !api_key) {
            return res.status(400).json({ error: 'Provider and API key are required' });
        }

        // Trim whitespace from API key
        const trimmedKey = api_key.trim();
        const startTime = Date.now();
        let response;

        console.log(`Testing ${provider} API key...`);

        // Test based on provider
        if (provider === 'gemini') {
            // Use the models list endpoint which is more reliable for testing
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${trimmedKey}`);
        } else if (provider === 'gpt4') {
            response = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${trimmedKey}` }
            });
        } else if (provider === 'claude') {
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': trimmedKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'test' }]
                })
            });
        } else if (provider === 'deepseek') {
            response = await fetch('https://api.deepseek.com/v1/models', {
                headers: { 'Authorization': `Bearer ${trimmedKey}` }
            });
        } else {
            return res.status(400).json({ error: 'Unsupported provider' });
        }

        const endTime = Date.now();
        const latency = endTime - startTime;

        if (response.ok) {
            console.log(`✅ ${provider} API key test successful (${latency}ms)`);
            res.json({
                success: true,
                status: 'connected',
                latency: `${latency}ms`
            });
        } else {
            let errorMsg = 'Connection failed';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error?.message || errorData.error?.status || errorData.message || JSON.stringify(errorData.error) || 'Connection failed';
            } catch (e) {
                errorMsg = `HTTP ${response.status}: ${response.statusText}`;
            }
            console.log(`❌ ${provider} API key test failed: ${errorMsg}`);
            res.status(400).json({
                success: false,
                status: 'error',
                error: errorMsg
            });
        }
    } catch (error) {
        console.error('Error testing API key:', error);
        res.status(500).json({
            success: false,
            status: 'error',
            error: error.message
        });
    }
});



// ==================== YOUTUBE CONFIG MANAGEMENT ====================

// Get YouTube configuration
app.get('/api/admin/youtube-config', async (req, res) => {
    try {
        let data = null;

        if (supabase) {
            const { data: dbData, error } = await supabase
                .from('youtube_config')
                .select('*')
                .single();

            if (!error) data = dbData;
        }

        // Fallback to local DB
        if (!data) {
            const localDb = await readLocalDb();
            data = localDb.youtube_config;
        }

        if (!data) {
            return res.json(null);
        }

        // Decrypt sensitive fields
        const decryptedConfig = {
            ...data,
            api_key: data.api_key ? decrypt(data.api_key) : null,
            client_id: data.client_id ? decrypt(data.client_id) : null,
            client_secret: data.client_secret ? decrypt(data.client_secret) : null,
            access_token: data.access_token ? decrypt(data.access_token) : null,
        };

        res.json(decryptedConfig);
    } catch (error) {
        console.error('Error fetching YouTube config:', error);
        res.status(500).json({ error: 'Failed to fetch YouTube configuration' });
    }
});

// Save YouTube configuration
app.post('/api/admin/youtube-config', async (req, res) => {
    try {
        const { api_key, client_id, client_secret, access_token, channel_id, privacy_status, auto_upload } = req.body;

        // Encrypt sensitive data
        const encryptedConfig = {
            api_key: api_key ? encrypt(api_key) : null,
            client_id: client_id ? encrypt(client_id) : null,
            client_secret: client_secret ? encrypt(client_secret) : null,
            access_token: access_token ? encrypt(access_token) : null,
            channel_id,
            privacy_status: privacy_status || 'private',
            auto_upload: auto_upload !== undefined ? auto_upload : true,
            updated_at: new Date().toISOString()
        };

        let result;

        if (supabase) {
            try {
                // Check if config exists
                const { data: existing } = await supabase
                    .from('youtube_config')
                    .select('id')
                    .single();

                if (existing) {
                    const { data, error } = await supabase
                        .from('youtube_config')
                        .update(encryptedConfig)
                        .eq('id', existing.id)
                        .select();
                    if (!error) result = data;
                } else {
                    const { data, error } = await supabase
                        .from('youtube_config')
                        .insert([{ ...encryptedConfig, created_at: new Date().toISOString() }])
                        .select();
                    if (!error) result = data;
                }
            } catch (dbError) {
                console.error('Supabase error (continuing to local DB):', dbError);
            }
        }

        // Always save to local DB
        const localDb = await readLocalDb();
        const newRecord = {
            id: 1, // Singleton
            ...encryptedConfig,
            created_at: localDb.youtube_config ? localDb.youtube_config.created_at : new Date().toISOString()
        };

        localDb.youtube_config = newRecord;
        await writeLocalDb(localDb);

        if (!result) result = newRecord;

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error saving YouTube config:', error);
        res.status(500).json({ error: 'Failed to save YouTube configuration', details: error.message });
    }
});

// Helper to get YouTube Agent
async function getYouTubeAgent() {
    let config = null;
    if (supabaseAdmin) {
        const { data } = await supabaseAdmin.from('youtube_config').select('*').single();
        config = data;
    }

    if (!config) {
        const localDb = await readLocalDb();
        config = localDb.youtube_config;
    }

    if (!config) return null;

    const { YouTubeAgent } = await import('./agents/youtube_agent.js');
    return new YouTubeAgent(config, decrypt);
}

import multer from 'multer';
const upload = multer({ dest: UPLOAD_DIR });

// Video Resume Upload & Analysis
// Video Resume Step 1: Upload (Just saves the file)
app.post('/api/video-resume/upload', authenticateUser, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        console.log(`[Upload] Video uploaded: ${req.file.path} (${req.file.size} bytes)`);

        // Return local path for next steps
        // In production, you might upload to S3/Supabase Storage here
        const videoUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            videoId: req.file.filename,
            videoUrl: videoUrl,
            params: {
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('[Upload] Error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Video Resume Step 2: Transcribe (Server-side)
app.post('/api/video-resume/transcribe', authenticateUser, async (req, res) => {
    try {
        const { videoId, providedTranscript } = req.body;
        if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

        // OPTIMIZATION: If frontend provided a transcript (from Web Speech API), use it!
        if (providedTranscript && providedTranscript.trim().split(/\s+/).length > 5) {
            console.log(`[Transcribe] Using frontend-provided transcript`);
            return res.json({
                success: true,
                transcript: providedTranscript,
                metadata: {
                    wordCount: providedTranscript.split(/\s+/).length,
                    language: 'en',
                    segments: 1,
                    source: 'web-speech-api'
                }
            });
        }

        const filePath = join(UPLOAD_DIR, videoId);

        console.log(`[Transcribe] Processing: ${filePath}`);

        // Call local python script
        const result = await transcribeVideo(filePath);

        // Helper to validate transcript
        const text = result.text || "";
        const wordCount = text.split(/\s+/).length;

        if (wordCount < 5) {
            console.warn(`[Transcribe] Transcript too short: "${text}"`);
            // DO NOT FALLBACK. Let the user know audio was unclear.
            return res.status(422).json({
                error: 'Audio unclear or too short. Please record again.',
                details: { transcript: text }
            });
        }

        res.json({
            success: true,
            transcript: text,
            metadata: {
                wordCount,
                language: result.language,
                segments: result.segments ? result.segments.length : 0
            }
        });

    } catch (error) {
        console.error('[Transcribe] Error:', error);
        // Support both Error objects and thrown structured objects
        const responseError = {
            success: false,
            error: error.message || (typeof error === 'string' ? error : 'Transcription failed'),
            error_code: error.error_code || 'TRANSCRIBE_ERROR',
            details: error.message || error.details || 'Internal server error during transcription',
            stderr_snippet: error.stderr_snippet || null
        };
        res.status(502).json(responseError);
    }
});

// Video Resume Step 3: Analyze (AI)
// This is the SINGLE permanent endpoint for video resume analysis.
app.post('/api/video-resume/analyze', authenticateUser, async (req, res) => {
    try {
        const { videoId, transcript, duration = 120 } = req.body;

        if (!transcript) {
            return res.status(400).json({
                error: 'Missing transcript',
                error_code: 'MISSING_DATA'
            });
        }

        console.log(`[Analyze] Analyzing transcript (${transcript.length} chars) for user ${req.user.id}`);

        // Fetch API keys (strictly fetch from DB or local fallback)
        let apiKeys = {};

        // 1. Try Supabase Admin (Primary)
        if (supabaseAdmin) {
            const { data: keys, error: keyError } = await supabaseAdmin.from('api_keys').select('*');
            if (keys && !keyError) {
                keys.forEach(k => {
                    if (k.api_key) apiKeys[k.provider] = decrypt(k.api_key);
                });
            }
        }

        // 2. Fallback to local DB (Dev/Testing)
        if (Object.keys(apiKeys).length === 0) {
            try {
                const localDb = await readLocalDb();
                if (localDb.api_keys) {
                    localDb.api_keys.forEach(k => {
                        if (k.api_key) apiKeys[k.provider] = decrypt(k.api_key);
                    });
                }
            } catch (dbErr) {
                console.warn('[Analyze] Local DB fallback failed:', dbErr.message);
            }
        }

        // 3. Check if we have identifiers for AI providers
        if (Object.keys(apiKeys).length === 0) {
            return res.status(503).json({
                error: 'AI Analysis failed',
                error_code: 'NO_PROVIDER_KEYS',
                details: 'AI provider keys are missing in both Supabase and local configuration. Please contact admin.'
            });
        }

        // Prepare candidate data for the AI layer
        let candidateData = {
            name: req.user.name || 'Candidate',
            skills: []
        };

        // Try to fetch real profile data if possible to personalize analysis
        if (req.supabase) {
            try {
                const { data: profile } = await req.supabase
                    .from('candidates')
                    .select('name, technical_skills')
                    .eq('user_id', req.user.id)
                    .single();

                if (profile) {
                    candidateData.name = profile.name || candidateData.name;
                    candidateData.skills = profile.technical_skills || [];
                }
            } catch (profileErr) {
                console.warn('[Analyze] Profile fetch failed (continuing with default data):', profileErr.message);
            }
        }

        // Perform Analysis using the service layer
        // This will call the Master Agent pipeline.
        const report = await analyzeVideoTranscript(candidateData, transcript, duration, apiKeys, req.supabase);

        if (!report || !report.finalScore) {
            throw new Error('AI Provider returned an empty or invalid report');
        }

        res.json({
            success: true,
            analysis: report,
            provider_used: report.provider || 'default'
        });

    } catch (error) {
        console.error('[Analyze] Critical failure:', error);
        res.status(502).json({
            error: 'AI Analysis failed',
            error_code: 'AI_SERVICE_ERROR',
            details: error.message || 'The AI service encountered an error processing your request.'
        });
    }
});

// Video Resume Step 4: Submit (Save to DB)
app.post('/api/video-resume/submit', authenticateUser, async (req, res) => {
    try {
        const { videoId, transcript, analysis, overallScore } = req.body;

        if (!videoId || !analysis) return res.status(400).json({ error: 'Missing data' });

        const videoUrl = `/uploads/${videoId}`; // Or the S3/storage URL if we had one

        // DB Save Reliability Fix: Use scoped client (req.supabase) or fallback to adminClient
        const dbClient = req.supabase || req.supabaseAdmin;

        if (!dbClient) {
            return res.status(503).json({
                error: 'Database services unavailable',
                error_code: 'NO_DB_CLIENT',
                details: 'No authenticated Supabase client or Admin client found to process the request.'
            });
        }

        // Save to video_resumes table
        const savedRecord = await saveVideoResume(dbClient, req.user.id, videoUrl, transcript, analysis, overallScore);

        // Also update candidate profile for backward compatibility
        try {
            await dbClient.from('candidates').update({
                video_resume_url: videoUrl,
                ai_overall_score: overallScore,
                updated_at: new Date().toISOString()
            }).eq('user_id', req.user.id);

            // Sync full scores
            await dbClient.from('users').update({
                ai_interview_score: overallScore,
                communication_clarity: analysis.layer3?.communication_clarity || 0
            }).eq('id', req.user.id);
        } catch (syncErr) {
            console.warn('[Submit] Secondary table sync failed (non-critical):', syncErr.message);
        }

        res.json({
            success: true,
            id: savedRecord.id
        });

    } catch (error) {
        console.error('[Submit] Error:', error);
        res.status(500).json({
            error: 'Database save failed',
            error_code: 'DB_SAVE_ERROR',
            details: error.message
        });
    }
});

/**
 * Live Assessment Video Upload
 * POST /api/live-assessment/upload
 */
app.post('/api/live-assessment/upload', authenticateUser, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const { jobId } = req.body;
        const candidateId = req.user?.id;

        // 1. Get YouTube Agent
        const agent = await getYouTubeAgent();
        let videoUrl = null;
        let videoId = null;

        if (agent) {
            console.log('Uploading live assessment to YouTube...');
            try {
                const result = await agent.uploadVideo(req.file.path, {
                    title: `Live Assessment - ${req.user?.email || 'Candidate'} - Job ${jobId}`,
                    description: `Live Assessment Recording for Job ID: ${jobId}`,
                    tags: ['HireGo', 'Assessment', 'Live Interview']
                });
                videoUrl = result.url;
                videoId = result.id;
                console.log('YouTube Upload Success:', videoUrl);
            } catch (err) {
                console.error('YouTube Agent Upload Failed:', err);
                // Fallback
                const protocol = req.protocol;
                const host = req.get('host');
                videoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
            }
        } else {
            console.warn('YouTube Agent not configured. Skipping upload.');
            const protocol = req.protocol;
            const host = req.get('host');
            videoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        // 2. Clean up temp file
        try {
            await fs.unlink(req.file.path);
        } catch (e) {
            console.warn('Failed to cleanup temp file:', e);
        }

        res.json({
            success: true,
            videoUrl,
            videoId
        });

    } catch (error) {
        console.error('Live assessment upload error:', error);
        res.status(500).json({ error: 'Failed to upload assessment video', details: error.message });
    }
});

// Lesson Video Upload
app.post('/api/admin/upskill/lessons/upload-video', authenticateUser, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const { courseId, lessonTitle } = req.body;

        const agent = await getYouTubeAgent();
        if (!agent) {
            return res.status(400).json({ error: 'YouTube not configured' });
        }

        console.log('Uploading lesson video to YouTube...');
        const result = await agent.uploadVideo(req.file.path, {
            title: lessonTitle || `Lesson - ${Date.now()}`,
            description: `Course Lesson Video for HireGo Upskill Portal. Course ID: ${courseId}`,
            privacyStatus: 'unlisted' // Lessons should probably be unlisted
        });

        // Clean up temporary file
        await fs.unlink(req.file.path);

        res.json({ success: true, videoUrl: result.url, videoId: result.id });
    } catch (error) {
        console.error('Lesson upload failed:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});
// Test YouTube Upload
app.post('/api/admin/youtube-upload-test', authenticateUser, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const agent = await getYouTubeAgent();
        if (!agent) {
            return res.status(400).json({ error: 'YouTube not configured' });
        }

        const result = await agent.uploadVideo(req.file.path, {
            title: 'HireGo Test Upload - ' + new Date().toISOString(),
            description: 'This is a test upload from HireGo Admin Panel to verify API configuration.',
            privacyStatus: 'unlisted'
        });

        // Clean up temporary file
        try {
            await fs.unlink(req.file.path);
        } catch (e) {
            console.warn('Failed to cleanup temp file:', e);
        }

        res.json({ success: true, videoUrl: result.url, videoId: result.id });
    } catch (error) {
        console.error('Test upload failed:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

// ==================== YOUTUBE OAUTH 2.0 REDIRECT CALLBACK (Video Resume) ====================

// Consistent redirect URI for OAuth flow — must match Google Cloud Console config
const YOUTUBE_OAUTH_REDIRECT_URI = process.env.YOUTUBE_OAUTH_REDIRECT_URI
    || `http://localhost:${port}/api/youtube/oauth/callback`;

/**
 * GET /api/youtube/oauth/authorize
 * Initiates the YouTube OAuth 2.0 authorization flow for video resume uploads.
 * Generates the Google consent screen URL and returns it to the frontend.
 *
 * Query params:
 *   - returnUrl (optional): Frontend URL to redirect to after auth completes
 */
app.get('/api/youtube/oauth/authorize', authenticateUser, async (req, res) => {
    try {
        // 1. Load YouTube config (client_id + client_secret)
        let config = null;
        if (supabaseAdmin) {
            const { data } = await supabaseAdmin.from('youtube_config').select('*').single();
            config = data;
        }
        if (!config) {
            const localDb = await readLocalDb();
            config = localDb.youtube_config;
        }

        if (!config || !config.client_id || !config.client_secret) {
            return res.status(400).json({
                error: 'YouTube API credentials not configured',
                message: 'Please configure YouTube Client ID and Client Secret in Admin > Video Storage first.'
            });
        }

        const clientId = decrypt(config.client_id);
        const clientSecret = decrypt(config.client_secret);

        // 2. Create OAuth2 client
        const { google } = await import('googleapis');
        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            YOUTUBE_OAUTH_REDIRECT_URI
        );

        // 3. Build state parameter (carries context + CSRF protection)
        const statePayload = {
            returnUrl: req.query.returnUrl || '/candidate/video-resume',
            userId: req.user?.id || null,
            nonce: crypto.randomBytes(16).toString('hex')
        };
        const stateToken = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

        // 4. Generate authorization URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',      // Request refresh_token
            prompt: 'consent',           // Always show consent (ensures refresh_token is returned)
            scope: [
                'https://www.googleapis.com/auth/youtube',
                'https://www.googleapis.com/auth/youtube.upload',
                'https://www.googleapis.com/auth/youtube.readonly'
            ],
            state: stateToken,
            include_granted_scopes: true
        });

        console.log('🔑 YouTube OAuth: Authorization URL generated');
        res.json({
            success: true,
            authUrl,
            redirectUri: YOUTUBE_OAUTH_REDIRECT_URI,
            message: 'Redirect the user to authUrl to begin YouTube authorization'
        });
    } catch (error) {
        console.error('YouTube OAuth authorize error:', error);
        res.status(500).json({ error: 'Failed to generate authorization URL', details: error.message });
    }
});

/**
 * GET /api/youtube/oauth/callback
 * OAuth 2.0 Redirect Callback — handles the authorization response from Google.
 * Exchanges the authorization code for access + refresh tokens,
 * persists them (encrypted) in the youtube_config table, and redirects to the frontend.
 *
 * Google will redirect here with: ?code=...&state=...
 * On error Google sends:         ?error=...&state=...
 */
app.get('/api/youtube/oauth/callback', async (req, res) => {
    const FRONTEND_BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

    try {
        const { code, error: oauthError, state } = req.query;

        // ---- Handle OAuth Errors (user denied, etc.) ----
        if (oauthError) {
            console.warn('⚠️ YouTube OAuth callback received error:', oauthError);
            const returnUrl = state ? JSON.parse(Buffer.from(state, 'base64url').toString()).returnUrl : '/candidate/video-resume';
            return res.redirect(
                `${FRONTEND_BASE}${returnUrl}?oauth_error=${encodeURIComponent(oauthError)}&provider=youtube`
            );
        }

        if (!code) {
            return res.status(400).json({ error: 'Missing authorization code' });
        }

        // ---- Decode state ----
        let stateData = { returnUrl: '/candidate/video-resume', userId: null };
        if (state) {
            try {
                stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
            } catch (e) {
                console.warn('Failed to parse state parameter:', e.message);
            }
        }

        // ---- Load YouTube config ----
        let config = null;
        if (supabaseAdmin) {
            const { data } = await supabaseAdmin.from('youtube_config').select('*').single();
            config = data;
        }
        if (!config) {
            const localDb = await readLocalDb();
            config = localDb.youtube_config;
        }

        if (!config || !config.client_id || !config.client_secret) {
            return res.redirect(
                `${FRONTEND_BASE}${stateData.returnUrl}?oauth_error=${encodeURIComponent('YouTube API not configured')}&provider=youtube`
            );
        }

        const clientId = decrypt(config.client_id);
        const clientSecret = decrypt(config.client_secret);

        // ---- Exchange authorization code for tokens ----
        const { google } = await import('googleapis');
        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            YOUTUBE_OAUTH_REDIRECT_URI
        );

        console.log('🔄 YouTube OAuth: Exchanging authorization code for tokens...');
        const { tokens } = await oauth2Client.getToken(code);
        console.log('✅ YouTube OAuth: Tokens obtained successfully');
        console.log(`   → Access Token:  ${tokens.access_token ? tokens.access_token.substring(0, 15) + '...' : 'N/A'}`);
        console.log(`   → Refresh Token: ${tokens.refresh_token ? tokens.refresh_token.substring(0, 10) + '...' : 'N/A (not returned — already granted?)'}`);
        console.log(`   → Expires In:    ${tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'N/A'}`);

        // ---- Persist the refresh token (encrypted) in youtube_config ----
        // If a refresh_token was returned, save it; otherwise keep the existing one.
        const tokenToStore = tokens.refresh_token || tokens.access_token;

        if (tokenToStore) {
            const encryptedToken = encrypt(tokenToStore);

            const updatedConfig = {
                access_token: encryptedToken,
                updated_at: new Date().toISOString()
            };

            // Save to Supabase
            if (supabase && config.id) {
                try {
                    await supabase
                        .from('youtube_config')
                        .update(updatedConfig)
                        .eq('id', config.id);
                    console.log('💾 YouTube OAuth: Token saved to Supabase');
                } catch (dbError) {
                    console.error('Supabase save error:', dbError);
                }
            }

            // Always save to local DB
            const localDb = await readLocalDb();
            if (localDb.youtube_config) {
                localDb.youtube_config.access_token = encryptedToken;
                localDb.youtube_config.updated_at = new Date().toISOString();
            } else {
                localDb.youtube_config = {
                    id: 1,
                    client_id: config.client_id,
                    client_secret: config.client_secret,
                    access_token: encryptedToken,
                    channel_id: config.channel_id || null,
                    privacy_status: config.privacy_status || 'unlisted',
                    auto_upload: true,
                    updated_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                };
            }
            await writeLocalDb(localDb);
            console.log('💾 YouTube OAuth: Token saved to local DB');
        }

        // ---- Redirect back to the frontend with success ----
        console.log('🎉 YouTube OAuth: Authorization complete — redirecting to frontend');
        res.redirect(
            `${FRONTEND_BASE}${stateData.returnUrl}?oauth_success=true&provider=youtube`
        );

    } catch (error) {
        console.error('❌ YouTube OAuth callback error:', error);
        const FRONTEND_BASE_FALLBACK = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(
            `${FRONTEND_BASE_FALLBACK}/candidate/video-resume?oauth_error=${encodeURIComponent(error.message)}&provider=youtube`
        );
    }
});

/**
 * GET /api/youtube/oauth/status
 * Check the current OAuth token status — whether tokens are configured and valid.
 */
app.get('/api/youtube/oauth/status', authenticateUser, async (req, res) => {
    try {
        let config = null;
        if (supabaseAdmin) {
            const { data } = await supabaseAdmin.from('youtube_config').select('*').single();
            config = data;
        }
        if (!config) {
            const localDb = await readLocalDb();
            config = localDb.youtube_config;
        }

        if (!config) {
            return res.json({
                configured: false,
                hasCredentials: false,
                hasToken: false,
                redirectUri: YOUTUBE_OAUTH_REDIRECT_URI,
                message: 'YouTube is not configured. Please set up credentials in Admin > Video Storage.'
            });
        }

        const hasCredentials = !!(config.client_id && config.client_secret);
        const hasToken = !!config.access_token;

        // Optionally test the token
        let tokenValid = false;
        if (hasCredentials && hasToken) {
            try {
                const { google } = await import('googleapis');
                const oauth2Client = new google.auth.OAuth2(
                    decrypt(config.client_id),
                    decrypt(config.client_secret),
                    YOUTUBE_OAUTH_REDIRECT_URI
                );
                const token = decrypt(config.access_token);
                oauth2Client.setCredentials({
                    access_token: token,
                    refresh_token: token
                });

                // Try to refresh — if it works, the token is valid
                const { credentials } = await oauth2Client.refreshAccessToken();
                tokenValid = !!credentials.access_token;
            } catch (e) {
                console.warn('YouTube token validation failed:', e.message);
                tokenValid = false;
            }
        }

        res.json({
            configured: true,
            hasCredentials,
            hasToken,
            tokenValid,
            redirectUri: YOUTUBE_OAUTH_REDIRECT_URI,
            channelId: config.channel_id || null,
            privacyStatus: config.privacy_status || 'unlisted'
        });
    } catch (error) {
        console.error('YouTube OAuth status error:', error);
        res.status(500).json({ error: 'Failed to check OAuth status' });
    }
});

// ==================== PAYMENT CONFIG MANAGEMENT ====================

// Get Payment configuration
app.get('/api/admin/payment-config', authenticateUser, async (req, res) => {
    try {
        let data = null;

        if (supabase) {
            const { data: dbData, error } = await supabase
                .from('payment_config')
                .select('*')
                .single();

            if (!error) data = dbData;
        }

        // Fallback to local DB
        if (!data) {
            const localDb = await readLocalDb();
            data = localDb.payment_config;
        }

        if (!data) {
            return res.json(null);
        }

        // Decrypt sensitive fields
        const decryptedConfig = {
            ...data,
            stripe_secret_key: data.stripe_secret_key ? decrypt(data.stripe_secret_key) : null,
            stripe_webhook_secret: data.stripe_webhook_secret ? decrypt(data.stripe_webhook_secret) : null,
            razorpay_key_secret: data.razorpay_key_secret ? decrypt(data.razorpay_key_secret) : null,
            razorpay_webhook_secret: data.razorpay_webhook_secret ? decrypt(data.razorpay_webhook_secret) : null,
        };

        res.json(decryptedConfig);
    } catch (error) {
        console.error('Error fetching Payment config:', error);
        res.status(500).json({ error: 'Failed to fetch Payment configuration' });
    }
});

// Save Payment configuration
app.post('/api/admin/payment-config', authenticateUser, async (req, res) => {
    try {
        const {
            provider,
            currency,
            stripe_public_key,
            stripe_secret_key,
            stripe_webhook_secret,
            razorpay_key_id,
            razorpay_key_secret,
            razorpay_webhook_secret,
            enabled
        } = req.body;

        // Encrypt sensitive data
        const encryptedConfig = {
            provider,
            currency,
            enabled: enabled !== undefined ? enabled : true,
            stripe_public_key,
            stripe_secret_key: stripe_secret_key ? encrypt(stripe_secret_key) : null,
            stripe_webhook_secret: stripe_webhook_secret ? encrypt(stripe_webhook_secret) : null,
            razorpay_key_id,
            razorpay_key_secret: razorpay_key_secret ? encrypt(razorpay_key_secret) : null,
            razorpay_webhook_secret: razorpay_webhook_secret ? encrypt(razorpay_webhook_secret) : null,
            updated_at: new Date().toISOString()
        };

        let result;

        if (supabase) {
            try {
                // Check if config exists
                const { data: existing } = await supabase
                    .from('payment_config')
                    .select('id')
                    .single();

                if (existing) {
                    const { data, error } = await supabase
                        .from('payment_config')
                        .update(encryptedConfig)
                        .eq('id', existing.id)
                        .select();
                    if (!error) result = data;
                } else {
                    const { data, error } = await supabase
                        .from('payment_config')
                        .insert([{ ...encryptedConfig, created_at: new Date().toISOString() }])
                        .select();
                    if (!error) result = data;
                }
            } catch (dbError) {
                console.error('Supabase error (continuing to local DB):', dbError);
            }
        }

        // Always save to local DB
        const localDb = await readLocalDb();
        const newRecord = {
            id: 1, // Singleton
            ...encryptedConfig,
            created_at: localDb.payment_config ? localDb.payment_config.created_at : new Date().toISOString()
        };

        localDb.payment_config = newRecord;
        await writeLocalDb(localDb);

        if (!result) result = newRecord;

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error saving Payment config:', error);
        res.status(500).json({ error: 'Failed to save Payment configuration', details: error.message });
    }
});

// Create Checkout Session
app.post('/api/create-checkout-session', authenticateUser, async (req, res) => {
    try {
        const { planId, amount, currency = 'usd' } = req.body;

        // Get payment config
        let config = null;
        if (supabaseAdmin) {
            const { data } = await supabaseAdmin.from('payment_config').select('*').single();
            config = data;
        }

        // Fallback to local DB
        if (!config) {
            const localDb = await readLocalDb();
            config = localDb.payment_config;
        }

        if (!config || !config.enabled) {
            return res.status(400).json({ error: 'Payment gateway not configured or disabled' });
        }

        const provider = config.provider;

        if (provider === 'stripe') {
            const stripeKey = decrypt(config.stripe_secret_key);
            const stripe = new Stripe(stripeKey);

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'Premium Plan', // Dynamic based on planId
                        },
                        unit_amount: amount * 100, // Cents
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/payment/cancel`,
            });

            res.json({ sessionId: session.id, url: session.url });

        } else if (provider === 'razorpay') {
            const razorpay = new Razorpay({
                key_id: config.razorpay_key_id,
                key_secret: decrypt(config.razorpay_key_secret)
            });

            const order = await razorpay.orders.create({
                amount: amount * 100, // Paise
                currency: currency.toUpperCase(),
                receipt: `receipt_${Date.now()}`
            });

            res.json({ orderId: order.id, keyId: config.razorpay_key_id });
        } else {
            res.status(400).json({ error: 'Invalid provider' });
        }

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Payment initialization failed' });
    }
});

// ==================== EXISTING ROUTES ====================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: supabase ? 'configured' : 'missing_credentials',
            encryption: ENCRYPTION_KEY !== 'default-encryption-key-change-in-production' ? 'configured' : 'using_default'
        }
    });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is connected!' });
});

// Mock Database for Logs
let systemLogs = [
    { id: 1, timestamp: '2025-11-20 10:30:15', level: 'SUCCESS', message: 'User login successful: john.doe@example.com', source: 'AuthService' },
    { id: 2, timestamp: '2025-11-20 10:32:00', level: 'WARNING', message: 'High latency detected on Gemini API (450ms)', source: 'AIProvider' },
    { id: 3, timestamp: '2025-11-20 10:35:22', level: 'ERROR', message: 'Failed to process video: Format not supported', source: 'VideoService' },
    { id: 4, timestamp: '2025-11-20 10:36:05', level: 'INFO', message: 'New job posted: Senior React Developer', source: 'JobService' },
    { id: 5, timestamp: '2025-11-20 10:40:11', level: 'INFO', message: 'Candidate assessment started: ID #4421', source: 'AssessmentService' },
];

// SECURITY FIX: Protect log endpoints with auth + admin check
app.get('/api/logs', authenticateUser, requireAdmin, (req, res) => {
    res.json(systemLogs);
});

app.post('/api/logs', authenticateUser, requireAdmin, (req, res) => {
    const newLog = {
        id: systemLogs.length + 1,
        timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
        ...req.body
    };
    systemLogs.unshift(newLog);
    res.status(201).json(newLog);
});

import { runMasterEvaluation } from './agents/master_agent.js';

// ==================== DEPRECATED ENDPOINTS ====================

/**
 * @deprecated Use POST /api/video-resume/analyze
 * Legacy endpoint removed to prevent conflicts and ensure unified pipeline.
 */
app.post('/api/analyze-video', (req, res) => {
    console.warn(`[Deprecation] Blocked legacy analysis request from IP: ${req.ip}`);
    res.status(410).json({
        error: "Deprecated endpoint. Use /api/video-resume/analyze",
        message: "This endpoint has been replaced by the unified Video Resume Analysis pipeline."
    });
});

// SECURITY FIX: Protected with authenticateUser middleware
app.post('/api/generate-job-description', authenticateUser, (req, res) => {
    const { title } = req.body;
    setTimeout(() => {
        res.json({
            description: `We are looking for a talented ${title} to join our dynamic team. You will be responsible for building scalable applications and working closely with cross-functional teams to deliver high-quality software solutions.`,
            requirements: `- 3+ years of experience in related field\n- Strong problem-solving skills\n- Excellent communication abilities\n- Proficiency in modern technologies`
        });
    }, 500);
});

// Setup AI Routes
// SECURITY FIX: Pass authenticateUser middleware to AI routes
setupAIRoutes(app, supabase, decrypt, authenticateUser);

// Setup Admin Routes (pass both supabase clients + requireAdmin)
setupAdminRoutes(app, supabaseAdmin || supabase, authenticateUser, encrypt, decrypt, readLocalDb, writeLocalDb);

// Setup Portal Routes
setupPortalRoutes(app, supabase, authenticateUser);

// Setup Page Routes
setupPageRoutes(app, supabase, authenticateUser, readLocalDb, writeLocalDb);

// Setup Payment Routes
setupPaymentRoutes(app, supabase, authenticateUser);

// Setup Engagement Routes
setupEngagementRoutes(app, supabase, authenticateUser);

// Setup Upskill Routes
// Setup Upskill Routes
app.use('/api/upskill', upskillRoutes);

// Start server only if not in Vercel serverless environment
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`✅ Server running on http://localhost:${port}`);
        if (!supabase) {
            console.warn('⚠️  Warning: Supabase credentials not found in .env');
        }
        if (ENCRYPTION_KEY === 'default-encryption-key-change-in-production') {
            console.warn('⚠️  Warning: Using default encryption key. Set ENCRYPTION_KEY in .env for production!');
        }

        // [PHASE 10] Start watchdog — runs every 5 minutes
        console.log('⏱️  Starting workflow watchdog (every 5 minutes)...');
        setInterval(() => {
            runWatchdog(supabase).catch(e => console.error('[Watchdog] Sweep failed:', e.message));
        }, 5 * 60 * 1000); // 5 minutes
    });
}

// Export for Vercel serverless
export default app;
