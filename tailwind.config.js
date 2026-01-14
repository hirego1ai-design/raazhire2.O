/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-cyan': '#00f3ff',
                'neon-purple': '#bc13fe',
                'neon-pink': '#ff006e',
                'neon-green': '#39FF14',
                'neon-blue': '#0066ff',
                'space-dark': '#0a0e27',
                'space-blue': '#1a1f3a',
                // Premium light theme colors
                'cream': '#FAFBFC',
                'soft-gray': '#F0F2F5',
                'muted-blue': '#E8EEF5',
            },
            fontFamily: {
                'outfit': ['Outfit', 'sans-serif'],
                'inter': ['Inter', 'sans-serif'],
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
                '6xl': '3rem',
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.5), 0 0 40px rgba(0, 243, 255, 0.3)',
                'neon-purple': '0 0 20px rgba(188, 19, 254, 0.5), 0 0 40px rgba(188, 19, 254, 0.3)',
                'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
                '3d-cyan': '0 10px 30px rgba(0, 243, 255, 0.4), 0 20px 60px rgba(0, 243, 255, 0.2)',
                '3d-purple': '0 10px 30px rgba(188, 19, 254, 0.4), 0 20px 60px rgba(188, 19, 254, 0.2)',
                // Multi-layer 3D shadows for cards
                '3d-card': '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.08), 0 25px 50px rgba(0, 0, 0, 0.15)',
                '3d-card-hover': '0 8px 12px rgba(0, 0, 0, 0.08), 0 20px 40px rgba(0, 0, 0, 0.12), 0 40px 80px rgba(0, 0, 0, 0.18)',
                '3d-lifted': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 40px 60px -10px rgba(0, 0, 0, 0.2)',
                '3d-glow-cyan': '0 0 15px rgba(0, 243, 255, 0.3), 0 10px 40px rgba(0, 243, 255, 0.15), 0 25px 50px rgba(0, 0, 0, 0.15)',
                '3d-glow-purple': '0 0 15px rgba(188, 19, 254, 0.3), 0 10px 40px rgba(188, 19, 254, 0.15), 0 25px 50px rgba(0, 0, 0, 0.15)',
                '3d-glow-green': '0 0 15px rgba(57, 255, 20, 0.3), 0 10px 40px rgba(57, 255, 20, 0.15), 0 25px 50px rgba(0, 0, 0, 0.15)',
                'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
                'btn-3d': '0 6px 0 rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.3)',
                'btn-3d-pressed': '0 2px 0 rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.2)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float 8s ease-in-out infinite',
                'float-fast': 'float 4s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 20s linear infinite',
                'border-flow': 'borderFlow 3s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
                'scale-pulse': 'scalePulse 2s ease-in-out infinite',
                'gradient-shift': 'gradientShift 3s ease infinite',
                'orbit': 'orbit 15s linear infinite',
                'orbit-reverse': 'orbit 15s linear infinite reverse',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%': { opacity: '0.7' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                borderFlow: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                bounceSoft: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                scalePulse: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                orbit: {
                    '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'mesh-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'hero-glow': 'radial-gradient(ellipse at center, rgba(0, 243, 255, 0.15) 0%, transparent 70%)',
            },
        },
    },
    plugins: [],
}
