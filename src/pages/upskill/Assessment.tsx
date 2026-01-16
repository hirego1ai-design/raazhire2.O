import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Camera,
    Mic,
    Wifi,
    CheckCircle,
    AlertTriangle,
    Clock,
    Brain,
    Target,
    ChevronRight,
    Monitor,
    Activity,
    Shield,
    Eye
} from 'lucide-react';

// ============================================
// SYSTEM CHECK ITEM
// ============================================
interface SystemCheckItemProps {
    icon: React.ElementType;
    label: string;
    status: 'ready' | 'checking' | 'error';
}

const SystemCheckItem: React.FC<SystemCheckItemProps> = ({ icon: Icon, label, status }) => {
    const statusColors = {
        ready: 'bg-soft-emerald-50 text-soft-emerald-600 border-soft-emerald-200',
        checking: 'bg-ai-cyan-50 text-ai-cyan-600 border-ai-cyan-200 animate-pulse',
        error: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
        <div className={`p-4 rounded-card-lg border-2 ${statusColors[status]} transition-all`}>
            <div className="flex items-center gap-3">
                <Icon className="w-6 h-6" />
                <span className="font-semibold flex-1">{label}</span>
                {status === 'ready' && <CheckCircle className="w-5 h-5" />}
                {status === 'checking' && <Activity className="w-5 h-5 animate-spin" />}
                {status === 'error' && <AlertTriangle className="w-5 h-5" />}
            </div>
        </div>
    );
};

