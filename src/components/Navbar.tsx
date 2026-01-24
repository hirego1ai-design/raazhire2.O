import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

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
    const isSkillsPage = location.pathname === '/upskill' || location.pathname.startsWith('/upskill/');

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
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <img
                            src="/hirego-logo.png"
                            alt="HireGo AI"
                            className="h-14 w-auto object-contain"
                        />
                    </motion.div>

                    {/* Desktop Menu - Integrated Right Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Navigation Links */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/upskill')}
                                className={`text-sm font-semibold transition-colors ${isSkillsPage
                                    ? 'text-electric-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Skills
                            </button>

                            <button
                                onClick={() => navigate('/jobs')}
                                className={`text-sm font-semibold transition-colors ${location.pathname.startsWith('/jobs')
                                    ? 'text-electric-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Jobs
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className={`text-sm font-semibold transition-colors ${isHomePage
                                    ? 'text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                For Employers
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/signin')}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
                            >
                                Sign In
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/signup?type=employer')}
                                className="px-5 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-full font-semibold shadow-lg shadow-neon-cyan/20 hover:shadow-neon-cyan/40 transition-all"
                            >
                                Sign Up
                            </motion.button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
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
                            onClick={() => { navigate('/upskill'); setIsOpen(false); }}
                            className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${isSkillsPage
                                ? 'bg-gray-50 text-electric-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Skills
                        </button>

                        <button
                            onClick={() => { navigate('/jobs'); setIsOpen(false); }}
                            className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${location.pathname.startsWith('/jobs')
                                ? 'bg-gray-50 text-electric-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Jobs
                        </button>

                        <button
                            onClick={() => { navigate('/'); setIsOpen(false); }}
                            className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${isHomePage
                                ? 'bg-gray-50 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            For Employers
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
                                Sign Up
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}
