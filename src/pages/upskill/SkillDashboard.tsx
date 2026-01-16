import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Award,
    TrendingUp,
    Target,
    MessageSquare,
    Brain,
    Briefcase,
    Download,
    Share2,
    ChevronRight,
    Star,
    CheckCircle,
    AlertCircle,
    Trophy,
    Rocket
} from 'lucide-react';

// ============================================
// CIRCULAR SCORE METER
// ============================================
interface CircularMeterProps {
    score: number;
    label: string;
    color: 'indigo' | 'cyan' | 'emerald' | 'amber';
    size?: 'sm' | 'md' | 'lg';
}

const CircularMeter: React.FC<CircularMeterProps> = ({ score, label, color, size = 'md' }) => {
    const

        colors = {
            indigo: {
                bg: 'stroke-electric-indigo-100',
                fill: 'stroke-electric-indigo-500',
                text: 'text-electric-indigo-600'
            },
            cyan: {
                bg: 'stroke-ai-cyan-100',
                fill: 'stroke-ai-cyan-500',
                text: 'text-ai-cyan-600'
            },
            emerald: {
                bg: 'stroke-soft-emerald-100',
                fill: 'stroke-soft-emerald-500',
                text: 'text-soft-emerald-600'
            },
            amber: {
                bg: 'stroke-amber-100',
                fill: 'stroke-amber-500',
                text: 'text-amber-600'
            }
        };

    const sizes = {
        sm: { dimension: 120, strokeWidth: 8, fontSize: 'text-2xl' },
        md: { dimension: 160, strokeWidth: 10, fontSize: 'text-3xl' },
        lg: { dimension: 200, strokeWidth: 12, fontSize: 'text-4xl' }
    };

    const { dimension, strokeWidth, fontSize } = sizes[size];
    const radius = (dimension - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: dimension, height: dimension }}>
                <svg width={dimension} height={dimension} className="transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        fill="none"
                        className={colors[color].bg}
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        fill="none"
                        className={colors[color].fill}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`${fontSize} font-extrabold ${colors[color].text}`}>
                        {score}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">/ 100</span>
                </div>
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 text-center">{label}</h3>
        </div>
    );
};

// ============================================
// STRENGTH/WEAKNESS CARD
// ============================================
interface InsightCardProps {
    type: 'strength' | 'improvement';
    items: string[];
}

