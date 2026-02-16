import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative w-64 h-64 mx-auto mb-8">
                        {/* Abstract 404 Illustration */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 leading-none select-none">
                                404
                            </span>
                        </div>
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-4 top-10 bg-white p-3 rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-50"
                        >
                            <Search size={24} className="text-indigo-600" />
                        </motion.div>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-3">Page Not Found</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        The page you are looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
                        >
                            <Home size={18} />
                            Go Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all hover:border-slate-300"
                        >
                            <ArrowLeft size={18} />
                            Go Back
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
