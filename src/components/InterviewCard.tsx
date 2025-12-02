
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Video, Users, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Interview {
    id: number;
    candidateName: string;
    role: string;
    date: string; // ISO string
    time: string;
    type: 'Video' | 'Technical' | 'HR';
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    avatar: string;
    participants?: string[];
    roundTag?: string;
}

interface InterviewCardProps {
    interview: Interview;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview }) => {
    const navigate = useNavigate();
    const [showDetails, setShowDetails] = useState(false);

    const handleJoin = () => {
        navigate(`/candidate/interview/${interview.id}`);
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors rounded-2xl p-6 shadow-3d-purple hover:shadow-3d-cyan cursor-pointer group"
            >
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <img
                        src={interview.avatar}
                        alt={interview.candidateName}
                        className="w-16 h-16 rounded-full object-cover border border-white/10"
                    />
                    {/* Info */}
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-gradient transition-all">
                            {interview.candidateName}
                        </h3>
                        <p className="text-gray-400 text-sm">{interview.role}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                                <Clock size={16} className="text-neon-cyan" />
                                {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1">
                                <Video size={16} className="text-neon-purple" />
                                {interview.type}
                            </div>
                            {interview.participants && (
                                <div className="flex items-center gap-1">
                                    <Users size={16} className="text-neon-pink" />
                                    {interview.participants.join(', ')}
                                </div>
                            )}
                            {interview.roundTag && (
                                <span className="px-2 py-1 rounded bg-neon-purple/20 text-neon-purple text-xs">
                                    {interview.roundTag}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4">
                    <button className="btn-3d btn-ghost flex items-center gap-1" onClick={() => setShowDetails(true)}>
                        <Info size={14} /> Details
                    </button>
                    <button className="btn-3d btn-primary" onClick={handleJoin}>
                        Join
                    </button>
                </div>
            </motion.div>

            {/* Details Modal */}
            {showDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0a0e27] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Interview Details</h3>
                        <div className="space-y-3 text-gray-300">
                            <p><strong className="text-white">Role:</strong> {interview.role}</p>
                            <p><strong className="text-white">Date:</strong> {new Date(interview.date).toLocaleDateString()}</p>
                            <p><strong className="text-white">Time:</strong> {interview.time}</p>
                            <p><strong className="text-white">Type:</strong> {interview.type}</p>
                            <p><strong className="text-white">Participants:</strong> {interview.participants?.join(', ') || 'N/A'}</p>
                            <p><strong className="text-white">Round:</strong> {interview.roundTag || 'N/A'}</p>
                            <p><strong className="text-white">Status:</strong> {interview.status}</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowDetails(false)}
                                className="btn-3d btn-ghost"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default InterviewCard;