const InsightCard: React.FC<InsightCardProps> = ({ type, items }) => {
    const config = type === 'strength' ? {
        icon: CheckCircle,
        title: 'Strengths',
        iconColor: 'text-soft-emerald-500',
        bgColor: 'bg-soft-emerald-50',
        borderColor: 'border-soft-emerald-200'
    } : {
        icon: AlertCircle,
        title: 'Areas for Improvement',
        iconColor: 'text-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-card-xl p-8 shadow-premium"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 ${config.bgColor} rounded-card flex items-center justify-center`}>
                    <config.icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{config.title}</h3>
            </div>
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-start gap-3 p-4 rounded-card-lg border-2 ${config.borderColor} ${config.bgColor}`}
                    >
                        <config.icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-700 font-medium">{item}</span>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

// ============================================
// JOB RECOMMENDATION CARD
// ============================================
interface JobCardProps {
    title: string;
    company: string;
    match: number;
    location: string;
    salary: string;
    delay: number;
}

const JobCard: React.FC<JobCardProps> = ({ title, company, match, location, salary, delay }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-card-xl p-6 shadow-soft hover:shadow-premium transition-all cursor-pointer"
            onClick={() => navigate('/upskill/jobs')}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
                    <p className="text-gray-600">{company}</p>
                </div>
                <div className="px-4 py-2 bg-soft-emerald-50 border-2 border-soft-emerald-200 rounded-pill">
                    <span className="text-soft-emerald-700 font-bold text-lg">{match}% Match</span>
                </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>{location}</span>
                <span>•</span>
                <span className="font-semibold text-gray-900">{salary}</span>
            </div>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-indigo text-white rounded-pill font-semibold shadow-soft hover:shadow-glow-indigo transition-all flex items-center justify-center gap-2"
            >
                Apply Now
                <ChevronRight className="w-5 h-5" />
            </motion.button>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const SkillDashboard: React.FC = () => {
    const navigate = useNavigate();

    const strengths = [
        "Strong understanding of data manipulation with Pandas",
        "Excellent problem-solving and analytical thinking",
        "Clear communication of technical concepts"
    ];

    const improvements = [
        "Practice more complex SQL queries and joins",
        "Strengthen machine learning algorithm fundamentals",
        "Improve visualization storytelling techniques"
    ];

    const recommendedJobs = [
        {
            title: "Junior Data Analyst",
            company: "TechCorp Inc.",
            match: 95,
            location: "Remote",
            salary: "$65K-$80K"
        },
        {
            title: "Data Science Intern",
            company: "AI Innovations",
            match: 88,
            location: "Hybrid",
            salary: "$50K-$60K"
        },
        {
            title: "Business Intelligence Analyst",
            company: "DataDriven Co.",
            match: 82,
            location: "On-site",
            salary: "$70K-$85K"
        }
    ];

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            {/* Hero Header */}
            <section className="bg-gradient-premium pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-pill shadow-soft mb-6">
                            <Trophy className="w-6 h-6 text-electric-indigo-500" />
                            <span className="font-bold text-gray-900">Assessment Complete!</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                            Your Skill Score
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            AI-powered analysis of your data science capabilities
                        </p>
                    </motion.div>

                    {/* Main Score Cards */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-4 lg:col-span-1 bg-white rounded-card-xl p-8 shadow-premium"
                        >
                            <CircularMeter score={87} label="Overall Score" color="indigo" size="lg" />
                            <div className="mt-6 text-center">
                                <p className="text-gray-600 mb-4">You scored higher than <strong className="text-electric-indigo-600">78%</strong> of test-takers</p>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/upskill/certificate/1')}
                                        className="flex-1 py-3 bg-gradient-indigo text-white rounded-pill font-semibold shadow-glow-indigo text-sm flex items-center justify-center gap-2"
                                    >
                                        <Award className="w-4 h-4" />
                                        View Certificate
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        <div className="md:col-span-4 lg:col-span-3 grid sm:grid-cols-3 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-card-xl p-8 shadow-premium"
                            >
                                <CircularMeter score={92} label="Technical Skills" color="cyan" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-card-xl p-8 shadow-premium"
                            >
                                <CircularMeter score={85} label="Communication" color="emerald" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-card-xl p-8 shadow-premium"
                            >
                                <CircularMeter score={90} label="Confidence" color="amber" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Breakdown */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">
                        Detailed Analysis
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-8 mb-16">
                        <InsightCard type="strength" items={strengths} />
                        <InsightCard type="improvement" items={improvements} />
                    </div>
                </div>
            </section>

            {/* Hiring Readiness */}
            <section className="py-16 px-4 bg-cloud-grey">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                            Hiring Readiness
                        </h2>
                        <p className="text-xl text-gray-600">
                            Based on your assessment, you're ready for these roles
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-electric-indigo-500 to-ai-cyan-500 rounded-section-xl p-12 text-white text-center mb-12 shadow-premium-lg relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        </div>
                        <div className="relative z-10">
                            <Rocket className="w-16 h-16 mx-auto mb-6 opacity-90" />
                            <h3 className="text-3xl font-extrabold mb-4">You're Ready to Apply!</h3>
                            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                                Your skills match perfectly with {recommendedJobs.length} open positions. Start your career journey today.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/upskill/certificate/1')}
                                    className="px-8 py-4 bg-white text-electric-indigo-600 rounded-pill font-bold shadow-soft flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Certificate
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-pill font-bold flex items-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share Results
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Recommended Jobs */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                                Recommended Jobs
                            </h2>
                            <p className="text-xl text-gray-600">
                                Positions matching your skill profile
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/upskill/jobs')}
                            className="px-6 py-3 bg-gradient-indigo text-white rounded-pill font-semibold shadow-glow-indigo flex items-center gap-2"
                        >
                            View All Jobs
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedJobs.map((job, index) => (
                            <JobCard key={index} {...job} delay={index * 0.1} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SkillDashboard;
