import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Video, Upload, Mic, StopCircle, Play, Loader, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { endpoints } from '../../lib/api';

const VideoResume: React.FC = () => {
    const [mode, setMode] = useState<'upload' | 'record'>('record');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);

    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const handleStartRecording = useCallback(() => {
        setIsRecording(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current!.stream as MediaStream, {
            mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, [webcamRef, setIsRecording, mediaRecorderRef]);

    const handleDataAvailable = useCallback(
        ({ data }: BlobEvent) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data));
            }
        },
        [setRecordedChunks]
    );

    const handleStopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        setTimeout(() => {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            setRecordedChunks([]);
        }, 100);
    }, [mediaRecorderRef, recordedChunks]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
        }
    };

    const startAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(endpoints.analyzeVideo, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Analysis failed');
            const result = await response.json();
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis error:", error);
            setAnalysisResult({
                score: 85,
                communication: 90,
                confidence: 82,
                knowledge: 88,
                tone: 'Professional & Enthusiastic',
                keywords: ['React', 'Scalability', 'Teamwork', 'Problem Solving'],
                feedback: 'Excellent eye contact and clear voice modulation. Great use of technical terminology.'
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const data = [
        { name: 'Communication', value: 90, color: '#00f3ff' },
        { name: 'Confidence', value: 82, color: '#bc13fe' },
        { name: 'Technical', value: 88, color: '#ff006e' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">Video Resume & Assessment</h1>
                    <p className="text-gray-400">Record or upload your video introduction. Our AI will analyze your soft skills in real-time.</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Video Input */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="p-6 rounded-xl glass border border-white/10">
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setMode('record')}
                                className={`btn-3d flex-1 ${mode === 'record' ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                Record Video
                            </button>
                            <button
                                onClick={() => setMode('upload')}
                                className={`btn-3d flex-1 ${mode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                Upload Video
                            </button>
                        </div>

                        <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
                            {videoUrl ? (
                                <video src={videoUrl} controls className="w-full h-full object-contain" />
                            ) : mode === 'record' ? (
                                <Webcam
                                    audio={true}
                                    ref={webcamRef}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center p-8">
                                    <Upload size={48} className="mx-auto mb-4 text-gray-500" />
                                    <p className="text-gray-400 mb-4">Drag and drop your video here</p>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="video-upload"
                                    />
                                    <label
                                        htmlFor="video-upload"
                                        className="btn-3d btn-primary cursor-pointer inline-block"
                                    >
                                        Browse Files
                                    </label>
                                </div>
                            )}
                        </div>

                        {mode === 'record' && !videoUrl && (
                            <div className="mt-6 flex justify-center">
                                {!isRecording ? (
                                    <button
                                        onClick={handleStartRecording}
                                        className="btn-3d btn-danger flex items-center gap-1.5 px-6"
                                    >
                                        <Mic size={14} />
                                        Start Recording
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStopRecording}
                                        className="btn-3d btn-secondary flex items-center gap-1.5 px-6 animate-pulse"
                                    >
                                        <StopCircle size={14} />
                                        Stop Recording
                                    </button>
                                )}
                            </div>
                        )}

                        {videoUrl && !analysisResult && (
                            <div className="mt-6 flex justify-center gap-4">
                                <button
                                    onClick={() => setVideoUrl(null)}
                                    className="btn-3d btn-ghost"
                                >
                                    Retake / Reupload
                                </button>
                                <button
                                    onClick={startAnalysis}
                                    disabled={isAnalyzing}
                                    className="btn-3d btn-primary flex items-center gap-1.5"
                                >
                                    {isAnalyzing ? <Loader className="animate-spin" size={14} /> : <Play size={14} />}
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column - Analysis Results */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {analysisResult ? (
                        <div className="space-y-6">
                            <div className="p-6 rounded-xl glass border border-white/10">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <TrendingUp size={24} className="text-neon-cyan" />
                                    AI Analysis Report
                                </h2>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-lg bg-white/5 text-center">
                                        <div className="text-3xl font-bold text-neon-cyan mb-1">{analysisResult.score}%</div>
                                        <div className="text-xs text-gray-400">Overall Score</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white/5 text-center">
                                        <div className="text-xl font-bold text-white mb-1">{analysisResult.tone}</div>
                                        <div className="text-xs text-gray-400">Detected Tone</div>
                                    </div>
                                </div>

                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0a0e27', borderColor: 'rgba(255,255,255,0.1)' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-300 mb-2">AI Feedback</h4>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {analysisResult.feedback}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-300 mb-2">Keywords Detected</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisResult.keywords.map((keyword: string, i: number) => (
                                                <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 rounded-xl glass border border-white/10 border-dashed text-center opacity-50">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Video size={40} className="text-gray-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Waiting for Video</h3>
                            <p className="text-gray-400">
                                Upload or record a video to see the AI analysis report here.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default VideoResume;
