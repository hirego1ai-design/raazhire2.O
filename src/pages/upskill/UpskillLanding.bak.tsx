import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Rocket, Target, Zap, ArrowRight,
    CircleCheck, BookOpen, Sparkles,
    Shield, Globe, Bot, Link2, CirclePlay, Cpu, Activity,
    Bell, Lightbulb, GitBranch, Gauge, X, Users, Map,
    ChevronDown, ChevronUp, Star, CircleHelp, MessageCircle
} from 'lucide-react';

// ============================================
// 1. HERO SECTION: AI CAREER CO-PILOT
// ============================================
const HeroUpskillCopilot = () => {
    const navigate = useNavigate();

    return (
        <section id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-white">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white" />
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-[80px]" />
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Copy & Actions */}
                    <div className="space-y-8 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-sm animate-fade-in-up"
                        >
                            <Sparkles className="w-4 h-4 ml-[-4px]" />
                            <span>Your Personal AI Career Architect</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight"
                        >
                            Your AI Career Co-Pilot is <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Ready for Takeoff.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                        >
                            No more guessing which skills to learn. Your personal AI maps your current abilities, designs a realistic growth plan, and navigates you from first lesson to first interview.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <button
                                onClick={() => navigate('/register/upskill')}
                                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group"
                            >
                                Start My Flight Plan
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => { }}
                                className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <CirclePlay className="w-5 h-5 text-indigo-600" />
                                See How It Works
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center lg:justify-start gap-8 pt-4"
                        >
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-semibold text-slate-600">Built by HireGo AI</span>
                            </div>
                            <div className="hidden sm:block w-px h-4 bg-slate-300" />
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-semibold text-slate-600">10K+ Learners</span>
                            </div>
                            <div className="hidden sm:block w-px h-4 bg-slate-300" />
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-500" />
                                <span className="text-sm font-semibold text-slate-600">85% Job Match Rate</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: AI Chat Interface Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2rem] -rotate-6 opacity-10 blur-2xl" />
                        <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.01] duration-500">
                            {/* Window Header */}
                            <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <div className="ml-auto text-xs font-medium text-slate-400">HireGo Co-Pilot v2.1</div>
                            </div>
                            {/* Chat Content */}
                            <div className="p-8 space-y-6">
                                {/* AI Message 1 */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <Bot className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm leading-relaxed">
                                            Hi Alex! 👋 I've analyzed your GitHub and LinkedIn. You're strong in <strong>Frontend</strong> but missing 3 key skills for that Senior React role you want.
                                        </div>
                                    </div>
                                </div>
                                {/* User Message */}
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-bold">
                                        You
                                    </div>
                                    <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none text-white text-sm leading-relaxed shadow-lg shadow-indigo-200">
                                        Which skills specifically? And how long to learn them?
                                    </div>
                                </div>
                                {/* AI Message 2 with Cards */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <Bot className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="space-y-3 w-full">
                                        <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm">
                                            Here's your custom gap analysis:
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 border border-slate-200 rounded-xl bg-white hover:border-indigo-200 transition-colors">
                                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Critical Gap</div>
                                                <div className="font-bold text-slate-800">Next.js 14</div>
                                                <div className="text-xs text-indigo-600 mt-2 font-medium">Est. 2 weeks</div>
                                            </div>
                                            <div className="p-3 border border-slate-200 rounded-xl bg-white hover:border-indigo-200 transition-colors">
                                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Preferred</div>
                                                <div className="font-bold text-slate-800">TypeScript</div>
                                                <div className="text-xs text-indigo-600 mt-2 font-medium">Est. 3 weeks</div>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-lg inline-flex items-center gap-2">
                                            <CircleCheck className="w-3 h-3" /> Roadmap generated instantly
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ============================================
// 2. THE SKILL GAP TRAP
// ============================================
const SkillGapTrap = () => {
    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Why Most People Get Stuck Forever</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Online courses promise transformation but often deliver confusion. Here's what actually happens without intelligent guidance.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 relative">
                    {/* The Trap */}
                    <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <X className="w-32 h-32 text-red-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <X className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">The "Course Collector" Loop</h3>
                        </div>
                        <ul className="space-y-4 relative z-10">
                            {[
                                "Buying courses you never finish",
                                "Learning outdated skills employers don't want",
                                "Zero feedback on your actual code",
                                "No connection to hiring managers",
                                "Feeling 'busy' but making no real progress"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-600">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-indigo-900 p-8 rounded-3xl shadow-xl relative overflow-hidden transform md:scale-105 border-4 border-white md:-mt-4 z-10">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CircleCheck className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">The HireGo Co-Pilot Way</h3>
                        </div>
                        <ul className="space-y-5 relative z-10">
                            {[
                                "Custom roadmap based on YOUR gaps",
                                "Daily AI check-ins to keep you moving",
                                "Validation that you're actually job-ready",
                                "Live market data drives what you learn",
                                "Direct pipeline to interviews when ready"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-indigo-100 font-medium">
                                    <CircleCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ============================================
// 3. AI UPSKILL SPACE (HOW IT WORKS)
// ============================================
const AIUpskillSpace = () => {
    const steps = [
        {
            icon: Brain,
            title: "Initial Scan",
            desc: "Upload CV or connect LinkedIn. AI reads your skills & gaps in 60 seconds."
        },
        {
            icon: Target,
            title: "Goal Setting",
            desc: "Tell us your target role. AI validates feasibility and timeline."
        },
        {
            icon: Map,
            title: "Smart Roadmap",
            desc: "Receive a week-by-week plan with micro-goals and checkpoints."
        },
        {
            icon: Bell,
            title: "Daily Guidance",
            desc: "Morning briefs: 'Today, master React Hooks.' Evening progress checks."
        },
        {
            icon: Rocket,
            title: "Job Match",
            desc: "When skills hit threshold, AI auto-submits you to HireGo openings."
        }
    ];

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-4">Think Less, Learn More</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        One conversation. One scan. One personalized plan that evolves with you every single day.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-100 hidden lg:block" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300 text-center lg:text-left"
                            >
                                <div className="w-14 h-14 mx-auto lg:mx-0 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300 shadow-sm relative z-20">
                                    <step.icon className="w-7 h-7 text-slate-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// ============================================
// 4. NINETY DAY JOURNEY
// ============================================
const NinetyDayJourney = () => {
    const weeks = [
        {
            range: "Weeks 1-2",
            title: "Foundation Lockdown",
            items: ["AI identifies top 3 skill gaps", "Complete diagnostic quizzes", "Get personalized resource pack"],
            achievement: "Clarity on where you stand",
            color: "blue"
        },
        {
            range: "Weeks 3-5",
            title: "Active Learning Sprint",
            items: ["Daily 90-min focused sessions", "AI adjusts difficulty real-time", "Weekly skill validation checkpoints"],
            achievement: "First mini-project completed",
            color: "indigo"
        },
        {
            range: "Weeks 6-8",
            title: "Build & Apply",
            items: ["Create portfolio project with AI", "Practice mock interviews", "Refine GitHub/LinkedIn presence"],
            achievement: "Portfolio live + profile optimized",
            color: "purple"
        },
        {
            range: "Weeks 9-12",
            title: "Job Market Entry",
            items: ["AI matches 5-10 HireGo openings", "Company-specific interview prep", "Application management dashboard"],
            achievement: "First real interviews scheduled",
            color: "green"
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-indigo-50/50 to-white">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider mb-4">
                        Realistic Timeline
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Week by Week: Your Flight Plan</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Real transformation takes 8–12 weeks when guided correctly. This is what your journey looks like.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-0.5 bg-slate-200 -ml-[1px]" />

                    <div className="space-y-12">
                        {weeks.map((period, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ margin: "-100px" }}
                                className={`flex flex-col md:flex-row items-start md:items-center gap-8 relative ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Center Dot */}
                                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md z-10"
                                    style={{ backgroundColor: `var(--color-${period.color}-500, #6366f1)` }} />

                                {/* Content Card */}
                                <div className="flex-1 ml-16 md:ml-0 md:w-1/2">
                                    <div className={`p-6 bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow border-l-4 border-${period.color}-500 group`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className={`text-xs font-bold uppercase tracking-wider text-${period.color}-600 bg-${period.color}-50 px-2 py-1 rounded-md`}>
                                                    {period.range}
                                                </span>
                                                <h3 className="text-xl font-bold text-slate-900 mt-2">{period.title}</h3>
                                            </div>
                                        </div>
                                        <ul className="space-y-2 mb-4">
                                            {period.items.map((item, idx) => (
                                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className={`mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-${period.color}-700 flex items-center gap-2`}>
                                            <Star className="w-4 h-4 fill-current" />
                                            ACHIEVEMENT: {period.achievement}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 hidden md:block" /> {/* Spacer */}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// ============================================
// 5. LEARNER PROFILES
// ============================================
const LearnerProfiles = () => {
    const personas = [
        {
            title: "The Grad",
            desc: "Fresh CS degree, zero real projects",
            path: "10-week Full Stack Track",
            outcome: "Junior Dev @ TechCorp",
            icon: BookOpen,
            color: "bg-blue-500"
        },
        {
            title: "The Switcher",
            desc: "Marketer moving to Product",
            path: "12-week PM Hybrid Plan",
            outcome: "Associate PM @ Startup",
            icon: GitBranch,
            color: "bg-purple-500"
        },
        {
            title: "The Up-leveler",
            desc: "Junior dev aiming for Mid-level",
            path: "8-week System Design",
            outcome: "Promoted to SDE II",
            icon: TrendingUp,
            color: "bg-emerald-500"
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900 mb-4">No Matter Where You Start</h2>
                    <p className="text-lg text-slate-600">Different backgrounds need different flight paths. We've built this for you.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {personas.map((p, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 hover:border-indigo-100 transition-all text-center group"
                        >
                            <div className={`w-16 h-16 mx-auto rounded-2xl ${p.color} text-white flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                                <div className="w-8 h-8"><p.icon size={32} /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{p.title}</h3>
                            <p className="text-slate-500 mb-6">{p.desc}</p>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-left">
                                <div className="text-xs uppercase text-slate-400 font-bold mb-1">AI Roadmap</div>
                                <div className="font-semibold text-slate-800">{p.path}</div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                                <CircleCheck size={16} />
                                {p.outcome}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ============================================
// 6. SKILLS TO INTERVIEWS
// ============================================
const SkillsToInterviews = () => {
    return (
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-cyan-600/10 blur-[100px]" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-6">
                            The Missing Link
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
                            From "I'm Learning" to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">"I Got the Job"</span>
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            Your co-pilot doesn't just teach you—it connects you directly to HireGo's employer network the moment you're ready. No more cold applying.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: "Skill Threshold Monitor", desc: "AI tracks your competency across technical & behavioral dims." },
                                { title: "Auto-Qualification", desc: "Hit 75% match? AI flags you as 'Interview Ready'." },
                                { title: "Smart Matching", desc: "Your profile auto-enters priority applicant pools." },
                                { title: "Interview Prep", desc: "Mock Q&A sessions tailored to the actual company." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0 border border-indigo-500/30">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{item.title}</h4>
                                        <p className="text-sm text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
                            {/* Graphic Representation */}
                            <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-4 py-2 text-xs font-bold rounded-bl-2xl border-l border-b border-green-500/20">
                                LIVE PIPELINE
                            </div>

                            <div className="space-y-6 mt-4">
                                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center"><Activity size={20} /></div>
                                        <div>
                                            <div className="text-sm font-bold">React.js Skill</div>
                                            <div className="text-xs text-slate-500">Progress Tracking</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">82%</div>
                                        <div className="text-[10px] text-green-400">READY FOR INTERVIEW</div>
                                    </div>
                                </div>

                                <ArrowRight className="w-6 h-6 text-slate-600 mx-auto rotate-90" />

                                <div className="flex items-center justify-between p-4 bg-indigo-600/20 rounded-xl border border-indigo-500/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center"><Rocket size={20} /></div>
                                        <div>
                                            <div className="text-sm font-bold text-white">HireGo Auto-Match</div>
                                            <div className="text-xs text-indigo-300">Target Role: Frontend Dev</div>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-500 px-3 py-1 rounded text-xs font-bold text-white">
                                        3 MATCHES
                                    </div>
                                </div>

                                <div className="space-y-2 pl-8 border-l-2 border-indigo-500/30 ml-8">
                                    {['TechCorp Inc.', 'StartupFlow', 'Global Systems'].map((company, i) => (
                                        <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-700/50 last:border-0">
                                            <span className="text-slate-300">{company}</span>
                                            <span className="text-green-400 font-mono text-xs">INVITE SENT</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ============================================
// 7. OUTCOMES & STORIES
// ============================================
const OutcomesStories = () => {
    const stories = [
        {
            name: "Priya S.",
            role: "Junior React Dev",
            before: "Stuck in customer service",
            quote: "The daily AI check-ins kept me accountable. I knew exactly what 'done' looked like.",
            salary: "₹6.5L/yr",
            time: "11 Weeks"
        },
        {
            name: "Rohan K.",
            role: "Data Analyst",
            before: "Mechanical Engineer",
            quote: "It felt like having a mentor who never sleeps. Every question had an answer.",
            salary: "₹9L/yr",
            time: "14 Weeks"
        },
        {
            name: "Anjali M.",
            role: "QA Engineer",
            before: "College Dropout",
            quote: "HireGo didn't just teach me—they connected me to the job. That's the difference.",
            salary: "₹5.5L/yr",
            time: "16 Weeks"
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Career Launches Powered by AI</h2>
                    <p className="text-lg text-slate-600">These aren't outliers. This is what happens when you have a plan.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {stories.map((story, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl p-8 relative hover:-translate-y-2 transition-transform duration-300">
                            <QuoteIcon />
                            <p className="text-slate-700 italic mb-6 relative z-10">"{story.quote}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                                    {story.name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{story.name}</div>
                                    <div className="text-xs text-slate-500">{story.role}</div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between text-xs font-bold">
                                <div>
                                    <span className="block text-slate-400 uppercase">Outcome</span>
                                    <span className="text-green-600">{story.salary}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-slate-400 uppercase">Timeline</span>
                                    <span className="text-indigo-600">{story.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Metrics Bar */}
                <div className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 text-white grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-black text-indigo-400 mb-2">84%</div>
                        <div className="text-sm text-slate-400 uppercase tracking-widest">Complete Plan</div>
                    </div>
                    <div className="md:border-l md:border-r border-slate-700">
                        <div className="text-4xl font-black text-cyan-400 mb-2">3.2x</div>
                        <div className="text-sm text-slate-400 uppercase tracking-widest">Faster Hired</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-green-400 mb-2">91%</div>
                        <div className="text-sm text-slate-400 uppercase tracking-widest">Interview Rate</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const QuoteIcon = () => (
    <svg className="absolute top-6 left-6 w-10 h-10 text-indigo-100 -z-0 transform -scale-x-100" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
    </svg>
);

// ============================================
// 8. FAQ + FINAL CTA
// ============================================
const FAQAndCTA = () => {
    const navigate = useNavigate();
    const faqs = [
        { q: "How is this different from Udemy/Coursera?", a: "We're not a course marketplace. We are an AI co-pilot that scans your gaps and builds a single tailored roadmap using the best resources from everywhere. Plus, we connect you directly to jobs." },
        { q: "Do I need to quit my job?", a: "No. Plans are tailored for 60-90 minutes a day. Your co-pilot optimizes for your specific schedule." },
        { q: "What if I get stuck technically?", a: "Our AI provides instant hints and debugging help. Premium users can also request human mentor code reviews." },
        { q: "Cost?", a: "Free basic plan (roadmap + community). Pro plan (human mentors + priority job matching) helps us keep the lights on." }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-gradient-to-br from-indigo-700 to-violet-900 text-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Your Questions, Answered</h2>
                </div>

                <div className="space-y-4 mb-20">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 transition-colors hover:bg-white/15">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left font-bold"
                            >
                                {faq.q}
                                {openIndex === i ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-indigo-100 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="text-center bg-white/5 p-10 rounded-3xl border border-white/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                        <Rocket size={150} />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">
                        Ready to Let AI Navigate Your Growth?
                    </h2>
                    <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto relative z-10">
                        Start your free skill scan now. See your roadmap in under 5 minutes.
                        No credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                        <button
                            onClick={() => navigate('/register/upskill')}
                            className="px-10 py-5 bg-white text-indigo-800 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-2"
                        >
                            Launch My Co-Pilot
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                            Watch 90-Second Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
const UpskillLandingV2: React.FC = () => {
    return (
        <div className="font-sans antialiased bg-white text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            <HeroUpskillCopilot />
            <SkillGapTrap />
            <AIUpskillSpace />
            <NinetyDayJourney />
            <LearnerProfiles />
            <SkillsToInterviews />
            <OutcomesStories />
            <FAQAndCTA />
        </div>
    );
};

export default UpskillLandingV2;
