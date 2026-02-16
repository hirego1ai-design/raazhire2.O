import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Sparkles, Clock, Database, Code,
    ArrowRight, Shield, Building2
} from 'lucide-react';

// ============================================
// 1. HERO SECTION: POWERED BY HIREGO AI
// ============================================
const HeroUpskillCopilot = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-20 overflow-hidden bg-[#FAFBFF]">
            {/* Subtle Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-30%] right-[-15%] w-[700px] h-[700px] bg-indigo-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase">Powered by HireGo AI</span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight"
                >
                    Build skills. Get hired{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500">
                        with
                    </span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500">
                        HireGo AI.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
                >
                    AI-powered learning paths, skill assessments, and auto job matching—
                    <br className="hidden sm:block" />
                    on one platform.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => navigate('/signup?type=learner')}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-indigo-200 hover:scale-[1.03] transition-all flex items-center justify-center gap-2 group"
                    >
                        Start Learning Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/upskill/courses')}
                        className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        Browse Skill Paths
                    </button>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-gray-400"
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="font-medium">No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Takes 2 minutes to start</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">50k+ learners trusting HireGo AI</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// ============================================
// SKILL PATH CARD COMPONENT
// ============================================
interface SkillPathCardProps {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    duration: string;
    targetRoles: string;
    delay: number;
    pathUrl: string;
}

const SkillPathCard: React.FC<SkillPathCardProps> = ({
    icon: Icon, iconBg, iconColor, title, description, duration, targetRoles, delay, pathUrl
}) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:border-gray-200 transition-all duration-400 cursor-pointer group relative"
            onClick={() => navigate(pathUrl)}
        >
            {/* Duration Badge */}
            <div className="absolute top-5 right-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-semibold text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {duration}
                </span>
            </div>

            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                <Icon className={`w-8 h-8 ${iconColor}`} strokeWidth={1.8} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {description}
            </p>

            {/* Target Roles */}
            <div className="mb-5">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Target Roles
                </div>
                <p className="text-sm font-semibold text-gray-700">
                    {targetRoles}
                </p>
            </div>

            {/* View Path Link */}
            <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-sm group-hover:gap-2.5 transition-all duration-300">
                <span>View Path</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
const UpskillLandingV2: React.FC = () => {
    const skillPaths = [
        {
            icon: Database,
            iconBg: 'bg-teal-50',
            iconColor: 'text-teal-600',
            title: 'Data & Analytics',
            description: 'Become job-ready for high-demand analyst and business intelligence roles.',
            duration: '8 weeks',
            targetRoles: 'Data Analyst, BI Developer',
            pathUrl: '/upskill/courses?category=Data+%26+Analytics'
        },
        {
            icon: Brain,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            title: 'AI & Machine Learning',
            description: 'Train for specialized ML engineer and AI specialist positions.',
            duration: '12 weeks',
            targetRoles: 'ML Engineer, AI Researcher',
            pathUrl: '/upskill/courses?category=AI+%26+ML'
        },
        {
            icon: Code,
            iconBg: 'bg-sky-50',
            iconColor: 'text-sky-600',
            title: 'Coding & Software',
            description: 'Build expertise in full-stack development and software engineering.',
            duration: '16 weeks',
            targetRoles: 'Full Stack Dev, Engineer',
            pathUrl: '/upskill/courses?category=Coding'
        },
        {
            icon: Building2,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-700',
            title: 'Business & Ops',
            description: 'Master modern management strategies and operational excellence.',
            duration: '6 weeks',
            targetRoles: 'Ops Manager, Project Lead',
            pathUrl: '/upskill/courses?category=Business'
        }
    ];

    return (
        <div className="min-h-screen bg-soft-white font-outfit overflow-x-hidden">
            {/* HERO: Powered by HireGo AI */}
            <HeroUpskillCopilot />

            {/* ============================================ */}
            {/* CHOOSE YOUR SKILL PATH SECTION */}
            {/* ============================================ */}
            <section id="skill-paths" className="pt-20 pb-16 px-4 bg-white">
                <div className="container mx-auto max-w-7xl">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 relative inline-block">
                            <span className="relative z-10">Choose Your Skill Path</span>
                            <span className="absolute bottom-1 left-0 right-0 h-4 bg-amber-300/50 -z-0 rounded-sm" />
                        </h2>
                        <p className="text-lg text-gray-500 max-w-xl mx-auto mt-4">
                            Expert-curated paths designed to get you job-ready.
                        </p>
                    </motion.div>

                    {/* Skill Path Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {skillPaths.map((path, index) => (
                            <SkillPathCard
                                key={path.title}
                                {...path}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UpskillLandingV2;
