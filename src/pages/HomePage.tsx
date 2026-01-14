import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Sparkles,
    Zap,
    Brain,
    Globe,
    Shield,
    Clock,
    Users,
    Award,
    Play,
    ArrowRight,
    CheckCircle,
    Bot,
    Target,
    Cpu,
    Rocket,
    ChevronRight,
    Building2,
    GraduationCap,
    Star,
    Quote,
    TrendingUp,
    FileText,
    Video,
    BadgeCheck,
    Briefcase,
    ShoppingBag,
    Database,
    Server,
    Layout,
    Code,
    Smartphone,
    Box,
    Hexagon,
    Command,
    Slack,
    Figma,
    Chrome,
    Github,
    Cloud
} from 'lucide-react';

// ============================================
// 3D FLOATING CARD COMPONENT
// ============================================
interface Card3DProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    glowColor?: 'cyan' | 'purple' | 'green' | 'pink';
}

const Card3D: React.FC<Card3DProps> = ({ children, className = '', delay = 0, glowColor = 'cyan' }) => {
    const glowShadows = {
        cyan: 'hover:shadow-3d-glow-cyan',
        purple: 'hover:shadow-3d-glow-purple',
        green: 'hover:shadow-3d-glow-green',
        pink: 'hover:shadow-neon-pink'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`
                relative overflow-hidden
                bg-white/95 backdrop-blur-xl
                rounded-4xl
                border border-white/20
                shadow-3d-card
                ${glowShadows[glowColor]}
                transition-all duration-500 ease-out
                ${className}
            `}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 rounded-4xl overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${glowColor === 'cyan' ? 'rgba(0, 243, 255, 0.5)' : glowColor === 'purple' ? 'rgba(188, 19, 254, 0.5)' : glowColor === 'green' ? 'rgba(57, 255, 20, 0.5)' : 'rgba(255, 0, 110, 0.5)'}, transparent)`,
                        opacity: 0.3,
                        padding: '1px',
                        borderRadius: '2rem'
                    }}
                />
            </div>
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};

// ============================================
// PREMIUM 3D BUTTON COMPONENT
// ============================================
interface Button3DProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const Button3D: React.FC<Button3DProps> = ({ children, variant = 'primary', onClick, className = '', icon, size = 'md' }) => {
    const variants = {
        primary: `
            bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan
            bg-[length:200%_100%]
            animate-gradient-shift
            text-white font-bold
            shadow-btn-3d
            hover:shadow-neon-cyan
            active:shadow-btn-3d-pressed active:translate-y-1
        `,
        secondary: `
            bg-white text-gray-900 font-semibold
            border-2 border-gray-200
            shadow-3d-card
            hover:border-neon-cyan hover:shadow-3d-glow-cyan
        `,
        ghost: `
            bg-transparent text-gray-600
            hover:text-neon-purple hover:bg-gray-50
            font-medium
        `,
        outline: `
            bg-transparent text-neon-purple font-semibold
            border-2 border-neon-purple/30
            hover:bg-neon-purple/10 hover:border-neon-purple
        `
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                ${sizes[size]}
                rounded-full
                flex items-center justify-center gap-2
                transition-all duration-300
                cursor-pointer
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
            {icon && <span>{icon}</span>}
        </motion.button>
    );
};

// ============================================
// FLOATING AI ORB COMPONENT
// ============================================
const FloatingOrb: React.FC<{ color: string; size: string; position: string; delay: number }> = ({
    color, size, position, delay
}) => (
    <motion.div
        className={`absolute ${position} ${size} rounded-full blur-xl opacity-30 pointer-events-none`}
        style={{ background: color }}
        animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
        }}
        transition={{
            duration: 6 + delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

// ============================================
// FEATURE CARD WITH OUTCOME
// ============================================
interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    outcome: string;
    description: string;
    color: 'cyan' | 'purple' | 'green' | 'pink';
    delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, outcome, description, color, delay }) => {
    const colorClasses = {
        cyan: 'bg-gradient-to-br from-cyan-400 to-blue-500',
        purple: 'bg-gradient-to-br from-purple-400 to-violet-600',
        green: 'bg-gradient-to-br from-green-400 to-emerald-500',
        pink: 'bg-gradient-to-br from-pink-400 to-rose-500'
    };

    return (
        <Card3D delay={delay} glowColor={color} className="p-6 h-full">
            <div className="flex flex-col items-center text-center h-full">
                <div className={`w-12 h-12 rounded-2xl ${colorClasses[color]} flex items-center justify-center mb-4 shadow-lg shadow-${color}-500/20`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-neon-purple font-semibold text-xs uppercase tracking-wide mb-3">{outcome}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
        </Card3D>
    );
};

// ============================================
// STAT COMPONENT WITH CONTEXT - REDESIGNED
// ============================================
interface StatProps {
    value: string;
    label: string;
    context?: string;
    icon: React.ElementType;
    color: 'cyan' | 'purple' | 'green' | 'pink';
    delay: number;
}

const StatItemCard: React.FC<StatProps> = ({ value, label, context, icon: Icon, color, delay }) => {
    const iconColors = {
        cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        pink: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="flex-1 min-w-[200px]"
        >
            <Card3D glowColor={color} className="p-6 h-full flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${iconColors[color]}`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
                <div className="text-gray-700 font-bold text-sm mb-1">{label}</div>
                {context && <div className="text-gray-400 text-xs">{context}</div>}
            </Card3D>
        </motion.div>
    );
};

