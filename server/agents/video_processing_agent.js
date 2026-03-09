import { generateAIResponse } from './ai_utils.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TRANSCRIBE_SCRIPT = path.resolve(__dirname, '../services/transcribe.py');

// Robust Python detection
const LOCAL_PYTHON = "C:\\Users\\RaAz\\AppData\\Local\\Programs\\Python\\Python311\\python.exe";
const PYTHON_CMD = fs.existsSync(LOCAL_PYTHON) ? `"${LOCAL_PYTHON}"` : "python";

/**
 * Video Processing & Transcription Agent
 * 
 * Responsibilities:
 * - Video ingestion and validation
 * - Audio extraction
 * - Speech-to-text transcription
 * - Sentiment analysis
 * - Non-verbal behavior analysis
 * - Confidence, clarity, hesitation scoring
 */

/**
 * Process video and extract comprehensive analysis
 * @param {string} videoUrl - URL or path to video file
 * @param {object} apiKeys - API keys for AI services
 * @returns {object} Complete video analysis results
 */
export async function processVideo(videoUrl, apiKeys) {
    console.log(`[Video Processing Agent] Starting analysis for: ${videoUrl}`);

    const startTime = Date.now();

    try {
        // Step 1: Video Validation & Metadata Extraction
        const videoMetadata = await extractVideoMetadata(videoUrl);

        // Step 2: Audio Extraction (simulated - in production use FFmpeg or cloud service)
        const audioData = await extractAudio(videoUrl);

        // Step 3: Speech-to-Text Transcription
        const transcription = await transcribeAudio(audioData, apiKeys);

        // Step 4: Sentiment & Tone Analysis
        const sentimentAnalysis = await analyzeSentiment(transcription.text, apiKeys);

        // Step 5: Communication Quality Analysis
        const communicationMetrics = await analyzeCommunication(transcription.text, apiKeys);

        // Step 6: Non-Verbal Analysis (if video frames available)
        const nonVerbalAnalysis = await analyzeNonVerbal(videoUrl, apiKeys);

        // Step 7: Keyword & Topic Extraction
        const topicAnalysis = await extractTopics(transcription.text, apiKeys);

        const processingTime = Date.now() - startTime;

        const result = {
            // Transcription
            transcription: transcription.text,
            transcriptionConfidence: transcription.confidence,

            // Sentiment
            overallSentiment: sentimentAnalysis.sentiment,
            sentimentScore: sentimentAnalysis.score,
            emotionalTone: sentimentAnalysis.tone,

            // Communication Metrics
            clarityScore: communicationMetrics.clarity,
            confidenceScore: communicationMetrics.confidence,
            engagementScore: communicationMetrics.engagement,
            hesitationCount: communicationMetrics.hesitations,
            fillerWordsCount: communicationMetrics.fillerWords,

            // Non-Verbal
            eyeContactScore: nonVerbalAnalysis.eyeContact,
            postureScore: nonVerbalAnalysis.posture,
            facialExpressionAnalysis: nonVerbalAnalysis.expressions,

            // Technical Details
            videoDuration: videoMetadata.duration,
            audioQuality: videoMetadata.audioQuality,
            processingTime,

            // Keywords & Topics
            detectedKeywords: topicAnalysis.keywords,
            topicAnalysis: topicAnalysis.topics,

            // Metadata
            processedAt: new Date().toISOString()
        };

        console.log(`[Video Processing Agent] Analysis complete in ${processingTime}ms`);
        return result;

    } catch (error) {
        console.error('[Video Processing Agent] Error:', error);
        throw error;
    }
}

/**
 * Extract video metadata (duration, quality, etc.)
 */
async function extractVideoMetadata(videoUrl) {
    // In production: Use FFmpeg or cloud video service
    // For now: Return mock metadata
    return {
        duration: 120, // seconds
        resolution: '1280x720',
        fps: 30,
        audioQuality: 'High',
        fileSize: 15728640 // bytes
    };
}

/**
 * Extract audio from video
 */
