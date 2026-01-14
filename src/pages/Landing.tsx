import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Briefcase, Zap, Shield, Globe } from 'lucide-react';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        { icon: Sparkles, title: 'AI-Powered Screening', desc: 'Smart algorithms rank candidates instantly' },
        { icon: Users, title: 'Video Interviews', desc: 'Proctored AI assessments with behavioral analysis' },
        { icon: Briefcase, title: 'Job Matching', desc: 'Precision matching based on skills & culture fit' },
        { icon: Zap, title: 'Instant Hiring', desc: 'Reduce time-to-hire from weeks to days' },
        { icon: Shield, title: 'Anti-Cheating AI', desc: 'Advanced proctoring ensures fair assessments' },
        { icon: Globe, title: 'Global Talent Pool', desc: 'Access candidates from around the world' },
    ];

    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-4">
            <div className="max-w-6xl w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple mb-6">
                        Hire in <span className="underline decoration-4 decoration-neon-cyan">10 minutes</span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        AI-powered hiring that delivers top talent in <strong>10 days</strong>. No more endless screening.
                        Experience the future of recruitment.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full text-lg font-medium hover:shadow-lg hover:shadow-neon-cyan/30 transition-all cursor-pointer"
                        >
                            Get Started Free
                        </button>
                        <button
                            onClick={() => navigate('/signin')}
                            className="px-8 py-3 bg-white/10 border border-white/20 rounded-full text-lg font-medium hover:bg-white/20 transition-all cursor-pointer"
                        >
                            Sign In
                        </button>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-neon-cyan/50 transition-all group"
                        >
                            <feature.icon className="w-10 h-10 text-neon-cyan mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                >
                    <div>
                        <div className="text-4xl font-bold text-neon-cyan">10K+</div>
                        <div className="text-gray-400">Companies</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-neon-purple">500K+</div>
                        <div className="text-gray-400">Candidates</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-neon-pink">95%</div>
                        <div className="text-gray-400">Satisfaction</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-green-400">70%</div>
                        <div className="text-gray-400">Faster Hiring</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Landing;
