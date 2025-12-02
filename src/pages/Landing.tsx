import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    const testLinks = [
        { title: 'Candidate Dashboard', path: '/candidate/dashboard', color: 'from-blue-600 to-blue-500' },
        { title: 'Employer Dashboard', path: '/employer/dashboard', color: 'from-purple-600 to-purple-500' },
        { title: 'Admin Dashboard', path: '/admin/dashboard', color: 'from-pink-600 to-pink-500' },
        { title: 'Employer Candidates', path: '/employer/candidates', color: 'from-green-600 to-green-500' },
        { title: 'Post a Job', path: '/employer/post-job', color: 'from-yellow-600 to-yellow-500' },
        { title: 'Candidate Jobs', path: '/candidate/jobs', color: 'from-indigo-600 to-indigo-500' },
    ];

    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-4">
            <div className="max-w-6xl w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple mb-6">
                        Hire in <span className="underline decoration-4 decoration-neon-cyan">10 minutes</span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        AI-powered hiring that delivers top talent in <strong>10 days</strong>. No more endless screening.
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="inline-block px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full text-lg font-medium hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        Get Started
                    </button>
                </motion.div>

                {/* Testing Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="bg-black/40 rounded-xl backdrop-blur-sm p-8 border border-white/10"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center text-neon-cyan">🧪 Testing Portal - Direct Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testLinks.map((link, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                onClick={() => navigate(link.path)}
                                className={`p-4 rounded-xl bg-gradient-to-r ${link.color} hover:scale-105 transition-transform font-semibold shadow-lg`}
                            >
                                {link.title}
                            </motion.button>
                        ))}
                    </div>
                    <p className="text-center text-gray-400 text-sm mt-6">
                        💡 No login required - Click any button to explore the portal
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default Landing;
