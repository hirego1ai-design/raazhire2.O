import React from 'react';
import { motion } from 'framer-motion';

interface AdminButton3DProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const AdminButton3D: React.FC<AdminButton3DProps> = ({
    children,
    variant = 'primary',
    onClick,
    className = '',
    icon,
    size = 'md',
    disabled = false,
    type = 'button'
}) => {
    const variants = {
        primary: `
            bg-gradient-to-br from-neon-pink via-neon-purple to-neon-cyan
            text-white font-bold
            shadow-[0_6px_0_0_rgba(168,85,247,0.5),0_10px_20px_rgba(168,85,247,0.3)]
            hover:shadow-[0_4px_0_0_rgba(168,85,247,0.5),0_8px_15px_rgba(168,85,247,0.4)]
            active:shadow-[0_2px_0_0_rgba(168,85,247,0.5),0_4px_10px_rgba(168,85,247,0.3)]
            hover:translate-y-[2px] active:translate-y-[4px]
        `,
        success: `
            bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500
            text-white font-bold
            shadow-[0_6px_0_0_rgba(16,185,129,0.5),0_10px_20px_rgba(16,185,129,0.3)]
            hover:shadow-[0_4px_0_0_rgba(16,185,129,0.5),0_8px_15px_rgba(16,185,129,0.4)]
            active:shadow-[0_2px_0_0_rgba(16,185,129,0.5),0_4px_10px_rgba(16,185,129,0.3)]
            hover:translate-y-[2px] active:translate-y-[4px]
        `,
        danger: `
            bg-gradient-to-br from-red-400 via-rose-500 to-pink-500
            text-white font-bold
            shadow-[0_6px_0_0_rgba(239,68,68,0.5),0_10px_20px_rgba(239,68,68,0.3)]
            hover:shadow-[0_4px_0_0_rgba(239,68,68,0.5),0_8px_15px_rgba(239,68,68,0.4)]
            active:shadow-[0_2px_0_0_rgba(239,68,68,0.5),0_4px_10px_rgba(239,68,68,0.3)]
            hover:translate-y-[2px] active:translate-y-[4px]
        `,
        warning: `
            bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-500
            text-white font-bold
            shadow-[0_6px_0_0_rgba(245,158,11,0.5),0_10px_20px_rgba(245,158,11,0.3)]
            hover:shadow-[0_4px_0_0_rgba(245,158,11,0.5),0_8px_15px_rgba(245,158,11,0.4)]
            active:shadow-[0_2px_0_0_rgba(245,158,11,0.5),0_4px_10px_rgba(245,158,11,0.3)]
            hover:translate-y-[2px] active:translate-y-[4px]
        `,
        info: `
            bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500
            text-white font-bold
            shadow-[0_6px_0_0_rgba(59,130,246,0.5),0_10px_20px_rgba(59,130,246,0.3)]
            hover:shadow-[0_4px_0_0_rgba(59,130,246,0.5),0_8px_15px_rgba(59,130,246,0.4)]
            active:shadow-[0_2px_0_0_rgba(59,130,246,0.5),0_4px_10px_rgba(59,130,246,0.3)]
            hover:translate-y-[2px] active:translate-y-[4px]
        `,
        outline: `
            bg-transparent
            text-neon-cyan font-bold
            border-2 border-neon-cyan
            shadow-[0_6px_0_0_rgba(0,243,255,0.3),0_10px_20px_rgba(0,243,255,0.1)]
            hover:shadow-[0_4px_0_0_rgba(0,243,255,0.3),0_8px_15px_rgba(0,243,255,0.2)]
            active:shadow-[0_2px_0_0_rgba(0,243,255,0.3),0_4px_10px_rgba(0,243,255,0.1)]
            hover:translate-y-[2px] active:translate-y-[4px]
            hover:bg-neon-cyan/10
        `
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm rounded-full',
        md: 'px-6 py-3 text-base rounded-full',
        lg: 'px-8 py-4 text-lg rounded-full'
    };

    return (
        <motion.button
            type={type}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`
                ${sizes[size]}
                flex items-center justify-center gap-2
                transition-all duration-200
                cursor-pointer
                ${variants[variant]}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </motion.button>
    );
};

export default AdminButton3D;
