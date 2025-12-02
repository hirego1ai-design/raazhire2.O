import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Video, Users, MoreHorizontal, Calendar, Briefcase, Building2, ChevronRight, CalendarX, CalendarCheck, MapPin, FileText, User } from 'lucide-react';

interface Interview {
    id: number;
    candidateName: string;
    companyName?: string;
    role: string;
    date: string;
    time: string;
    type: 'Video' | 'Technical' | 'HR' | 'Final';
    status: 'Scheduled' | 'Completed' | 'Pending' | 'Selected' | 'Rejected' | 'Cancelled';
    avatar: string;
    participants?: string[];
    roundTag?: string;
    jobDescription?: string;
    companyProfile?: string;
    instructions?: string;
    mode?: 'Virtual' | 'Face to Face';
    address?: string;
}

interface CompactInterviewCardProps {
    interview: Interview;
    isEmployer?: boolean;
    onJoin?: () => void;
    onViewDetails?: () => void;
    onClick?: () => void;
    onCancel?: () => void;
    onReschedule?: () => void;
}

const statusColors = {
    Scheduled: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Completed: 'text-green-400 bg-green-400/10 border-green-400/20',
    Pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Selected: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
    Rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
    Cancelled: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

const CompactInterviewCard: React.FC<CompactInterviewCardProps> = ({
    interview,
    isEmployer,
    onJoin,
    onViewDetails,
    onClick,
    onCancel,
    onReschedule
}) => {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-[#0f1629] to-[#1a1f3a] border border-white/10 rounded-3xl p-5 transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(0,243,255,0.15)] hover:border-neon-cyan/40 overflow-hidden"
        >
            {/* Subtle 3D Background Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-neon-cyan/5 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neon-purple/5 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={interview.avatar}
                            alt={isEmployer ? interview.candidateName : interview.companyName || ''}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
                        />
                        <div>
                            <h3 className="font-bold text-white text-sm leading-tight">
                                {isEmployer ? interview.candidateName : interview.companyName}
                            </h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <Briefcase size={10} />
                                {interview.role}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[interview.status]} font-medium`}
                    >
                        {interview.status}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
                        <Calendar className="text-neon-cyan flex-shrink-0" size={12} />
                        <p className="text-[11px] text-white font-medium">
                            {new Date(interview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
                        <Clock className="text-neon-purple flex-shrink-0" size={12} />
                        <p className="text-[11px] text-white font-medium">{interview.time}</p>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
                        <Video className="text-yellow-400 flex-shrink-0" size={12} />
                        <p className="text-[11px] text-white font-medium">{interview.mode || 'Virtual'}</p>
                    </div>
                    {interview.mode === 'Face to Face' && interview.address && (
                        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <MapPin className="text-orange-400 flex-shrink-0" size={12} />
                            <p className="text-[11px] text-orange-400 font-medium truncate">{interview.address}</p>
                        </div>
                    )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center gap-1">
                        <Video size={10} /> {interview.type}
                    </span>
                    {interview.roundTag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple font-medium">
                            {interview.roundTag}
                        </span>
                    )}
                </div>

                {/* Pre-Interview Guidelines */}
                {interview.instructions && (
                    <div className="mb-4 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <div className="flex items-start gap-2">
                            <FileText className="text-yellow-400 flex-shrink-0 mt-0.5" size={12} />
                            <div>
                                <p className="text-[10px] font-semibold text-yellow-400 mb-1">Guidelines</p>
                                <p className="text-[10px] text-yellow-300/80 leading-relaxed">{interview.instructions}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                    {/* Primary Action Row */}
                    <div className="flex gap-2">
                        <button
                            onClick={onClick || onViewDetails}
                            className="flex-1 py-2 text-[11px] font-semibold rounded-2xl text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                        >
                            <User size={12} />
                            View Profile
                        </button>
                        <button
                            onClick={onClick || onJoin}
                            disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                            className="flex-1 py-2 text-[11px] font-bold rounded-2xl text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1.5"
                        >
                            <Video size={12} />
                            Join
                        </button>
                    </div>

                    {/* Secondary Action Row */}
                    {(onCancel || onReschedule) && (
                        <div className="flex gap-2">
                            {onReschedule && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onReschedule();
                                    }}
                                    disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                    className="flex-1 py-1.5 text-[10px] font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-[0_3px_10px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_14px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1"
                                >
                                    <CalendarCheck size={11} />
                                    Request Reschedule
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CompactInterviewCard;
