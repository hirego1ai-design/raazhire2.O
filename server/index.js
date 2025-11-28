import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCAL_DB_PATH = join(__dirname, 'local_db.json');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
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

// ==================== API KEY MANAGEMENT ====================

// Get all API keys (admin only)
app.get('/api/admin/api-keys', async (req, res) => {
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
app.post('/api/admin/api-keys', async (req, res) => {
    try {
        const { provider, api_key, client_id, client_secret, access_token, metadata } = req.body;

        if (!provider) {
            return res.status(400).json({ error: 'Provider is required' });
        }

        // Encrypt sensitive data
        const encryptedData = {
            provider,
            api_key: api_key ? encrypt(api_key) : null,
            client_id: client_id ? encrypt(client_id) : null,
            client_secret: client_secret ? encrypt(client_secret) : null,
            access_token: access_token ? encrypt(access_token) : null,
            metadata: metadata || {},
            updated_at: new Date().toISOString()
        };

        let result;

        if (supabase) {
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
                if (!error) result = data;
            } else {
                const { data, error } = await supabase
                    .from('api_keys')
                    .insert([{ ...encryptedData, created_at: new Date().toISOString() }])
                    .select();
                if (!error) result = data;
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

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error saving API keys:', error);
        res.status(500).json({ error: 'Failed to save API keys' });
    }
});

// Test API connection
app.post('/api/admin/test-api-key', async (req, res) => {
    try {
        const { provider, api_key } = req.body;

        if (!provider || !api_key) {
            return res.status(400).json({ error: 'Provider and API key are required' });
        }

        const startTime = Date.now();
        let response;

        // Test based on provider
        if (provider === 'gemini') {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=${api_key}`);
        } else if (provider === 'gpt4') {
            response = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${api_key}` }
            });
        } else {
            return res.status(400).json({ error: 'Unsupported provider' });
        }

        const endTime = Date.now();
        const latency = endTime - startTime;

        if (response.ok) {
            res.json({
                success: true,
                status: 'connected',
                latency: `${latency}ms`
            });
        } else {
            const errorData = await response.json();
            res.status(400).json({
                success: false,
                status: 'error',
                error: errorData.error?.message || 'Connection failed'
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

// AI Video Analysis - Now uses real API keys from database
app.post('/api/analyze-video', async (req, res) => {
    try {
        if (!supabase) {
            // Fallback to mock if no database
            return setTimeout(() => {
                res.json({
                    score: Math.floor(Math.random() * 20) + 80,
                    communication: Math.floor(Math.random() * 20) + 80,
                    confidence: Math.floor(Math.random() * 20) + 80,
                    knowledge: Math.floor(Math.random() * 20) + 80,
                    tone: ['Professional', 'Enthusiastic', 'Calm', 'Confident'][Math.floor(Math.random() * 4)],
                    keywords: ['React', 'Node.js', 'Scalability', 'Teamwork', 'Problem Solving', 'Leadership'].sort(() => 0.5 - Math.random()).slice(0, 4),
                    feedback: 'Great video! You showed good confidence and clear communication. Try to maintain more eye contact in the next one.'
                });
            }, 2000);
        }

        // Get Gemini API key from database
        const { data: keyData } = await supabase
            .from('api_keys')
            .select('api_key')
            .eq('provider', 'gemini')
            .single();

        if (!keyData || !keyData.api_key) {
            return res.status(503).json({ error: 'Gemini API key not configured' });
        }

        const geminiKey = decrypt(keyData.api_key);

        // TODO: Implement real Gemini API call here
        // For now, return mock data
        setTimeout(() => {
            res.json({
                score: Math.floor(Math.random() * 20) + 80,
                communication: Math.floor(Math.random() * 20) + 80,
                confidence: Math.floor(Math.random() * 20) + 80,
                knowledge: Math.floor(Math.random() * 20) + 80,
                tone: ['Professional', 'Enthusiastic', 'Calm', 'Confident'][Math.floor(Math.random() * 4)],
                keywords: ['React', 'Node.js', 'Scalability', 'Teamwork', 'Problem Solving', 'Leadership'].sort(() => 0.5 - Math.random()).slice(0, 4),
                feedback: 'Great video! You showed good confidence and clear communication. Try to maintain more eye contact in the next one.'
            });
        }, 2000);
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
            requirements: `- 3+ years of experience in related field\\n- Strong problem-solving skills\\n- Excellent communication abilities\\n- Proficiency in modern technologies`
        });
    }, 1500);
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (!supabase) {
        console.warn('Warning: Supabase credentials not found in .env');
    }
    if (ENCRYPTION_KEY === 'default-encryption-key-change-in-production') {
        console.warn('Warning: Using default encryption key. Set ENCRYPTION_KEY in .env for production!');
    }
});
