import { execFile, execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runMasterEvaluation } from '../agents/master_agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Timeout for Python scripts (10 minutes)
const PYTHON_TIMEOUT_MS = 600000;
// Max buffer size for stdout (10 MB)
const MAX_BUFFER = 10 * 1024 * 1024;

let pyCmd = 'python3';
try {
    execFileSync('python3', ['--version'], { stdio: 'ignore' });
} catch (e) {
    pyCmd = 'python';
}

/**
 * Runs the transcription Python script and returns JSON output.
 * Handles errors with detailed context for the frontend.
 * SECURITY: Uses execFile() with array arguments to prevent command injection.
 */
const runPythonScript = (scriptPath, args) => {
    return new Promise((resolve, reject) => {
        console.log(`[Video Service] Running: ${pyCmd} ${scriptPath} [${args.length} args]`);

        execFile(pyCmd, [scriptPath, ...args], { timeout: PYTHON_TIMEOUT_MS, maxBuffer: MAX_BUFFER }, (error, stdout, stderr) => {
            const stderr_snippet = stderr ? stderr.substring(0, 1000) : '';

            if (error) {
                console.error(`[Video Service] Python Error: ${error.message}`);

                // Structured Errors for Production Stability
                if (error.killed || error.signal === 'SIGTERM') {
                    return reject({
                        error_code: 'TIMEOUT',
                        message: 'Transcription timed out. The video may be too long for the local CPU.',
                        stderr_snippet
                    });
                }

                if (stderr && stderr.includes("ModuleNotFoundError")) {
                    return reject({
                        error_code: 'MISSING_DEPENDENCY',
                        message: "Python dependencies missing on server. Please run setup scripts.",
                        stderr_snippet
                    });
                }

                return reject({
                    error_code: 'PYTHON_EXEC_FAILED',
                    message: `Python script failed: ${error.message}`,
                    stderr_snippet
                });
            }

            try {
                const jsonStart = stdout.indexOf('{');
                const jsonEnd = stdout.lastIndexOf('}');

                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
                    resolve(JSON.parse(jsonStr));
                } else {
                    reject({
                        error_code: 'PARSE_ERROR',
                        message: 'No valid JSON output from transcription script.',
                        stderr_snippet: stdout.substring(0, 500)
                    });
                }
            } catch (e) {
                reject({
                    error_code: 'PARSE_FAILED',
                    message: `Failed to parse Python output: ${e.message}`,
                    stderr_snippet: stdout.substring(0, 500)
                });
            }
        });
    });
};

/**
 * Transcribes video using Whisper local model.
 * Default model is 'tiny' for speed and stability.
 */
export const transcribeVideo = async (filePath) => {
    const scriptPath = path.join(__dirname, 'transcribe.py');
    const model = process.env.WHISPER_MODEL || "tiny";

    if (!fs.existsSync(filePath)) {
        throw {
            error_code: 'FILE_NOT_FOUND',
            message: `Video file not found: ${path.basename(filePath)}`
        };
    }

    try {
        const result = await runPythonScript(scriptPath, [filePath, model]);
        if (result.error) {
            throw {
                error_code: 'TRANSCRIBE_SCRIPT_ERROR',
                message: result.error,
                stderr_snippet: 'Internal Python logic error'
            };
        }
        return result;
    } catch (error) {
        if (error.error_code) throw error;
        throw {
            error_code: 'UNKNOWN_SERVICE_ERROR',
            message: `Transcription service failed: ${error.message}`,
            stderr_snippet: error.stderr || error.toString()
        };
    }
};

/**
 * Analyzes video transcript using Multi-Layer AI Agents.
 */
export const analyzeVideoTranscript = async (candidateData, transcript, duration, apiKeys, dbClient = null) => {
    if (!transcript || transcript.trim().length === 0) {
        throw new Error("Transcript is empty. Cannot perform analysis.");
    }

    const videoData = {
        transcription: transcript,
        metadata: { duration }
    };

    return await runMasterEvaluation(candidateData, videoData, apiKeys, dbClient);
};

/**
 * Persists the video resume analysis results to Supabase.
 */
export const saveVideoResume = async (dbClient, userId, videoUrl, transcript, analysisJson, overallScore) => {
    if (!dbClient) throw new Error("Database client not available for saving.");

    const { data, error } = await dbClient
        .from('video_resumes')
        .insert([{
            user_id: userId,
            video_url: videoUrl,
            transcript: transcript,
            analysis_json: analysisJson,
            overall_score: overallScore,
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) throw new Error(`Database insert failed: ${error.message}`);
    return data;
};
