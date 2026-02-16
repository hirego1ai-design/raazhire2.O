import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UpskillInsights = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-amber-50/30 font-sans p-4 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-200 p-8 md:p-10 max-w-2xl relative z-10"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">AI Skill Insights</h2>
                <p className="text-gray-600 mb-6 text-center">
                    Here you will see personalized AI‑driven insights about your learning progress, skill gaps, and recommended next steps.
                </p>
                <div className="flex justify-center">
                    <Link to="/upskill/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-colors">
                        Back to Dashboard
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default UpskillInsights;
