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
    Lightbulb
} from 'lucide-react';

// ============================================
// PREMIUM PILL BUTTON (999px radius)
// ============================================
interface PremiumButtonProps {
    children: React.ReactNode;
    variant?: 'indigo' | 'cyan' | 'emerald' | 'outline';
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
        indigo: 'bg-gradient-indigo text-white shadow-glow-indigo hover:shadow-glow-indigo',
        cyan: 'bg-gradient-cyan text-white shadow-glow-cyan hover:shadow-glow-cyan',
        emerald: 'bg-gradient-emerald text-white shadow-glow-emerald hover:shadow-glow-emerald',
        outline: 'bg-white border-2 border-electric-indigo-500 text-electric-indigo-500 hover:bg-electric-indigo-50'
    };

    const sizes = {
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl'
    };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
                rounded-pill font-semibold
                transition-all duration-300
                shadow-soft-lg hover:shadow-premium-lg
                flex items-center gap-2 justify-center
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
// PREMIUM CARD (32px-40px radius)
// ============================================
interface PremiumCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
}

const PremiumCard: React.FC<PremiumCardProps> = ({ children, className = '', delay = 0, hover = true }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={hover ? { y: -8 } : undefined}
            className={`
                bg-white rounded-card-xl
                shadow-premium hover:shadow-premium-lg
                transition-all duration-500
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

// ============================================
// SKILL CATEGORY CARD (EXTRA LARGE)
// ============================================
interface SkillCategoryProps {
    icon: React.ElementType;
    title: string;
    description: string;
    gradient: string;
    delay: number;
}

const SkillCategoryCard: React.FC<SkillCategoryProps> = ({ icon: Icon, title, description, gradient, delay }) => {
    return (
        <PremiumCard delay={delay} className="p-8 group cursor-pointer">
            <div className="mb-6">
                <div className={`w-20 h-20 rounded-card bg-gradient-to-br ${gradient} flex items-center justify-center shadow-soft-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
            <div className="mt-6 flex items-center text-electric-indigo-500 font-semibold group-hover:gap-3 gap-2 transition-all">
                <span>Explore Skills</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
            description: 'Master data science, analytics, and business intelligence skills.',
            gradient: 'from-electric-indigo-500 to-electric-indigo-700'
        },
        {
            icon: Brain,
            title: 'AI & Machine Learning',
            description: 'Learn cutting-edge AI, ML, and deep learning technologies.',
            gradient: 'from-ai-cyan-500 to-ai-cyan-700'
        },
        {
            icon: Code,
            title: 'Coding & Software',
            description: 'Build expertise in programming, development, and engineering.',
            gradient: 'from-soft-emerald-500 to-soft-emerald-700'
        },
        {
            icon: Briefcase,
            title: 'Business & Operations',
            description: 'Develop skills in management, strategy, and operations.',
            gradient: 'from-electric-indigo-400 to-ai-cyan-500'
        },
        {
            icon: MessageSquare,
            title: 'Communication Skills',
            description: 'Enhance presentation, writing, and interpersonal abilities.',
            gradient: 'from-ai-cyan-400 to-soft-emerald-500'
        },
        {
            icon: Users,
            title: 'BPO / Customer Support',
            description: 'Train for roles in customer service and business process outsourcing.',
            gradient: 'from-soft-emerald-400 to-electric-indigo-500'
        },
        {
            icon: TrendingUp,
            title: 'HR & Admin Skills',
            description: 'Learn recruitment, talent management, and administrative excellence.',
            gradient: 'from-electric-indigo-500 to-soft-emerald-600'
        },
        {
            icon: Lightbulb,
            title: 'Creative & Design',
            description: 'Unlock creativity with design thinking, UI/UX, and visual arts.',
            gradient: 'from-ai-cyan-500 to-electric-indigo-600'
        }
    ];

    const features = [
        {
            icon: Brain,
            title: 'AI Personalized Learning',
            description: 'Adaptive content tailored to your pace and style'
        },
        {
            icon: BarChart3,
            title: 'Real-time Progress Tracking',
            description: 'Monitor your growth with detailed analytics'
        },
        {
            icon: Target,
            title: 'AI Skill Scoring',
            description: 'Get objective assessments of your capabilities'
        },
        {
            icon: Briefcase,
            title: 'Auto Job Matching',
            description: 'Connect directly to relevant job opportunities'
        }
    ];

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            {/* ============================================ */}
            {/* HERO SECTION */}
            {/* ============================================ */}
            <section className="relative overflow-hidden bg-gradient-premium pt-32 pb-24">
                {/* Floating Abstract Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 left-10 w-64 h-64 bg-electric-indigo-200/30 rounded-section-xl blur-3xl"
                    />
                    <motion.div
                        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 right-10 w-80 h-80 bg-ai-cyan-200/30 rounded-section-xl blur-3xl"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-soft-emerald-200/20 rounded-full blur-3xl"
                    />
                </div>

                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Pill Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-pill shadow-soft-md mb-8"
                        >
                            <Sparkles className="w-5 h-5 text-electric-indigo-500" />
                            <span className="text-sm font-semibold text-gray-700">Powered by HireGo AI</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
                        >
                            Build Skills. Get Hired.{' '}
                            <span className="bg-gradient-rainbow bg-clip-text text-transparent drop-shadow-sm font-black">
                                Automatically.
                            </span>
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                        >
                            AI-powered upskilling connected directly to autonomous hiring. Learn, assess, and get matched to jobs—all in one platform.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <PremiumButton
                                variant="indigo"
                                size="xl"
                                onClick={() => navigate('/upskill/courses')}
                                icon={<ArrowRight className="w-6 h-6" />}
                            >
                                Start Learning
                            </PremiumButton>
                            <PremiumButton
                                variant="outline"
                                size="xl"
                                onClick={() => navigate('/upskill/courses')}
                                className="!border-electric-indigo-600 !text-electric-indigo-600 hover:!bg-electric-indigo-50"
                                icon={<Play className="w-6 h-6" />}
                            >
                                Explore Skills
                            </PremiumButton>
                        </motion.div>

                        {/* Trust Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 flex items-center justify-center gap-2 text-gray-500"
                        >
                            <CheckCircle className="w-5 h-5 text-soft-emerald-500" />
                            <span>Join 50,000+ learners upskilling globally</span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* SKILL CATEGORY CARDS */}
            {/* ============================================ */}
            <section className="py-24 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            Choose Your Skill Path
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Expert-curated learning paths designed for career growth
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {skillCategories.map((category, index) => (
                            <SkillCategoryCard
                                key={index}
                                {...category}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* HOW UPSKILL WORKS (HORIZONTAL FLOW) */}
            {/* ============================================ */}
            <section className="py-24 bg-cloud-grey">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            How It Works
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-600"
                        >
                            Your journey from learning to hiring—simplified
                        </motion.p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        {[
                            { icon: GraduationCap, title: 'Choose a Skill', description: 'Select from 100+ expert courses' },
                            { icon: Play, title: 'Learn with AI Video Lessons', description: 'Interactive, personalized content' },
                            { icon: Target, title: 'Take AI Skill Assessment', description: 'Get objectively scored' },
                            { icon: Briefcase, title: 'Get Auto-Matched to Jobs', description: 'Direct pipeline to hiring' }
                        ].map((step, index) => (
                            <React.Fragment key={index}>
                                <PremiumCard delay={index * 0.15} hover={false} className="flex-1 p-8 text-center">
                                    <div className="w-20 h-20 mx-auto bg-gradient-rainbow rounded-card flex items-center justify-center mb-6 shadow-soft-lg">
                                        <step.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </PremiumCard>
                                {index < 3 && (
                                    <div className="hidden lg:block">
                                        <ArrowRight className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* AI-POWERED FEATURES */}
            {/* ============================================ */}
            <section className="py-24 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                        >
                            Powered by HireGo AI
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Smart technology that adapts to your learning style
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <PremiumCard key={index} delay={index * 0.1} className="p-8 text-center backdrop-blur-xl bg-white/80">
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-electric-indigo-100 to-ai-cyan-100 rounded-card-lg flex items-center justify-center mb-6 shadow-soft">
                                    <feature.icon className="w-8 h-8 text-electric-indigo-600" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                            </PremiumCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FINAL CTA */}
            {/* ============================================ */}
            <section className="py-24 px-4 bg-gradient-to-br from-electric-indigo-500 via-ai-cyan-500 to-soft-emerald-500 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                            Upskill Once. Get Hired Globally.
                        </h2>
                        <p className="text-xl text-white mb-10 max-w-2xl mx-auto font-medium drop-shadow-md">
                            Join thousands of professionals transforming their careers through AI-powered learning
                        </p>
                        <PremiumButton
                            variant="indigo"
                            size="xl"
                            onClick={() => navigate('/upskill/courses')}
                            className="!bg-white !text-electric-indigo-600 hover:!bg-gray-50 shadow-xl"
                            icon={<Zap className="w-6 h-6" />}
                        >
                            Begin Your Journey
                        </PremiumButton>
                    </motion.div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <footer className="py-12 bg-gray-900 text-gray-300 text-center">
                <p>© 2026 HireGo AI Upskill Portal. Empowering careers through intelligent learning.</p>
            </footer>
        </div>
    );
};

export default UpskillLanding;
