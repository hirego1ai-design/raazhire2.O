import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, AlertCircle, Play, Timer, CheckCircle, Calendar, Video, Mic, Eye, Monitor, X, AlertTriangle, ChevronRight, Upload } from 'lucide-react';
import ProctoringWrapper from '../../components/ProctoringWrapper';

// Mock assessment data
const MOCK_ASSESSMENTS = [
    {
        id: 1,
        title: 'JavaScript Fundamentals',
        type: 'Technical',
        duration: '30 mins',
        questions: 15,
        status: 'pending',
        dueDate: '2024-12-15',
        difficulty: 'Medium'
    },
    {
        id: 2,
        title: 'React & Frontend Development',
        type: 'Technical',
        duration: '45 mins',
        questions: 20,
        status: 'pending',
        dueDate: '2024-12-18',
        difficulty: 'Hard'
    },
    {
        id: 3,
        title: 'Problem Solving & Algorithms',
        type: 'Technical',
        duration: '60 mins',
        questions: 10,
        status: 'pending',
        dueDate: '2024-12-20',
        difficulty: 'Hard'
    },
    {
        id: 4,
        title: 'Communication Skills Assessment',
        type: 'Behavioral',
        duration: '20 mins',
        questions: 8,
        status: 'completed',
        dueDate: '2024-11-28',
        difficulty: 'Easy',
        score: 85,
        date: 'Nov 28, 2024'
    },
    {
        id: 5,
        title: 'Database & SQL Basics',
        type: 'Technical',
        duration: '40 mins',
        questions: 12,
        status: 'pending',
        dueDate: '2024-12-22',
        difficulty: 'Medium'
    },
    {
        id: 6,
        title: 'General Aptitude Test',
        type: 'Aptitude',
        duration: '30 mins',
        questions: 25,
        status: 'completed',
        dueDate: '2024-11-25',
        difficulty: 'Easy',
        score: 92,
        date: 'Nov 25, 2024'
    }
];

// Mock video-based questions (Part 1: 4 questions, 12 minutes)
const VIDEO_QUESTIONS: Question[] = [
    {
        id: 1,
        text: 'Please introduce yourself and explain your experience with the technologies mentioned in your profile.',
        type: 'video' as const,
        duration: 180 // 3 minutes
    },
    {
        id: 2,
        text: 'Describe a challenging project you worked on. What was your role and how did you overcome the difficulties?',
        type: 'video' as const,
        duration: 180 // 3 minutes
    },
    {
        id: 3,
        text: 'Explain your approach to learning new technologies. Give an example from your recent experience.',
        type: 'video' as const,
        duration: 180 // 3 minutes
    },
    {
        id: 4,
        text: 'Where do you see yourself in the next 3-5 years? How does this position align with your career goals?',
        type: 'video' as const,
        duration: 180 // 3 minutes
    }
];

