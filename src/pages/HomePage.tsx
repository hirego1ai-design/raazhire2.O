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
import InteractiveGlobe from '../components/InteractiveGlobe';

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
// 3D SQUARE BOX COMPONENT (Neutral Colors)
// ============================================
const ThreeDSquareBox: React.FC<{ size?: string; className?: string; delay?: number }> = ({ size = "w-24 h-24", className = "", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, rotateX: 45, rotateY: -45, scale: 0.8 }}
        whileInView={{ opacity: 1, rotateX: 25, rotateY: -25, scale: 1 }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className={`relative ${size} ${className}`}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
        {/* Front - Blue */}
        <div className="absolute inset-0 bg-blue-500/60 shadow-lg border border-white/20" style={{ transform: "translateZ(50px)" }} />
        {/* Back - Purple */}
        <div className="absolute inset-0 bg-purple-500/50 opacity-90" style={{ transform: "translateZ(-50px) rotateY(180deg)" }} />
        {/* Right - Light Blue */}
        <div className="absolute inset-0 bg-cyan-300/80" style={{ transform: "rotateY(90deg) translateZ(50px)" }} />
        {/* Left - Indigo */}
        <div className="absolute inset-0 bg-indigo-500/40" style={{ transform: "rotateY(-90deg) translateZ(50px)" }} />
        {/* Top - Light Purple */}
        <div className="absolute inset-0 bg-violet-400/40" style={{ transform: "rotateX(90deg) translateZ(50px)" }} />
        {/* Bottom - Light Cyan */}
        <div className="absolute inset-0 bg-cyan-400/40" style={{ transform: "rotateX(-90deg) translateZ(50px)" }} />

        {/* Glow effect - Blue/Purple Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-3xl opacity-20 -z-10 animate-pulse-soft" />
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
        cyan: {
            cardBg: 'bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100',
            iconBg: 'bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-500',
            text: 'text-white',
            accent: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent'
        },
        purple: {
            cardBg: 'bg-gradient-to-br from-purple-100 via-violet-100 to-fuchsia-100',
            iconBg: 'bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-600',
            text: 'text-white',
            accent: 'bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-600 bg-clip-text text-transparent'
        },
        green: {
            cardBg: 'bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100',
            iconBg: 'bg-gradient-to-br from-emerald-500 via-green-400 to-teal-500',
            text: 'text-white',
            accent: 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent'
        },
        pink: {
            cardBg: 'bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100',
            iconBg: 'bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500',
            text: 'text-white',
            accent: 'bg-gradient-to-r from-rose-600 via-pink-500 to-orange-600 bg-clip-text text-transparent'
        },
        india: {
            cardBg: 'bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100',
            iconBg: 'bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-600',
            text: 'text-white',
            accent: 'bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-600 bg-clip-text text-transparent'
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={`relative p-6 h-full flex flex-col items-center text-center rounded-[2.5rem] ${colorMap[color].cardBg} transition-all duration-300 cursor-pointer`}
        >
            <div className="flex flex-col h-full items-center">
                <div
                    className={`w-14 h-14 rounded-[1.2rem] ${colorMap[color].iconBg} flex items-center justify-center mb-4 mx-auto`}
                >
                    <Icon className={`w-7 h-7 ${colorMap[color].text}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${colorMap[color].accent}`}>{outcome}</p>
                <p className="text-slate-600 leading-snug text-sm">{description}</p>
            </div>
        </motion.div>
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
        cyan: { gradient: 'from-blue-500 via-cyan-400 to-teal-500' },
        purple: { gradient: 'from-purple-600 via-violet-500 to-fuchsia-600' },
        green: { gradient: 'from-emerald-500 via-green-400 to-teal-500' },
        pink: { gradient: 'from-rose-500 via-pink-500 to-orange-500' }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="relative p-6 h-full flex flex-col items-center text-center rounded-[2rem] bg-white border-2 border-slate-200 transition-all duration-300"
            style={{
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                transform: 'translateZ(0)'
            }}
        >
            <div className={`text-4xl font-black bg-gradient-to-r ${colorMap[color].gradient} bg-clip-text text-transparent mb-2 tracking-tighter`}>{value}</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-[0.15em] mb-1">{label}</div>
            {context && <div className="text-xs text-slate-600 font-medium leading-snug">{context}</div>}
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
    color: 'cyan' | 'purple' | 'green' | 'pink' | 'india';
    delay: number;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description, microcopy, color, delay }) => {
    const colorMap = {
        cyan: {
            cardBg: 'bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100',
            numberBg: 'bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-500',
            text: 'text-white'
        },
        purple: {
            cardBg: 'bg-gradient-to-br from-purple-100 via-violet-100 to-fuchsia-100',
            numberBg: 'bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-600',
            text: 'text-white'
        },
        green: {
            cardBg: 'bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100',
            numberBg: 'bg-gradient-to-br from-emerald-500 via-green-400 to-teal-500',
            text: 'text-white'
        },
        pink: {
            cardBg: 'bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100',
            numberBg: 'bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500',
            text: 'text-white'
        },
        india: {
            cardBg: 'bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100',
            numberBg: 'bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-600',
            text: 'text-white'
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={`relative p-8 text-center h-full rounded-[2.5rem] ${colorMap[color].cardBg} cursor-pointer`}
        >
            <div className={`w-14 h-14 rounded-[1.2rem] ${colorMap[color].numberBg} ${colorMap[color].text} font-black text-xl flex items-center justify-center mx-auto mb-6`}>
                {number}
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">{description}</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{microcopy}</p>
        </motion.div>
    );
};

// BRAND LOGO SVG COMPONENT - REAL COLORED LOGOS
// ============================================
const BrandLogoSVG: React.FC<{ name: string }> = ({ name }) => {
    // Real colored SVG logos
    const logos: Record<string, React.ReactNode> = {
        Google: (
            <svg viewBox="0 0 272 92" className="h-8 w-auto">
                <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335" />
                <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05" />
                <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4" />
                <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
                <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335" />
                <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4" />
            </svg>
        ),
        Microsoft: (
            <svg viewBox="0 0 23 23" className="h-8 w-auto">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#00a4ef" d="M1 12h10v10H1z" />
                <path fill="#7fba00" d="M12 1h10v10H12z" />
                <path fill="#ffb900" d="M12 12h10v10H12z" />
            </svg>
        ),
        Amazon: (
            <svg viewBox="0 0 200 60" className="h-7 w-auto">
                <rect width="200" height="60" fill="#232F3E" />
                <text x="100" y="38" fontSize="26" fontWeight="bold" fill="#FF9900" textAnchor="middle" fontFamily="Arial, sans-serif">amazon</text>
                <path d="M130 42c-10 4-20 6-30 6-14 0-27-5-37-13 -0.8-0.7-0.1-1.6 0.8-1.1 10 6 23 10 36 10 9 0 19-2 28-6 1.4-0.6 2.5 0.9 1.2 1.9z" fill="#FF9900" />
            </svg>
        ),
        Slack: (
            <svg viewBox="0 0 270 270" className="h-8 w-auto">
                <path fill="#E01E5A" d="M99.4 151.2c0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9 0-7.1 5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9v-32.3z" />
                <path fill="#36C5F0" d="M118.8 99.4c-7.1 0-12.9-5.8-12.9-12.9 0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v12.9h-12.9zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H86.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3z" />
                <path fill="#2EB67D" d="M170.6 118.8c0-7.1 5.8-12.9 12.9-12.9 7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9h-12.9v-12.9zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9V86.5c0-7.1 5.8-12.9 12.9-12.9 7.1 0 12.9 5.8 12.9 12.9v32.3z" />
                <path fill="#ECB22E" d="M151.2 170.6c7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9v-12.9h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9 0-7.1 5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9h-32.3z" />
            </svg>
        ),
        Stripe: (
            <svg viewBox="0 0 60 25" className="h-7 w-auto">
                <path fill="#635BFF" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-6.3-5.63c-1.03 0-1.98.98-2.12 2.87h4.18c0-1.76-.78-2.87-2.06-2.87zM34.78 20.05V5.532h4.24l.24 1.49c.89-1.17 2.17-1.791 3.66-1.791 2.96 0 4.7 2.16 4.7 5.46v9.32h-4.5v-8.72c0-1.49-.68-2.45-2.02-2.45-1.34 0-1.82.96-1.82 2.03v9.14h-4.5zM24.64 3.18c0-1.42 1.12-2.5 2.5-2.5s2.5 1.08 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.08-2.5-2.5zm.25 16.87V5.532h4.5V20.05h-4.5zM17.67 5.29c-1.01 0-1.7.64-1.7 1.57v.77h3.35V5.532h4.5V20.05h-4.5v-8.03h-3.35v8.03h-4.5V5.532l4.5-.002v-.58c0-2.66 1.96-4.952 5.28-4.952 2.31 0 3.81.79 4.56 1.57l-1.66 3.08c-.45-.47-1.14-.8-1.98-.8zM0 12.63C0 6.26 3.47 5.29 7.87 5.29c2.1 0 4.1.56 5.54 1.58l-1.68 3.24c-.97-.65-2.28-.97-3.36-.97-1.57 0-3.11.66-3.11 3.49s1.54 3.49 3.11 3.49c1.08 0 2.39-.32 3.36-.97l1.68 3.24c-1.44 1.02-3.44 1.58-5.54 1.58C3.47 19.97 0 19 0 12.63z" />
            </svg>
        ),
        Spotify: (
            <svg viewBox="0 0 496 512" className="h-8 w-auto">
                <path fill="#1ED760" d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" />
            </svg>
        ),
        Airbnb: (
            <svg viewBox="0 0 200 60" className="h-8 w-auto">
                <rect width="200" height="60" fill="#FF5A5F" rx="8" />
                <text x="100" y="40" fontSize="26" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">Airbnb</text>
            </svg>
        ),
        Notion: (
            <svg viewBox="0 0 100 100" className="h-8 w-auto">
                <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="#fff" />
                <path fillRule="evenodd" clipRule="evenodd" d="M61.35.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.433-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.873-2.847-3.443-4.733L74.167 3.143c-4.273-3.107-6.02-3.5-12.817-2.917zM25.92 19.523c-5.247.353-6.437.433-9.417-1.99L8.927 11.507c-.77-.78-.383-1.753 1.557-1.947l53.193-3.887c4.467-.39 6.793 1.167 8.54 2.527l9.123 6.61c.39.197 1.36 1.36.193 1.36l-54.933 3.307-.68.047zM19.803 88.3V30.367c0-2.53.777-3.697 3.103-3.893L86 22.78c2.14-.193 3.107 1.167 3.107 3.693v57.547c0 2.53-.39 4.67-3.883 4.863l-60.377 3.5c-3.493.193-5.043-.97-5.043-4.083zm59.6-54.827c.387 1.75 0 3.5-1.75 3.7l-2.91.577v42.773c-2.527 1.36-4.853 2.137-6.797 2.137-3.107 0-3.883-.973-6.21-3.887l-19.03-29.94v28.967l6.02 1.363s0 3.5-4.857 3.5l-13.39.777c-.39-.78 0-2.723 1.357-3.11l3.497-.97v-38.3L30.48 40.667c-.39-1.75.58-4.277 3.3-4.473l14.367-.967 19.8 30.327v-26.83l-5.047-.58c-.39-2.143 1.163-3.7 3.103-3.89l13.4-.78z" fill="#000" />
            </svg>
        ),
        TCS: (
            <svg viewBox="0 0 200 60" className="h-7 w-auto">
                <rect width="200" height="60" fill="#0066B2" />
                <text x="100" y="38" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">TCS</text>
            </svg>
        ),
        Infosys: (
            <svg viewBox="0 0 200 60" className="h-7 w-auto">
                <defs>
                    <linearGradient id="infosysGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#007CC3', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#00A8E1', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                <rect width="200" height="60" fill="url(#infosysGrad)" />
                <text x="100" y="40" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">Infosys</text>
            </svg>
        ),
        Wipro: (
            <svg viewBox="0 0 200 60" className="h-7 w-auto">
                <rect width="200" height="60" fill="#6F2C91" />
                <text x="100" y="38" fontSize="26" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">WIPRO</text>
            </svg>
        ),
        TechMahindra: (
            <svg viewBox="0 0 220 60" className="h-7 w-auto">
                <rect width="220" height="60" fill="#ED1C24" />
                <text x="110" y="28" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">Tech</text>
                <text x="110" y="48" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">Mahindra</text>
            </svg>
        ),
        Cognizant: (
            <svg viewBox="0 0 200 60" className="h-7 w-auto">
                <rect width="200" height="60" fill="#0033A0" />
                <text x="100" y="40" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">cognizant</text>
            </svg>
        ),
        HCL: (
            <svg viewBox="0 0 200 60" className="h-7 w-auto">
                <rect width="200" height="60" fill="#1E3A8A" />
                <text x="100" y="38" fontSize="28" fontWeight="bold" fill="#FFD700" textAnchor="middle" fontFamily="Arial, sans-serif">HCL</text>
            </svg>
        ),
        Zomato: (
            <svg viewBox="0 0 200 60" className="h-8 w-auto">
                <rect width="200" height="60" fill="#E23744" rx="8" />
                <text x="100" y="40" fontSize="26" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">zomato</text>
            </svg>
        ),
        Swiggy: (
            <svg viewBox="0 0 200 60" className="h-8 w-auto">
                <rect width="200" height="60" fill="#FC8019" rx="8" />
                <text x="100" y="40" fontSize="26" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">Swiggy</text>
            </svg>
        ),
        Concentrix: (
            <svg viewBox="0 0 220 60" className="h-7 w-auto">
                <rect width="220" height="60" fill="#00205B" />
                <text x="110" y="40" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">CONCENTRIX</text>
            </svg>
        ),
    };

    return (
        <motion.div
            whileHover={{ scale: 1.08 }}
            className="flex items-center justify-center px-8 py-4 transition-all duration-300 cursor-pointer"
        >
            {logos[name]}
        </motion.div>
    );
};

// ============================================

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
            outcome: '10-MINUTE AVERAGE TIME-TO-SHORTLIST',
            description: 'AI agents work 24/7 to automate screening, evaluation, and candidate ranking, cutting manual work to almost zero.',
            color: 'cyan' as const
        },
        {
            icon: Zap,
            title: 'Lightning Fast Hiring',
            outcome: 'REDUCE RECRUITER WORKLOAD BY UP TO 80%',
            description: 'Go from job posting to qualified shortlist in minutes, not weeks, so you fill urgent roles before competitors even start.',
            color: 'purple' as const
        },
        {
            icon: Target,
            title: 'Precision Matching',
            outcome: '95% CANDIDATE-JOB FIT ACCURACY',
            description: 'AI-powered matching based on skills, experience, culture fit, and growth potential for highly accurate placements.',
            color: 'green' as const
        },
        {
            icon: Bot,
            title: 'AI Video Interviews',
            outcome: 'SCREEN 100+ CANDIDATES SIMULTANEOUSLY',
            description: 'Automated video interviews with behavioral analysis, sentiment detection, and clear, actionable candidate reports.',
            color: 'pink' as const
        },
        {
            icon: Shield,
            title: 'AI Anti-Cheating Engine',
            outcome: '99.9% FRAUD DETECTION RATE',
            description: 'Advanced proctoring ensures fair, authentic assessments with real-time fraud detection and identity verification.',
            color: 'cyan' as const
        },
        {
            icon: Globe,
            title: 'Global Talent Access',
            outcome: 'ACCESS 50+ COUNTRIES INSTANTLY',
            description: 'Connect with verified talent worldwide. No borders, no limits, reduced visa headaches for global hiring teams.',
            color: 'purple' as const
        }
    ];

    const processSteps = [
        {
            number: '1',
            title: 'Post Job',
            description: 'Create your job in seconds with AI‑assisted requirements.',
            microcopy: 'Import your JD or let AI generate one in under 30 seconds',
            color: 'cyan' as const
        },
        {
            number: '2',
            title: 'AI Screens',
            description: 'AI agents instantly screen and rank every applicant.',
            microcopy: 'Evaluate 1000+ candidates in under 5 minutes with zero manual effort',
            color: 'purple' as const
        },
        {
            number: '3',
            title: 'Auto Interview',
            description: 'Candidates complete AI‑powered, fraud‑proof video interviews.',
            microcopy: 'Behavioral insights, skill verification, and cheating detection in one report',
            color: 'green' as const
        },
        {
            number: '4',
            title: 'Hire Fast',
            description: 'Get a ranked shortlist with rich, actionable profiles.',
            microcopy: 'Review, compare, and send offers in minutes, not weeks',
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
                {/* Interactive 3D Globe Background */}
                <div className="absolute inset-0 z-0 select-none bg-[#020617] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <InteractiveGlobe className="opacity-100" />
                    </div>
                    {/* Cinematic Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510]/80 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050510]/80 via-transparent to-[#050510]/80 pointer-events-none" />
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
            {/* HIRING PARTNERS - MODERN MARQUEE */}
            {/* ============================================ */}
            <section className="py-16 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

                <div className="container mx-auto px-4 relative z-10 mb-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                                Trusted by industry leaders
                            </span>
                        </h2>
                        <p className="text-slate-600 text-base max-w-xl mx-auto">
                            Top companies use HireGo AI to find and hire exceptional talent faster than ever.
                        </p>
                    </motion.div>
                </div>

                {/* 3D Curved Container */}
                <div className="container mx-auto px-4 relative z-10">
                    <div className="relative max-w-7xl mx-auto bg-white rounded-[2.5rem] p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] border-4 border-white" style={{
                        boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 0 rgba(0,0,0,0.05)',
                        transform: 'translateZ(0)',
                    }}>
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 pointer-events-none" />

                        {/* Gradient overlays for marquee fade effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white to-transparent z-20 pointer-events-none rounded-l-[2.5rem]" />
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white to-transparent z-20 pointer-events-none rounded-r-[2.5rem]" />

                        {/* Infinite Marquee - Row 1 */}
                        <div className="relative w-full overflow-hidden py-6">
                            <motion.div
                                className="flex gap-16 items-center"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                            >
                                {/* Double the logos for seamless loop */}
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex gap-16 items-center shrink-0">
                                        <BrandLogoSVG name="Google" />
                                        <BrandLogoSVG name="TCS" />
                                        <BrandLogoSVG name="Microsoft" />
                                        <BrandLogoSVG name="Infosys" />
                                        <BrandLogoSVG name="Amazon" />
                                        <BrandLogoSVG name="Zomato" />
                                        <BrandLogoSVG name="Slack" />
                                        <BrandLogoSVG name="Wipro" />
                                        <BrandLogoSVG name="Stripe" />
                                        <BrandLogoSVG name="Cognizant" />
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Infinite Marquee - Row 2 (Reverse direction, slightly slower) */}
                        <div className="relative w-full overflow-hidden py-6">
                            <motion.div
                                className="flex gap-16 items-center"
                                animate={{ x: ["-50%", "0%"] }}
                                transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
                            >
                                {/* Double the logos for seamless loop */}
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex gap-16 items-center shrink-0">
                                        <BrandLogoSVG name="Swiggy" />
                                        <BrandLogoSVG name="Spotify" />
                                        <BrandLogoSVG name="TechMahindra" />
                                        <BrandLogoSVG name="Airbnb" />
                                        <BrandLogoSVG name="HCL" />
                                        <BrandLogoSVG name="Notion" />
                                        <BrandLogoSVG name="Concentrix" />
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Stats Bar */}
                        <div className="container mx-auto px-4 mt-16">
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
                                <div>
                                    <div className="text-4xl font-bold text-slate-900">500+</div>
                                    <div className="text-sm text-slate-500 mt-1">Partner Companies</div>
                                </div>
                                <div className="hidden md:block w-px bg-slate-200" />
                                <div>
                                    <div className="text-4xl font-bold text-slate-900">50K+</div>
                                    <div className="text-sm text-slate-500 mt-1">Successful Hires</div>
                                </div>
                                <div className="hidden md:block w-px bg-slate-200" />
                                <div>
                                    <div className="text-4xl font-bold text-slate-900">12</div>
                                    <div className="text-sm text-slate-500 mt-1">Countries</div>
                                </div>
                                <div className="hidden md:block w-px bg-slate-200" />
                                <div>
                                    <div className="text-4xl font-bold text-slate-900">99%</div>
                                    <div className="text-sm text-slate-500 mt-1">Satisfaction Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* STATS SECTION */}
            {/* ============================================ */}
            <section className="py-8 relative bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <div className="container mx-auto max-w-7xl px-4 relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold mb-1">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Trusted Results Worldwide
                            </span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatItemCard
                            value="10 min"
                            label="Avg. Hiring Time"
                            context="Reducing industry timelines by 45 days on average"
                            icon={Clock}
                            color="cyan"
                            delay={0.1}
                        />
                        <StatItemCard
                            value="85%"
                            label="Time Saving"
                            context="Faster than traditional hiring"
                            icon={Zap}
                            color="purple"
                            delay={0.2}
                        />
                        <StatItemCard
                            value="50K+"
                            label="Successful Hirings"
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
            <section className="py-8 relative bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Built for worldwide hiring.</h2>
                        <p className="text-base text-slate-600 max-w-2xl mx-auto">Premium features designed for modern engineering teams and global enterprises.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <section className="py-10 relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                {/* Colorful dot pattern overlay */}
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    backgroundPosition: '16px 16px'
                }} />

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
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                                <Bot className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AUTONOMOUS AI AGENTS</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-text-primary mb-4 leading-tight">
                                Agentic Hiring Dashboard
                            </h2>
                            <p className="text-lg text-text-secondary mb-6 leading-relaxed font-semibold">
                                Agentic AI hiring platform that runs your recruitment on autopilot.
                            </p>
                            <p className="text-base text-text-secondary mb-8 leading-relaxed">
                                Our AI agents go beyond resumes, delivering behavioral insights, skill verification, and culture‑fit analysis in a single, intuitive dashboard.
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
            <section className="py-12 relative bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 border-t border-light-border">
                {/* Colorful dot pattern overlay */}
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    backgroundPosition: '16px 16px'
                }} />

                <div className="container mx-auto max-w-6xl px-6 text-center mb-12 relative z-10 w-full">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
                        <span className="text-text-primary">Your entire hiring pipeline, </span>
                        <span className="bg-gradient-to-r from-hg-blue to-hg-green bg-clip-text text-transparent">fully automated.</span>
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
            <section className="py-12 relative bg-gradient-to-br from-purple-200 via-pink-200 via-orange-200 to-yellow-200 border-y border-light-border overflow-hidden">
                {/* Multi-color dot pattern overlay with vibrant colors */}
                <div className="absolute inset-0 opacity-50" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(168, 85, 247, 0.7) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute inset-0 opacity-45" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    backgroundPosition: '16px 16px'
                }} />
                <div className="absolute inset-0 opacity-35" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(251, 146, 60, 0.5) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    backgroundPosition: '8px 8px'
                }} />

                <div className="container mx-auto max-w-6xl px-6 text-center mb-10 w-full relative z-10">
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
                                        <div className="relative p-8 h-full bg-gradient-to-br from-white to-orange-50/50 rounded-[2rem] border-2 border-orange-100">
                                            <div className="flex gap-1 text-amber-500 mb-6">
                                                {[...Array(5)].map((_, s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                                            </div>
                                            <p className="text-lg text-text-secondary mb-8 font-medium">"{testi.quote}"</p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                                                    {testi.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-primary text-sm">{testi.name}</div>
                                                    <div className="text-xs text-text-tertiary uppercase tracking-wider">{testi.role}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ============================================ */}
            {/* ABOUT US */}
            {/* ============================================ */}


            {/* ============================================ */}
            {/* FINAL CTA */}
            {/* ============================================ */}
            <section className="py-16 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
                {/* Vibrant gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-hg-blue/10 via-white to-hg-green/10 pointer-events-none" />
                <div className="absolute inset-0 bg-mesh-colorful pointer-events-none opacity-30" />

                <div className="container mx-auto max-w-5xl px-4 relative z-10">
                    {/* 3D Curved Container Box */}
                    <div
                        className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-[3rem] p-12 md:p-16 border-4 border-white"
                        style={{
                            boxShadow: '0 25px 70px -15px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.8), 0 1px 0 rgba(0,0,0,0.05)',
                            transform: 'translateZ(0)'
                        }}
                    >
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-blue-100/40 via-transparent to-purple-100/40 pointer-events-none" />

                        <div className="relative z-10 text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-2xl md:text-3xl lg:text-4xl font-black mb-6 tracking-tight"
                            >
                                <span className="bg-gradient-to-r from-hg-blue via-accent-violet to-hg-red bg-clip-text text-transparent whitespace-nowrap">Ready to scale, without scaling your HR team?</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-text-secondary mb-10 max-w-xl mx-auto leading-relaxed"
                            >
                                Join 10,000+ companies worldwide using HireGo AI to run autonomous, 24/7 hiring. Start free today.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <Button3D variant="primary" size="lg" onClick={() => navigate('/signup')}>
                                    Get Started Free
                                </Button3D>
                                <Button3D variant="secondary" size="lg" onClick={() => navigate('/contact')}>
                                    Contact Sales
                                </Button3D>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default HomePage;