async function extractAudio(videoUrl) {
    console.log('[Video Processing Agent] Extracting audio from:', videoUrl);
    try {
        // Resolve absolute path for ffmpeg
        const absoluteVideoPath = path.resolve(videoUrl);
        const outputFilename = `audio-${Date.now()}.mp3`;
        // Ensure uploads/temp dir exists
        const outputDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, outputFilename);

        // Try to find ffmpeg
        let ffmpegCmd = 'ffmpeg';
        const localFfmpeg = path.join(process.env.LOCALAPPDATA || '', 'ffmpeg', 'bin', 'ffmpeg.exe');

        if (fs.existsSync(localFfmpeg)) {
            ffmpegCmd = `"${localFfmpeg}"`;
        } else {
            // Fallback: Check if we can get it from python imageio-ffmpeg
            try {
                const ffmpegPathScript = path.resolve(__dirname, '../services/get_ffmpeg_path.py');
                const { stdout } = await execAsync(`${PYTHON_CMD} "${ffmpegPathScript}"`);
                const pyFfmpegPath = stdout.trim();
                if (pyFfmpegPath && fs.existsSync(pyFfmpegPath)) {
                    ffmpegCmd = `"${pyFfmpegPath}"`;
                    console.log('[Video Processing Agent] Found FFmpeg via Python:', ffmpegCmd);
                }
            } catch (e) {
                console.warn('[Video Processing Agent] Could not find FFmpeg via Python helper:', e.message);
            }
        }

        // Run extraction: -y (overwrite), -vn (no video), -acodec libmp3lame (mp3)
        // Note: Using a timeout to prevent hanging
        console.log(`[Video Processing Agent] Running: ${ffmpegCmd} -i "${absoluteVideoPath}" ...`);
        await execAsync(`${ffmpegCmd} -i "${absoluteVideoPath}" -vn -acodec libmp3lame -q:a 2 -y "${outputPath}"`, { timeout: 60000 });

        if (fs.existsSync(outputPath)) {
            console.log('[Video Processing Agent] Audio extracted to:', outputPath);
            return {
                path: outputPath,
                format: 'mp3',
                sampleRate: 44100, // approximations
                duration: 120
            };
        } else {
            throw new Error("Output file not created");
        }
    } catch (error) {
        console.error('[Video Processing Agent] Real audio extraction failed:', error);
        throw new Error(`Audio extraction failed: ${error.message}. Ensure FFmpeg is installed locally.`);
    }
}

/**
 * Transcribe audio to text using AI
 */
async function transcribeAudio(audioData, apiKeys) {
    console.log('[Video Processing Agent] Transcribing audio with local Whisper model...');

    if (!audioData || !audioData.path || !fs.existsSync(audioData.path)) {
        throw new Error("Invalid audio data for local transcription. Audio file missing.");
    }

    try {
        console.log(`[Video Processing Agent] Running Whisper (small model) on: ${audioData.path}`);

        // Run python script: python transcribe.py <path> small
        const cmd = `${PYTHON_CMD} "${TRANSCRIBE_SCRIPT}" "${audioData.path}" small`;

        // 10 minute timeout for slower local machines
        const { stdout, stderr } = await execAsync(cmd, { timeout: 600000 });

        // Check for python script errors in stderr first
        if (stderr && stderr.includes('Traceback')) {
            throw new Error(`Python script error: ${stderr}`);
        }

        try {
            const result = JSON.parse(stdout.trim());
            if (result.error) throw new Error(result.error);

            console.log('[Video Processing Agent] Local transcription successful');
            return {
                text: result.text,
                confidence: 0.95,
                language: result.language || 'en'
            };
        } catch (parseError) {
            console.error('[Video Processing Agent] Failed to parse Whisper output:', stdout);
            throw new Error(`Transcription output parsing failed: ${parseError.message}`);
        }

    } catch (error) {
        console.error('[Video Processing Agent] Local transcription failed:', error);
        throw new Error(`Local Whisper transcription failed: ${error.message}`);
    }
}

/**
 * Analyze sentiment and emotional tone
 */
async function analyzeSentiment(transcription, apiKeys) {
    console.log('[Video Processing Agent] Analyzing sentiment...');

    const systemPrompt = `
        You are an expert in sentiment analysis and emotional intelligence.
        Analyze the following interview transcription for:
        1. Overall sentiment (positive, neutral, negative, professional)
        2. Emotional tone
        3. Confidence level
        
        Transcription: "${transcription}"
        
        Return a JSON object ONLY (no markdown) with this structure:
        {
            "sentiment": "positive" | "neutral" | "negative" | "professional",
            "score": number (0-100),
            "tone": string (e.g., "confident", "nervous", "enthusiastic"),
            "details": string
        }
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            "Analyze the sentiment of this interview.",
            systemPrompt,
            'gemini'
        );

        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        return result;

    } catch (error) {
        console.warn('[Video Processing Agent] Sentiment analysis failed, using fallback');
        return {
            sentiment: 'professional',
            score: 75,
            tone: 'confident',
            details: 'Candidate appears professional and composed'
        };
    }
}

/**
 * Analyze communication quality
 */
async function analyzeCommunication(transcription, apiKeys) {
    console.log('[Video Processing Agent] Analyzing communication quality...');

    const systemPrompt = `
        You are a communication expert analyzing interview performance.
        Analyze the following transcription for:
        1. Clarity of expression (0-100)
        2. Confidence level (0-100)
        3. Engagement level (0-100)
        4. Count of hesitations (um, uh, etc.)
        5. Count of filler words
        
        Transcription: "${transcription}"
        
        Return a JSON object ONLY (no markdown) with this structure:
        {
            "clarity": number (0-100),
            "confidence": number (0-100),
            "engagement": number (0-100),
            "hesitations": number,
            "fillerWords": number,
            "details": string[]
        }
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            "Analyze communication quality.",
            systemPrompt,
            'gpt4'
        );

        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        return result;

    } catch (error) {
        console.warn('[Video Processing Agent] Communication analysis failed, using fallback');

        // Simple fallback analysis
        const hesitations = (transcription.match(/\b(um|uh|er|ah)\b/gi) || []).length;
        const fillerWords = (transcription.match(/\b(like|you know|basically|actually)\b/gi) || []).length;

        return {
            clarity: 80,
            confidence: 75,
            engagement: 85,
            hesitations,
            fillerWords,
            details: ['Clear communication', 'Good articulation']
        };
    }
}

