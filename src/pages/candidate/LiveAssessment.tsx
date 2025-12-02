import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import {
    Video, Mic, StopCircle, Play, Loader, AlertTriangle,
    Clock, Eye, CheckCircle, XCircle, Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/api';

interface Question {
    id: number;
    text: string;
    timeLimit: number; // seconds
}

const LiveAssessment: React.FC = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAnswers, setRecordedAnswers] = useState<Blob[]>([]);
    const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes per question
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [assessmentData, setAssessmentData] = useState<any>(null);
    
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const transcriptRef = useRef<string>('');
    const recognitionRef = useRef<any>(null);

    // Fetch questions based on profile and job
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            // Fetch candidate profile
            const { data: profile } = await supabase
                .from('candidates')
                .select('*, candidate_skills(*)')
                .eq('user_id', user.id)
                .single();

            // Fetch job details
            const { data: job } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            // Generate AI questions based on profile and job
            const generatedQuestions = await generateQuestions(profile, job);
            setQuestions(generatedQuestions);
        };

        fetchQuestions();
    }, [jobId]);

    // Generate questions using AI
    const generateQuestions = async (profile: any, job: any): Promise<Question[]> => {
        // For now, return template questions. In production, call AI API
        return [
            { id: 1, text: `Tell us about your experience with ${job?.title || 'this role'} and why you're interested.`, timeLimit: 180 },
            { id: 2, text: `Describe a challenging project you worked on that relates to ${job?.title || 'this position'}.`, timeLimit: 180 },
            { id: 3, text: `What are your key strengths that make you suitable for this role?`, timeLimit: 180 },
            { id: 4, text: `How do you stay updated with the latest trends in your field?`, timeLimit: 180 },
            { id: 5, text: `Describe a situation where you had to work in a team. What was your role?`, timeLimit: 180 },
            { id: 6, text: `What are your career goals for the next 2-3 years?`, timeLimit: 180 },
            { id: 7, text: `How do you handle tight deadlines and pressure?`, timeLimit: 180 },
            { id: 8, text: `Why should we hire you for this position?`, timeLimit: 180 }
        ];
    };

    // Monitor tab switching
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && hasStarted) {
                setTabSwitchCount(prev => {
                    const newCount = prev + 1;
                    setShowWarning(true);
                    setTimeout(() => setShowWarning(false), 5000);
                    
                    if (newCount >= 3) {
                        handleTerminateAssessment();
                    }
                    return newCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [hasStarted]);

    // Timer countdown
    useEffect(() => {
        if (!isRecording) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleStopRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRecording]);

    const handleStartAssessment = async () => {
        // Request camera and microphone permissions
        try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setHasStarted(true);
            handleStartRecording(0);
        } catch (error) {
            alert('Camera and microphone access required for assessment');
        }
    };

    const handleStartRecording = useCallback((questionIndex: number) => {
        setCurrentQuestionIndex(questionIndex);
        setIsRecording(true);
        setTimeRemaining(questions[questionIndex]?.timeLimit || 180);
        recordedChunksRef.current = [];
        transcriptRef.current = '';

        // Start video recording
        if (webcamRef.current?.stream) {
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                mimeType: "video/webm"
            });
            
            mediaRecorderRef.current.addEventListener('dataavailable', (event: BlobEvent) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            });
            
            mediaRecorderRef.current.start();
        }

        // Start speech recognition
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
                    transcriptRef.current += finalTranscript;
                }
            };

            recognitionRef.current.start();
        }
    }, [questions]);

    const handleStopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
        recognitionRef.current?.stop();
        setIsRecording(false);

        setTimeout(() => {
            const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
            setRecordedAnswers(prev => [...prev, blob]);

            // Move to next question or finish
            if (currentQuestionIndex < questions.length - 1) {
                setTimeout(() => handleStartRecording(currentQuestionIndex + 1), 2000);
            } else {
                handleSubmitAssessment();
            }
        }, 100);
    }, [currentQuestionIndex, questions.length]);

    const handleSubmitAssessment = async () => {
        setIsAnalyzing(true);

        try {
            const { data: { user } } = await supabase!.auth.getUser();

            // Submit to AI for analysis
            const response = await fetch(`${API_BASE_URL}/api/analyze-live-assessment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    jobId,
                    transcript: transcriptRef.current,
                    questionsAnswered: questions.length,
                    tabSwitches: tabSwitchCount,
                    totalDuration: questions.length * 180
                })
            });

            const result = await response.json();
            setAssessmentData(result);

            // Save to database
            if (supabase) {
                await supabase.from('assessment_results').insert([{
                    user_id: user?.id,
                    job_id: jobId,
                    score: result.overallScore,
                    communication_score: result.communication,
                    knowledge_score: result.knowledge,
                    confidence_score: result.confidence,
                    transcript: transcriptRef.current,
                    completed_at: new Date().toISOString()
                }]);
            }

            // Navigate to results
            setTimeout(() => {
                navigate(`/candidate/assessment-result/${jobId}`);
            }, 2000);

        } catch (error) {
            console.error('Assessment submission error:', error);
            alert('Failed to submit assessment. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleTerminateAssessment = () => {
        alert('Assessment terminated due to multiple violations.');
        navigate('/candidate/jobs');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!hasStarted) {
        return (
            <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full p-8 rounded-xl glass border border-white/10"
                >
                    <div className="text-center mb-8">
                        <Shield className="mx-auto mb-4 text-neon-cyan" size={64} />
                        <h1 className="text-3xl font-bold mb-2">Live Video Assessment</h1>
                        <p className="text-gray-400">Mandatory for job application completion</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <h3 className="font-bold mb-2 text-blue-400">Assessment Details</h3>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• {questions.length} questions</li>
                                <li>• 2-3 minutes per question</li>
                                <li>• Total duration: ~15-18 minutes</li>
                                <li>• Camera and microphone required</li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <h3 className="font-bold mb-2 text-red-400 flex items-center gap-2">
                                <AlertTriangle size={18} />
                                Important Rules
                            </h3>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Do not switch tabs or leave the window</li>
                                <li>• Keep your camera on throughout</li>
                                <li>• Stay in a quiet environment</li>
                                <li>• Maximum 3 tab switches allowed (auto-termination)</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleStartAssessment}
                        className="w-full btn-3d btn-primary py-4 text-lg flex items-center justify-center gap-2"
                    >
                        <Play size={24} />
                        Start Assessment
                    </button>
                </motion.div>
            </div>
        );
    }

    if (isAnalyzing) {
        return (
            <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <Loader className="animate-spin text-neon-cyan mx-auto mb-4" size={64} />
                    <h2 className="text-2xl font-bold mb-2">Analyzing Your Responses...</h2>
                    <p className="text-gray-400">AI is processing your assessment. Please wait.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] p-6">
            {/* Warning Banner */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-6 py-4 text-center font-bold"
                    >
                        <AlertTriangle className="inline mr-2" size={20} />
                        WARNING: Tab switching detected! ({tabSwitchCount}/3)
                        {tabSwitchCount >= 2 && " - Next violation will terminate the assessment!"}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Video className="text-neon-cyan" size={28} />
                            Live Video Assessment
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-neon-cyan">{formatTime(timeRemaining)}</div>
                        <div className="text-xs text-gray-400">Time Remaining</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-neon-cyan/30">
                            <Webcam
                                ref={webcamRef}
                                audio={true}
                                className="w-full h-full object-cover"
                            />
                            
                            {isRecording && (
                                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-white text-sm font-bold">REC</span>
                                </div>
                            )}
                        </div>

                        {/* Question Card */}
                        <div className="p-6 rounded-xl glass border border-white/10">
                            <h2 className="text-xl font-bold mb-4">Question {currentQuestionIndex + 1}</h2>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                {questions[currentQuestionIndex]?.text}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-4">
                            {isRecording && (
                                <button
                                    onClick={handleStopRecording}
                                    className="btn-3d btn-danger px-8 py-3 flex items-center gap-2"
                                >
                                    <StopCircle size={20} />
                                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Assessment'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Progress */}
                        <div className="p-4 rounded-xl glass border border-white/10">
                            <h3 className="font-bold mb-3">Progress</h3>
                            <div className="space-y-2">
                                {questions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className={`flex items-center gap-2 text-sm ${
                                            idx < currentQuestionIndex
                                                ? 'text-green-400'
                                                : idx === currentQuestionIndex
                                                ? 'text-neon-cyan'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {idx < currentQuestionIndex ? (
                                            <CheckCircle size={16} />
                                        ) : idx === currentQuestionIndex ? (
                                            <Play size={16} />
                                        ) : (
                                            <Clock size={16} />
                                        )}
                                        Question {idx + 1}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="text-green-400" size={18} />
                                <span className="font-bold text-green-400">Monitoring Active</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                Tab switches: {tabSwitchCount}/3
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveAssessment;
