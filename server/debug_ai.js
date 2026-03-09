
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import fetch from 'node-fetch';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

function decrypt(text) {
    if (!text) return null;
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
        return text;
    }
}

async function testProvider(name, url, headers, body) {
    console.log(`\n--- Testing ${name} ---`);
    const startTime = Date.now();
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(body)
        });
        const status = res.status;
        const data = await res.json();
        const duration = Date.now() - startTime;
        console.log(`Status: ${status} (${duration}ms)`);
        console.log(`Response: ${JSON.stringify(data).substring(0, 300)}...`);
        return { name, status, ok: res.ok, data };
    } catch (err) {
        console.log(`Error: ${err.message}`);
        return { name, error: err.message };
    }
}

async function run() {
    const dbPath = './local_db.json';
    if (!fs.existsSync(dbPath)) {
        console.error("local_db.json not found");
        return;
    }

    const localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const apiKeys = {};
    localDb.api_keys.forEach(k => {
        const decrypted = decrypt(k.api_key);
        apiKeys[k.provider] = decrypted;
        console.log(`Provider: ${k.provider}, Key Found: ${!!decrypted}, Length: ${decrypted?.length}`);
    });

    if (apiKeys.gemini) {
        await testProvider('Gemini',
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKeys.gemini}`,
            {},
            { contents: [{ parts: [{ text: "Respond with 'ALIVE'" }] }] }
        );
    }

    if (apiKeys.gpt4) {
        await testProvider('OpenAI (gpt-4)',
            'https://api.openai.com/v1/chat/completions',
            { 'Authorization': `Bearer ${apiKeys.gpt4}` },
            { model: "gpt-4", messages: [{ role: "user", content: "Respond with 'ALIVE'" }], max_tokens: 5 }
        );
    }

    if (apiKeys.deepseek) {
        await testProvider('DeepSeek',
            'https://api.deepseek.com/chat/completions',
            { 'Authorization': `Bearer ${apiKeys.deepseek}` },
            { model: "deepseek-chat", messages: [{ role: "user", content: "Respond with 'ALIVE'" }], max_tokens: 5 }
        );
    }
}

run();
