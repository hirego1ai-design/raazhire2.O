import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Video, CheckCircle } from 'lucide-react';

interface DashboardJobCardProps {
    title: string;
    location: string;
    salary: string;
    payCycle: string;
    workMode: string;
    jobType: string;
    matchPercentage: number;
    colorTheme: 'green' | 'pink' | 'purple' | 'blue';
    logo?: string;
    jobId?: string;
}

const themeStyles = {
    green: {
        border: 'border-neon-green',
        shadow: 'shadow-[0_0_15px_rgba(57,255,20,0.3)]',
        button: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        text: 'text-neon-green',
        progress: '#39FF14'
    },
    pink: {
        border: 'border-neon-pink',
        shadow: 'shadow-[0_0_15px_rgba(255,20,147,0.3)]',
        button: 'bg-gradient-to-r from-pink-500 to-rose-500',
        text: 'text-neon-pink',
        progress: '#FF1493'
    },
    purple: {
        border: 'border-neon-purple',
        shadow: 'shadow-[0_0_15px_rgba(147,51,234,0.3)]',
        button: 'bg-gradient-to-r from-purple-500 to-indigo-500',
        text: 'text-neon-purple',
        progress: '#9333EA'
    },
    blue: {
        border: 'border-neon-cyan',
        shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
        button: 'bg-gradient-to-r from-cyan-500 to-blue-500',
        text: 'text-neon-cyan',
        progress: '#06B6D4'
    }
};

const DashboardJobCard: React.FC<DashboardJobCardProps> = ({
    title,
    location,
    salary,
    payCycle,
    workMode,
    jobType,
    matchPercentage,
    colorTheme,
    logo,
    jobId
}) => {
    const theme = themeStyles[colorTheme];
    const navigate = useNavigate();
    const [showAssessmentModal, setShowAssessmentModal] = useState(false);
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;

    const handleApply = () => {
        setShowAssessmentModal(true);
    };

    const proceedToAssessment = () => {
        navigate(`/candidate/live-assessment/${jobId || '1'}`);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`relative p-6 rounded-3xl bg-black/40 backdrop-blur-xl border ${theme.border} ${theme.shadow} flex flex-col justify-between h-full overflow-hidden group`}
        >
            {/* Background Glow Effect */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${colorTheme}-500/20 blur-[50px] rounded-full pointer-events-none`} />

            <div className="flex justify-between items-start mb-4">
                {/* Logo */}
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 text-white font-bold">
                    {logo || 'H'}
                </div>
            </div>

            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{location}</p>

                    <div className="space-y-1 mb-6">
                        <p className="text-gray-300 text-sm">{salary}</p>
                        <p className="text-gray-500 text-xs">{payCycle}</p>
                    </div>

                    <div className="flex gap-3">
                        <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 text-xs">
                            {workMode}
                        </span>
                        <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 text-xs">
                            {jobType}
                        </span>
                    </div>
                </div>

                {/* Match Circle */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="transform -rotate-90 w-20 h-20">
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-gray-700"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                stroke={theme.progress}
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-lg font-bold text-white">{matchPercentage}%</span>
                            <p className="text-[10px] text-gray-400">Match</p>
                        </div>
                    </div>

                    <motion.button
                        onClick={handleApply}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-2 rounded-full text-white text-sm font-medium ${theme.button} shadow-lg shadow-${colorTheme}-500/20`}
                    >
                        Apply Now
                    </motion.button>
                </div>
            </div>

            {/* Assessment Modal */}
            <AnimatePresence>
                {showAssessmentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowAssessmentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f1629] border border-neon-cyan/30 rounded-xl p-8 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(0,243,255,0.3)]"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-block p-4 rounded-full bg-neon-cyan/20 mb-4">
                                    <Video className="text-neon-cyan" size={48} />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Mandatory Live Assessment</h2>
                                <p className="text-gray-400">To complete your application, you must complete a live video assessment</p>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <CheckCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <div className="font-medium text-blue-400 text-sm">7-8 Questions</div>
                                        <div className="text-xs text-gray-400">2-3 minutes per question</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <CheckCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <div className="font-medium text-blue-400 text-sm">Real-time AI Analysis</div>
                                        <div className="text-xs text-gray-400">Communication, knowledge, confidence</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                    <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <div className="font-medium text-yellow-400 text-sm">Camera Required</div>
                                        <div className="text-xs text-gray-400">Full proctoring active</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAssessmentModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={proceedToAssessment}
                                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold"
                                >
                                    Start Assessment
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DashboardJobCard;