// ============================================
// QUESTION CARD
// ============================================
interface QuestionCardProps {
    questionNumber: number;
    totalQuestions: number;
    question: string;
    options: string[];
    onAnswer: (answer: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    questionNumber,
    totalQuestions,
    question,
    options,
    onAnswer
}) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    const handleSubmit = () => {
        if (selectedAnswer !== null) {
            onAnswer(selectedAnswer);
            setSelectedAnswer(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-card-xl p-8 shadow-premium"
        >
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-2 bg-electric-indigo-50 text-electric-indigo-600 rounded-pill text-sm font-semibold">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">02:30</span>
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{question}</h3>
            </div>

            <div className="space-y-3 mb-8">
                {options.map((option, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedAnswer(index)}
                        className={`
                            w-full p-5 rounded-card-lg text-left transition-all border-2 font-medium
                            ${selectedAnswer === index
                                ? 'bg-electric-indigo-50 border-electric-indigo-500 text-electric-indigo-900'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                                w-6 h-6 rounded-pill border-2 flex items-center justify-center
                                ${selectedAnswer === index ? 'border-electric-indigo-500' : 'border-gray-300'}
                            `}>
                                {selectedAnswer === index && (
                                    <div className="w-3 h-3 rounded-pill bg-electric-indigo-500" />
                                )}
                            </div>
                            <span>{option}</span>
                        </div>
                    </motion.button>
                ))}
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="w-full py-4 bg-gradient-indigo text-white rounded-pill font-bold text-lg shadow-glow-indigo disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
                Submit Answer
                <ChevronRight className="w-5 h-5" />
            </motion.button>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const Assessment: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [stage, setStage] = useState<'setup' | 'assessment' | 'complete'>('setup');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes

    const [systemChecks, setSystemChecks] = useState({
        camera: 'checking' as 'ready' | 'checking' | 'error',
        microphone: 'checking' as 'ready' | 'checking' | 'error',
        internet: 'checking' as 'ready' | 'checking' | 'error'
    });

    useEffect(() => {
        // Simulate system checks
        setTimeout(() => {
            setSystemChecks({
                camera: 'ready',
                microphone: 'ready',
                internet: 'ready'
            });
        }, 2000);
    }, []);

    useEffect(() => {
        if (stage === 'assessment') {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [stage]);

    const questions = [
        {
            question: "What is the primary purpose of data normalization?",
            options: [
                "To make data look prettier",
                "To reduce redundancy and improve data integrity",
                "To increase database size",
                "To slow down queries"
            ]
        },
        {
            question: "Which Python library is best for data manipulation?",
            options: [
                "Pandas",
                "Django",
                "Flask",
                "Pygame"
            ]
        },
        {
            question: "What does 'overfitting' mean in machine learning?",
            options: [
                "Model performs well on training data but poorly on new data",
                "Model is too simple",
                "Model trains too quickly",
                "Model uses too little data"
            ]
        }
    ];

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (answer: number) => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setStage('complete');
            navigate(`/upskill/dashboard`);
        }
    };

    const startAssessment = () => {
        const allReady = Object.values(systemChecks).every(status => status === 'ready');
        if (allReady) {
            setStage('assessment');
        }
    };

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            {stage === 'setup' ? (
                // Setup Stage
                <div className="container mx-auto px-4 py-16 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="w-20 h-20 mx-auto bg-gradient-indigo rounded-card-xl flex items-center justify-center mb-6 shadow-glow-indigo">
                            <Brain className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                            AI Skill Assessment
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            A comprehensive evaluation of your data science knowledge powered by AI
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {/* System Check */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-card-xl p-8 shadow-premium"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Monitor className="w-8 h-8 text-electric-indigo-600" />
                                <h2 className="text-2xl font-bold text-gray-900">System Check</h2>
                            </div>
                            <div className="space-y-3">
                                <SystemCheckItem
                                    icon={Camera}
                                    label="Camera Access"
                                    status={systemChecks.camera}
                                />
                                <SystemCheckItem
                                    icon={Mic}
                                    label="Microphone Access"
                                    status={systemChecks.microphone}
                                />
                                <SystemCheckItem
                                    icon={Wifi}
                                    label="Internet Connection"
                                    status={systemChecks.internet}
                                />
                            </div>
                        </motion.div>

                        {/* Instructions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-card-xl p-8 shadow-premium"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-8 h-8 text-ai-cyan-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Instructions</h2>
                            </div>
                            <ul className="space-y-4 text-gray-700">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-1" />
                                    <span>Assessment duration: <strong>30 minutes</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-1" />
                                    <span>Total questions: <strong>{questions.length}</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-1" />
                                    <span>Ensure you're in a <strong>quiet environment</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-1" />
                                    <span>Camera will monitor for <strong>integrity</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-1" />
                                    <span>AI will analyze your <strong>confidence level</strong></span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Webcam Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-section p-8 shadow-premium mb-8"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Camera Preview</h3>
                        <div className="max-w-3xl mx-auto">
                            <div className="relative aspect-video bg-gray-900 rounded-video overflow-hidden shadow-premium-lg">
                                <div className="absolute inset-0 bg-gradient-to-br from-electric-indigo-500/20 to-ai-cyan-500/20" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                    <Camera className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-lg font-semibold opacity-75">Camera feed will appear here</p>
                                </div>
                                {/* Proctoring Indicators */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <div className="px-4 py-2 bg-soft-emerald-500/90 backdrop-blur-sm rounded-pill text-white text-sm font-semibold flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-pill animate-pulse" />
                                        Recording
                                    </div>
                                    <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-pill text-white text-sm font-semibold flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        AI Monitoring
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Start Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={startAssessment}
                            disabled={Object.values(systemChecks).some(status => status !== 'ready')}
                            className="px-16 py-5 bg-gradient-indigo text-white rounded-pill font-bold text-xl shadow-glow-indigo disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 mx-auto"
                        >
                            <Target className="w-6 h-6" />
                            Start Assessment
                        </motion.button>
                        <p className="text-sm text-gray-500 mt-4">
                            By starting, you agree to our assessment terms and proctoring policies
                        </p>
                    </motion.div>
                </div>
            ) : stage === 'assessment' ? (
                // Assessment Stage
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    {/* Header with Timer */}
                    <div className="bg-white rounded-card-xl p-6 shadow-soft mb-8 sticky top-4 z-40">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Data Science Assessment</h2>
                                <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 px-6 py-3 bg-electric-indigo-50 rounded-pill">
                                    <Clock className="w-5 h-5 text-electric-indigo-600" />
                                    <span className="text-2xl font-bold text-electric-indigo-600">
                                        {formatTime(timeRemaining)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-soft-emerald-500 rounded-pill animate-pulse" />
                                    <span>AI Monitoring</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 w-full bg-gray-100 rounded-pill h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                className="h-full bg-gradient-indigo rounded-pill transition-all duration-500"
                            />
                        </div>
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <QuestionCard
                            key={currentQuestion}
                            questionNumber={currentQuestion + 1}
                            totalQuestions={questions.length}
                            question={questions[currentQuestion].question}
                            options={questions[currentQuestion].options}
                            onAnswer={handleAnswer}
                        />
                    </AnimatePresence>
                </div>
            ) : null}
        </div>
    );
};

export default Assessment;
