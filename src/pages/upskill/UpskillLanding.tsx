import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Brain,
    Code,
    Briefcase,
    Users,
    MessageSquare,
    Database,
    TrendingUp,
    Sparkles,
    Target,
    Zap,
    Award,
    ArrowRight,
    Play,
    CheckCircle,
    BarChart3,
    Lightbulb,
    Clock,
    UserCheck,
    CreditCard
} from 'lucide-react';

// ============================================
// PREMIUM PILL BUTTON
// ============================================
interface PremiumButtonProps {
    children: React.ReactNode;
    variant?: 'indigo' | 'cyan' | 'emerald' | 'outline' | 'white';
    onClick?: () => void;
    icon?: React.ReactNode;
    size?: 'md' | 'lg' | 'xl';
    className?: string;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
    children,
    variant = 'indigo',
    onClick,
    icon,
    size = 'md',
    className = ''
}) => {
    const variants = {
        indigo: 'bg-gradient-indigo text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50',
        cyan: 'bg-gradient-cyan text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50',
        emerald: 'bg-gradient-emerald text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50',
        outline: 'bg-white border-2 border-electric-indigo-500 text-electric-indigo-500 hover:bg-electric-indigo-50',
        white: 'bg-white text-electric-indigo-600 hover:bg-gray-50 shadow-lg'
    };

    const sizes = {
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl'
    };

    // Removed text shadows, kept bold
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
                rounded-full font-bold
                transition-all duration-300
                inline-flex items-center gap-2 justify-center
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
        >
            {children}
            {icon}
        </motion.button>
    );
};

// ============================================
// PREMIUM CARD
// ============================================
interface PremiumCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
    onClick?: () => void;
}

