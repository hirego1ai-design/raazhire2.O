import React from 'react';
import { motion } from 'framer-motion';

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

export default Button3D;
