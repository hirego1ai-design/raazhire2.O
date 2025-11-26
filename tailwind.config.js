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
                'space-dark': '#0a0e27',
                'space-blue': '#1a1f3a',
            },
            fontFamily: {
                'outfit': ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.5), 0 0 40px rgba(0, 243, 255, 0.3)',
                'neon-purple': '0 0 20px rgba(188, 19, 254, 0.5), 0 0 40px rgba(188, 19, 254, 0.3)',
                'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
                '3d-cyan': '0 10px 30px rgba(0, 243, 255, 0.4), 0 20px 60px rgba(0, 243, 255, 0.2)',
                '3d-purple': '0 10px 30px rgba(188, 19, 254, 0.4), 0 20px 60px rgba(188, 19, 254, 0.2)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.5s ease-out',
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
            },
        },
    },
    plugins: [],
}
