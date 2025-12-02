import fetch from 'node-fetch'; // Assuming node-fetch is available or using global fetch in Node 18+

// Helper to call Gemini API
export async function callGemini(apiKey, prompt, systemInstruction = "") {
    if (!apiKey) throw new Error("Gemini API Key is missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{ text: systemInstruction + "\n\n" + prompt }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Gemini API Error');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini Call Failed:", error);
        return null;
    }
}

// Helper to call OpenAI API
export async function callOpenAI(apiKey, prompt, systemInstruction = "") {
    if (!apiKey) throw new Error("OpenAI API Key is missing");

    const url = 'https://api.openai.com/v1/chat/completions';

    const payload = {
        model: "gpt-4",
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        temperature: 0.7
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'OpenAI API Error');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Call Failed:", error);
        return null;
    }
}

// Universal AI Caller (Tries Primary, falls back to Secondary)
export async function generateAIResponse(keys, prompt, systemInstruction, preferredProvider = 'gemini') {
    // 1. Try Preferred
    if (preferredProvider === 'gemini' && keys.gemini) {
        const res = await callGemini(keys.gemini, prompt, systemInstruction);
        if (res) return res;
    }

    if (preferredProvider === 'gpt4' && keys.gpt4) {
        const res = await callOpenAI(keys.gpt4, prompt, systemInstruction);
        if (res) return res;
    }

    // 2. Fallback
    if (keys.gemini) return await callGemini(keys.gemini, prompt, systemInstruction);
    if (keys.gpt4) return await callOpenAI(keys.gpt4, prompt, systemInstruction);

    throw new Error("No available AI providers or keys");
}
