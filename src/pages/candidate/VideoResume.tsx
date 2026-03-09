import React, { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, Upload, Mic, StopCircle, Play, Loader, TrendingUp,
    RefreshCcw, CheckCircle2, AlertCircle, Clock, Shield, Zap, FileText, Send
} from 'lucide-react';
import { endpoints } from '../../lib/api';
import CandidateAIReport from '../../components/CandidateAIReport';

const VIDEO_LIMIT_SECONDS = 180; // 3 Minutes

type PipelineState = 'idle' | 'uploading' | 'transcribing' | 'analyzing' | 'completed' | 'error';

const VideoResume: React.FC = () => {
    const [mode, setMode] = useState<'upload' | 'record'>('record');
    const [status, setStatus] = useState<PipelineState>('idle');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);
    const [analysisTranscript, setAnalysisTranscript] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(VIDEO_LIMIT_SECONDS);
    const [liveTranscript, setLiveTranscript] = useState('');

    // Ref to track transcript without stale closures
    const liveTranscriptRef = useRef('');

    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch candidate details
                const { data: profile } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
                setUser(profile || { name: 'Candidate', skills: [] });

                // Check for saved video resume URL
                const savedUrl = profile?.video_resume_url;
                if (savedUrl) {
                    setVideoUrl(savedUrl);
                }
            }
        };
        fetchUser();
    }, []);

    // Timer logic
    useEffect(() => {
        if (isRecording && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRecording) {
            handleStopRecording();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording, timeLeft]);

    const handleDataAvailable = useCallback(
        ({ data }: BlobEvent) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data));
            }
        },
        [setRecordedChunks]
    );

    const handleStartRecording = useCallback(() => {
        setRecordedChunks([]); // Clear previous chunks
        setIsRecording(true);
        setError(null);
        setStatus('idle');
        setAnalysisResult(null);
        setTimeLeft(VIDEO_LIMIT_SECONDS);
        setLiveTranscript('');
        liveTranscriptRef.current = ''; // Reset ref

        // Start Video Recording
        if (webcamRef.current && webcamRef.current.stream) {
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                mimeType: "video/webm"
            });
            mediaRecorderRef.current.addEventListener(
                "dataavailable",
                handleDataAvailable
            );
            mediaRecorderRef.current.start();
        }

        // Start Speech Recognition (Visual only)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                if (finalTranscript) {
                    setLiveTranscript(prev => prev + finalTranscript);
                    liveTranscriptRef.current += finalTranscript; // Update Ref
                }
            };

            recognitionRef.current.start();
        }
    }, [webcamRef, handleDataAvailable]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);

        // Brief delay to ensure blobs are collected
        setTimeout(() => {
            setRecordedChunks((oldChunks) => {
                const blob = new Blob(oldChunks, { type: "video/webm" });
                // Pass the current ref value for transcript
                startPipeline(blob, liveTranscriptRef.current);
                return [];
            });
        }, 500);
    }, [mediaRecorderRef]);

    const startPipeline = async (blob: Blob, providedText?: string) => {
        try {
            setError(null);
            setVideoUrl(URL.createObjectURL(blob));

            // Pre-check: ensure user has a valid session
            // BYPASS FOR NOW: Fake session for developers testing while Supabase is down
            // if (!supabase) throw new Error('Authentication service unavailable. Please refresh the page.');
            // const { data: { session: currentSession } } = await supabase.auth.getSession();
            // if (!currentSession?.access_token) {
            //     throw new Error('Your session has expired. Please sign out and sign back in, then try again.');
            // }

            // Helper: get fresh auth headers (prevents token expiry during long operations)
            const getAuthHeaders = async (): Promise<Record<string, string>> => {
                // if (!supabase) return {};
                // const { data: { session } } = await supabase.auth.getSession();
                // const headers: Record<string, string> = {};
                // if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
                // return headers;
                return { 'Authorization': 'Bearer BYPASS_TOKEN' };
            };

            // Helper: fetch with timeout (10 min for long transcription)
            const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 600000) => {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), timeoutMs);
                try {
                    const res = await fetch(url, { ...options, signal: controller.signal });
                    return res;
                } finally {
                    clearTimeout(timer);
                }
            };

            // 1. Upload (30s timeout)
            setStatus('uploading');
            const formData = new FormData();
            formData.append('video', blob, 'video_resume.webm');

            const uploadHeaders = await getAuthHeaders();
            const uploadRes = await fetchWithTimeout(endpoints.videoResume.upload, {
                method: 'POST',
                headers: uploadHeaders,
                body: formData
            }, 60000);

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();
            const id = uploadData.videoId;
            setVideoId(id);

            // 2. Transcribe (10 min timeout — Whisper small model on CPU can take 3-5 min)
            setStatus('transcribing');
            const transcribeHeaders = await getAuthHeaders(); // Fresh token
            const transcribeRes = await fetchWithTimeout(endpoints.videoResume.transcribe, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...transcribeHeaders },
                body: JSON.stringify({
                    videoId: id,
                    providedTranscript: providedText
                })
            }, 600000);

            if (!transcribeRes.ok) {
                const err = await transcribeRes.json();
                throw new Error(err.error || 'Transcription failed');
            }
            const transcribeData = await transcribeRes.json();
            const transcriptText = transcribeData.transcript;
            console.log("Using transcript:", transcriptText);
            setAnalysisTranscript(transcriptText);

            // 3. Analyze (5 min timeout)
            setStatus('analyzing');
            const analyzeHeaders = await getAuthHeaders(); // Fresh token again
            const analyzeRes = await fetchWithTimeout(endpoints.videoResume.analyze, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...analyzeHeaders },
                body: JSON.stringify({
                    videoId: id,
                    transcript: transcriptText,
                    duration: VIDEO_LIMIT_SECONDS - timeLeft
                })
            }, 300000);

            if (!analyzeRes.ok) {
                const err = await analyzeRes.json();
                throw new Error(err.error || 'Analysis failed');
            }
            const analyzeData = await analyzeRes.json();

            setAnalysisResult(analyzeData.analysis);
            setStatus('completed');

        } catch (err: any) {
            console.error(err);
            const msg = err.name === 'AbortError'
                ? 'Request timed out. The video may be too long or the server is busy. Please try again.'
                : (err.message || 'An error occurred during processing');
            setError(msg);
            setStatus('error');
        }
    };

    const handleSubmitProfile = async () => {
        if (!videoId || !analysisResult || !analysisTranscript) return;

        try {
            // const { data: { session } } = await supabase.auth.getSession();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            // if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
            headers['Authorization'] = `Bearer BYPASS_TOKEN`;

            const res = await fetch(endpoints.videoResume.submit, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    videoId,
                    transcript: analysisTranscript,
                    analysis: analysisResult,
                    overallScore: analysisResult.finalScore
                })
            });

            if (!res.ok) throw new Error('Submit failed');

            alert('Video Resume saved to your profile!');
        } catch (e: any) {
            alert('Failed to save: ' + e.message);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Video Resume</h1>
                    <p className="text-[var(--text-muted)] font-medium">Record a 3-minute pitch to unlock AI-powered soft skill analysis.</p>
                </div>
                {!videoUrl && mode === 'record' && (
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 transition-all duration-300 ${isRecording ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'}`}>
                        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`} />
                        <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                        <span className="text-xs uppercase font-black opacity-60">Remaining</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column - Video Interface */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <div className="saas-card overflow-hidden">
                        <div className="flex border-b border-[var(--border-subtle)]">
                            <button
                                onClick={() => { setMode('record'); setVideoUrl(null); setAnalysisResult(null); setError(null); setStatus('idle'); }}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${mode === 'record' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            >
                                <Video size={18} /> Record Live
                            </button>
                            <button
                                onClick={() => { setMode('upload'); setVideoUrl(null); setAnalysisResult(null); setError(null); setStatus('idle'); }}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${mode === 'upload' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            >
                                <Upload size={18} /> Upload File
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-inner flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {videoUrl ? (
                                        <div className="relative w-full h-full">
                                            <motion.video
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                src={videoUrl} controls
                                                className="w-full h-full object-contain bg-black"
                                            />
                                            {/* Overlay for Processing States */}
                                            {status !== 'idle' && status !== 'completed' && status !== 'error' && (
                                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                                                    <Loader className="animate-spin mb-4 text-[var(--primary)]" size={48} />
                                                    <h3 className="text-xl font-bold mb-2">
                                                        {status === 'uploading' && 'Uploading Video...'}
                                                        {status === 'transcribing' && 'Transcribing Audio...'}
                                                        {status === 'analyzing' && 'Analyzing Soft Skills...'}
                                                    </h3>
                                                    <p className="text-white/60 text-sm">Please do not close this tab</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : mode === 'record' ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                                            <Webcam
                                                audio={true}
                                                ref={webcamRef}
                                                className="w-full h-full object-cover"
                                                mirrored={true}
                                            />
                                            {isRecording && (
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> REC
                                                    </span>
                                                </div>
                                            )}
                                            {liveTranscript && isRecording && (
                                                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-lg text-white text-xs">
                                                    {liveTranscript.slice(-100)}
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                                            <div className="w-20 h-20 bg-[var(--bg-page)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-subtle)]">
                                                <Upload size={32} className="text-[var(--text-muted)]" />
                                            </div>
                                            <p className="text-sm font-bold text-[var(--text-main)]">Drag & drop your resume video</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-1 mb-6">MP4, WebM or MOV (Max 50MB)</p>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) startPipeline(file);
                                                }}
                                                className="hidden"
                                                id="video-upload"
                                            />
                                            <label
                                                htmlFor="video-upload"
                                                className="btn-saas-primary cursor-pointer"
                                            >
                                                Select Video
                                            </label>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 text-[var(--text-muted)]">
                                    <div className="p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)]">
                                        <Mic size={18} className={isRecording ? 'text-red-500' : ''} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Microphone</p>
                                        <p className="text-[10px] font-bold">Standard Audio Device</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {videoUrl && status !== 'uploading' && status !== 'transcribing' && status !== 'analyzing' ? (
                                        <button
                                            onClick={() => {
                                                setVideoUrl(null);
                                                setAnalysisResult(null);
                                                setError(null);
                                                setStatus('idle');
                                                setTimeLeft(VIDEO_LIMIT_SECONDS);
                                            }}
                                            className="px-6 py-2.5 rounded-xl border border-[var(--border-subtle)] text-sm font-bold flex items-center gap-2 hover:bg-[var(--bg-page)] transition-all"
                                        >
                                            <RefreshCcw size={16} /> Retake
                                        </button>
                                    ) : mode === 'record' && !videoUrl ? (
                                        !isRecording ? (
                                            <button
                                                onClick={handleStartRecording}
                                                className="btn-saas-primary px-10 shadow-lg shadow-indigo-500/20"
                                            >
                                                Start Recording
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleStopRecording}
                                                className="px-10 py-2.5 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 animate-pulse hover:bg-red-700 transition-all"
                                            >
                                                <StopCircle size={18} /> Finish Now
                                            </button>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tips Card */}
                    <div className="saas-card p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 items-center flex gap-6">
                        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white border border-[var(--border-subtle)] items-center justify-center shrink-0 shadow-sm">
                            <Zap size={28} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold mb-1">Boost your AI Score</h4>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Maintain eye contact with the camera, speak at a moderate pace, and try to include industry-specific keywords like "Architecture", "Scaling", or "Leadership".
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Analysis Results */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6 sticky top-24 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {status === 'error' ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="saas-card p-12 text-center border-red-200 bg-red-50/50"
                            >
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="text-red-500" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-red-700 mb-2">Analysis Failed</h3>
                                <p className="text-sm text-red-600 mb-6 max-w-xs mx-auto">{error}</p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => { setError(null); setStatus('idle'); setVideoUrl(null); }}
                                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </motion.div>
                        ) : analysisResult ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <CandidateAIReport data={analysisResult} />

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleSubmitProfile}
                                        className="flex-1 btn-saas-primary flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} /> Submit to My Profile
                                    </button>
                                    <button className="p-3 border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-page)] transition-all">
                                        <FileText size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="saas-card p-12 text-center border-dashed border-2 opacity-60"
                            >
                                <div className="w-16 h-16 bg-[var(--bg-page)] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Shield className="text-[var(--text-muted)]" size={24} />
                                </div>
                                <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">Real-time Analysis Ready</h3>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                    Your AI soft-skill report will appear here automatically after recording. No manual submission needed.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default VideoResume;
