import fetch from 'node-fetch';

// ==================== CONSTANTS ====================
const MAX_RETRIES = 1;
const DEFAULT_TEMPERATURE = 0.2;
const API_TIMEOUT_MS = 30000; // 30 second timeout

// ==================== HELPER: SECURE FETCH WITH TIMEOUT ====================
async function fetchWithTimeout(url, options, timeout = API_TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
    }
}

// ==================== GEMINI CALLER ====================
export async function callGemini(apiKey, prompt, systemInstruction = "") {
    if (!apiKey) throw new Error("Gemini API Key is missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{
            parts: [{ text: (systemInstruction ? systemInstruction + "\n\n" : "") + prompt }]
        }],
        generationConfig: {
            temperature: DEFAULT_TEMPERATURE,
            maxOutputTokens: 2048
        }
    };

    console.log(`[Gemini] Calling 2.0-flash... (Timeout: ${API_TIMEOUT_MS}ms)`);

    const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        console.error(`[Gemini] Failed to parse JSON. Raw: ${rawText.substring(0, 200)}`);
        throw new Error(`Gemini returned invalid JSON: ${rawText.substring(0, 100)}...`);
    }

    if (!response.ok) {
        const errMsg = data.error?.message || `Gemini API Error (Status: ${response.status})`;
        console.error(`[Gemini] Error: ${errMsg}`);
        throw new Error(errMsg);
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
        console.error(`[Gemini] Response structure missing content:`, JSON.stringify(data).substring(0, 200));
        throw new Error("Gemini returned an empty or malformed response structure");
    }

    return content;
}

// ==================== OPENAI CALLER (Optimized for GPT-4o-mini) ====================
export async function callOpenAI(apiKey, prompt, systemInstruction = "") {
    if (!apiKey) throw new Error("OpenAI API Key is missing");

    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
        model: "gpt-4o-mini", // Upgraded from gpt-4 for better availability and speed
        messages: [
            { role: "system", content: systemInstruction || "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        temperature: DEFAULT_TEMPERATURE,
        response_format: { type: "json_object" }
    };

    console.log(`[OpenAI] Calling gpt-4o-mini... (Timeout: ${API_TIMEOUT_MS}ms)`);

    const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        console.error(`[OpenAI] Failed to parse JSON. Raw: ${rawText.substring(0, 200)}`);
        throw new Error(`OpenAI returned invalid JSON: ${rawText.substring(0, 100)}...`);
    }

    if (!response.ok) {
        const errMsg = data.error?.message || `OpenAI API Error (Status: ${response.status})`;
        console.error(`[OpenAI] Error: ${errMsg}`);
        throw new Error(errMsg);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("OpenAI returned an empty response body");
    }

    return content;
}

// ==================== DEEPSEEK CALLER ====================
export async function callDeepSeek(apiKey, prompt, systemInstruction = "") {
    if (!apiKey) throw new Error("DeepSeek API Key is missing");

    const url = 'https://api.deepseek.com/chat/completions';
    const payload = {
        model: "deepseek-chat",
        messages: [
            { role: "system", content: systemInstruction || "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        temperature: DEFAULT_TEMPERATURE,
        response_format: { type: "json_object" }
    };

    console.log(`[DeepSeek] Calling deepseek-chat... (Timeout: ${API_TIMEOUT_MS}ms)`);

    const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        throw new Error(`DeepSeek returned invalid JSON: ${rawText.substring(0, 100)}...`);
    }

    if (!response.ok) {
        const errMsg = data.error?.message || `DeepSeek API Error (Status: ${response.status})`;
        throw new Error(errMsg);
    }

    return data?.choices?.[0]?.message?.content;
}

// ==================== ORCHESTRATION ====================

const PROVIDER_CALLERS = {
    gemini: callGemini,
    gpt4: callOpenAI,
    deepseek: callDeepSeek
};

const PROVIDER_DISPLAY_NAMES = {
    gemini: 'Google Gemini 2.0 Flash',
    gpt4: 'OpenAI GPT-4o Mini',
    deepseek: 'DeepSeek Chat'
};

const PROVIDER_PRIORITY = ['gemini', 'gpt4', 'deepseek'];

/**
 * Universally retrieves AI configuration
 */
export async function getAIConfig(supabase) {
    try {
        let config = null;
        if (supabase) {
            const { data } = await supabase.from('ai_config').select('*').single();
            config = data;
        }

        if (!config) {
            const fs = await import('fs');
            const path = await import('path');
            const dbPath = path.join(process.cwd(), 'server/local_db.json');
            if (fs.existsSync(dbPath)) {
                const localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                config = localDb.ai_config;
            }
        }

        return config || {
            primaryProvider: 'gemini',
            enabled_providers: ['gemini', 'gpt4', 'deepseek']
        };
    } catch (e) {
        return { primaryProvider: 'gemini', enabled_providers: ['gemini'] };
    }
}

/**
 * Main AI Entry point with full chain execution
 */
export async function generateAIResponse(keys, prompt, systemInstruction, aiConfig = {}) {
    const primary = aiConfig.primaryProvider || 'gemini';
    const enabled = aiConfig.enabled_providers || PROVIDER_PRIORITY;

    // Create unique chain: primary first, then others if enabled
    const chain = [primary, ...PROVIDER_PRIORITY.filter(p => p !== primary)]
        .filter(p => enabled.includes(p));

    const errors = [];

    for (const provider of chain) {
        const apiKey = keys[provider];
        if (!apiKey) {
            errors.push(`${provider}: Key missing`);
            continue;
        }

        const caller = PROVIDER_CALLERS[provider];
        if (!caller) continue;

        for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
            try {
                const result = await caller(apiKey, prompt, systemInstruction);
                if (result) return result;
                throw new Error("Empty response received");
            } catch (err) {
                const errorDetail = `[${provider}] Attempt ${attempt} failed: ${err.message}`;
                errors.push(errorDetail);
                console.warn(errorDetail);
                // If it's the last attempt for this provider, we move to the next in chain
            }
        }
    }

    // Final failure state
    const errorLog = errors.join('\n');
    throw new Error(`AI Pipeline Failed. Chain: ${chain.join(' -> ')}\nDetails:\n${errorLog}`);
}

/**
 * Health Check: Tests all configured providers
 */
export async function checkAIHealth(keys, enabledProviders) {
    const results = [];
    const testPrompt = "Respond only with the word 'OK'.";

    for (const provider of PROVIDER_PRIORITY) {
        const isEnabled = enabledProviders.includes(provider);
        const hasKey = !!keys[provider];

        const status = {
            provider,
            displayName: PROVIDER_DISPLAY_NAMES[provider],
            enabled: isEnabled,
            keyFound: hasKey,
            status: 'unknown',
            latency: null,
            error: null
        };

        if (isEnabled && hasKey) {
            const start = Date.now();
            try {
                const caller = PROVIDER_CALLERS[provider];
                await caller(keys[provider], testPrompt, "Health check agent.");
                status.status = 'healthy';
                status.latency = Date.now() - start;
            } catch (e) {
                status.status = 'unhealthy';
                status.error = e.message;
            }
        } else if (!isEnabled) {
            status.status = 'disabled';
        } else {
            status.status = 'missing_config';
        }

        results.push(status);
    }
    return results;
}

export function safeParseJSON(text) {
    if (!text) return null;
    try {
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        return null; // Return null if parsing fails, but the caller should handle it
    }
}