// ============================================
// PROCESS STEP COMPONENT
// ============================================
interface ProcessStepProps {
    number: string;
    title: string;
    description: string;
    microcopy: string;
    color: 'cyan' | 'purple' | 'green' | 'pink';
    delay: number;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description, microcopy, color, delay }) => {
    const colorClasses = {
        cyan: 'from-neon-cyan to-blue-500',
        purple: 'from-neon-purple to-violet-600',
        green: 'from-neon-green to-emerald-500',
        pink: 'from-neon-pink to-rose-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="relative"
        >
            <Card3D className="p-6 text-center h-full" glowColor={color}>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg`}>
                    {number}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-3">{description}</p>
                <p className="text-xs text-gray-400 italic">{microcopy}</p>
            </Card3D>
        </motion.div>
    );
};

// ============================================
// COMPANY LOGO - PREMIUM REDESIGN
// ============================================
const CompanyLogo: React.FC<{ name: string; icon: React.ElementType }> = ({ name, icon: Icon }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.05 }}
        className="px-6 py-4 bg-white/40 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300"
    >
        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white">
            <Icon className="w-5 h-5" />
        </div>
        <span className="text-gray-700 font-bold tracking-tight">{name}</span>
    </motion.div>
);

// ============================================
// MAIN HOME PAGE COMPONENT
// ============================================
const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

    // Features ordered by importance to employers
    const features = [
        {
            icon: Brain,
            title: 'Autonomous AI Agents',
            outcome: 'Reduce recruiter workload by up to 80%',
            description: 'Our AI agents work 24/7 to fully automate screening, evaluation, and candidate ranking with zero human intervention.',
            color: 'cyan' as const
        },
        {
            icon: Zap,
            title: 'Lightning Fast Hiring',
            outcome: '10-minute average time-to-shortlist',
            description: 'Go from job posting to qualified shortlist in minutes, not weeks. Fill urgent roles before competitors even start.',
            color: 'purple' as const
        },
        {
            icon: Target,
            title: 'Precision Matching',
            outcome: '95% candidate-job fit accuracy',
            description: 'AI-powered matching based on skills, experience, culture fit, and growth potential for perfect placements.',
            color: 'green' as const
        },
        {
            icon: Bot,
            title: 'AI Video Interviews',
            outcome: 'Screen 100+ candidates simultaneously',
            description: 'Automated video interviews with behavioral analysis, sentiment detection, and comprehensive candidate reports.',
            color: 'pink' as const
        },
        {
            icon: Shield,
            title: 'AI Anti-Cheating Engine',
            outcome: '99.9% fraud detection rate',
            description: 'Advanced proctoring ensures fair, authentic assessments with real-time fraud detection and verification.',
            color: 'cyan' as const
        },
        {
            icon: Globe,
            title: 'Global Talent Access',
            outcome: 'Access 50+ countries instantly',
            description: 'Connect with verified talent from around the world. No borders, no limits, no visa complications.',
            color: 'purple' as const
        }
    ];

    const processSteps = [
        {
            number: '1',
            title: 'Post Job',
            description: 'Create your job listing with AI-assisted requirements',
            microcopy: 'Import your JD or generate with AI in 30 seconds',
            color: 'cyan' as const
        },
        {
            number: '2',
            title: 'AI Screens',
            description: 'Our AI agents evaluate all applicants instantly',
            microcopy: 'Agents evaluate 1000+ applicants in under 5 minutes',
            color: 'purple' as const
        },
        {
            number: '3',
            title: 'Auto Interview',
            description: 'Candidates complete AI-powered video assessments',
            microcopy: 'Behavioral analysis + skill verification + fraud check',
            color: 'green' as const
        },
        {
            number: '4',
            title: 'Hire Fast',
            description: 'Review ranked candidates and make your decision',
            microcopy: 'Receive a ranked shortlist with full reports, ready to hire',
            color: 'pink' as const
        }
    ];

    const trustedCompanies = ['TechCorp', 'StartupXYZ', 'GlobalInc', 'InnovateCo', 'ScaleUp', 'FutureTech'];

    return (
        <div className="bg-gradient-to-b from-cream via-white to-soft-gray min-h-screen overflow-hidden">
            {/* ============================================ */}
            {/* HERO SECTION */}
            {/* ============================================ */}
            <motion.section
                ref={heroRef}
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
            >
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <FloatingOrb color="linear-gradient(135deg, #00f3ff, #0066ff)" size="w-96 h-96" position="top-1/4 -left-48" delay={0} />
                    <FloatingOrb color="linear-gradient(135deg, #bc13fe, #7c3aed)" size="w-80 h-80" position="top-1/3 right-0" delay={2} />
                    <FloatingOrb color="linear-gradient(135deg, #39FF14, #10b981)" size="w-64 h-64" position="bottom-1/4 left-1/4" delay={1} />
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(0, 243, 255, 0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0, 243, 255, 0.5) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px'
                        }}
                    />
                </div>

                <div className="container mx-auto max-w-7xl px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="order-2 lg:order-1">
                            {/* Audience Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-wrap items-center gap-3 mb-6"
                            >
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/30">
                                    <Building2 className="w-4 h-4 text-neon-cyan" />
                                    <span className="text-sm font-semibold text-gray-700">For Employers</span>
                                </span>
                                <span className="text-gray-400 text-sm">Fast-growing startups & enterprises hiring globally</span>
                            </motion.div>

                            {/* Headline - Refined for readability */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight"
                            >
                                Hire verified talent in{' '}
                                <span className="relative inline-block whitespace-nowrap">
                                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                                        10 minutes
                                    </span>
                                    <motion.div
                                        className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.8, delay: 0.5 }}
                                    />
                                </span>{' '}
                                using autonomous AI agents
                            </motion.h1>

                            {/* Subtext - Clear explanation */}
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-lg text-gray-600 mb-6 max-w-lg leading-relaxed font-medium"
                            >
                                Screen, assess, interview, and shortlist candidates automatically—
                                <strong className="text-gray-900 font-bold">no recruiter needed</strong>. Our AI agents do the heavy lifting 24/7.
                            </motion.p>

                            {/* Social Proof Line */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex items-center gap-2 mb-8"
                            >
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                    <strong className="text-gray-900">Trusted by 10K+ companies</strong> worldwide
                                </span>
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                            </motion.div>

                            {/* CTA Buttons - One primary, others secondary */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4 mb-4"
                            >
                                <Button3D
                                    variant="primary"
                                    size="lg"
                                    onClick={() => navigate('/signup?type=employer')}
                                    icon={<Rocket className="w-5 h-5" />}
                                >
                                    Start Hiring in 10 Minutes
                                </Button3D>
                                <Button3D
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate('/demo')}
                                    icon={<Play className="w-5 h-5" />}
                                >
                                    Watch Demo
                                </Button3D>
                            </motion.div>

                            {/* Risk Reversal */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="text-sm text-gray-500 flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4 text-neon-green" />
                                No credit card required • First job posting free
                            </motion.p>
                        </div>

                        {/* Right Content - Hero Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="order-1 lg:order-2 relative"
                        >
                            <div className="relative">
                                <Card3D className="overflow-hidden" glowColor="cyan">
                                    <img
                                        src="/hero-hiring.png"
                                        alt="AI Hiring Platform"
                                        className="w-full h-auto rounded-4xl"
                                    />
                                </Card3D>
                                {/* Floating Stats Card */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -bottom-6 -left-6 bg-white rounded-3xl shadow-3d-card p-5 border border-white/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-extrabold text-gray-900">10 min</div>
                                            <div className="text-gray-500 text-sm font-medium">Avg. time-to-hire</div>
                                        </div>
                                    </div>
                                </motion.div>
                                {/* Floating Agent Orb */}
                                <motion.div
                                    animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="absolute -top-4 -right-4 bg-gradient-to-br from-neon-purple to-violet-600 rounded-2xl shadow-neon-purple p-4"
                                >
                                    <Bot className="w-8 h-8 text-white" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* ============================================ */}
            {/* TRUSTED BY 200+ HIRING PARTNERS - MARQUEE */}
            {/* ============================================ */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto max-w-7xl px-4 relative z-10">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            Trusted by <span className="bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">200+</span> Hiring Partners
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Our talent gets placed at the world's leading technology companies
                        </motion.p>
                    </div>

                    <div className="relative w-full overflow-hidden mask-linear-fade">
                        <style>{`
                            .mask-linear-fade {
                                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                            }
                        `}</style>

                        {/* First Row of Icons - Tech & Cloud */}
                        <motion.div
                            className="flex gap-16 whitespace-nowrap mb-12"
                            animate={{ x: [0, -1700] }}
                            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                        >
                            {[...Array(3)].map((_, i) => (
                                <React.Fragment key={i}>
                                    {[
                                        { icon: Chrome, color: "text-blue-600", bg: "bg-blue-50" },
                                        { icon: Layout, color: "text-sky-600", bg: "bg-sky-50" },
                                        { icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
                                        { icon: Cpu, color: "text-indigo-600", bg: "bg-indigo-50" },
                                        { icon: Database, color: "text-red-600", bg: "bg-red-50" },
                                        { icon: Cloud, color: "text-cyan-500", bg: "bg-cyan-50" },
                                        { icon: Server, color: "text-violet-600", bg: "bg-violet-50" },
                                        { icon: Github, color: "text-gray-800", bg: "bg-gray-100" },
                                        { icon: Smartphone, color: "text-green-500", bg: "bg-green-50" },
                                    ].map((logo, idx) => (
                                        <div key={idx} className={`w-20 h-20 rounded-2xl ${logo.bg} flex items-center justify-center border border-white/50 shadow-sm mx-4 transform hover:scale-110 transition-transform duration-300`}>
                                            <logo.icon className={`w-10 h-10 ${logo.color}`} strokeWidth={1.5} />
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </motion.div>

                        {/* Second Row of Icons - Tools & Startups */}
                        <motion.div
                            className="flex gap-16 whitespace-nowrap"
                            animate={{ x: [-1700, 0] }}
                            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
                        >
                            {[...Array(3)].map((_, i) => (
                                <React.Fragment key={i}>
                                    {[
                                        { icon: Slack, color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
                                        { icon: Figma, color: "text-purple-600", bg: "bg-purple-50" },
                                        { icon: Box, color: "text-emerald-500", bg: "bg-emerald-50" },
                                        { icon: Command, color: "text-rose-600", bg: "bg-rose-50" },
                                        { icon: Hexagon, color: "text-amber-500", bg: "bg-amber-50" },
                                        { icon: Globe, color: "text-teal-500", bg: "bg-teal-50" },
                                        { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
                                        { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                                        { icon: Video, color: "text-red-500", bg: "bg-red-50" },
                                    ].map((logo, idx) => (
                                        <div key={idx} className={`w-20 h-20 rounded-2xl ${logo.bg} flex items-center justify-center border border-white/50 shadow-sm mx-4 transform hover:scale-110 transition-transform duration-300`}>
                                            <logo.icon className={`w-10 h-10 ${logo.color}`} strokeWidth={1.5} />
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none" />
            </section>

            {/* ============================================ */}
            {/* STATS SECTION - REDESIGNED GRID */}
            {/* ============================================ */}
            <section className="py-24 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto max-w-7xl px-4 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        <StatItemCard
                            value="10 min"
                            label="Avg. time-to-hire"
                            context="From post to shortlist"
                            icon={Clock}
                            color="cyan"
                            delay={0.1}
                        />
                        <StatItemCard
                            value="85%"
                            label="Faster hiring"
                            context="vs. traditional methods"
                            icon={Zap}
                            color="purple"
                            delay={0.2}
                        />
                        <StatItemCard
                            value="500K+"
                            label="Successful hires"
                            context="Since 2023"
                            icon={CheckCircle}
                            color="green"
                            delay={0.3}
                        />
                        <StatItemCard
                            value="95%"
                            label="Client satisfaction"
                            context="Based on surveys"
                            icon={Star}
                            color="pink"
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FEATURES SECTION - REORDERED WITH OUTCOMES */}
            {/* ============================================ */}
            <section className="py-24 relative">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/30 mb-4"
                        >
                            <Cpu className="w-4 h-4 text-neon-purple" />
                            <span className="text-sm font-semibold text-neon-purple">AI-Powered Features</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            Why 10K+ Companies Choose HireGo
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Measurable results from day one—not promises
                        </motion.p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                outcome={feature.outcome}
                                description={feature.description}
                                color={feature.color}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* HOW IT WORKS - WITH MICROCOPY */}
            {/* ============================================ */}
            <section className="py-24 relative bg-gradient-to-b from-soft-gray to-white">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-4"
                        >
                            <Zap className="w-4 h-4 text-neon-green" />
                            <span className="text-sm font-semibold text-neon-green">4-Step Process</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            From Job Posting to Hire in Minutes
                        </motion.h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {processSteps.map((step, index) => (
                            <div key={index} className="relative">
                                <ProcessStep {...step} delay={index * 0.15} />
                                {index < processSteps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="w-6 h-6 text-gray-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* TESTIMONIAL / SOCIAL PROOF */}
            {/* ============================================ */}
            {/* ============================================ */}
            {/* TESTIMONIAL / SOCIAL PROOF - MARQUEE */}
            {/* ============================================ */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto max-w-7xl px-4 mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4"
                    >
                        <Quote className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-amber-600">Client Success Stories</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">What HR Leaders Are Saying</h2>
                    <p className="text-xl text-gray-600">Real feedback from teams that scaled with HireGo</p>
                </div>

                <div className="relative w-full mask-linear-fade">
                    <style>{`
                        .mask-linear-fade {
                            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                        }
                    `}</style>
                    <motion.div
                        className="flex gap-6 py-4"
                        animate={{ x: [0, -3800] }}
                        transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
                    >
                        {/* Duplicating array for seamless loop */}
                        {[...[
                            { name: "Priya Sharma", role: "HR Director, TCS", quote: "HireGo's AI agents slashed our time-to-hire by 70%. We closed 15 senior dev roles in a week.", color: "cyan" },
                            { name: "James Wilson", role: "CTO, Microsoft", quote: "The technical assessments vary dynamically. It's impossible to cheat, and the candidates we get are top-tier.", color: "purple" },
                            { name: "Anita Desai", role: "Talent Lead, Infosys", quote: "Finally, an AI tool that actually understands 'culture fit'. The candidate summaries are scary accurate.", color: "green" },
                            { name: "Rahul Verma", role: "Founder, Razorpay", quote: "As a small team, we couldn't afford a recruiter. HireGo acted as our entire HR department for a fraction of the cost.", color: "pink" },
                            { name: "Sarah Jenkins", role: "VP of People, Accenture", quote: "The video interview analysis helped us spot soft skills we usually miss. A game changer for remote hiring.", color: "cyan" },
                            { name: "Amit Patel", role: "Eng Manager, Swiggy", quote: "I used to spend 20 hours a week screening resumes. Now I spend zero. The shortlist is always spot on.", color: "purple" },
                            { name: "Emily Chen", role: "Recruiting Mgr, Amazon", quote: "The global reach is real. We hired developers from Brazil and India seamlessly through the platform.", color: "green" },
                            { name: "Vikram Singh", role: "Ops Director, Zomato", quote: "Speed is everything. Using HireGo, we went from job post to offer letter in just 3 days.", color: "pink" },
                            { name: "Lisa Thompson", role: "Head of Talent, Deloitte", quote: "The candidate experience is fantastic. They love the instant feedback and smooth process.", color: "cyan" },
                            { name: "Arjun Reddy", role: "CEO, Ola", quote: "We practice what we preach. We built our entire core AI team using HireGo's own agents.", color: "purple" }
                        ], ...[
                            { name: "Priya Sharma", role: "HR Director, TCS", quote: "HireGo's AI agents slashed our time-to-hire by 70%. We closed 15 senior dev roles in a week.", color: "cyan" },
                            { name: "James Wilson", role: "CTO, Microsoft", quote: "The technical assessments vary dynamically. It's impossible to cheat, and the candidates we get are top-tier.", color: "purple" },
                            { name: "Anita Desai", role: "Talent Lead, Infosys", quote: "Finally, an AI tool that actually understands 'culture fit'. The candidate summaries are scary accurate.", color: "green" },
                            { name: "Rahul Verma", role: "Founder, Razorpay", quote: "As a small team, we couldn't afford a recruiter. HireGo acted as our entire HR department for a fraction of the cost.", color: "pink" },
                            { name: "Sarah Jenkins", role: "VP of People, Accenture", quote: "The video interview analysis helped us spot soft skills we usually miss. A game changer for remote hiring.", color: "cyan" },
                            { name: "Amit Patel", role: "Eng Manager, Swiggy", quote: "I used to spend 20 hours a week screening resumes. Now I spend zero. The shortlist is always spot on.", color: "purple" },
                            { name: "Emily Chen", role: "Recruiting Mgr, Amazon", quote: "The global reach is real. We hired developers from Brazil and India seamlessly through the platform.", color: "green" },
                            { name: "Vikram Singh", role: "Ops Director, Zomato", quote: "Speed is everything. Using HireGo, we went from job post to offer letter in just 3 days.", color: "pink" },
                            { name: "Lisa Thompson", role: "Head of Talent, Deloitte", quote: "The candidate experience is fantastic. They love the instant feedback and smooth process.", color: "cyan" },
                            { name: "Arjun Reddy", role: "CEO, Ola", quote: "We practice what we preach. We built our entire core AI team using HireGo's own agents.", color: "purple" }
                        ]].map((testimonial, i) => (
                            <div key={i} className="w-[350px] flex-shrink-0">
                                <Card3D className="p-6 h-full" glowColor={testimonial.color as any}>
                                    <div className="flex flex-col h-full">
                                        <div className="mb-4 flex-1">
                                            <div className="flex gap-1 text-amber-500 mb-3">
                                                {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-3 h-3 fill-current" />)}
                                            </div>
                                            <p className="text-base text-gray-700 italic leading-relaxed">"{testimonial.quote}"</p>
                                        </div>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color === 'cyan' ? 'from-cyan-400 to-blue-500' : testimonial.color === 'purple' ? 'from-purple-400 to-violet-600' : testimonial.color === 'green' ? 'from-green-400 to-emerald-500' : 'from-pink-400 to-rose-500'}`} />
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{testimonial.name}</div>
                                                <div className="text-xs text-gray-500 font-medium">{testimonial.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card3D>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FOR CANDIDATES / SKILLS SECTION */}
            {/* ============================================ */}
            <section className="py-24 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <FloatingOrb color="linear-gradient(135deg, #39FF14, #10b981)" size="w-64 h-64" position="top-0 right-0" delay={0} />
                    <FloatingOrb color="linear-gradient(135deg, #00f3ff, #0066ff)" size="w-48 h-48" position="bottom-0 left-0" delay={1} />
                </div>
                <div className="container mx-auto max-w-7xl px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {/* Audience Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-green/10 to-emerald-500/10 border border-neon-green/30 mb-6"
                            >
                                <GraduationCap className="w-4 h-4 text-neon-green" />
                                <span className="text-sm font-semibold text-gray-700">For Candidates in India</span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
                            >
                                Upskill with AI & Get{' '}
                                <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
                                    Matched to Top Companies
                                </span>
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-gray-600 mb-8 leading-relaxed"
                            >
                                Take AI-driven skill assessments, earn verified certifications,
                                and get automatically matched to companies hiring for your exact skillset.
                            </motion.p>

                            {/* Benefits List */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4 mb-8"
                            >
                                {[
                                    { icon: BadgeCheck, text: 'Industry-recognized certifications' },
                                    { icon: Target, text: 'AI-powered job matching to 200+ companies' },
                                    { icon: TrendingUp, text: '85% placement rate for certified learners' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
                                            <item.icon className="w-4 h-4 text-neon-green" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item.text}</span>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Two distinct CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Button3D
                                    variant="primary"
                                    onClick={() => navigate('/skill-development')}
                                    icon={<FileText className="w-5 h-5" />}
                                    className="!bg-gradient-to-r !from-neon-green !via-emerald-500 !to-neon-green"
                                >
                                    Take Skill Assessment
                                </Button3D>
                                <Button3D
                                    variant="secondary"
                                    onClick={() => navigate('/jobs')}
                                    icon={<Briefcase className="w-5 h-5" />}
                                >
                                    View Matching Jobs
                                </Button3D>
                            </motion.div>
                        </div>

                        {/* Right Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Card3D className="overflow-hidden" glowColor="green">
                                <img
                                    src="/hero-skills.png"
                                    alt="Skill Development"
                                    className="w-full h-auto rounded-4xl"
                                />
                            </Card3D>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FINAL CTA SECTION */}
            {/* ============================================ */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-space-dark via-space-blue to-space-dark" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <FloatingOrb color="rgba(0, 243, 255, 0.3)" size="w-64 h-64" position="-top-32 -left-32" delay={0} />
                    <FloatingOrb color="rgba(188, 19, 254, 0.3)" size="w-96 h-96" position="-bottom-48 -right-48" delay={2} />
                </div>
                <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                            Ready to Hire Smarter, Faster?
                        </h2>
                        <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
                            Join 10,000+ companies using HireGo AI to find the best talent in record time.
                        </p>
                        <p className="text-gray-400 mb-10 flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-neon-green" />
                            No credit card required • First job posting free • Setup in 2 minutes
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button3D
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/signup?type=employer')}
                                icon={<ArrowRight className="w-5 h-5" />}
                            >
                                Start Hiring for Free
                            </Button3D>
                            <Button3D
                                variant="secondary"
                                size="lg"
                                onClick={() => navigate('/contact')}
                            >
                                Talk to Sales
                            </Button3D>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <footer className="py-16 bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid md:grid-cols-4 gap-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/hirego-logo.png"
                                    alt="HireGo AI"
                                    className="h-20 w-auto object-contain"
                                />
                            </div>
                            <p className="text-gray-600 max-w-md">
                                The world's fastest autonomous AI hiring platform. Revolutionizing recruitment with intelligent agents.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">For Employers</h4>
                            <ul className="space-y-3">
                                <li><Link to="/post-job-public" className="text-gray-600 hover:text-neon-cyan transition-colors">Post a Job</Link></li>
                                <li><Link to="/ai-features" className="text-gray-600 hover:text-neon-cyan transition-colors">AI Features</Link></li>
                                <li><Link to="/pricing" className="text-gray-600 hover:text-neon-cyan transition-colors">Pricing</Link></li>
                                <li><Link to="/enterprise" className="text-gray-600 hover:text-neon-cyan transition-colors">Enterprise</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">For Candidates</h4>
                            <ul className="space-y-3">
                                <li><Link to="/skill-development" className="text-gray-600 hover:text-neon-cyan transition-colors">Skill Assessments</Link></li>
                                <li><Link to="/find-jobs" className="text-gray-600 hover:text-neon-cyan transition-colors">Find Jobs</Link></li>
                                <li><Link to="/certifications" className="text-gray-600 hover:text-neon-cyan transition-colors">Certifications</Link></li>
                                <li><Link to="/career-resources" className="text-gray-600 hover:text-neon-cyan transition-colors">Career Resources</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
                        <p>© 2026 HireGo AI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
