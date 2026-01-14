import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    BookOpen,
    Award,
    TrendingUp,
    Users,
    Star,
    Play,
    ArrowRight,
    CheckCircle,
    Brain,
    Target,
    Cpu,
    Rocket,
    ChevronRight,
    Zap,
    Globe,
    Trophy,
    Sparkles,
    BadgeCheck,
    BarChart3,
    Code,
    Briefcase,
    Lightbulb,
    Video
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
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />

            {/* Animated border line */}
            <div className="absolute inset-0 rounded-4xl overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 animate-border-flow"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${glowColor === 'cyan' ? 'rgba(0, 243, 255, 0.5)' : glowColor === 'purple' ? 'rgba(188, 19, 254, 0.5)' : glowColor === 'green' ? 'rgba(57, 255, 20, 0.5)' : 'rgba(255, 0, 110, 0.5)'}, transparent)`,
                        backgroundSize: '200% 100%',
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude',
                        padding: '2px',
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
    variant?: 'primary' | 'secondary' | 'ghost' | 'green';
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
}

const Button3D: React.FC<Button3DProps> = ({ children, variant = 'primary', onClick, className = '', icon }) => {
    const variants = {
        primary: `
            bg-gradient-to-r from-neon-green via-emerald-500 to-neon-green
            bg-[length:200%_100%]
            animate-gradient-shift
            text-white font-bold
            shadow-btn-3d
            hover:shadow-3d-glow-green
            active:shadow-btn-3d-pressed active:translate-y-1
        `,
        secondary: `
            bg-white text-gray-900 font-semibold
            border-2 border-gray-200
            shadow-3d-card
            hover:border-neon-green hover:shadow-3d-glow-green
        `,
        ghost: `
            bg-transparent text-gray-700
            hover:bg-gray-100
            font-medium
        `,
        green: `
            bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan
            bg-[length:200%_100%]
            animate-gradient-shift
            text-white font-bold
            shadow-btn-3d
            hover:shadow-neon-cyan
            active:shadow-btn-3d-pressed active:translate-y-1
        `
    };

    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                px-8 py-4
                rounded-full
                flex items-center justify-center gap-3
                transition-all duration-300
                cursor-pointer
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
            {icon && <span className="ml-1">{icon}</span>}
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
// COURSE CARD COMPONENT
// ============================================
interface CourseCardProps {
    title: string;
    category: string;
    duration: string;
    level: string;
    learners: string;
    rating: string;
    icon: React.ElementType;
    color: 'cyan' | 'purple' | 'green' | 'pink';
    delay: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
    title, category, duration, level, learners, rating, icon: Icon, color, delay
}) => {
    const colorClasses = {
        cyan: 'bg-gradient-to-br from-cyan-400 to-blue-500',
        purple: 'bg-gradient-to-br from-purple-400 to-violet-600',
        green: 'bg-gradient-to-br from-green-400 to-emerald-500',
        pink: 'bg-gradient-to-br from-pink-400 to-rose-500'
    };

    return (
        <Card3D delay={delay} glowColor={color} className="p-6 h-full">
            <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                    <span className="text-xs font-semibold text-neon-purple uppercase tracking-wider">{category}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{title}</h3>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">{duration}</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">{level}</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{learners} learners</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{rating}</span>
                </div>
            </div>
        </Card3D>
    );
};

// ============================================
// BENEFIT CARD COMPONENT
// ============================================
interface BenefitCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    color: 'cyan' | 'purple' | 'green' | 'pink';
    delay: number;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title, description, color, delay }) => {
    const colorClasses = {
        cyan: 'text-neon-cyan',
        purple: 'text-neon-purple',
        green: 'text-neon-green',
        pink: 'text-neon-pink'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="flex items-start gap-4"
        >
            <div className={`w-12 h-12 rounded-2xl bg-white shadow-3d-card flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${colorClasses[color]}`} strokeWidth={2} />
            </div>
            <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-gray-600">{description}</p>
            </div>
        </motion.div>
    );
};

// ============================================
// STAT COUNTER COMPONENT
// ============================================
interface StatProps {
    value: string;
    label: string;
    suffix?: string;
    color: string;
}

const StatCounter: React.FC<StatProps> = ({ value, label, suffix = '', color }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center"
        >
            <div className={`text-4xl md:text-5xl font-extrabold ${color} mb-2`}>
                {value}{suffix}
            </div>
            <div className="text-gray-500 font-medium">{label}</div>
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
// MAIN SKILL DEVELOPMENT PAGE COMPONENT
// ============================================
const SkillDevelopment: React.FC = () => {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

    const courses = [
        {
            icon: Code,
            title: 'Full Stack Development',
            category: 'Technology',
            duration: '6 months',
            level: 'Beginner',
            learners: '45K',
            rating: '4.9',
            color: 'cyan' as const
        },
        {
            icon: Brain,
            title: 'AI & Machine Learning',
            category: 'Data Science',
            duration: '8 months',
            level: 'Intermediate',
            learners: '32K',
            rating: '4.8',
            color: 'purple' as const
        },
        {
            icon: BarChart3,
            title: 'Data Analytics',
            category: 'Analytics',
            duration: '4 months',
            level: 'Beginner',
            learners: '28K',
            rating: '4.7',
            color: 'green' as const
        },
        {
            icon: Briefcase,
            title: 'Digital Marketing',
            category: 'Marketing',
            duration: '3 months',
            level: 'Beginner',
            learners: '52K',
            rating: '4.8',
            color: 'pink' as const
        },
        {
            icon: Lightbulb,
            title: 'Product Management',
            category: 'Business',
            duration: '5 months',
            level: 'Intermediate',
            learners: '18K',
            rating: '4.9',
            color: 'cyan' as const
        },
        {
            icon: Cpu,
            title: 'Cloud Computing',
            category: 'Technology',
            duration: '4 months',
            level: 'Intermediate',
            learners: '22K',
            rating: '4.7',
            color: 'purple' as const
        }
    ];

    const benefits = [
        {
            icon: Trophy,
            title: 'Industry-Recognized Certifications',
            description: 'Earn certificates valued by top companies in India and globally.',
            color: 'cyan' as const
        },
        {
            icon: Video,
            title: 'Live Interactive Sessions',
            description: 'Learn from industry experts through live classes and 1:1 mentoring.',
            color: 'purple' as const
        },
        {
            icon: Target,
            title: 'Job Placement Support',
            description: 'Get guaranteed interview opportunities with our hiring partners.',
            color: 'green' as const
        },
        {
            icon: Zap,
            title: 'AI-Powered Learning',
            description: 'Personalized learning paths adapted to your pace and goals.',
            color: 'pink' as const
        }
    ];

    const partners = [
        'Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Deloitte'
    ];

    return (
        <div className="bg-gradient-to-b from-cream via-white to-soft-gray min-h-screen overflow-hidden">
            {/* ============================================ */}
            {/* HERO SECTION */}
            {/* ============================================ */}
            <motion.section
                ref={heroRef}
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
            >
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Gradient Orbs */}
                    <FloatingOrb color="linear-gradient(135deg, #39FF14, #10b981)" size="w-96 h-96" position="top-1/4 -left-48" delay={0} />
                    <FloatingOrb color="linear-gradient(135deg, #00f3ff, #0066ff)" size="w-80 h-80" position="top-1/3 right-0" delay={2} />
                    <FloatingOrb color="linear-gradient(135deg, #bc13fe, #7c3aed)" size="w-64 h-64" position="bottom-1/4 left-1/4" delay={1} />

                    {/* Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(57, 255, 20, 0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(57, 255, 20, 0.5) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px'
                        }}
                    />
                </div>

                <div className="container mx-auto max-w-7xl px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="order-2 lg:order-1">
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-green/10 to-emerald-500/10 border border-neon-green/30 mb-6"
                            >
                                <GraduationCap className="w-4 h-4 text-neon-green" />
                                <span className="text-sm font-semibold text-neon-green">
                                    India's #1 Skill Platform
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6"
                            >
                                Unlock Your{' '}
                                <span className="relative inline-block">
                                    <span className="bg-gradient-to-r from-neon-green via-emerald-500 to-neon-cyan bg-clip-text text-transparent">
                                        Future
                                    </span>
                                    <motion.div
                                        className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-neon-green to-neon-cyan rounded-full"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.8, delay: 0.5 }}
                                    />
                                </span>{' '}
                                With AI-Powered Skills
                            </motion.h1>

                            {/* Supporting Text */}
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-2xl md:text-3xl font-bold text-gray-800 mb-4"
                            >
                                Learn. Upskill. Get <span className="text-neon-green">Hired</span>.
                            </motion.p>

                            {/* Subtext */}
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed"
                            >
                                Transform your career with industry-relevant skills.
                                Our AI-powered platform creates <strong className="text-gray-900">personalized learning paths</strong> and
                                connects you directly with hiring companies.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4 mb-8"
                            >
                                <Button3D
                                    variant="primary"
                                    onClick={() => navigate('/signup?type=learner')}
                                    icon={<Rocket className="w-5 h-5" />}
                                >
                                    Start Learning Free
                                </Button3D>
                                <Button3D
                                    variant="secondary"
                                    onClick={() => navigate('/courses')}
                                    icon={<BookOpen className="w-5 h-5" />}
                                >
                                    Explore Courses
                                </Button3D>
                            </motion.div>

                            {/* Back to Home Link */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                <button
                                    onClick={() => navigate('/')}
                                    className="group flex items-center gap-2 text-gray-600 hover:text-neon-cyan transition-colors cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    <span>Back to AI Hiring Platform</span>
                                </button>
                            </motion.div>
                        </div>

                        {/* Right Content - Hero Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="order-1 lg:order-2 relative"
                        >
                            <div className="relative">
                                {/* Main Hero Image */}
                                <Card3D className="overflow-hidden" glowColor="green">
                                    <img
                                        src="/hero-skills.png"
                                        alt="Skill Development Platform"
                                        className="w-full h-auto rounded-4xl"
                                    />
                                </Card3D>

                                {/* Floating Certification Badge */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -bottom-6 -left-6 bg-white rounded-3xl shadow-3d-card p-6 border border-white/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                            <Award className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-extrabold text-gray-900">50K+</div>
                                            <div className="text-gray-500 font-medium">Certifications</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Growth Icon */}
                                <motion.div
                                    animate={{
                                        y: [0, -15, 0],
                                        rotate: [0, 5, 0]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="absolute -top-4 -right-4 bg-gradient-to-br from-neon-green to-emerald-500 rounded-2xl shadow-3d-glow-green p-4"
                                >
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* ============================================ */}
            {/* STATS SECTION */}
            {/* ============================================ */}
            <section className="py-20 relative">
                <div className="container mx-auto max-w-7xl px-4">
                    <Card3D className="p-12" glowColor="green">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            <StatCounter value="1M" suffix="+" label="Active Learners" color="text-neon-green" />
                            <StatCounter value="500" suffix="+" label="Industry Courses" color="text-neon-cyan" />
                            <StatCounter value="85" suffix="%" label="Placement Rate" color="text-neon-purple" />
                            <StatCounter value="200" suffix="+" label="Hiring Partners" color="text-amber-500" />
                        </div>
                    </Card3D>
                </div>
            </section>

            {/* ============================================ */}
            {/* BENEFITS SECTION */}
            {/* ============================================ */}
            <section className="py-24 relative">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left - Content */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-4"
                            >
                                <Sparkles className="w-4 h-4 text-neon-cyan" />
                                <span className="text-sm font-semibold text-neon-cyan">Why Choose Us</span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
                            >
                                Learn From The Best,
                                <br />
                                <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
                                    Land Your Dream Job
                                </span>
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-gray-600 mb-10"
                            >
                                Our AI-powered platform doesn't just teach you skills—it connects you with
                                opportunities that match your newfound expertise.
                            </motion.p>

                            <div className="space-y-6">
                                {benefits.map((benefit, index) => (
                                    <BenefitCard
                                        key={index}
                                        icon={benefit.icon}
                                        title={benefit.title}
                                        description={benefit.description}
                                        color={benefit.color}
                                        delay={index * 0.1}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right - Decorative Cards */}
                        <div className="relative">
                            <Card3D className="p-8" glowColor="cyan">
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center mx-auto mb-6">
                                        <BadgeCheck className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Certified</h3>
                                    <p className="text-gray-600 mb-6">
                                        Earn industry-recognized certifications that showcase your skills to potential employers.
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['Python', 'AWS', 'React', 'Data Science', 'AI/ML'].map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Card3D>

                            {/* Floating element */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-3d-card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-bold text-gray-900">Job Ready</div>
                                        <div className="text-gray-500">In 3-6 months</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* COURSES SECTION */}
            {/* ============================================ */}
            <section className="py-24 relative bg-gradient-to-b from-soft-gray to-white">
                <div className="container mx-auto max-w-7xl px-4">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/30 mb-4"
                        >
                            <BookOpen className="w-4 h-4 text-neon-purple" />
                            <span className="text-sm font-semibold text-neon-purple">Popular Courses</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            Most In-Demand Skills in India
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Master skills that top companies are actively hiring for
                        </motion.p>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <CourseCard
                                key={index}
                                {...course}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>

                    {/* View All Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <Button3D
                            variant="green"
                            onClick={() => navigate('/courses')}
                            icon={<ArrowRight className="w-5 h-5" />}
                        >
                            Explore All Courses
                        </Button3D>
                    </motion.div>
                </div>
            </section>

            {/* ============================================ */}
            {/* HIRING PARTNERS SECTION - REDESIGNED */}
            {/* ============================================ */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto max-w-7xl px-4 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4"
                        >
                            <TrendingUp className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-semibold text-amber-600">Career Outcomes</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            Trusted by 200+ Hiring Partners
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Our learners get placed at top companies across India and globally
                        </motion.p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                        {[
                            { name: 'TechCorp', icon: Cpu },
                            { name: 'StartupXYZ', icon: Zap },
                            { name: 'GlobalInc', icon: Globe },
                            { name: 'InnovateCo', icon: Brain },
                            { name: 'ScaleUp', icon: TrendingUp },
                            { name: 'FutureTech', icon: Rocket }
                        ].map((company, i) => (
                            <CompanyLogo key={company.name} name={company.name} icon={company.icon} />
                        ))}
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />
            </section>

            {/* ============================================ */}
            {/* CTA SECTION */}
            {/* ============================================ */}
            <section className="py-24 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <FloatingOrb color="rgba(57, 255, 20, 0.3)" size="w-64 h-64" position="-top-32 -left-32" delay={0} />
                    <FloatingOrb color="rgba(0, 243, 255, 0.3)" size="w-96 h-96" position="-bottom-48 -right-48" delay={2} />
                </div>

                <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                            Ready to Transform Your Career?
                        </h2>
                        <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                            Join over 1 million learners who have already started their journey towards a better career.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button3D
                                variant="primary"
                                onClick={() => navigate('/signup?type=learner')}
                                icon={<ArrowRight className="w-5 h-5" />}
                            >
                                Start Your Journey Today
                            </Button3D>
                            <Button3D
                                variant="secondary"
                                onClick={() => navigate('/contact')}
                            >
                                Talk to a Counselor
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
                        {/* Logo & Description */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/hirego-logo.png"
                                    alt="HireGo Skills"
                                    className="h-20 w-auto object-contain"
                                />
                            </div>
                            <p className="text-gray-600 max-w-md">
                                India's leading AI-powered skill development platform. Learn industry-relevant skills and get hired faster.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Programs</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-600 hover:text-neon-green transition-colors">Full Stack Development</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-neon-green transition-colors">Data Science</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-neon-green transition-colors">Cloud Computing</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-neon-green transition-colors">Digital Marketing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-600 hover:text-neon-green transition-colors">Career Guidance</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-neon-green transition-colors">Success Stories</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-neon-green transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-neon-green transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500">© 2026 HireGo Skills. All rights reserved.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-500 hover:text-neon-cyan transition-colors cursor-pointer"
                        >
                            <Rocket className="w-4 h-4" />
                            <span>Visit HireGo AI Hiring Platform</span>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SkillDevelopment;