// Mock text-based questions (Part 2: 12 questions, 8 minutes)
const MOCK_QUESTIONS: Question[] = [
    {
        id: 1,
        text: 'What is the difference between let, const, and var in JavaScript?',
        type: 'text' as const,
        options: [
            'let is block-scoped, const is function-scoped, var is global-scoped',
            'let and const are block-scoped, var is function-scoped',
            'They are all the same, just different syntax',
            'var is block-scoped, let and const are function-scoped'
        ]
    },
    {
        id: 2,
        text: 'Which of the following is NOT a valid way to create a component in React?',
        type: 'text' as const,
        options: [
            'Function Component',
            'Class Component',
            'Arrow Function Component',
            'Template Component'
        ]
    },
    {
        id: 3,
        text: 'What does the "virtual DOM" refer to in React?',
        type: 'text' as const,
        options: [
            'A virtual server for testing',
            'A lightweight copy of the actual DOM',
            'A cloud-based DOM storage',
            'A deprecated React feature'
        ]
    },
    {
        id: 4,
        text: 'Which hook is used to manage side effects in React functional components?',
        type: 'text' as const,
        options: [
            'useState',
            'useEffect',
            'useContext',
            'useReducer'
        ]
    },
    {
        id: 5,
        text: 'What is the purpose of the "key" prop in React lists?',
        type: 'text' as const,
        options: [
            'To encrypt data',
            'To help React identify which items have changed',
            'To unlock premium features',
            'To validate form inputs'
        ]
    },
    {
        id: 6,
        text: 'What is the correct way to update state in React?',
        type: 'text' as const,
        options: [
            'this.state = newValue',
            'setState(newValue)',
            'state.update(newValue)',
            'this.updateState(newValue)'
        ]
    },
    {
        id: 7,
        text: 'Which method is used to render JSX in React?',
        type: 'text' as const,
        options: [
            'render()',
            'display()',
            'show()',
            'output()'
        ]
    },
    {
        id: 8,
        text: 'What is the purpose of useCallback hook?',
        type: 'text' as const,
        options: [
            'To memoize values',
            'To memoize functions',
            'To manage state',
            'To handle side effects'
        ]
    },
    {
        id: 9,
        text: 'What is prop drilling in React?',
        type: 'text' as const,
        options: [
            'Passing data through multiple layers of components',
            'Creating holes in components',
            'Debugging props',
            'Validating prop types'
        ]
    },
    {
        id: 10,
        text: 'Which of these is a way to style React components?',
        type: 'text' as const,
        options: [
            'CSS-in-JS',
            'Inline styles',
            'CSS modules',
            'All of the above'
        ]
    },
    {
        id: 11,
        text: 'What is the purpose of React.Fragment?',
        type: 'text' as const,
        options: [
            'To group multiple elements without adding extra DOM nodes',
            'To create fragments of code',
            'To split components',
            'To handle errors'
        ]
    },
    {
        id: 12,
        text: 'What is the difference between controlled and uncontrolled components?',
        type: 'text' as const,
        options: [
            'Controlled components have their state managed by React',
            'Uncontrolled components are faster',
            'There is no difference',
            'Controlled components use refs'
        ]
    }
];

interface Assessment {
    id: number;
    title: string;
    type: string;
    duration: string;
    questions: number;
    status: string;
    dueDate: string;
    difficulty: string;
    score?: number;
    date?: string;
}

interface Question {
    id: number;
    text: string;
    type: 'video' | 'text';
    options?: string[];
    duration?: number;
}

