/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // 🎨 NEW PREMIUM COLOR SYSTEM
            colors: {
                // Base Colors (Soft & Clean)
                'soft-white': '#FAFAFA',
                'cloud-grey': '#F2F4F8',
                'deep-grey': '#E5E7EB',

                // Primary Accents (Calm & Powerful)
                'electric-indigo': {
                    50: '#F0F0FF',
                    100: '#E5E5FF',
                    200: '#D1D1FF',
                    300: '#B8B8FF',
                    400: '#9F9FFF',
                    500: '#6366F1', // Main
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                },
                'ai-cyan': {
                    50: '#ECFEFF',
                    100: '#CFFAFE',
                    200: '#A5F3FC',
                    300: '#67E8F9',
                    400: '#22D3EE',
                    500: '#06B6D4', // Main
                    600: '#0891B2',
                    700: '#0E7490',
                    800: '#155E75',
                    900: '#164E63',
                },
                'soft-emerald': {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981', // Main
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                },

                // Keep existing neon colors for backward compatibility
                'neon-cyan': '#00F3FF',
                'neon-purple': '#BC13FE',
                'neon-pink': '#FF006E',
                'neon-green': '#39FF14',
                'space-dark': '#0a0e27',
                'space-blue': '#1a1f3a',
            },

            // 🟣 LARGE RADIUS SYSTEM (32px-56px for cards, 999px for pills)
            borderRadius: {
                'card': '32px',
                'card-lg': '36px',
                'card-xl': '40px',
                'section': '40px',
                'section-lg': '48px',
                'section-xl': '56px',
                'pill': '999px',
                'video': '32px',
            },

            // 🌫️ PREMIUM 3-LAYER SHADOW SYSTEM
            boxShadow: {
                // Soft Premium Shadows
                'soft': '0 2px 20px rgba(0, 0, 0, 0.04)',
                'soft-md': '0 4px 30px rgba(0, 0, 0, 0.06)',
                'soft-lg': '0 8px 40px rgba(0, 0, 0, 0.08)',

                // 3D Depth Shadows (3-layer system)
                'premium': `
          0 2px 10px rgba(0, 0, 0, 0.03),
          0 8px 30px rgba(0, 0, 0, 0.05),
          0 20px 60px rgba(0, 0, 0, 0.08)
        `,
                'premium-lg': `
          0 4px 15px rgba(0, 0, 0, 0.04),
          0 12px 40px rgba(0, 0, 0, 0.06),
          0 30px 80px rgba(0, 0, 0, 0.1)
        `,

                // Glow Shadows (for hover states)
                'glow-indigo': '0 0 40px rgba(99, 102, 241, 0.25)',
                'glow-cyan': '0 0 40px rgba(6, 182, 212, 0.25)',
                'glow-emerald': '0 0 40px rgba(16, 185, 129, 0.25)',
                'glow-purple': '0 0 40px rgba(188, 19, 254, 0.25)',

                // Keep existing shadows for backward compatibility
                'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.5)',
                'neon-purple': '0 0 20px rgba(188, 19, 254, 0.5)',
                'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
                'neon-green': '0 0 20px rgba(57, 255, 20, 0.5)',
            },

            // 🎨 ELEGANT GRADIENT UTILITIES
            backgroundImage: {
                'gradient-soft': 'linear-gradient(135deg, #FAFAFA 0%, #F2F4F8 100%)',
                'gradient-indigo': 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                'gradient-cyan': 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                'gradient-rainbow': 'linear-gradient(135deg, #6366F1 0%, #06B6D4 50%, #10B981 100%)',
                'gradient-premium': 'linear-gradient(135deg, #F0F0FF 0%, #ECFEFF 50%, #ECFDF5 100%)',
            },

            // Animation utilities
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                glow: {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                },
            },

            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
