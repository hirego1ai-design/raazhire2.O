/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // HireGo Vibrant Colorful Palette (Matching Logo)
                'hg-blue': '#4285F4',
                'hg-red': '#EA4335',
                'hg-yellow': '#FBBC05',
                'hg-green': '#34A853',

                // Backgrounds - Bright & Colorful (NO BLACK)
                'light-bg': '#F8FAFF',
                'light-surface': '#FFFFFF',
                'light-border': '#E2E8F0',
                'light-muted': '#F1F5F9',

                // Text Colors - Deep Navy (NO BLACK)
                'text-primary': '#1E3A5F',
                'text-secondary': '#475569',
                'text-tertiary': '#94A3B8',

                // Accent Colors - Vibrant Logo Colors
                'accent-blue': '#4285F4',
                'accent-red': '#EA4335',
                'accent-yellow': '#FBBC05',
                'accent-green': '#34A853',
                'accent-violet': '#8B5CF6',
                'accent-orange': '#F97316',
                'accent-pink': '#EC4899',
                'accent-cyan': '#06B6D4',

                // Global/International Trust Colors
                'trust-blue': '#2563EB',
                'success-green': '#10B981',
                'warm-orange': '#F59E0B',

                // Legacy (compatibility)
                'neon-cyan': '#00f3ff',
                'neon-purple': '#bc13fe',
                'neon-pink': '#ff006e',
                'neon-green': '#39FF14',
                'cream': '#FFFBF5',
                'soft-gray': '#F1F5F9',
                'soft-white': '#FBFCFF',
                'cloud-grey': '#F8FAFC',

                // Upskill Specific Colors
                'electric-indigo': {
                    50: '#F5F3FF',
                    100: '#EDE9FE',
                    200: '#DDD6FE',
                    300: '#C4B5FD',
                    400: '#A78BFA',
                    500: '#8B5CF6',
                    600: '#7C3AED',
                    700: '#6D28D9',
                },
                'ai-cyan': {
                    50: '#ECFEFF',
                    100: '#CFFAFE',
                    200: '#A5F3FC',
                    300: '#67E8F9',
                    400: '#22D3EE',
                    500: '#06B6D4',
                    600: '#0891B2',
                    700: '#0E7490',
                },
                'soft-emerald': {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                }
            },
            fontFamily: {
                'outfit': ['Outfit', 'sans-serif'],
                'inter': ['Inter', 'sans-serif'],
                'plus': ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            borderRadius: {
                'premium': '1rem',
                'card': '24px',
                'pill': '999px',
                'card-lg': '32px',
                'card-xl': '40px',
                'section-xl': '64px',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            boxShadow: {
                'colorful-sm': '0 2px 4px rgba(66, 133, 244, 0.1)',
                'colorful-md': '0 4px 12px rgba(66, 133, 244, 0.15)',
                'colorful-lg': '0 8px 24px rgba(66, 133, 244, 0.2)',
                'colorful-xl': '0 12px 48px rgba(66, 133, 244, 0.25)',
                'card-hover': '0 20px 40px rgba(66, 133, 244, 0.15), 0 8px 16px rgba(234, 67, 53, 0.1)',
                'button-glow': '0 4px 14px rgba(66, 133, 244, 0.4)',
                'green-glow': '0 4px 14px rgba(52, 168, 83, 0.4)',
                'rainbow': '0 8px 32px rgba(66, 133, 244, 0.2), 0 4px 16px rgba(234, 67, 53, 0.1)',

                // Premium Shadow Set
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'soft-md': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
                'soft-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                'premium': '0 10px 30px -5px rgba(30, 58, 138, 0.1), 0 10px 20px -10px rgba(30, 58, 138, 0.05)',
                'premium-lg': '0 25px 50px -12px rgba(30, 58, 138, 0.15)',
                'glow-indigo': '0 4px 20px rgba(139, 92, 246, 0.3)',
                'glow-cyan': '0 4px 20px rgba(6, 182, 212, 0.3)',
                'glow-emerald': '0 4px 20px rgba(16, 185, 129, 0.3)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float 8s ease-in-out infinite',
                'bounce-slow': 'bounce 3s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'gradient-shift': 'gradientShift 8s ease-in-out infinite',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', transform: 'scale(1.02)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            backgroundImage: {
                'gradient-hero': 'linear-gradient(135deg, #E8F4FD 0%, #FFFFFF 50%, #FFF5F5 100%)',
                'gradient-vibrant': 'linear-gradient(135deg, #4285F4 0%, #8B5CF6 50%, #EA4335 100%)',
                'gradient-fresh': 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)',
                'mesh-colorful': 'radial-gradient(at 0% 0%, rgba(66, 133, 244, 0.12) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(234, 67, 53, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(251, 188, 5, 0.1) 0, transparent 50%), radial-gradient(at 0% 100%, rgba(52, 168, 83, 0.08) 0, transparent 50%)',
                'gradient-blue-red': 'linear-gradient(135deg, #4285F4, #EA4335)',
                'gradient-green-yellow': 'linear-gradient(135deg, #34A853, #FBBC05)',

                // Upskill Premium Gradients
                'gradient-premium': 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 50%, #F5F3FF 100%)',
                'gradient-indigo': 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                'gradient-cyan': 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                'gradient-rainbow': 'linear-gradient(135deg, #8B5CF6, #06B6D4, #10B981)',
            },
        },
    },
    plugins: [],
}
