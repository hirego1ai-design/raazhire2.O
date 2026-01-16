import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Play,
    Clock,
    Users,
    Award,
    Star,
    CheckCircle,
    ChevronRight,
    Download,
    Share2,
    Bookmark,
    Target,
    Brain,
    BarChart3,
    Trophy
} from 'lucide-react';

// ============================================
// MODULE CARD
// ============================================
interface ModuleCardProps {
    moduleNumber: number;
    title: string;
    lessons: number;
    duration: string;
    completed: boolean;
    locked: boolean;
    delay: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
    moduleNumber,
    title,
    lessons,
    duration,
    completed,
    locked,
    delay
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className={`
                bg-white rounded-card-lg p-6
                shadow-soft hover:shadow-soft-lg
                transition-all duration-300
                ${locked ? 'opacity-60' : completed ? 'border-2 border-soft-emerald-200' : 'hover:scale-[1.02]'}
                ${locked || completed ? '' : 'cursor-pointer'}
            `}
        >
            <div className="flex items-start gap-4">
                <div className={`
                    w-14 h-14 rounded-card flex-shrink-0
                    flex items-center justify-center text-xl font-bold
                    ${completed
                        ? 'bg-gradient-emerald text-white'
                        : locked
                            ? 'bg-gray-200 text-gray-400'
                            : 'bg-gradient-indigo text-white'
                    }
                `}>
                    {completed ? <CheckCircle className="w-7 h-7" /> : moduleNumber}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{lessons} lessons</span>
                        <span>•</span>
                        <span>{duration}</span>
                    </div>
                </div>
                {!locked && !completed && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const CourseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isBookmarked, setIsBookmarked] = useState(false);

    const modules = [
        { moduleNumber: 1, title: 'Introduction to Data Science', lessons: 8, duration: '2h 15m', completed: true, locked: false },
        { moduleNumber: 2, title: 'Python Basics for Data Analysis', lessons: 12, duration: '3h 40m', completed: false, locked: false },
        { moduleNumber: 3, title: 'Data Manipulation with Pandas', lessons: 10, duration: '2h 55m', completed: false, locked: false },
        { moduleNumber: 4, title: 'Data Visualization Techniques', lessons: 9, duration: '2h 30m', completed: false, locked: true },
        { moduleNumber: 5, title: 'Statistical Analysis Fundamentals', lessons: 11, duration: '3h 10m', completed: false, locked: true },
        { moduleNumber: 6, title: 'Machine Learning Introduction', lessons: 14, duration: '4h 20m', completed: false, locked: true }
    ];

    const features = [
        { icon: Target, text: '50+ hands-on projects' },
        { icon: Award, text: 'Industry-recognized certificate' },
        { icon: Brain, text: 'AI-powered skill assessment' },
        { icon: Trophy, text: 'Direct job matching upon completion' }
    ];

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            {/* Hero Section with Video */}
            <section className="relative bg-gradient-premium pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Left: Video Player */}
                        <div className="lg:col-span-3">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative rounded-video bg-gray-900 overflow-hidden shadow-premium-lg aspect-video group cursor-pointer"
                            >
                                {/* Video Thumbnail with Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-electric-indigo-500/50 to-ai-cyan-500/50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-pill flex items-center justify-center group-hover:bg-white/30 transition-all shadow-glow-cyan"
                                    >
                                        <Play className="w-10 h-10 text-white ml-1" fill="white" />
                                    </motion.div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900/90 to-transparent">
                                    <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-pill text-white text-sm font-semibold">
                                        Preview Course
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right: Course Info */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-card-xl p-8 shadow-premium"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-4 py-2 bg-electric-indigo-50 text-electric-indigo-600 rounded-pill text-sm font-semibold">
                                        Data & Analytics
                                    </span>
                                    <span className="px-4 py-2 bg-soft-emerald-50 text-soft-emerald-600 rounded-pill text-sm font-semibold">
                                        Beginner
                                    </span>
                                </div>

                                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                                    Data Science Fundamentals with Python
                                </h1>

                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Master the essentials of data science with hands-on Python projects. Learn data analysis, visualization, and statistical techniques used by industry experts.
                                </p>

                                <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span className="font-medium">12 weeks</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        <span className="font-medium">45K students</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                                    <span className="text-2xl font-bold text-gray-900">4.8</span>
                                    <span className="text-gray-500">(12,450 reviews)</span>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {features.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-3 text-gray-700"
                                        >
                                            <div className="w-8 h-8 rounded-card bg-electric-indigo-50 flex items-center justify-center">
                                                <feature.icon className="w-4 h-4 text-electric-indigo-600" />
                                            </div>
                                            <span>{feature.text}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(`/upskill/course/${id}/lesson/1`)}
                                        className="w-full py-4 bg-gradient-indigo text-white rounded-pill font-bold text-lg shadow-glow-indigo hover:shadow-glow-indigo transition-all flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-5 h-5" fill="white" />
                                        Start Learning
                                    </motion.button>

                                    <div className="flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsBookmarked(!isBookmarked)}
                                            className={`
                                                flex-1 py-3 rounded-pill font-semibold border-2 transition-all
                                                ${isBookmarked
                                                    ? 'bg-electric-indigo-50 border-electric-indigo-500 text-electric-indigo-600'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <Bookmark className={`w-5 h-5 inline ${isBookmarked ? 'fill-current' : ''}`} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-pill font-semibold text-gray-700 hover:border-gray-300 transition-all"
                                        >
                                            <Share2 className="w-5 h-5 inline" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Content Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content: Modules */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-section p-8 shadow-soft">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                                        Course Modules
                                    </h2>
                                    <p className="text-gray-600">
                                        64 lessons • 18h 50m total duration
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {modules.map((module, index) => (
                                        <ModuleCard key={index} {...module} delay={index * 0.05} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Instructor & Progress */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Instructor Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-card-xl p-6 shadow-soft"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-indigo rounded-pill flex items-center justify-center text-2xl font-bold text-white">
                                        SC
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Dr. Sarah Chen</h4>
                                        <p className="text-sm text-gray-600">Data Scientist</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    15+ years in data science and AI. Former lead data scientist at Google. Published researcher and industry expert.
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>250K students</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span>4.9 rating</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Progress Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-electric-indigo-500 to-ai-cyan-500 rounded-card-xl p-6 text-white shadow-premium"
                            >
                                <h3 className="text-xl font-bold mb-4">Your Progress</h3>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold">Completion</span>
                                        <span className="text-2xl font-bold">15%</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-pill h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '15%' }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-white rounded-pill"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-white/70">Completed</p>
                                        <p className="text-xl font-bold">8 / 64</p>
                                    </div>
                                    <div>
                                        <p className="text-white/70">Time Spent</p>
                                        <p className="text-xl font-bold">2h 15m</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Certificate Preview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-card-xl p-6 shadow-soft border-2 border-amber-200"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Award className="w-8 h-8 text-amber-500" />
                                    <h3 className="text-lg font-bold text-gray-900">Earn Certificate</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Complete all modules and pass the final AI assessment to earn your verified certificate.
                                </p>
                                <div className="aspect-video bg-gradient-to-br from-amber-50 to-amber-100 rounded-card flex items-center justify-center border border-amber-200">
                                    <Trophy className="w-12 h-12 text-amber-400" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CourseDetail;
