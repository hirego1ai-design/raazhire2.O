import { motion } from 'framer-motion';
import { Building2, GraduationCap, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
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

    const isHomePage = location.pathname === '/';
    const isSkillsPage = location.pathname === '/skill-development';

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: isVisible ? 0 : -100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
        >
            <div className="container mx-auto max-w-7xl px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <img
                            src="/hirego-logo.png"
                            alt="HireGo AI"
                            className="h-14 w-auto object-contain"
                        />
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* For Employers - Highlighted on home */}
                        <button
                            onClick={() => navigate('/')}
                            className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${isHomePage
                                    ? 'bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 text-gray-900 border border-neon-cyan/30'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            For Employers
                        </button>

                        {/* For Candidates / Skills */}
                        <button
                            onClick={() => navigate('/skill-development')}
                            className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${isSkillsPage
                                    ? 'bg-gradient-to-r from-neon-green/10 to-emerald-500/10 text-gray-900 border border-neon-green/30'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Skills & Jobs
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-2" />

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/signin')}
                            className="px-5 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-all font-medium"
                        >
                            Sign In
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/signup?type=employer')}
                            className="px-5 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-full font-semibold shadow-lg shadow-neon-cyan/20 hover:shadow-neon-cyan/40 transition-all"
                        >
                            Start Hiring Free
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 p-2"
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
                        className="md:hidden mt-4 space-y-3 pb-4 border-t border-gray-100 pt-4"
                    >
                        <button
                            onClick={() => { navigate('/'); setIsOpen(false); }}
                            className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${isHomePage
                                    ? 'bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Building2 className="w-5 h-5" />
                            For Employers
                        </button>

                        <button
                            onClick={() => { navigate('/skill-development'); setIsOpen(false); }}
                            className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${isSkillsPage
                                    ? 'bg-gradient-to-r from-neon-green/10 to-emerald-500/10 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <GraduationCap className="w-5 h-5" />
                            Skills & Jobs
                        </button>

                        <div className="border-t border-gray-100 pt-3 space-y-3">
                            <button
                                onClick={() => { navigate('/signin'); setIsOpen(false); }}
                                className="w-full px-5 py-3 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-all font-medium"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { navigate('/signup?type=employer'); setIsOpen(false); }}
                                className="w-full px-5 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-full font-semibold"
                            >
                                Start Hiring Free
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}
