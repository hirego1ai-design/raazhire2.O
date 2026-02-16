import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Clock, AlertCircle, Play, Timer, CheckCircle, Calendar,
    Video, Mic, Eye, Monitor, X, AlertTriangle, ChevronRight, Upload,
    ChevronLeft, ShieldCheck, Trophy, Target, Zap, Brain
} from 'lucide-react';
import ProctoringWrapper from '../../components/ProctoringWrapper';
import { API_BASE_URL } from '../../lib/api';

const Assessments: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [activeAssessmentId, setActiveAssessmentId] = useState<number | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [assessmentSection, setAssessmentSection] = useState<'video' | 'text'>('text'); // Default to text if type unknown
    const [timeRemaining, setTimeRemaining] = useState(720);
    const [showProctoringModal, setShowProctoringModal] = useState(false);
    const [modalStep, setModalStep] = useState<'warning' | 'permissions' | 'ready'>('warning');
    const [permissions, setPermissions] = useState({ camera: false, microphone: false, fullscreen: false });
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [questionTimer, setQuestionTimer] = useState(0);

    const [assessments, setAssessments] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]); // Using any for blob temporarily to avoid lib issues

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('sb-token');
            const res = await fetch(`${API_BASE_URL}/api/upskill/assessments`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setAssessments(data.assessments || []);
            }
        } catch (error) {
            console.error('Error fetching assessments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssessmentDetails = async (id: number) => {
        try {
            const token = localStorage.getItem('sb-token');
            // Using the route we saw in upskill_routes: /api/upskill/assessment/:id
            // Note: The route param is called :courseId but the code falls back to checking by ID too.
            const res = await fetch(`${API_BASE_URL}/api/upskill/assessment/${id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                if (data.assessment && data.assessment.questions) {
                    setQuestions(data.assessment.questions);
                    // Determine type based on q stucture or defaults
                    setAssessmentSection(data.assessment.type === 'video' ? 'video' : 'text');
                }
            }
        } catch (error) {
            console.error('Error fetching assessment questions:', error);
        }
    }

    const requestPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setPermissions({ camera: true, microphone: true, fullscreen: false });
            stream.getTracks().forEach(track => track.stop());
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
                setPermissions(p => ({ ...p, fullscreen: true }));
            }
            setModalStep('ready');
        } catch (error) {
            alert('Hardware access is required for proctored assessments.');
        }
    };

    const handleStartAssessment = async () => {
        if (activeAssessmentId) {
            await fetchAssessmentDetails(activeAssessmentId);
        }
        setShowProctoringModal(false);
        setCurrentQuestion(0);
        setTimeRemaining(720); // Should come from assessment.duration_minutes * 60
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoStream(stream);
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const startRecording = () => {
        if (!videoStream) return;
        recordedChunksRef.current = [];
        setQuestionTimer(0);
        // @ts-ignore
        const media = new MediaRecorder(videoStream);
        media.ondataavailable = (e) => (e.data.size > 0 && recordedChunksRef.current.push(e.data));
        media.start();
        mediaRecorderRef.current = media;
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const filteredAssessments = assessments.filter(a => activeTab === 'all' || (a.status || 'pending') === activeTab);

    if (activeAssessmentId && !showProctoringModal && questions.length > 0) {
        return (
            <ProctoringWrapper isActive={true} onViolation={() => { }}>
                <div className="max-w-5xl mx-auto p-4 lg:p-8">
                    {/* Test HUD */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-1 block">Live Assessment</span>
                            <h2 className="text-2xl font-black text-[var(--text-main)] italic">
                                {assessmentSection === 'video' ? 'Video Pitch Phase' : 'Technical Validation'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="saas-card px-4 py-2 flex items-center gap-2 border-[var(--primary)] bg-[var(--primary-light)]">
                                <Timer size={18} className="text-[var(--primary)]" />
                                <span className="font-mono font-bold text-[var(--primary)]">
                                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="saas-card overflow-hidden">
                                <div className="p-6 bg-[var(--bg-page)] border-b border-[var(--border-subtle)]">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="pph-badge">Question {currentQuestion + 1} of {questions.length}</span>
                                        {assessmentSection === 'video' && (
                                            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
                                                <Clock size={12} /> Limit: 3m
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-main)]">
                                        {questions[currentQuestion].text || questions[currentQuestion].question_text}
                                    </h3>
                                </div>

                                <div className="p-6">
                                    {assessmentSection === 'video' ? (
                                        <div className="space-y-6">
                                            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl">
                                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[40%]" />
                                                {isRecording && (
                                                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full animate-pulse shadow-lg">
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                        <span className="text-[10px] text-white font-black uppercase tracking-widest">Recording</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-center gap-4">
                                                {!isRecording ? (
                                                    <button onClick={startRecording} className="btn-saas-primary px-10 bg-red-600 border-red-500 hover:bg-red-700">
                                                        Start Recording
                                                    </button>
                                                ) : (
                                                    <button onClick={stopRecording} className="btn-saas-primary px-10 bg-gray-800 border-gray-700">
                                                        Stop & Save
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {(questions[currentQuestion].options || []).map((opt: string, i: number) => (
                                                <button key={i} className="w-full text-left p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-6 h-6 rounded-full border-2 border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--primary)] bg-white text-[10px] font-bold">
                                                            {String.fromCharCode(65 + i)}
                                                        </div>
                                                        <span className="text-sm font-medium text-[var(--text-main)]">{opt}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-[var(--bg-page)] border-t border-[var(--border-subtle)] flex justify-between items-center">
                                    <button
                                        onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
                                        disabled={currentQuestion === 0}
                                        className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30"
                                    >
                                        <ChevronLeft size={20} /> Previous
                                    </button>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setCurrentQuestion(q => Math.min(questions.length - 1, q + 1))}
                                            className="btn-saas-primary px-8"
                                            disabled={currentQuestion === questions.length - 1 && assessmentSection === 'text'}
                                        >
                                            {currentQuestion === questions.length - 1 ? 'Finish Assessment' : 'Next Question'} <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="saas-card p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 shadow-xl">
                                <Brain className="mb-4 opacity-50" size={32} />
                                <h4 className="font-bold mb-2">AI Proctoring Active</h4>
                                <p className="text-xs text-white/80 leading-relaxed mb-4">
                                    Session ID: {activeAssessmentId}-{Date.now().toString().slice(-4)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ProctoringWrapper>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Skill Assessments</h1>
                    <p className="text-[var(--text-muted)] font-medium">Verify your expertise and unlock higher-paying roles with AI agents.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredAssessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssessments.map((a) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="saas-card group overflow-hidden"
                        >
                            <div className={`h-2 w-full ${a.status === 'completed' ? 'bg-green-500' : 'bg-[var(--primary)] opacity-30'}`} />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-2xl bg-[var(--bg-page)] text-[var(--primary)] group-hover:scale-110 transition-transform">
                                        <Zap size={24} />
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500`}>
                                        {a.difficulty || 'Standard'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold mb-1">{a.title}</h3>
                                <p className="text-xs text-[var(--text-muted)] mb-6 flex items-center gap-2">
                                    <Zap size={12} className="text-[var(--primary)]" /> {a.type || 'Assessment'} • {a.questions?.length || '?'} Qs
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-[var(--text-muted)] leading-none mb-1">Duration</span>
                                        <span className="text-xs font-bold">{a.duration || '30 mins'}</span>
                                    </div>
                                    <button
                                        onClick={() => { setActiveAssessmentId(a.id); setShowProctoringModal(true); }}
                                        className="btn-saas-primary text-xs px-4"
                                    >
                                        Start Assessment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="saas-card p-20 text-center">
                    <Zap size={40} className="mx-auto text-[var(--text-muted)] opacity-20 mb-4" />
                    <h4 className="font-bold text-[var(--text-main)]">No Assessments Available</h4>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Check back later for new skill verification tests.</p>
                </div>
            )}

            <AnimatePresence>
                {showProctoringModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProctoringModal(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[var(--bg-surface)] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-[var(--border-subtle)]"
                        >
                            <div className="p-8 text-center">
                                {modalStep === 'warning' && (
                                    <div className="space-y-6">
                                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                                            <AlertTriangle size={40} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-[var(--text-main)] italic">Secure Assessment Mode</h2>
                                            <p className="text-sm text-[var(--text-muted)] mt-2 pr-4 pl-4">
                                                By proceeding, you agree to enable AI Proctoring. This includes camera access, full-screen lock, and tab Monitoring.
                                            </p>
                                        </div>
                                        <button onClick={requestPermissions} className="btn-saas-primary w-full py-4 uppercase tracking-widest text-xs font-black">
                                            Initialize Secure Environment
                                        </button>
                                    </div>
                                )}
                                {modalStep === 'ready' && (
                                    <div className="space-y-6 py-8">
                                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 relative">
                                            <ShieldCheck size={48} />
                                            <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-[var(--text-main)] italic">Environment Verified</h2>
                                            <p className="text-sm text-[var(--text-muted)] mt-2">All hardware tests passed. System is now locked.</p>
                                        </div>
                                        <button onClick={handleStartAssessment} className="btn-saas-primary w-full py-4 text-sm font-black uppercase tracking-widest">
                                            Grant Access & Begin
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Assessments;
