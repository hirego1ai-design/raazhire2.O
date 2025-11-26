import { motion } from 'framer-motion';
import { Rocket, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
    onSignInClick?: () => void;
}

export default function Navbar({ onSignInClick }: NavbarProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: isVisible ? 0 : -100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--glass-border)]"
        >
            <div className="container mx-auto max-w-7xl px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--glass-border)] flex items-center justify-center shadow-sm">
                            <Rocket className="text-[var(--text-primary)]" size={20} />
                        </div>
                        <span className="text-2xl font-bold text-[var(--text-primary)]">JobPortal</span>
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#jobs" className="text-[var(--text-secondary)] hover:text-neon-cyan transition-colors">
                            Find Jobs
                        </a>
                        <a href="#companies" className="text-[var(--text-secondary)] hover:text-neon-cyan transition-colors">
                            Companies
                        </a>
                        <a href="#about" className="text-[var(--text-secondary)] hover:text-neon-cyan transition-colors">
                            About
                        </a>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--text-primary)]"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/auth')}
                            className="btn-3d btn-primary px-6 py-2 rounded-full"
                        >
                            Sign In
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--text-primary)]"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[var(--text-primary)]"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden mt-4 space-y-4 pb-4"
                    >
                        <a href="#jobs" className="block text-[var(--text-secondary)] hover:text-neon-cyan transition-colors">
                            Find Jobs
                        </a>
                        <a href="#companies" className="block text-[var(--text-secondary)] hover:text-neon-cyan transition-colors">
                            Companies
                        </a>
                        <a href="#about" className="block text-[var(--text-secondary)] hover:text-neon-cyan transition-colors">
                            About
                        </a>
                        <button
                            onClick={() => navigate('/auth')}
                            className="w-full btn-3d btn-primary px-6 py-2 rounded-full"
                        >
                            Sign In
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.nav >
    );
}
