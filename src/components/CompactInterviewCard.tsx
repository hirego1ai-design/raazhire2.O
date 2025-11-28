import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Video, Users, MoreHorizontal, Calendar, Briefcase, Building2, ChevronRight, CalendarX, CalendarCheck } from 'lucide-react';

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
            whileHover={{ y: -2, borderColor: 'rgba(6, 182, 212, 0.5)' }}
            className="group relative bg-[#0a0e27]/80 backdrop-blur-sm border border-white/10 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/10"
            style={{ borderRadius: '0px' }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={interview.avatar}
                        alt={interview.candidateName}
                        className="w-10 h-10 object-cover border border-white/10"
                        style={{ borderRadius: '0px' }}
                    />
                    <div>
                        <h3 className="font-semibold text-white text-sm leading-tight">
                            {isEmployer ? interview.candidateName : interview.companyName}
                        </h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Briefcase size={10} />
                            {interview.role}
                        </p>
                    </div>
                </div>
                <span
                    className={`text-[10px] px-2 py-0.5 border ${statusColors[interview.status]}`}
                    style={{ borderRadius: '0px' }}
                >
                    {interview.status}
                </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/5 p-2 border border-white/5" style={{ borderRadius: '0px' }}>
                    <p className="text-[10px] text-gray-500 mb-0.5 flex items-center gap-1">
                        <Calendar size={10} /> Date
                    </p>
                    <p className="text-xs text-gray-300 font-medium">
                        {new Date(interview.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                </div>
                <div className="bg-white/5 p-2 border border-white/5" style={{ borderRadius: '0px' }}>
                    <p className="text-[10px] text-gray-500 mb-0.5 flex items-center gap-1">
                        <Clock size={10} /> Time
                    </p>
                    <p className="text-xs text-gray-300 font-medium">{interview.time}</p>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span
                    className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 flex items-center gap-1"
                    style={{ borderRadius: '0px' }}
                >
                    <Video size={10} /> {interview.type}
                </span>
                {interview.roundTag && (
                    <span
                        className="text-[10px] px-2 py-0.5 bg-neon-purple/10 border border-neon-purple/20 text-neon-purple"
                        style={{ borderRadius: '0px' }}
                    >
                        {interview.roundTag}
                    </span>
                )}
            </div>

            {/* Actions - With Cancel/Reschedule Buttons */}
            <div className="space-y-2">
                {/* Primary Action Row */}
                <div className="flex gap-2">
                    <button
                        onClick={onClick || onViewDetails}
                        className="flex-1 py-1.5 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        style={{ borderRadius: '0px' }}
                    >
                        Details
                    </button>
                    <button
                        onClick={onClick || onJoin}
                        disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                        className="flex-1 py-1.5 text-xs font-medium text-black bg-neon-cyan hover:bg-cyan-400 transition-colors shadow-lg shadow-neon-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderRadius: '0px' }}
                    >
                        Join
                    </button>
                </div>

                {/* Secondary Action Row - Cancel/Reschedule */}
                {(onCancel || onReschedule) && (
                    <div className="flex gap-2">
                        {onReschedule && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReschedule();
                                }}
                                disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                className="flex-1 py-1.5 text-xs font-medium bg-gradient-to-b from-blue-500 to-blue-600 text-white border-b-2 border-blue-700 hover:from-blue-600 hover:to-blue-700 active:border-b active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                style={{ borderRadius: '0px' }}
                            >
                                <CalendarCheck size={12} />
                                Reschedule
                            </button>
                        )}
                        {onCancel && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCancel();
                                }}
                                disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                className="flex-1 py-1.5 text-xs font-medium bg-gradient-to-b from-red-500 to-red-600 text-white border-b-2 border-red-700 hover:from-red-600 hover:to-red-700 active:border-b active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                style={{ borderRadius: '0px' }}
                            >
                                <CalendarX size={12} />
                                Cancel
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CompactInterviewCard;
