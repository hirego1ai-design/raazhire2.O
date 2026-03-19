import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function analyzeVideoDirectly(filePath, candidateData, apiKeys) {
    const geminiKey = apiKeys.gemini;
    if (!geminiKey) throw new Error("Gemini API Key is missing");

    // Production-ready stable model names (aliased to latest stable versions)
    const primaryModel = "gemini-1.5-flash-latest"; // Best for video / speed
    const fallbackModel = "gemini-1.5-flash-latest"; // Fallback to same stable alias
    console.log(`[Gemini Video] Using models: Primary=${primaryModel}, Fallback=${fallbackModel}`);

    const fileManager = new GoogleAIFileManager(geminiKey);
    const genAI = new GoogleGenerativeAI(geminiKey);

    console.log(`[Gemini Video] Uploading video to Gemini File API: ${filePath}`);

    // Upload the file
    let uploadResult;
    try {
        uploadResult = await fileManager.uploadFile(filePath, {
            mimeType: "video/webm",
            displayName: "Video Resume",
        });
    } catch (e) {
        throw new Error(`Failed to upload video to Gemini: ${e.message}`);
    }

    const { file } = uploadResult;
    console.log(`[Gemini Video] Uploaded as ${file.name} (${file.uri})`);

    // Poll until ready
    let state = file.state;
    while (state === FileState.PROCESSING) {
        console.log("[Gemini Video] Processing video...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const res = await fileManager.getFile(file.name);
        state = res.state;
        if (state === FileState.FAILED) {
            throw new Error("Gemini Video Processing failed.");
        }
    }

    const prompt = `
You are a master AI hiring evaluator. Evaluate this candidate's video resume.
Candidate Name: ${candidateData.name}
Claimed Skills: ${candidateData.skills?.join(', ') || 'None specified'}

Provide a comprehensive JSON report containing:
1. "finalScore": (0-100) Overall candidate score.
2. "status": "Shortlisted", "On Hold", or "Flagged".
3. "summary": A 2-3 sentence overall summary of their performance.
4. "layer1": { "score": 0-100, "details": ["strengths", "weaknesses"] } (Screening / Profile Match)
5. "layer2": { "score": 0-100, "detectedTerms": ["list", "of", "skills"], "domainKnowledge": "Strong/Average/Weak", "details": ["tech strengths"] } (Technical Skills)
6. "layer3": { "score": 0-100, "emotionalTone": "Confident/Nervous/etc", "traits": ["Resilient", "Leader"], "details": ["soft skills"] } (Behavioral)
7. "fraudDetection": { "fraud_flag": boolean, "ai_generated_probability": 0-100, "authenticity_score": 0-100, "fraud_indicators": ["concerns if any"] }
8. "transcription": "A rough transcript of what they said."

ONLY return a valid JSON object. No markdown wrapping.
`;

    // Try primary model
    let responseText;
    let usedProvider = primaryModel;
    try {
        const model = genAI.getGenerativeModel({ model: primaryModel });
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri
                }
            },
            { text: prompt },
        ]);
        responseText = result.response.text();
    } catch (e) {
        console.warn(`[Gemini Video] Primary model failed: ${e.message}. Trying fallback...`);
        try {
            usedProvider = fallbackModel;
            const fallback = genAI.getGenerativeModel({ model: fallbackModel });
            const result = await fallback.generateContent([
                {
                    fileData: {
                        mimeType: file.mimeType,
                        fileUri: file.uri
                    }
                },
                { text: prompt },
            ]);
            responseText = result.response.text();
        } catch (fallbackError) {
            throw new Error(`Video analysis failed on both primary and fallback models: ${fallbackError.message}`);
        }
    }

    // Clean up file to save API storage space
    try {
        await fileManager.deleteFile(file.name);
        console.log(`[Gemini Video] Cleaned up file ${file.name}`);
    } catch (e) {
        console.warn(`[Gemini Video] Failed to cleanup file ${file.name}`);
    }

    // Parse Response
    try {
        let cleaned = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const jsonResult = JSON.parse(cleaned);

        // Map status for fraud
        if (jsonResult.fraudDetection?.fraud_flag) {
            jsonResult.status = "Flagged";
            jsonResult.finalScore = Math.round(jsonResult.finalScore * 0.7); // Penalize
        }

        // Add metadata
        jsonResult.provider = usedProvider;
        jsonResult.rank = jsonResult.finalScore > 90 ? "Top 5%" : (jsonResult.finalScore > 80 ? "Top 15%" : (jsonResult.finalScore > 70 ? "Top 30%" : "Average"));

        return jsonResult;
    } catch (parseError) {
        console.error(`[Gemini Video] JSON Parse failed. Raw output: ${responseText.substring(0, 200)}`);
        throw new Error("AI returned malformed JSON report.");
    }
}
