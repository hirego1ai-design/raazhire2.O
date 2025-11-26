import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info' | 'purple';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    icon,
    fullWidth = false,
    className = '',
    disabled = false,
    ...props
}) => {
    const baseStyles = 'btn-3d inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        success: 'btn-success',
        warning: 'btn-warning',
        info: 'btn-info',
        purple: 'btn-purple'
    };

    const sizeStyles = {
        xs: 'px-3 py-1 text-xs rounded-full',
        sm: 'px-3 py-1.5 text-xs rounded-full',
        md: 'px-4 py-2 text-sm rounded-full',
        lg: 'px-5 py-2.5 text-base rounded-full'
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
            disabled={disabled}
            {...props}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

export default Button;