const Assessments: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [activeAssessmentId, setActiveAssessmentId] = useState<number | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [assessments] = useState<Assessment[]>(MOCK_ASSESSMENTS);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [assessmentSection, setAssessmentSection] = useState<'video' | 'text'>('video');
    const [timeRemaining, setTimeRemaining] = useState(720); // 12 minutes for video section
    const [showProctoringModal, setShowProctoringModal] = useState(false);
    const [modalStep, setModalStep] = useState<'warning' | 'permissions' | 'ready'>('warning');
    const [permissions, setPermissions] = useState({
        camera: false,
        microphone: false,
        fullscreen: false
    });
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
    const [questionTimer, setQuestionTimer] = useState(0);
    const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Disable ESC key when assessment is active
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeAssessmentId && e.key === 'Escape') {
                e.preventDefault();
                setShowExitWarning(true);
            }
        };

        if (activeAssessmentId) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [activeAssessmentId]);

    const handleStartTest = async (id: number) => {
        setActiveAssessmentId(id);
        setShowProctoringModal(true);
        setModalStep('warning');
    };

    const handleCloseModal = () => {
        setShowProctoringModal(false);
        setActiveAssessmentId(null);
        setModalStep('warning');
        setPermissions({ camera: false, microphone: false, fullscreen: false });
    };

    const handleContinueToPermissions = () => {
        setModalStep('permissions');
    };

    const requestPermissions = async () => {
        try {
            // Request camera and microphone
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setPermissions(prev => ({ ...prev, camera: true, microphone: true }));
            stream.getTracks().forEach(track => track.stop()); // Stop preview

            // Request fullscreen
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
                setPermissions(prev => ({ ...prev, fullscreen: true }));
            }

            setModalStep('ready');
        } catch (error) {
            alert('Camera and microphone permissions are required for this assessment.');
        }
    };

    const handleStartAssessment = async () => {
        setShowProctoringModal(false);
        setCurrentQuestion(0);
        setAssessmentSection('video');
        setQuestions(VIDEO_QUESTIONS as Question[]);
        setTimeRemaining(720); // 12 minutes for video section
        
        // Start video stream for video questions
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Camera access is required for video questions');
        }
    };

    const startRecording = () => {
        if (videoStream) {
            recordedChunksRef.current = [];
            setQuestionTimer(0); // Reset timer
            setRecordingStartTime(Date.now());
            
            const mediaRecorder = new MediaRecorder(videoStream, {
                mimeType: 'video/webm;codecs=vp8,opus'
            });
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingStartTime(null);
            // Here you would upload the recorded video to your backend
            // const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            // uploadVideo(blob);
        }
    };

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('video/')) {
                alert('Please upload a valid video file');
                return;
            }
            
            // Validate file size (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                alert('Video file size must be less than 100MB');
                return;
            }
            
            setUploadedVideo(file);
            
            // Simulate upload progress
            setUploadProgress(0);
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
            
            // Here you would upload to YouTube or your backend
            // uploadVideoToYoutube(file);
        }
    };

    const handleNextSection = () => {
        // Stop video stream when moving to text section
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
        }
        if (isRecording) {
            stopRecording();
        }
        
        // Move from video to text section
        setAssessmentSection('text');
        setCurrentQuestion(0);
        setQuestions(MOCK_QUESTIONS);
        setTimeRemaining(480); // 8 minutes for text section
    };

    const handleSubmitTest = async () => {
        // In a real implementation, save results to database
        // For now, just show success message
        setActiveAssessmentId(null);
        alert("Assessment submitted successfully!");
    };

    // Timer effect for overall assessment
    useEffect(() => {
        if (activeAssessmentId && !showProctoringModal && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // Auto-submit when time runs out
                        if (assessmentSection === 'video' && currentQuestion === VIDEO_QUESTIONS.length - 1) {
                            handleNextSection();
                        } else if (assessmentSection === 'text') {
                            handleSubmitTest();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [activeAssessmentId, showProctoringModal, timeRemaining, assessmentSection, currentQuestion]);

    // Question timer - only runs when recording
    useEffect(() => {
        if (isRecording && assessmentSection === 'video') {
            const timer = setInterval(() => {
                setQuestionTimer(prev => {
                    const maxTime = questions[currentQuestion]?.duration || 180;
                    if (prev >= maxTime) {
                        // Auto-stop recording when time limit reached
                        stopRecording();
                        return maxTime;
                    }
                    return prev + 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isRecording, assessmentSection, currentQuestion, questions]);

    const handleForceExit = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        handleCloseModal();
        setShowExitWarning(false);
    };

    const handleViolation = (message: string) => {
        console.log("Proctoring Violation:", message);
        // Log violation to Supabase
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'completed', label: 'Completed' }
    ];

    const filteredAssessments = assessments.filter(a => activeTab === 'all' || a.status === activeTab);

    if (activeAssessmentId && !showProctoringModal) {
        if (questions.length === 0) return <div className="p-8 text-center text-white">Loading questions...</div>;

        return (
            <ProctoringWrapper isActive={true} onViolation={handleViolation}>
                {/* Exit Warning Modal */}
                <AnimatePresence>
                    {showExitWarning && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gradient-to-br from-red-500/20 to-orange-500/10 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full"
                                style={{ boxShadow: '0 20px 60px rgba(239, 68, 68, 0.4)' }}
                            >
                                <div className="text-center">
                                    <AlertTriangle className="mx-auto mb-4 text-red-400" size={64} />
                                    <h2 className="text-2xl font-bold text-white mb-3">Exit Warning</h2>
                                    <p className="text-gray-300 mb-6">Exiting the assessment will terminate your session and your progress will be lost. Are you sure?</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowExitWarning(false)}
                                            className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
                                        >
                                            Continue Assessment
                                        </button>
                                        <button
                                            onClick={handleForceExit}
                                            className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all"
                                        >
                                            Exit Anyway
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{assessmentSection === 'video' ? 'Video Questions' : 'Text Questions'}</h2>
                            <p className="text-[var(--text-secondary)] text-sm">Question {currentQuestion + 1} of {questions.length}</p>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 rounded-xl glass border border-[var(--glass-border)] min-h-[400px] flex flex-col justify-between">
                        <div className="space-y-6">
                            <h3 className="text-lg md:text-xl font-medium leading-relaxed text-[var(--text-primary)]">
                                {questions[currentQuestion].text}
                            </h3>

                            {/* Video Recording Section */}
                            {assessmentSection === 'video' ? (
                                <div className="space-y-4">
                                    {/* Video Preview */}
                                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover mirror"
                                            src={uploadedVideo ? URL.createObjectURL(uploadedVideo) : undefined}
                                        />
                                        {isRecording && (
                                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 px-3 py-1.5 rounded-full animate-pulse">
                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                                <span className="text-white text-sm font-bold">Recording</span>
                                            </div>
                                        )}
                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                            <div className="absolute bottom-4 left-4 right-4 bg-black/60 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Upload size={16} className="text-blue-400" />
                                                    <span className="text-white text-sm font-semibold">Uploading...</span>
                                                    <span className="text-blue-400 text-sm ml-auto">{uploadProgress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        {uploadedVideo && uploadProgress === 100 && (
                                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/90 px-3 py-1.5 rounded-full">
                                                <CheckCircle size={16} className="text-white" />
                                                <span className="text-white text-sm font-bold">Video Uploaded</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recording Controls */}
                                    <div className="flex items-center justify-center gap-3 flex-wrap">
                                        {!uploadedVideo && !isRecording && (
                                            <>
                                                <button
                                                    onClick={startRecording}
                                                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all transform hover:scale-[1.02] flex items-center gap-2"
                                                    style={{ boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)' }}
                                                >
                                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                                    Start Recording
                                                </button>
                                                
                                                <span className="text-gray-500 font-semibold">OR</span>
                                                
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoUpload}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all transform hover:scale-[1.02] flex items-center gap-2"
                                                    style={{ boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)' }}
                                                >
                                                    <Upload size={18} />
                                                    Upload Video
                                                </button>
                                            </>
                                        )}
                                        
                                        {isRecording && (
                                            <button
                                                onClick={stopRecording}
                                                className="px-8 py-3 rounded-xl font-bold text-base bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-[0_0_20px_rgba(107,114,128,0.4)] transition-all transform hover:scale-[1.02] flex items-center gap-2"
                                                style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                                            >
                                                <div className="w-4 h-4 bg-white rounded-sm"></div>
                                                Stop Recording
                                            </button>
                                        )}
                                        
                                        {uploadedVideo && (
                                            <button
                                                onClick={() => {
                                                    setUploadedVideo(null);
                                                    setUploadProgress(0);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all transform hover:scale-[1.02] flex items-center gap-2"
                                            >
                                                <X size={18} />
                                                Remove Video
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-center text-sm text-gray-400">
                                        You have {questions[currentQuestion].duration} seconds to answer this question
                                    </p>

                                    {/* Question Timer Display */}
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
                                        <Timer size={18} className="text-orange-400" />
                                        <span className="text-orange-400 font-mono font-bold">
                                            {Math.floor(questionTimer / 60)}:{(questionTimer % 60).toString().padStart(2, '0')} / {Math.floor((questions[currentQuestion].duration || 180) / 60)}:{((questions[currentQuestion].duration || 180) % 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* Text-based Questions */
                                <div className="space-y-3">
                                    {questions[currentQuestion].options?.map((option: string, idx: number) => (
                                        <label key={idx} className="flex items-center gap-4 p-4 rounded-lg border border-[var(--glass-border)] hover:bg-[var(--glass-border)] cursor-pointer transition-colors group">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-500 group-hover:border-neon-cyan flex items-center justify-center flex-shrink-0">
                                                <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] text-sm md:text-base">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-[var(--glass-border)] mt-6 gap-4">
                            <button
                                onClick={() => {
                                    if (isRecording) stopRecording();
                                    setQuestionTimer(0);
                                    setCurrentQuestion(Math.max(0, currentQuestion - 1));
                                }}
                                disabled={currentQuestion === 0}
                                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white border border-gray-500/50 hover:shadow-[0_0_20px_rgba(107,114,128,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden group"
                                style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                <span className="relative z-10">Previous</span>
                            </button>

                            {currentQuestion < questions.length - 1 ? (
                                <button
                                    onClick={() => {
                                        if (isRecording) stopRecording();
                                        setQuestionTimer(0);
                                        setCurrentQuestion(currentQuestion + 1);
                                    }}
                                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-cyan/90 via-neon-purple/90 to-neon-pink/90 text-white shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:from-neon-cyan hover:via-neon-purple hover:to-neon-pink transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
                                    style={{ boxShadow: '0 6px 20px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)' }}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                    <span className="relative z-10">Next Question</span>
                                </button>
                            ) : assessmentSection === 'video' ? (
                                <button
                                    onClick={handleNextSection}
                                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                                    style={{ boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)' }}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                    <span className="relative z-10">Continue to Text Questions</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitTest}
                                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                                    style={{ boxShadow: '0 6px 20px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)' }}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                    <span className="relative z-10">Submit Assessment</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </ProctoringWrapper>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] pb-12">
            <div className="max-w-7xl mx-auto px-4 pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-3 text-white bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">Assessments</h1>
                    <p className="text-gray-400 text-lg">Complete these assessments to verify your skills and increase your hiring chances.</p>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 p-2 rounded-2xl glass border border-white/10 overflow-x-auto backdrop-blur-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                    <div className="flex gap-2 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`btn-3d px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'btn-primary shadow-lg'
                                        : 'btn-ghost hover:bg-white/5'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Assessment Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssessments.map((assessment, index) => (
                    <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-neon-cyan/40 transition-all duration-300 overflow-hidden group"
                        style={{
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(6, 182, 212, 0.1)'
                        }}
                    >
                        <div className="p-6">
                            {/* Header with Icon and Title */}
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className={`p-3 rounded-xl flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${
                                        assessment.status === 'completed'
                                            ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 text-green-400'
                                            : 'bg-gradient-to-br from-neon-purple/20 to-neon-pink/10 text-neon-purple'
                                    }`}
                                        style={{ boxShadow: assessment.status === 'completed' ? '0 4px 20px rgba(34, 197, 94, 0.2)' : '0 4px 20px rgba(168, 85, 247, 0.2)' }}
                                    >
                                        {assessment.status === 'completed' ? <CheckCircle size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold mb-2 text-white leading-tight">{assessment.title}</h3>
                                        <span className="inline-block text-xs font-semibold text-neon-cyan bg-neon-cyan/10 px-3 py-1.5 rounded-full border border-neon-cyan/30">
                                            {assessment.type}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Duration and Questions - Right Side */}
                                <div className="flex flex-col items-end gap-2 text-right">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
                                        <Clock size={14} className="text-neon-cyan" />
                                        <span className="text-sm font-semibold text-gray-300">{assessment.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-purple/5 border border-neon-purple/20">
                                        <AlertCircle size={14} className="text-neon-purple" />
                                        <span className="text-sm font-semibold text-gray-300">{assessment.questions} Q</span>
                                    </div>
                                </div>
                            </div>

                            {/* Difficulty Badge */}
                            <div className="mb-6">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border-2 ${
                                    assessment.difficulty === 'Hard' ? 'border-red-500/60 text-red-400 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                                    assessment.difficulty === 'Medium' ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
                                    'border-green-500/60 text-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                }`}>
                                    {assessment.difficulty}
                                </span>
                            </div>

                            {/* Footer */}
                            {assessment.status === 'completed' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-green-500/15 to-green-600/5 border border-green-500/40"
                                        style={{ boxShadow: '0 4px 20px rgba(34, 197, 94, 0.15)' }}
                                    >
                                        <span className="text-sm font-bold text-green-400">Your Score</span>
                                        <span className="text-4xl font-black text-green-400">{assessment.score}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar size={16} className="text-green-400" />
                                        <span>Completed on <span className="font-semibold text-gray-300">{assessment.date}</span></span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Due Date - Highlighted */}
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/30"
                                        style={{ boxShadow: '0 4px 15px rgba(249, 115, 22, 0.15)' }}
                                    >
                                        <Calendar size={18} className="text-orange-400" />
                                        <div>
                                            <span className="text-xs text-gray-400 block mb-0.5">Due Date</span>
                                            <span className="text-sm font-bold text-orange-400">{assessment.dueDate}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Start Test Button - Reduced Size */}
                                    <button
                                        onClick={() => handleStartTest(assessment.id)}
                                        className="w-full px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-cyan/90 via-neon-purple/90 to-neon-pink/90 text-white shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:from-neon-cyan hover:via-neon-purple hover:to-neon-pink transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
                                        style={{
                                            boxShadow: '0 6px 20px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                                        }}
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                        <Play size={16} className="relative z-10" />
                                        <span className="relative z-10">Start Assessment</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
                </div>

                {/* Empty State */}
                {filteredAssessments.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <FileText size={64} className="mx-auto mb-4 text-gray-600 opacity-50" />
                        <p className="text-gray-400 text-lg">No {activeTab} assessments found.</p>
                    </motion.div>
                )}

                {/* Proctoring Modal */}
                <AnimatePresence>
                    {showProctoringModal && (
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9998] flex items-center justify-center p-6 overflow-y-auto">
                            <motion.div
                                ref={modalRef}
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full max-w-xl bg-gradient-to-br from-[#1a1f3a]/95 to-[#0a0e27]/95 backdrop-blur-xl border-2 border-neon-cyan/30 rounded-3xl overflow-hidden shadow-2xl my-auto"
                                style={{ 
                                    boxShadow: '0 30px 80px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                    maxHeight: '90vh'
                                }}
                            >
                                {/* Warning Step */}
                                {modalStep === 'warning' && (
                                    <div className="flex flex-col p-8">
                                        <div className="flex flex-col items-center justify-start text-center">
                                            <div className="mb-4 p-5 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/10 border-2 border-orange-500/40"
                                                style={{ boxShadow: '0 10px 40px rgba(249, 115, 22, 0.3)' }}
                                            >
                                                <AlertTriangle size={56} className="text-orange-400" />
                                            </div>
                                            <h2 className="text-2xl font-black text-white mb-3 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                                                Proctored Assessment
                                            </h2>
                                            <p className="text-gray-300 text-base mb-5 max-w-md leading-relaxed">
                                                This assessment is fully proctored. Your activity will be monitored and recorded to ensure integrity.
                                            </p>

                                            {/* Proctoring Features */}
                                            <div className="grid grid-cols-2 gap-3 mb-5 w-full max-w-sm">
                                                <div className="p-3.5 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
                                                    <Video size={24} className="text-neon-cyan mx-auto mb-1.5" />
                                                    <p className="text-xs text-gray-300 font-semibold">Camera Monitoring</p>
                                                </div>
                                                <div className="p-3.5 rounded-xl bg-neon-purple/5 border border-neon-purple/20">
                                                    <Mic size={24} className="text-neon-purple mx-auto mb-1.5" />
                                                    <p className="text-xs text-gray-300 font-semibold">Audio Recording</p>
                                                </div>
                                                <div className="p-3.5 rounded-xl bg-neon-pink/5 border border-neon-pink/20">
                                                    <Eye size={24} className="text-neon-pink mx-auto mb-1.5" />
                                                    <p className="text-xs text-gray-300 font-semibold">Eye Tracking</p>
                                                </div>
                                                <div className="p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                                    <Monitor size={24} className="text-yellow-400 mx-auto mb-1.5" />
                                                    <p className="text-xs text-gray-300 font-semibold">Screen Lock</p>
                                                </div>
                                            </div>

                                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-5 w-full">
                                                <p className="text-xs text-gray-300"><span className="font-bold text-orange-400">Note:</span> ESC key will be disabled. Tab switching will trigger warnings.</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleCloseModal}
                                                className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white border border-gray-500/50 hover:shadow-[0_0_20px_rgba(107,114,128,0.4)] transition-all transform hover:scale-[1.02]"
                                                style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleContinueToPermissions}
                                                className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink text-white hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                                style={{ boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)' }}
                                            >
                                                Continue
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Permissions Step */}
                                {modalStep === 'permissions' && (
                                    <div className="flex flex-col p-8">
                                        <div className="flex flex-col items-center justify-start text-center">
                                            <h2 className="text-2xl font-black text-white mb-4">Grant Permissions</h2>
                                            <p className="text-gray-300 text-sm mb-6">We need access to your camera and microphone to proceed.</p>

                                            <div className="space-y-3 w-full max-w-md mb-6">
                                                <div className={`p-3.5 rounded-xl border-2 transition-all ${permissions.camera ? 'bg-green-500/10 border-green-500/40' : 'bg-gray-500/5 border-gray-500/20'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Video size={22} className={permissions.camera ? 'text-green-400' : 'text-gray-400'} />
                                                            <span className="font-semibold text-white text-sm">Camera Access</span>
                                                        </div>
                                                        {permissions.camera && <CheckCircle size={22} className="text-green-400" />}
                                                    </div>
                                                </div>
                                                <div className={`p-3.5 rounded-xl border-2 transition-all ${permissions.microphone ? 'bg-green-500/10 border-green-500/40' : 'bg-gray-500/5 border-gray-500/20'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Mic size={22} className={permissions.microphone ? 'text-green-400' : 'text-gray-400'} />
                                                            <span className="font-semibold text-white text-sm">Microphone Access</span>
                                                        </div>
                                                        {permissions.microphone && <CheckCircle size={22} className="text-green-400" />}
                                                    </div>
                                                </div>
                                                <div className={`p-3.5 rounded-xl border-2 transition-all ${permissions.fullscreen ? 'bg-green-500/10 border-green-500/40' : 'bg-gray-500/5 border-gray-500/20'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Monitor size={22} className={permissions.fullscreen ? 'text-green-400' : 'text-gray-400'} />
                                                            <span className="font-semibold text-white text-sm">Fullscreen Mode</span>
                                                        </div>
                                                        {permissions.fullscreen && <CheckCircle size={22} className="text-green-400" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setModalStep('warning')}
                                                className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white border border-gray-500/50 hover:shadow-[0_0_20px_rgba(107,114,128,0.4)] transition-all"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={requestPermissions}
                                                className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-all flex items-center justify-center gap-2"
                                            >
                                                Grant Access
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Ready Step */}
                                {modalStep === 'ready' && (
                                    <div className="flex flex-col p-8">
                                        <div className="flex flex-col items-center justify-start text-center">
                                            <div className="mb-4 p-5 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40"
                                                style={{ boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)' }}
                                            >
                                                <CheckCircle size={56} className="text-green-400" />
                                            </div>
                                            <h2 className="text-2xl font-black text-white mb-3">All Set!</h2>
                                            <p className="text-gray-300 text-base mb-5">You're ready to begin your assessment.</p>

                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 mb-6 w-full">
                                                <h3 className="font-bold text-white mb-3 text-base">Assessment Structure:</h3>
                                                <div className="space-y-3 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center flex-shrink-0">
                                                            <span className="font-bold text-neon-cyan text-sm">1</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white text-sm">Live Video Section</p>
                                                            <p className="text-xs text-gray-400">12 minutes • 4 questions</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center flex-shrink-0">
                                                            <span className="font-bold text-neon-purple text-sm">2</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white text-sm">Text-Based Section</p>
                                                            <p className="text-xs text-gray-400">8 minutes • 10-12 questions</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleStartAssessment}
                                            className="w-full px-6 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink text-white hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                            style={{ boxShadow: '0 8px 30px rgba(6, 182, 212, 0.5)' }}
                                        >
                                            <Play size={20} />
                                            Start Assessment Now
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Assessments;