const PremiumCard: React.FC<PremiumCardProps> = ({ children, className = '', delay = 0, hover = true, onClick }) => {
    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={hover ? { y: -8 } : undefined}
            className={`
                bg-white rounded-3xl
                border-2 border-slate-100
                shadow-xl shadow-slate-200/50
                hover:shadow-2xl hover:border-indigo-100
                transition-all duration-500
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

// ============================================
// SKILL CATEGORY CARD
// ============================================
interface SkillCategoryProps {
    icon: React.ElementType;
    title: string;
    description: string;
    sampleRoles: string;
    duration: string;
    gradient: string;
    delay: number;
    onClick?: () => void;
}

const SkillCategoryCard: React.FC<SkillCategoryProps> = ({ icon: Icon, title, description, sampleRoles, duration, gradient, delay, onClick }) => {
    return (
        <PremiumCard onClick={onClick} delay={delay} className="p-8 group cursor-pointer h-full flex flex-col relative overflow-hidden bg-white">
            {/* Hover Gradient Overlay - subtle */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />

            <div className="mb-6 flex justify-between items-start">
                {/* 3D Icon Container: Fully curved (rounded-3xl), Shadow, Gradient */}
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300 border-t border-white/30`}>
                    <Icon className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2} />
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {duration}
                </div>
            </div>

            {/* Title - Bold, No Text Shadow (2D) */}
            <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">{title}</h3>

            <p className="text-slate-600 text-sm mb-5 flex-grow leading-relaxed font-medium">{description}</p>

            <div className="pt-5 border-t border-slate-100 mt-auto">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Target Roles</p>
                <p className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg inline-block w-full">{sampleRoles}</p>
            </div>

            <div className="mt-6 flex items-center text-indigo-600 text-sm font-bold group-hover:gap-2 gap-1 transition-all">
                <span>View Path</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
        </PremiumCard>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const UpskillLanding: React.FC = () => {
    const navigate = useNavigate();

    const skillCategories = [
        {
            icon: Database,
            title: 'Data & Analytics',
            description: 'Become job-ready for high-demand analyst and business intelligence roles.',
            sampleRoles: 'Data Analyst, BI Developer',
            duration: '8 weeks',
            gradient: 'from-blue-500 to-indigo-600'
        },
        {
            icon: Brain,
            title: 'AI & Machine Learning',
            description: 'Train for specialized ML engineer and AI specialist positions.',
            sampleRoles: 'ML Engineer, AI Researcher',
            duration: '12 weeks',
            gradient: 'from-violet-500 to-purple-600'
        },
        {
            icon: Code,
            title: 'Coding & Software',
            description: 'Build expertise in full-stack development and software engineering.',
            sampleRoles: 'Full Stack Dev, Engineer',
            duration: '16 weeks',
            gradient: 'from-emerald-400 to-teal-500'
        },
        {
            icon: Briefcase,
            title: 'Business & Ops',
            description: 'Master modern management strategies and operational excellence.',
            sampleRoles: 'Ops Manager, Project Lead',
            duration: '6 weeks',
            gradient: 'from-orange-400 to-amber-500'
        },
        {
            icon: MessageSquare,
            title: 'Communication',
            description: 'Enhance presentation, negotiation, and corporate communication skills.',
            sampleRoles: 'Corp Comm, Sales Lead',
            duration: '4 weeks',
            gradient: 'from-cyan-400 to-blue-500'
        },
        {
            icon: Users,
            title: 'Customer Success',
            description: 'Learn best practices for customer support and client relationships.',
            sampleRoles: 'CS Manager, Support Lead',
            duration: '5 weeks',
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            icon: TrendingUp,
            title: 'Digital Marketing',
            description: 'Acquire skills in SEO, content marketing, and performance advertising.',
            sampleRoles: 'Marketer, Growth Hacker',
            duration: '8 weeks',
            gradient: 'from-lime-500 to-green-600'
        },
        {
            icon: Lightbulb,
            title: 'Product Design',
            description: 'Unlock creativity with design thinking, UI/UX, and prototyping.',
            sampleRoles: 'Product Designer, UX Researcher',
            duration: '10 weeks',
            gradient: 'from-fuchsia-500 to-pink-600'
        }
    ];

    const steps = [
        {
            icon: GraduationCap,
            title: 'Choose a Skill Path',
            description: 'Pick from 100+ job-aligned courses designed by industry experts.',
            color: 'bg-gradient-to-br from-indigo-500 to-blue-600'
        },
        {
            icon: Play,
            title: 'Learn with AI Lessons',
            description: 'Interactive video lessons and quizzes that adapt to your pace.',
            color: 'bg-gradient-to-br from-cyan-500 to-blue-500'
        },
        {
            icon: Target,
            title: 'Prove Your Skills',
            description: 'Complete AI-graded assessments and real-world project tasks.',
            color: 'bg-gradient-to-br from-emerald-500 to-green-600'
        },
        {
            icon: Briefcase,
            title: 'Get Auto-Matched',
            description: 'Your verified profile goes directly into top hiring pipelines.',
            color: 'bg-gradient-to-br from-violet-500 to-purple-600'
        }
    ];

    const aiFeatures = [
        {
            icon: Brain,
            title: 'AI Personalized Learning',
            description: 'Content difficulty adjusts automatically based on your quiz performance.'
        },
        {
            icon: BarChart3,
            title: 'AI Skill Scoring',
            description: 'Get an objective, standardized score that hiring managers trust.'
        },
        {
            icon: Briefcase,
            title: 'Auto Job Matching',
            description: 'Your new skills feed directly into HireGo’s autonomous recruitment engine.'
        },
        {
            icon: Zap,
            title: 'Real-time Feeback',
            description: 'Instant AI analysis of your code, answers, and project submissions.'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-outfit overflow-x-hidden">
            {/* ============================================ */}
            {/* HERO SECTION */}
            {/* ============================================ */}
            <section className="relative overflow-hidden bg-white pt-32 pb-24 border-b border-slate-200">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}
                />

                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Pill Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-full border border-slate-200 shadow-sm mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">Powered by HireGo AI</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight"
                        >
                            Build skills. Get hired <span className="text-indigo-600">with HireGo AI.</span>
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-semibold"
                        >
                            AI-powered learning paths, skill assessments, and auto job matching—on one platform.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
                        >
                            <PremiumButton
                                variant="indigo"
                                size="xl"
                                onClick={() => navigate('/signup?type=learner')}
                                icon={<ArrowRight className="w-5 h-5" />}
                            >
                                Start Learning Free
                            </PremiumButton>
                            <PremiumButton
                                variant="white"
                                size="xl"
                                onClick={() => navigate('/upskill/courses')}
                                className="!border-2 !border-slate-200 !text-slate-700 hover:!border-slate-300 hover:!text-slate-900 shadow-sm"
                            >
                                Browse Skill Paths
                            </PremiumButton>
                        </motion.div>

                        {/* Trust Markers */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-500"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>Takes 2 minutes to start</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                                <UserCheck className="w-4 h-4 text-purple-500" />
                                <span>50k+ learners trusting HireGo AI</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* SKILL PATHS SECTION */}
            {/* ============================================ */}
            <section className="py-24 px-4 bg-slate-50 relative">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
                        >
                            Choose Your Skill Path
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 max-w-2xl mx-auto font-medium"
                        >
                            Expert-curated paths designed to get you job-ready.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {skillCategories.map((category, index) => (
                            <SkillCategoryCard
                                key={index}
                                {...category}
                                delay={index * 0.05}
                                onClick={() => navigate('/upskill/courses')}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/upskill/courses')}
                            className="inline-flex items-center gap-2 text-indigo-600 font-extrabold hover:text-indigo-700 transition-colors text-lg px-8 py-4 bg-white rounded-full shadow-lg border border-indigo-100 hover:-translate-y-1 transform duration-300"
                        >
                            Explore All Skill Paths <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* HOW IT WORKS (Timeline Style) */}
            {/* ============================================ */}
            <section className="py-24 bg-white relative overflow-hidden border-y border-slate-200">
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block mb-4"
                        >
                            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-sm uppercase tracking-wider border border-blue-100">Simple Process</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
                        >
                            How It Works
                        </motion.h2>
                        <p className="text-xl text-slate-600 font-medium">Your journey from learning to hiring—simplified.</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-[2.5rem] left-0 w-full h-1 bg-slate-100 -z-10" />

                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative flex flex-col items-center text-center group"
                            >
                                {/* 3D Icon Circle */}
                                <div className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center mb-8 shadow-xl shadow-slate-200 border-4 border-white z-10 transform group-hover:scale-110 transition-transform duration-300`}>
                                    <step.icon className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
                                </div>

                                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 w-full hover:border-indigo-100 transition-colors h-full">
                                    <div className="mb-4 inline-block px-3 py-1 bg-slate-50 rounded-lg text-slate-400 font-bold text-xs uppercase">
                                        Step 0{index + 1}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* AI FEATURES DIFFERENTIATION */}
            {/* ============================================ */}
            <section className="py-24 px-4 bg-slate-50">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            {/* Graphic Representation */}
                            <div className="relative aspect-square rounded-[3rem] bg-white overflow-hidden border border-slate-200 shadow-2xl">
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                                    <div className="relative w-full max-w-md aspect-square">
                                        {/* Central Hub */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center z-20 border-8 border-slate-50">
                                            <div className="text-center">
                                                <div className="text-4xl font-black text-indigo-600 tracking-tighter">AI</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Engine</div>
                                            </div>
                                        </div>

                                        {/* Orbiting Elements */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 z-10"
                                        >
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg flex items-center justify-center text-white border-2 border-white transform -rotate-0">
                                                <Brain className="w-8 h-8 drop-shadow-md" />
                                            </div>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12 w-20 h-20 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl shadow-lg flex items-center justify-center text-white border-2 border-white transform -rotate-180">
                                                <Target className="w-8 h-8 drop-shadow-md" />
                                            </div>
                                            <div className="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg flex items-center justify-center text-white border-2 border-white transform -rotate-90">
                                                <Code className="w-8 h-8 drop-shadow-md" />
                                            </div>
                                            <div className="absolute right-0 top-1/2 translate-x-12 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg flex items-center justify-center text-white border-2 border-white transform rotate-90">
                                                <Briefcase className="w-8 h-8 drop-shadow-md" />
                                            </div>
                                        </motion.div>

                                        {/* Orbit Rings - clear borders */}
                                        <div className="absolute inset-12 border-2 border-dashed border-slate-200 rounded-full opacity-60" />
                                        <div className="absolute inset-32 border-2 border-dashed border-slate-200 rounded-full opacity-60" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-4"
                            >
                                <span className="text-indigo-600 font-extrabold tracking-wide uppercase text-sm bg-indigo-50 px-4 py-2 rounded-lg">The HireGo AI Advantage</span>
                            </motion.div>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-none">
                                More than just <br /> a course. <br />
                                <span className="text-indigo-600">It's a career engine.</span>
                            </h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                Most platforms just play videos. HireGo AI analyzes your skills and actively pushes you towards higher-paying roles.
                            </p>

                            <div className="space-y-4">
                                {aiFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex gap-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 shadow-inner">
                                            <feature.icon className="w-6 h-6" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-1">{feature.title}</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed font-medium">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FINAL CTA */}
            {/* ============================================ */}
            <section className="py-24 px-4 bg-indigo-600 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
                            Upskill Once. <br /> Get Hired Globally.
                        </h2>
                        <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium">
                            Join 50,000+ learners who use HireGo AI to move into higher-paying roles.
                        </p>
                        <PremiumButton
                            variant="white"
                            size="xl"
                            onClick={() => navigate('/signup?type=learner')}
                            icon={<Zap className="w-6 h-6" />}
                            className="shadow-2xl"
                        >
                            Start Learning Free
                        </PremiumButton>
                        <p className="mt-8 text-indigo-200 text-sm font-bold opacity-80">
                            No credit card required. Free for learners.
                        </p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default UpskillLanding;