/**
 * Analyze non-verbal cues (future enhancement)
 */
async function analyzeNonVerbal(videoUrl, apiKeys) {
    console.log('[Video Processing Agent] Analyzing non-verbal cues...');

    // In production: Use computer vision APIs (AWS Rekognition, Google Vision, etc.)
    // For now: Return mock analysis

    return {
        eyeContact: 85,
        posture: 90,
        expressions: {
            smile: 0.7,
            neutral: 0.2,
            focused: 0.8,
            nervous: 0.1
        },
        gestures: ['professional', 'engaged'],
        details: 'Maintains good eye contact and professional posture'
    };
}

/**
 * Extract keywords and topics
 */
async function extractTopics(transcription, apiKeys) {
    console.log('[Video Processing Agent] Extracting topics and keywords...');

    const systemPrompt = `
        You are an expert in natural language processing.
        Extract key topics and technical keywords from this interview transcription.
        
        Transcription: "${transcription}"
        
        Return a JSON object ONLY (no markdown) with this structure:
        {
            "keywords": string[] (technical terms, skills mentioned),
            "topics": object (topic: relevance_score),
            "mainThemes": string[]
        }
    `;

    try {
        const aiResponse = await generateAIResponse(
            apiKeys,
            "Extract topics and keywords.",
            systemPrompt,
            'gemini'
        );

        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        return result;

    } catch (error) {
        console.warn('[Video Processing Agent] Topic extraction failed, using fallback');

        // Simple keyword extraction
        const techKeywords = ['React', 'Node.js', 'JavaScript', 'TypeScript', 'API', 'Database'];
        const foundKeywords = techKeywords.filter(kw =>
            transcription.toLowerCase().includes(kw.toLowerCase())
        );

        return {
            keywords: foundKeywords,
            topics: {
                'Frontend Development': 0.8,
                'Backend Development': 0.7,
                'Full Stack': 0.9
            },
            mainThemes: ['Technical Skills', 'Experience', 'Problem Solving']
        };
    }
}

/**
 * Save video analysis results to database
 */
export async function saveVideoAnalysis(candidateId, videoUrl, analysisResults, supabase) {
    try {
        const { data, error } = await supabase
            .from('video_analysis_results')
            .insert([{
                candidate_id: candidateId,
                video_url: videoUrl,
                transcription: analysisResults.transcription,
                transcription_confidence: analysisResults.transcriptionConfidence,
                overall_sentiment: analysisResults.overallSentiment,
                sentiment_score: analysisResults.sentimentScore,
                clarity_score: analysisResults.clarityScore,
                confidence_score: analysisResults.confidenceScore,
                engagement_score: analysisResults.engagementScore,
                hesitation_count: analysisResults.hesitationCount,
                filler_words_count: analysisResults.fillerWordsCount,
                eye_contact_score: analysisResults.eyeContactScore,
                posture_score: analysisResults.postureScore,
                facial_expression_analysis: analysisResults.facialExpressionAnalysis,
                video_duration: analysisResults.videoDuration,
                audio_quality: analysisResults.audioQuality,
                processing_time: analysisResults.processingTime,
                detected_keywords: analysisResults.detectedKeywords,
                topic_analysis: analysisResults.topicAnalysis
            }])
            .select();

        if (error) throw error;

        console.log('[Video Processing Agent] Results saved to database');
        return data;

    } catch (error) {
        console.error('[Video Processing Agent] Failed to save results:', error);
        throw error;
    }
}
