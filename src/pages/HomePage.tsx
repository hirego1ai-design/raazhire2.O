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
    Github,
    Cloud,
    Chrome
} from 'lucide-react';
// import AnimatedGlobe from '../components/AnimatedGlobe'; // Removed as user preferred image

// ============================================
// 3D FLOATING CARD COMPONENT
// ============================================
interface Card3DProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    glowColor?: 'cyan' | 'purple' | 'green' | 'pink' | 'india';
}

const Card3D: React.FC<Card3DProps> = ({ children, className = '', delay = 0, glowColor = 'cyan' }) => {
    const glowColors = {
        cyan: 'from-hg-blue via-accent-cyan to-hg-green',
        purple: 'from-accent-violet via-accent-pink to-hg-red',
        green: 'from-hg-green via-accent-cyan to-hg-blue',
        pink: 'from-hg-red via-accent-orange to-hg-yellow',
        india: 'from-[#FF9933]/40 via-white/80 to-[#138808]/40'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay }}
            className={`
                relative overflow-hidden
                bg-white
                rounded-xl
                border border-light-border
                hover:border-hg-blue/40
                shadow-colorful-md hover:shadow-card-hover
                transition-all duration-500 ease-out
                group
                cursor-pointer
                ${className}
            `}
        >
            {/* Animated gradient border - PERMANENTLY VISIBLE */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${glowColors[glowColor]} opacity-70 transition-opacity duration-500 -z-10 blur-xl`} />

            {/* Top highlight - PERMANENTLY VISIBLE */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-hg-blue/40 to-transparent opacity-100 transition-opacity duration-500" />

            {/* Content */}
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
            bg-gradient-to-r from-hg-blue to-accent-violet text-white font-bold
            hover:from-hg-blue hover:to-hg-red
            shadow-button-glow hover:shadow-colorful-lg
        `,
        secondary: `
            bg-white text-text-primary font-semibold
            border-2 border-hg-blue/20 hover:border-hg-blue
            hover:bg-hg-blue/5
            shadow-colorful-sm hover:shadow-colorful-md
        `,
        ghost: `
            bg-transparent text-hg-blue
            hover:text-hg-red hover:bg-hg-blue/5
            font-semibold
        `,
        outline: `
            bg-transparent text-hg-blue font-bold
            border-2 border-hg-blue
            hover:bg-hg-blue hover:text-white
            transition-colors
        `
    };

    const sizes = {
        sm: 'px-5 py-2.5 text-sm',
        md: 'px-7 py-3.5',
        lg: 'px-10 py-5 text-lg'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                ${sizes[size]}
                rounded-xl
                flex items-center justify-center gap-3
                transition-all duration-300
                cursor-pointer
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
            {icon && <span className="animate-bounce-slow">{icon}</span>}
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
        className={`absolute ${position} ${size} rounded-full blur-[120px] opacity-20 pointer-events-none`}
        style={{ background: color }}
        animate={{
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
        }}
        transition={{
            duration: 8 + delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

// ============================================
// 3D GREEN SQUARE BOX COMPONENT
// ============================================
const ThreeDSquareBox: React.FC<{ size?: string; className?: string; delay?: number }> = ({ size = "w-24 h-24", className = "", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, rotateX: 45, rotateY: -45, scale: 0.8 }}
        whileInView={{ opacity: 1, rotateX: 25, rotateY: -25, scale: 1 }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className={`relative ${size} ${className}`}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
        {/* Front - Soft Saffron (Orange) */}
        <div className="absolute inset-0 bg-[#FF9933]/60 shadow-lg border border-white/20" style={{ transform: "translateZ(50px)" }} />
        {/* Back - Soft Green */}
        <div className="absolute inset-0 bg-[#138808]/50 opacity-90" style={{ transform: "translateZ(-50px) rotateY(180deg)" }} />
        {/* Right - Milky White */}
        <div className="absolute inset-0 bg-white/80" style={{ transform: "rotateY(90deg) translateZ(50px)" }} />
        {/* Left - Soft Navy (Chakra color) */}
        <div className="absolute inset-0 bg-[#000080]/20" style={{ transform: "rotateY(-90deg) translateZ(50px)" }} />
        {/* Top - Very Light Saffron */}
        <div className="absolute inset-0 bg-[#FFB366]/40" style={{ transform: "rotateX(90deg) translateZ(50px)" }} />
        {/* Bottom - Very Light Green */}
        <div className="absolute inset-0 bg-[#90EE90]/40" style={{ transform: "rotateX(-90deg) translateZ(50px)" }} />

        {/* Glow effect - Subtle Tricolor Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933]/10 via-white/10 to-[#138808]/10 blur-3xl opacity-20 -z-10 animate-pulse-soft" />
    </motion.div>
);

// ============================================
// FEATURE CARD WITH OUTCOME
// ============================================
interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    outcome: string;
    description: string;
    color: 'cyan' | 'purple' | 'green' | 'pink' | 'india';
    delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, outcome, description, color, delay }) => {
    const colorMap = {
        cyan: { bg: 'bg-hg-blue/10', border: 'border-hg-blue/20', text: 'text-hg-blue', accent: 'text-hg-blue' },
        purple: { bg: 'bg-accent-violet/10', border: 'border-accent-violet/20', text: 'text-accent-violet', accent: 'text-hg-red' },
        green: { bg: 'bg-hg-green/10', border: 'border-hg-green/20', text: 'text-hg-green', accent: 'text-hg-green' },
        pink: { bg: 'bg-hg-red/10', border: 'border-hg-red/20', text: 'text-hg-red', accent: 'text-hg-yellow' },
        india: { bg: 'bg-[#FF9933]/10', border: 'border-[#FF9933]/20', text: 'text-[#FF9933]', accent: 'text-[#138808]' }
    };

    return (
        <Card3D delay={delay} glowColor="india" className="p-8 h-full flex flex-col items-center text-center">
            <div className="flex flex-col h-full items-center">
                <div className={`w-16 h-16 rounded-xl ${colorMap[color].bg} border ${colorMap[color].border} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${colorMap[color].text}`} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
                <p className={`text-xs font-bold ${colorMap[color].accent} uppercase tracking-widest mb-4`}>{outcome}</p>
                <p className="text-text-secondary leading-relaxed text-sm max-w-[250px]">{description}</p>
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
    color: 'cyan' | 'purple' | 'green' | 'pink' | 'india';
    delay: number;
}

const StatItemCard: React.FC<StatProps> = ({ value, label, context, icon: Icon, color, delay }) => {
    const colorMap = {
        cyan: { gradient: 'from-hg-blue to-accent-cyan', text: 'text-hg-blue' },
        purple: { gradient: 'from-accent-violet to-hg-red', text: 'text-accent-violet' },
        green: { gradient: 'from-hg-green to-accent-cyan', text: 'text-hg-green' },
        pink: { gradient: 'from-hg-red to-hg-yellow', text: 'text-hg-red' },
        india: { gradient: 'from-[#FF9933] to-[#138808]', text: 'text-[#FF9933]' }
    };

    return (
        <Card3D delay={delay} glowColor="india" className="p-8 h-full flex flex-col items-center text-center">
            <div className={`text-5xl font-black bg-gradient-to-r ${colorMap[color].gradient} bg-clip-text text-transparent mb-3 tracking-tighter`}>{value}</div>
            <div className="text-sm font-bold text-text-primary uppercase tracking-[0.15em] mb-2">{label}</div>
            {context && <div className="text-xs text-text-tertiary font-medium">{context}</div>}
        </Card3D>
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
    color: 'cyan' | 'purple' | 'green' | 'pink' | 'india';
    delay: number;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description, microcopy, color, delay }) => {
    const colorMap = {
        cyan: { bg: 'bg-gradient-to-br from-hg-blue to-accent-cyan', text: 'text-white' },
        purple: { bg: 'bg-gradient-to-br from-accent-violet to-hg-red', text: 'text-white' },
        green: { bg: 'bg-gradient-to-br from-hg-green to-accent-cyan', text: 'text-white' },
        pink: { bg: 'bg-gradient-to-br from-hg-red to-hg-yellow', text: 'text-white' },
        india: { bg: 'bg-gradient-to-br from-[#FF9933] to-[#138808]', text: 'text-white' }
    };

    return (
        <Card3D delay={delay} glowColor="india" className="p-8 text-center h-full">
            <div className={`w-14 h-14 rounded-xl ${colorMap[color].bg} ${colorMap[color].text} font-black text-xl flex items-center justify-center mx-auto mb-6 shadow-colorful-md group-hover:scale-110 transition-transform duration-300`}>
                {number}
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">{description}</p>
            <p className="text-[10px] text-hg-blue font-bold uppercase tracking-widest">{microcopy}</p>
        </Card3D>
    );
};

// ============================================
// COMPANY LOGO - PREMIUM REDESIGN
// ============================================
const CompanyLogo: React.FC<{ name: string; icon: React.ElementType }> = ({ name, icon: Icon }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.05 }}
        className="px-6 py-4 bg-white rounded-xl border border-light-border shadow-colorful-sm hover:shadow-colorful-md flex items-center gap-3 transition-all duration-300 cursor-pointer group"
    >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-hg-blue to-accent-violet flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
        </div>
        <span className="text-text-primary font-bold tracking-tight">{name}</span>
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

    const heroOpacity = 1;
    const heroScale = 1;

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
        <div className="bg-gradient-hero min-h-screen overflow-hidden max-w-full w-full">
            {/* ============================================ */}
            {/* HERO SECTION */}
            {/* ============================================ */}
            {/* HERO SECTION */}
            {/* ============================================ */}
            <motion.section
                ref={heroRef}
                className="relative pt-32 pb-40 overflow-hidden min-h-[90vh] flex flex-col justify-center w-full max-w-full"
            >
                {/* Full Width World Map Background */}
                <div className="absolute inset-0 z-0 select-none overflow-hidden">
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <img
                            src="/images/full_page_world_map_hero.png"
                            alt="Global Hiring Network"
                            className="w-full h-full object-cover object-center"
                        />
                    </motion.div>

                    {/* Light Overlay - Reduced darkness, world map clearly visible */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-[#F8FAFF]/90" />
                </div>

                <div className="container mx-auto max-w-5xl px-6 relative z-10 text-center w-full">
                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tighter drop-shadow-2xl"
                    >
                        <span className="text-white">World's </span>
                        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Fastest Hiring</span>
                        <br />
                        <span className="text-white">Platform.</span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-slate-200 mb-10 max-w-3xl mx-auto leading-relaxed px-4 font-medium drop-shadow-md"
                    >
                        Reducing recruitment time by up to <span className="text-cyan-400 font-bold">90%</span>. Screen, assess, and interview candidates automatically with intelligent agents across the globe.
                    </motion.p>

                    {/* Impact CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
                    >
                        <Button3D
                            variant="primary"
                            size="lg"
                            className="w-full sm:w-auto min-w-[220px] shadow-2xl shadow-cyan-500/20 box-border border-white/10"
                            onClick={() => navigate('/signup?type=employer')}
                        >
                            Get Started Free
                        </Button3D>
                        <div className="backdrop-blur-md rounded-xl">
                            <Button3D
                                variant="outline" // This might need style override for white text
                                size="lg"
                                className="w-full sm:w-auto min-w-[220px] !text-white !border-white/30 hover:!bg-white/10"
                                onClick={() => navigate('/demo')}
                            >
                                Watch Demo
                            </Button3D>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* ============================================ */}
            {/* TRUSTED BY - COLORFUL TICKER */}
            {/* ============================================ */}
            <section className="py-12 bg-white relative border-y border-light-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-20 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-center text-xl md:text-2xl font-bold text-text-primary mb-8 tracking-tight opacity-90">
                        Trusted by 10,000+ companies worldwide
                    </h2>

                    {/* 3D Curved Box Container */}
                    <div className="relative max-w-5xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-hg-blue/5 via-white/40 to-hg-green/5 blur-xl rounded-[2rem] transform rotate-1 opacity-50" />

                        <div className="relative bg-white/60 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-[2rem] p-8 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">

                            <motion.div
                                className="flex gap-16 whitespace-nowrap items-center"
                                animate={{ x: [0, -1000] }}
                                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                            >
                                {[...Array(4)].map((_, i) => (
                                    <React.Fragment key={i}>
                                        {[
                                            { name: "Google", icon: Chrome, color: 'text-hg-blue' },
                                            { name: "Salesforce", icon: Cloud, color: 'text-hg-green' },
                                            { name: "Amazon", icon: ShoppingBag, color: 'text-hg-yellow' },
                                            { name: "Apple", icon: Command, color: 'text-hg-red' },
                                            { name: "Microsoft", icon: Layout, color: 'text-hg-blue' },
                                            { name: "Slack", icon: Slack, color: 'text-accent-violet' },
                                            { name: "Tesla", icon: Zap, color: 'text-hg-red' },
                                            { name: "Airbnb", icon: Star, color: 'text-hg-green' }
                                        ].map((company, idx) => (
                                            <div
                                                key={`${i}-${idx}`}
                                                className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300"
                                            >
                                                <company.icon className={`w-8 h-8 ${company.color} filter drop-shadow-sm`} />
                                                <span className="text-xl font-bold text-text-primary tracking-tight">{company.name}</span>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* STATS SECTION */}
            {/* ============================================ */}
            <section className="py-10 relative bg-mesh-colorful">
                <div className="container mx-auto max-w-6xl px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl lg:text-3xl font-black text-text-primary mb-3">Trusted Results Worldwide</h2>
                        <p className="text-text-secondary">Join companies across 🇺🇸 🇨🇦 🇬🇧 🇦🇺 🇦🇪 🇪🇺</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatItemCard
                            value="10 min"
                            label="Avg. time-to-hire"
                            context="Industry lead: 45 days"
                            icon={Clock}
                            color="cyan"
                            delay={0.1}
                        />
                        <StatItemCard
                            value="85%"
                            label="Cost Reduction"
                            context="Global average save"
                            icon={Zap}
                            color="purple"
                            delay={0.2}
                        />
                        <StatItemCard
                            value="500K+"
                            label="Successful Hires"
                            context="Across 12 countries"
                            icon={CheckCircle}
                            color="green"
                            delay={0.3}
                        />
                        <StatItemCard
                            value="99.9%"
                            label="Accuracy Rate"
                            context="Verified AI matching"
                            icon={Star}
                            color="pink"
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FEATURES SECTION */}
            {/* ============================================ */}
            <section className="py-12 relative bg-light-bg overflow-hidden border-t border-light-border">
                {/* Decorative squares for features */}
                <ThreeDSquareBox size="w-24 h-24" className="absolute -top-10 -left-10 opacity-20" delay={0.3} />
                <ThreeDSquareBox size="w-16 h-16" className="absolute bottom-10 right-10 opacity-15" delay={0.6} />

                <div className="container mx-auto max-w-6xl px-6 text-center">
                    <div className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">Built for scale.</h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto text-center px-4">Premium features designed for modern engineering teams and global enterprises.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            {/* AI DASHBOARD PREVIEW */}
            {/* ============================================ */}
            <section className="py-10 relative overflow-hidden bg-gradient-to-b from-light-muted to-light-bg">
                {/* Decorative squares for AI dashboard */}
                <ThreeDSquareBox size="w-20 h-20" className="absolute top-10 right-[10%] opacity-20" delay={0.4} />
                <ThreeDSquareBox size="w-12 h-12" className="absolute bottom-20 left-[5%] opacity-15" delay={0.7} />

                <div className="container mx-auto max-w-6xl px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-accent-blue/5 blur-[100px] rounded-full" />
                            <div className="relative rounded-xl border border-light-border overflow-hidden shadow-light-xl">
                                <img
                                    src="/images/ai-dashboard.png"
                                    alt="Management Dashboard"
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-accent-blue/10 border border-accent-blue/20 mb-6">
                                <Bot className="w-4 h-4 text-accent-blue" />
                                <span className="text-xs font-bold text-accent-blue uppercase tracking-wider">AI Intelligence</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-text-primary mb-4 leading-tight">
                                Management <br />
                                <span className="text-text-tertiary">at your fingertips.</span>
                            </h2>
                            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                                Our AI goes beyond resumes. Get deep behavioral insights, skill verification, and culture fit analysis in a single, intuitive dashboard.
                            </p>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div>
                                    <div className="text-3xl font-bold text-text-primary mb-1">98.5%</div>
                                    <div className="text-sm text-text-tertiary font-medium">Matching Accuracy</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-text-primary mb-1">10 min</div>
                                    <div className="text-sm text-text-tertiary font-medium">Time to Shortlist</div>
                                </div>
                            </div>

                            <Button3D variant="outline" size="lg" onClick={() => navigate('/ai-features')}>
                                Explore AI Features
                            </Button3D>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* HOW IT WORKS */}
            {/* ============================================ */}
            <section className="py-12 relative bg-white border-t border-light-border">
                <div className="absolute inset-0 bg-mesh-colorful opacity-50 pointer-events-none" />
                {/* Decorative squares for How it works */}
                <ThreeDSquareBox size="w-16 h-16" className="absolute top-20 left-[5%] opacity-20" delay={0.2} />
                <ThreeDSquareBox size="w-24 h-24" className="absolute bottom-20 right-[5%] opacity-15" delay={0.5} />

                <div className="container mx-auto max-w-6xl px-6 text-center mb-12 relative z-10 w-full">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
                        <span className="text-text-primary">Simple, </span>
                        <span className="bg-gradient-to-r from-hg-blue to-hg-green bg-clip-text text-transparent">yet powerful.</span>
                    </h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">From job posting to offer letter in record time.</p>
                </div>

                <div className="container mx-auto max-w-6xl px-6 relative z-10">
                    <div className="grid md:grid-cols-4 gap-6">
                        {processSteps.map((step, index) => (
                            <ProcessStep key={index} {...step} delay={index * 0.1} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* TESTIMONIALS */}
            {/* ============================================ */}
            <section className="py-12 relative bg-light-muted border-y border-light-border overflow-hidden">
                {/* Decorative squares for Testimonials */}
                <ThreeDSquareBox size="w-24 h-24" className="absolute top-0 right-0 opacity-10" delay={0.5} />
                <ThreeDSquareBox size="w-24 h-24" className="absolute bottom-0 left-0 opacity-10" delay={0.9} />

                <div className="container mx-auto max-w-6xl px-6 text-center mb-10 w-full">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-text-primary mb-4">Trusted by leaders.</h2>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto px-4">See why the world's best companies hire with HireGo.</p>
                </div>

                <div className="relative w-full overflow-hidden">
                    <motion.div
                        className="flex gap-6"
                        animate={{ x: [0, -2000] }}
                        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                    >
                        {[...Array(2)].map((_, i) => (
                            <React.Fragment key={i}>
                                {[
                                    { name: "Priya Sharma", role: "HR Director, TCS", quote: "HireGo's AI agents slashed our time-to-hire by 70%. We closed 15 senior dev roles in a week." },
                                    { name: "James Wilson", role: "CTO, Microsoft", quote: "The technical assessments vary dynamically. It's impossible to cheat, and the candidates are top-tier." },
                                    { name: "Anita Desai", role: "Talent Lead, Infosys", quote: "Finally, an AI tool that actually understands 'culture fit'. The candidate summaries are scary accurate." },
                                    { name: "Rahul Verma", role: "Founder, Razorpay", quote: "As a small team, we couldn't afford a recruiter. HireGo acted as our entire HR department." }
                                ].map((testi, idx) => (
                                    <div key={idx} className="w-[400px] flex-shrink-0">
                                        <Card3D glowColor="india" className="p-8 h-full bg-light-surface">
                                            <div className="flex gap-1 text-amber-500 mb-6">
                                                {[...Array(5)].map((_, s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                                            </div>
                                            <p className="text-lg text-text-secondary mb-8 font-medium">"{testi.quote}"</p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold">
                                                    {testi.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-primary text-sm">{testi.name}</div>
                                                    <div className="text-xs text-text-tertiary uppercase tracking-wider">{testi.role}</div>
                                                </div>
                                            </div>
                                        </Card3D>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FINAL CTA */}
            {/* ============================================ */}
            <section className="py-10 relative overflow-hidden">
                {/* Vibrant gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-hg-blue/10 via-white to-hg-green/10 pointer-events-none" />
                <div className="absolute inset-0 bg-mesh-colorful pointer-events-none" />

                {/* Decorative squares for Final CTA */}
                <ThreeDSquareBox size="w-32 h-32" className="absolute -top-10 -right-10 opacity-30" delay={0.4} />
                <ThreeDSquareBox size="w-20 h-20" className="absolute -bottom-10 -left-10 opacity-20" delay={0.8} />

                <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 tracking-tighter"
                    >
                        <span className="text-text-primary">Ready to </span>
                        <span className="bg-gradient-to-r from-hg-blue via-accent-violet to-hg-red bg-clip-text text-transparent">scale?</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-text-secondary mb-10 max-w-xl mx-auto leading-relaxed"
                    >
                        Join 10,000+ companies in 🇺🇸 🇨🇦 🇬🇧 🇦🇺 🇦🇪 🇪🇺 using HireGo AI to find the best talent. Start free today.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Button3D variant="primary" size="lg" onClick={() => navigate('/signup')}>
                            Get Started Free 🚀
                        </Button3D>
                        <Button3D variant="secondary" size="lg" onClick={() => navigate('/contact')}>
                            Contact Sales
                        </Button3D>
                    </motion.div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <footer className="py-12 bg-light-surface border-t border-light-border text-text-tertiary">
                <div className="container mx-auto max-w-6xl px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-2">
                            <img src="/hirego-logo.png" alt="HireGo" className="h-12 mb-6 opacity-90" />
                            <p className="max-w-sm mb-8 leading-relaxed text-text-secondary">
                                The global standard for autonomous AI recruitment. Building the future of work with intelligence.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-text-primary font-bold mb-6">Platform</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link to="/features" className="hover:text-text-primary transition-colors">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link></li>
                                <li><Link to="/enterprise" className="hover:text-text-primary transition-colors">Enterprise</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-text-primary font-bold mb-6">Company</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link to="/about" className="hover:text-text-primary transition-colors">About</Link></li>
                                <li><Link to="/careers" className="hover:text-text-primary transition-colors">Careers</Link></li>
                                <li><Link to="/blog" className="hover:text-text-primary transition-colors">Blog</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-light-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest">
                        <p>© 2026 HireGo AI. All rights reserved.</p>
                        <div className="flex gap-8">
                            <Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
                            <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
