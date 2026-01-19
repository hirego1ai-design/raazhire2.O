import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { setupAIRoutes } from './routes/ai_routes.js';
import { setupAdminRoutes } from './routes/admin_routes.js';
import { setupPortalRoutes } from './routes/portal_routes.js';
import { setupPageRoutes } from './routes/page_routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCAL_DB_PATH = join(__dirname, 'local_db.json');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(join(__dirname, 'public')));

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase only if keys are present
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

// Encryption functions
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}


function decrypt(text) {
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = parts.join(':');
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed (possibly encrypted with different key):', error.message);
        return null; // Return null instead of crashing
    }
}


// ==================== LOCAL DB HELPER (Fallback) ====================
async function readLocalDb() {
    try {
        const data = await fs.readFile(LOCAL_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { api_keys: [], youtube_config: null };
    }
}

async function writeLocalDb(data) {
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

// ==================== AUTH MIDDLEWARE ====================
const authenticateUser = async (req, res, next) => {
    // Skip auth if Supabase is not configured (Dev mode fallback)
    if (!supabase) {
        console.warn('⚠️ Supabase not configured. Skipping auth check for:', req.path);
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        // In development, allow requests without auth for admin panel testing
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ No auth header provided. Allowing request in dev mode for:', req.path);
            return next();
        }
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ No token provided. Allowing request in dev mode for:', req.path);
            return next();
        }
        return res.status(401).json({ error: 'Missing Bearer token' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            // In development, allow even with invalid token
            if (process.env.NODE_ENV !== 'production') {
                console.warn('⚠️ Invalid token. Allowing request in dev mode for:', req.path);
                return next();
            }
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Internal authentication error' });
    }
};

// ==================== API KEY MANAGEMENT ====================

// Get all API keys (admin only)
app.get('/api/admin/api-keys', authenticateUser, async (req, res) => {
    try {
        let data = [];

        if (supabase) {
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

// Get API key for a specific provider (for internal use)
app.get('/api/internal/api-key/:provider', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ error: 'Database not configured' });
        }

        const { provider } = req.params;

        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('provider', provider)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'API key not found' });
        }

        // Decrypt and return
        const decryptedKey = {
            provider: data.provider,
            api_key: data.api_key ? decrypt(data.api_key) : null,
            access_token: data.access_token ? decrypt(data.access_token) : null,
        };

        res.json(decryptedKey);
    } catch (error) {
        console.error('Error fetching API key:', error);
        res.status(500).json({ error: 'Failed to fetch API key' });
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
        if (supabase) {
            const { data } = await supabase.from('payment_config').select('*').single();
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

app.get('/api/logs', (req, res) => {
    res.json(systemLogs);
});

app.post('/api/logs', (req, res) => {
    const newLog = {
        id: systemLogs.length + 1,
        timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
        ...req.body
    };
    systemLogs.unshift(newLog);
    res.status(201).json(newLog);
});

import { runMasterEvaluation } from './agents/master_agent.js';

// AI Video Analysis - Powered by Multi-Layer Agent Architecture
app.post('/api/analyze-video', async (req, res) => {
    try {
        console.log('Received video analysis request');

        // Extract data from request (support both old and new formats)
        const candidateData = req.body.candidateData || {
            name: 'Candidate',
            skills: ['React', 'Node.js', 'Communication'] // Default skills for testing
        };

        const videoData = req.body.videoData || {
            transcription: "I have experience with React and Node.js. I am confident in my ability to lead teams.",
            metadata: { duration: 120 }
        };

        // Fetch API keys from database
        let apiKeys = {};

        if (supabase) {
            const { data: keys } = await supabase.from('api_keys').select('*');
            if (keys) {
                keys.forEach(k => {
                    if (k.api_key) apiKeys[k.provider] = decrypt(k.api_key);
                });
            }
        } else {
            // Fallback to local DB
            const localDb = await readLocalDb();
            if (localDb.api_keys) {
                localDb.api_keys.forEach(k => {
                    if (k.api_key) apiKeys[k.provider] = decrypt(k.api_key);
                });
            }
        }

        // Run the Master Agent Evaluation
        const report = await runMasterEvaluation(candidateData, videoData, apiKeys);

        // Map the detailed agent report to the format expected by the current frontend
        // This ensures backward compatibility while we upgrade the UI
        const response = {
            // Legacy fields
            score: report.finalScore,
            communication: report.layer3 ? report.layer3.score : 0,
            confidence: report.layer3 ? report.layer3.score : 0, // Using behavioral score as proxy
            knowledge: report.layer2 ? report.layer2.score : 0,
            tone: report.layer3 ? report.layer3.emotionalTone : 'Neutral',
            keywords: report.layer2 ? report.layer2.detectedTerms : [],
            feedback: report.summary,

            // New Rich Data (for future UI)
            detailedReport: report
        };

        res.json(response);

    } catch (error) {
        console.error('Error analyzing video:', error);
        res.status(500).json({ error: 'Failed to analyze video' });
    }
});

app.post('/api/generate-job-description', (req, res) => {
    const { title } = req.body;
    setTimeout(() => {
        res.json({
            description: `We are looking for a talented ${title} to join our dynamic team. You will be responsible for building scalable applications and working closely with cross-functional teams to deliver high-quality software solutions.`,
            requirements: `- 3+ years of experience in related field\n- Strong problem-solving skills\n- Excellent communication abilities\n- Proficiency in modern technologies`
        });
    }, 500);
});

// Setup AI Routes
setupAIRoutes(app, supabase, decrypt);

// Setup Admin Routes
setupAdminRoutes(app, supabase, authenticateUser, encrypt, decrypt, readLocalDb, writeLocalDb);

// Setup Portal Routes
setupPortalRoutes(app, supabase, authenticateUser);

// Setup Page Routes
setupPageRoutes(app, supabase, authenticateUser, readLocalDb, writeLocalDb);

// Setup Upskill Routes
import upskillRoutes from './routes/upskill_routes.js';
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
    });
}

// Export for Vercel serverless
export default app;
