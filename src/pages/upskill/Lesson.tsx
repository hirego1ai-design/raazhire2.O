import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Play,
    Pause,
    Volume2,
    Maximize,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Clock,
    FileText,
    MessageSquare,
    Download,
    Share2,
    BookmarkPlus,
    ThumbsUp,
    Award,
    Target
} from 'lucide-react';

// ============================================
// QUIZ CARD
// ============================================
const QuizCard: React.FC = () => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const question = "What is the primary purpose of pandas in data science?";
    const options = [
        "Web development",
        "Data manipulation and analysis",
        "Game development",
        "Mobile app development"
    ];
    const correctAnswer = 1;

    const handleSubmit = () => {
        setShowResult(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-card-xl p-8 shadow-premium"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-indigo rounded-card flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Quick Quiz</h3>
            </div>

            <p className="text-lg font-semibold text-gray-900 mb-6">{question}</p>

            <div className="space-y-3 mb-6">
                {options.map((option, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !showResult && setSelectedAnswer(index)}
                        className={`
                            w-full p-4 rounded-card-lg text-left transition-all border-2
                            ${selectedAnswer === index
                                ? showResult
                                    ? index === correctAnswer
                                        ? 'bg-soft-emerald-50 border-soft-emerald-500 text-soft-emerald-900'
                                        : 'bg-red-50 border-red-500 text-red-900'
                                    : 'bg-electric-indigo-50 border-electric-indigo-500 text-electric-indigo-900'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                            }
                        `}
                        disabled={showResult}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{option}</span>
                            {showResult && index === correctAnswer && (
                                <CheckCircle className="w-5 h-5 text-soft-emerald-600" />
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>

            {!showResult ? (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="w-full py-4 bg-gradient-indigo text-white rounded-pill font-bold shadow-glow-indigo disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit Answer
                </motion.button>
            ) : (
                <div className={`
                    p-4 rounded-card-lg
                    ${selectedAnswer === correctAnswer
                        ? 'bg-soft-emerald-50 border-2 border-soft-emerald-200'
                        : 'bg-red-50 border-2 border-red-200'
                    }
                `}>
                    <p className={`font-semibold ${selectedAnswer === correctAnswer ? 'text-soft-emerald-900' : 'text-red-900'}`}>
                        {selectedAnswer === correctAnswer ? '✨ Correct! Well done!' : '❌ Incorrect. The correct answer is: ' + options[correctAnswer]}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const Lesson: React.FC = () => {
    const navigate = useNavigate();
    const { courseId, lessonId } = useParams();
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState<'notes' | 'quiz'>('notes');

    const lessons = [
        { id: 1, title: 'Introduction to Data Science', duration: '12:45', completed: true },
        { id: 2, title: 'Setting Up Your Environment', duration: '18:30', completed: true },
        { id: 3, title: 'Understanding Data Types', duration: '15:20', completed: false },
        { id: 4, title: 'Working with DataFrames', duration: '22:10', completed: false },
        { id: 5, title: 'Data Cleaning Basics', duration: '19:45', completed: false }
    ];

    const currentLessonIndex = lessons.findIndex(l => l.id.toString() === lessonId);
    const currentLesson = lessons[currentLessonIndex];

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            {/* Top Navigation Bar */}
            <div className="bg-white shadow-soft sticky top-0 z-50 px-4 py-4">
                <div className="container mx-auto max-w-7xl flex items-center justify-between">
                    <button
                        onClick={() => navigate(`/upskill/course/${courseId}`)}
                        className="flex items-center gap-2 text-gray-700 hover:text-electric-indigo-600 transition-colors font-semibold"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Course
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 hidden md:block">
                        Data Science Fundamentals
                    </h2>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 bg-cloud-grey rounded-pill hover:bg-deep-grey transition-colors"
                        >
                            <BookmarkPlus className="w-5 h-5 text-gray-700" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 bg-cloud-grey rounded-pill hover:bg-deep-grey transition-colors"
                        >
                            <Share2 className="w-5 h-5 text-gray-700" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Video & Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-gray-900 rounded-video overflow-hidden shadow-premium-lg aspect-video group"
                        >
                            {/* Video Content */}
                            <div className="absolute inset-0 bg-gradient-to-br from-electric-indigo-500/30 to-ai-cyan-500/30" />

                            {/* Play/Pause Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-pill flex items-center justify-center group-hover:bg-white/30 transition-all shadow-glow-cyan"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-10 h-10 text-white" fill="white" />
                                    ) : (
                                        <Play className="w-10 h-10 text-white ml-1" fill="white" />
                                    )}
                                </motion.button>
                            </div>

                            {/* Video Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-4">
                                    <button className="text-white hover:text-electric-indigo-400 transition-colors">
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                    </button>
                                    <div className="flex-1 h-1 bg-white/20 rounded-pill overflow-hidden">
                                        <div className="h-full w-1/3 bg-electric-indigo-500 rounded-pill" />
                                    </div>
                                    <span className="text-white text-sm font-medium">04:15 / 12:45</span>
                                    <button className="text-white hover:text-electric-indigo-400 transition-colors">
                                        <Volume2 className="w-6 h-6" />
                                    </button>
                                    <button className="text-white hover:text-electric-indigo-400 transition-colors">
                                        <Maximize className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Lesson Title & Info */}
                        <div className="bg-white rounded-card-xl p-6 shadow-soft">
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                                {currentLesson?.title}
                            </h1>
                            <div className="flex items-center gap-6 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{currentLesson?.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ThumbsUp className="w-5 h-5" />
                                    <span>98% found helpful</span>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="bg-white rounded-card-xl shadow-soft overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`
                                        flex-1 px-6 py-4 font-semibold transition-all
                                        ${activeTab === 'notes'
                                            ? 'bg-electric-indigo-50 text-electric-indigo-600 border-b-4 border-electric-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        <span>Notes</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('quiz')}
                                    className={`
                                        flex-1 px-6 py-4 font-semibold transition-all
                                        ${activeTab === 'quiz'
                                            ? 'bg-electric-indigo-50 text-electric-indigo-600 border-b-4 border-electric-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        <span>Quiz</span>
                                    </div>
                                </button>
                            </div>

                            <div className="p-8">
                                {activeTab === 'notes' ? (
                                    <div className="prose max-w-none">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Lesson Notes</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            In this lesson, we cover the fundamental concepts of data science and how it applies to real-world problems.
                                            You'll learn about the data science workflow, key terminology, and the tools used by professionals.
                                        </p>
                                        <h4 className="text-xl font-bold text-gray-900 mb-3">Key Takeaways:</h4>
                                        <ul className="space-y-2 text-gray-700">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span>Data science combines statistics, programming, and domain expertise</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span>The workflow includes: collection, cleaning, analysis, and visualization</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span>Python and R are the most popular programming languages for data science</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-soft-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span>Understanding business context is crucial for effective analysis</span>
                                            </li>
                                        </ul>

                                        <div className="mt-6 p-6 bg-ai-cyan-50 rounded-card-lg border-2 border-ai-cyan-200">
                                            <h4 className="text-lg font-bold text-ai-cyan-900 mb-2">📚 Resources</h4>
                                            <div className="space-y-2">
                                                <a href="#" className="flex items-center gap-2 text-ai-cyan-700 hover:text-ai-cyan-900">
                                                    <Download className="w-4 h-4" />
                                                    <span className="underline">Download Lesson Slides (PDF)</span>
                                                </a>
                                                <a href="#" className="flex items-center gap-2 text-ai-cyan-700 hover:text-ai-cyan-900">
                                                    <Download className="w-4 h-4" />
                                                    <span className="underline">Practice Dataset (CSV)</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <QuizCard />
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={currentLessonIndex === 0}
                                onClick={() => navigate(`/upskill/course/${courseId}/lesson/${lessons[currentLessonIndex - 1].id}`)}
                                className="flex-1 py-4 bg-white border-2 border-gray-200 rounded-pill font-bold text-gray-700 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Previous Lesson
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={currentLessonIndex === lessons.length - 1}
                                onClick={() => navigate(`/upskill/course/${courseId}/lesson/${lessons[currentLessonIndex + 1].id}`)}
                                className="flex-1 py-4 bg-gradient-indigo text-white rounded-pill font-bold shadow-glow-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Next Lesson
                                <ChevronRight className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Sidebar: Lesson List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-card-xl p-6 shadow-soft sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Course Lessons</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {lessons.map((lesson, index) => (
                                    <motion.button
                                        key={lesson.id}
                                        whileHover={{ x: 4 }}
                                        onClick={() => navigate(`/upskill/course/${courseId}/lesson/${lesson.id}`)}
                                        className={`
                                            w-full p-4 rounded-card-lg text-left transition-all
                                            ${lesson.id.toString() === lessonId
                                                ? 'bg-electric-indigo-50 border-2 border-electric-indigo-500'
                                                : lesson.completed
                                                    ? 'bg-soft-emerald-50 border-2 border-soft-emerald-200'
                                                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`
                                                w-8 h-8 rounded-card flex items-center justify-center flex-shrink-0 font-bold text-sm
                                                ${lesson.id.toString() === lessonId
                                                    ? 'bg-electric-indigo-500 text-white'
                                                    : lesson.completed
                                                        ? 'bg-soft-emerald-500 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                }
                                            `}>
                                                {lesson.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-1">{lesson.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{lesson.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-gradient-to-br from-electric-indigo-50 to-ai-cyan-50 rounded-card-lg border-2 border-electric-indigo-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-electric-indigo-600" />
                                    <span className="font-bold text-gray-900">Progress</span>
                                </div>
                                <div className="w-full bg-white rounded-pill h-2 overflow-hidden mb-2">
                                    <div className="h-full w-2/5 bg-gradient-indigo rounded-pill" />
                                </div>
                                <p className="text-sm text-gray-600">2 of 5 lessons completed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lesson;
