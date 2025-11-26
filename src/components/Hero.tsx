import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase } from 'lucide-react';
import Globe from './Globe';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                        >
                            <span className="block text-gradient glow-text">Hiring in 10 Minutes</span>
                            <span className="text-white">Not 10 Days</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-xl text-gray-300 max-w-xl"
                        >
                            AI-powered hiring platform that reduces recruitment time by 90%. Video resumes, proctored assessments, and automated screening - all in one place.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="glass glass-hover rounded-2xl p-2 shadow-3d-cyan"
                        >
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                                    <Briefcase className="text-neon-cyan" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Job title or keyword"
                                        className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                                    <MapPin className="text-neon-purple" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-400"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-3d btn-primary px-8 py-3 flex items-center gap-2 justify-center"
                                >
                                    <Search size={20} />
                                    Search
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="flex gap-8 pt-4"
                        >
                            <div>
                                <div className="text-4xl font-bold text-gradient">90%</div>
                                <div className="text-gray-400 text-sm">Time Reduction</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gradient">AI</div>
                                <div className="text-gray-400 text-sm">Powered</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gradient">100%</div>
                                <div className="text-gray-400 text-sm">Automated</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Globe */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="relative h-[500px] lg:h-[600px]"
                    >
                        <Globe />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
