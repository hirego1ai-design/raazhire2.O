import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, X, Calendar, Clock, User, MapPin, Phone, Mail, Briefcase, ArrowRight, CalendarCheck, CalendarX, VideoIcon as Video, Star, CheckCircle } from 'lucide-react';
import ScheduleInterviewModal from '../../components/ScheduleInterviewModal';
import { supabase } from '../../lib/supabase';

interface Interview {
    id: number;
    candidateName: string;
    role: string;
    date: string;
    time: string;
    duration: string;
    type: 'Video' | 'Technical' | 'HR' | 'Final';
    status: 'Scheduled' | 'Completed' | 'Pending' | 'Selected' | 'Rejected' | 'Cancelled';
    avatar: string;
    email?: string;
    phone?: string;
    location?: string;
    interviewer?: string;
    meetingLink?: string;
    notes?: string;
    cancellationReason?: string;
    mode?: 'Virtual' | 'Face to Face';
    address?: string;
    rating?: number;
}

const EmployerInterviews: React.FC = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [ratingFeedback, setRatingFeedback] = useState('');

    // Mock Data Load
    // Load Data from Supabase
    useEffect(() => {
        const fetchInterviews = async () => {
            if (!supabase) return;

            const { data } = await supabase
                .from('interviews')
                .select(`
                    *,
                    candidate:candidates(name, email, phone, location),
                    job:jobs(title)
                `)
                .order('date', { ascending: true });

            if (data) {
                const formattedInterviews: Interview[] = data.map((int: any) => ({
                    id: int.id,
                    candidateName: int.candidate?.name || 'Unknown',
                    role: int.job?.title || 'Unknown',
                    date: int.date,
                    time: int.time,
                    duration: int.duration || "45 mins",
                    type: int.type,
                    status: int.status,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(int.candidate?.name || 'User')}&background=random`,
                    email: int.candidate?.email,
                    phone: int.candidate?.phone,
                    location: int.candidate?.location || "Remote",
                    interviewer: int.interviewer,
                    meetingLink: int.meeting_link,
                    notes: int.notes,
                    cancellationReason: int.cancellation_reason
                }));
                setInterviews(formattedInterviews);
            }
        };

        fetchInterviews();
    }, []);

    const handleSchedule = async (data: any) => {
        // In a real app, you'd insert into Supabase here
        // For now, we'll just update local state to reflect "success" after a mock API call
        // But ideally: await supabase.from('interviews').insert({...})

        // Simulating the optimistic update for now as the Modal might not return full DB object structure
        const newInterview: Interview = {
            id: Date.now(), // Temporary ID
            candidateName: data.candidateName,
            role: data.role,
            date: data.date,
            time: data.time,
            duration: data.duration || "45 mins",
            type: data.type,
            status: 'Scheduled',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.candidateName)}&background=random`,
            email: data.email,
            phone: data.phone,
            location: data.location || "Remote",
            interviewer: data.interviewer,
            meetingLink: data.meetingLink
        };
        setInterviews([newInterview, ...interviews]);
        setShowScheduleModal(false);
    };

    const handleCancelInterview = (interview: Interview) => {
        setSelectedInterview(interview);
        setShowCancelModal(true);
    };

    const confirmCancelInterview = async () => {
        if (selectedInterview && cancellationReason.trim()) {
            // Update Supabase
            if (supabase) {
                await supabase
                    .from('interviews')
                    .update({ status: 'Cancelled', cancellation_reason: cancellationReason })
                    .eq('id', selectedInterview.id);
            }

            setInterviews(interviews.map(i =>
                i.id === selectedInterview.id ? { ...i, status: 'Cancelled', cancellationReason } : i
            ));
            setShowCancelModal(false);
            setCancellationReason('');
            setSelectedInterview(null);
        }
    };

    const handleRescheduleInterview = (interview: Interview) => {
        setSelectedInterview(interview);
        setShowRescheduleModal(true);
    };

    const handleJoinInterview = (interview: Interview) => {
        window.open(`/employer/proctored-interview/${interview.id}`, '_blank');
    };

    const filteredInterviews = interviews.filter(interview => {
        const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            interview.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || interview.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'Completed': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'Selected': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Video': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
            case 'Technical': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
            case 'HR': return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
            case 'Final': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Interview Management</h1>
                        <p className="text-gray-400">Manage and track all your scheduled interviews</p>
                    </div>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="btn-3d btn-primary px-6 py-3 flex items-center gap-2 shadow-[0_6px_0_0_#4F46E5] hover:shadow-[0_6px_0_0_#4338CA] active:shadow-[0_2px_0_0_#4338CA] active:translate-y-1"
                    >
                        <Plus size={20} />
                        Schedule Interview
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search candidates or roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                            style={{ borderRadius: '0px' }}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'scheduled', 'completed', 'pending', 'cancelled'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setFilterStatus(filter)}
                                className={`px-4 py-3 text-sm font-medium transition-all ${filterStatus === filter
                                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                    }`}
                                style={{ borderRadius: '0px' }}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Interview Cards Grid - Compact Square Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredInterviews.map((interview, index) => (
                    <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-[#0f1629] to-[#1a1f3a] border border-white/10 rounded-3xl p-5 hover:border-neon-cyan/40 transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(0,243,255,0.15)] relative overflow-hidden"
                    >
                        {/* Subtle 3D Background Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-neon-cyan/5 to-transparent rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neon-purple/5 to-transparent rounded-full blur-xl"></div>
                        
                        <div className="relative z-10">
                            {/* Card Header */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="relative">
                                    <img
                                        src={interview.avatar}
                                        alt={interview.candidateName}
                                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
                                    />
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f1629] ${
                                        interview.status === 'Scheduled' ? 'bg-green-400' :
                                        interview.status === 'Completed' ? 'bg-blue-400' :
                                        interview.status === 'Cancelled' ? 'bg-red-400' : 'bg-yellow-400'
                                    }`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white mb-0.5 truncate">{interview.candidateName}</h3>
                                    <p className="text-xs text-gray-400 truncate">{interview.role}</p>
                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(interview.status)} font-medium`}>
                                            {interview.status}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTypeColor(interview.type)} font-medium`}>
                                            {interview.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Interview Details - Compact */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
                                    <Calendar className="text-neon-cyan flex-shrink-0" size={12} />
                                    <p className="text-[11px] text-white font-medium truncate">{new Date(interview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
                                    <Clock className="text-neon-purple flex-shrink-0" size={12} />
                                    <p className="text-[11px] text-white font-medium">{interview.time} • {interview.duration}</p>
                                </div>

                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
                                    <Video className="text-yellow-400 flex-shrink-0" size={12} />
                                    <p className="text-[11px] text-white font-medium">{interview.mode || 'Virtual'}</p>
                                </div>
                            </div>

                            {/* Action Buttons - Small & Compact */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleJoinInterview(interview)}
                                    disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                    className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[11px] font-bold shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1.5"
                                >
                                    <Video size={13} />
                                    Join Interview
                                </button>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleRescheduleInterview(interview)}
                                        disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                        className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-[10px] font-semibold shadow-[0_3px_10px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_14px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1"
                                    >
                                        <CalendarCheck size={11} />
                                        Reschedule
                                    </button>

                                    <button
                                        onClick={() => handleCancelInterview(interview)}
                                        disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                        className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-semibold shadow-[0_3px_10px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_14px_rgba(239,68,68,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1"
                                    >
                                        <CalendarX size={11} />
                                        Cancel
                                    </button>
                                </div>

                                {/* Rating Button - Shows after Completed */}
                                {interview.status === 'Completed' && (
                                    <button
                                        onClick={() => {
                                            setSelectedInterview(interview);
                                            setRating(interview.rating || 0);
                                            setShowRatingModal(true);
                                        }}
                                        className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-[11px] font-bold shadow-[0_4px_12px_rgba(234,179,8,0.3)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Star size={13} fill={interview.rating ? 'currentColor' : 'none'} />
                                        {interview.rating ? 'Update Rating' : 'Rate Candidate'}
                                    </button>
                                )}
                            </div>

                            {/* Show Rating if exists */}
                            {interview.rating && (
                                <div className="mt-3 flex items-center justify-center gap-1 p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={12}
                                            className={star <= (interview.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredInterviews.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <Calendar className="mx-auto mb-4 text-gray-600" size={64} />
                    <h3 className="text-xl font-bold text-white mb-2">No Interviews Found</h3>
                    <p className="text-gray-400 mb-6">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Schedule your first interview to get started'}
                    </p>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="btn-3d btn-primary px-6 py-3 inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Schedule Interview
                    </button>
                </motion.div>
            )}

            {/* Schedule Modal */}
            <ScheduleInterviewModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSchedule={handleSchedule}
            />

            {/* Reschedule Modal */}
            {showRescheduleModal && selectedInterview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f1629] border-2 border-white/10 p-8 w-full max-w-md"
                        style={{ borderRadius: '0px' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Reschedule Interview</h2>
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">New Date</label>
                                <input
                                    type="date"
                                    defaultValue={selectedInterview.date}
                                    className="w-full px-4 py-3 bg-[#0a0e27] border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                                    style={{ borderRadius: '0px' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">New Time</label>
                                <input
                                    type="time"
                                    defaultValue="10:00"
                                    className="w-full px-4 py-3 bg-[#0a0e27] border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                                    style={{ borderRadius: '0px' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
                                <select
                                    defaultValue={selectedInterview.duration}
                                    className="w-full px-4 py-3 bg-[#0a0e27] border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                                    style={{ borderRadius: '0px' }}
                                >
                                    <option value="30 mins" className="bg-[#0a0e27] text-white">30 minutes</option>
                                    <option value="45 mins" className="bg-[#0a0e27] text-white">45 minutes</option>
                                    <option value="60 mins" className="bg-[#0a0e27] text-white">60 minutes</option>
                                    <option value="90 mins" className="bg-[#0a0e27] text-white">90 minutes</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                                style={{ borderRadius: '0px' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert('Interview rescheduled successfully!');
                                    setShowRescheduleModal(false);
                                }}
                                className="flex-1 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold border-b-4 border-blue-700 hover:from-blue-600 hover:to-blue-700 active:border-b-2 active:translate-y-0.5 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                style={{ borderRadius: '0px' }}
                            >
                                Confirm Reschedule
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Cancel Interview Modal */}
            {showCancelModal && selectedInterview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f1629] border-2 border-white/10 p-8 w-full max-w-md"
                        style={{ borderRadius: '0px' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Cancel Interview</h2>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancellationReason('');
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-300 mb-4">
                                You are about to cancel the interview with <span className="font-bold text-white">{selectedInterview.candidateName}</span>.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Cancellation Reason *</label>
                                <textarea
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Please provide a reason for cancellation..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-[#0a0e27] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 resize-none"
                                    style={{ borderRadius: '0px' }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancellationReason('');
                                }}
                                className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                                style={{ borderRadius: '0px' }}
                            >
                                Go Back
                            </button>
                            <button
                                onClick={confirmCancelInterview}
                                disabled={!cancellationReason.trim()}
                                className="flex-1 py-3 bg-gradient-to-b from-red-500 to-red-600 text-white font-semibold border-b-4 border-red-700 hover:from-red-600 hover:to-red-700 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                style={{ borderRadius: '0px' }}
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && selectedInterview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f1629] border-2 border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Rate Candidate</h2>
                            <button
                                onClick={() => {
                                    setShowRatingModal(false);
                                    setRating(0);
                                    setRatingFeedback('');
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-300 mb-4">
                                How would you rate <span className="font-bold text-white">{selectedInterview.candidateName}</span>'s interview performance?
                            </p>
                            
                            {/* Star Rating */}
                            <div className="flex justify-center gap-3 mb-6 p-4 bg-white/5 rounded-2xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="hover:scale-125 transition-transform"
                                    >
                                        <Star
                                            size={32}
                                            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-300'}
                                        />
                                    </button>
                                ))}
                            </div>

                            {rating > 0 && (
                                <p className="text-center text-sm text-neon-cyan mb-4">
                                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Needs Improvement'}
                                </p>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Feedback (Optional)</label>
                                <textarea
                                    value={ratingFeedback}
                                    onChange={(e) => setRatingFeedback(e.target.value)}
                                    placeholder="Share your feedback about the candidate's performance..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-[#0a0e27] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowRatingModal(false);
                                    setRating(0);
                                    setRatingFeedback('');
                                }}
                                className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (rating > 0 && selectedInterview) {
                                        // Update rating in database
                                        if (supabase) {
                                            await supabase
                                                .from('interviews')
                                                .update({ rating: rating, feedback: ratingFeedback })
                                                .eq('id', selectedInterview.id);
                                        }
                                        
                                        // Update local state
                                        setInterviews(interviews.map(i =>
                                            i.id === selectedInterview.id ? { ...i, rating: rating } : i
                                        ));
                                        
                                        setShowRatingModal(false);
                                        setRating(0);
                                        setRatingFeedback('');
                                    }
                                }}
                                disabled={rating === 0}
                                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold shadow-[0_6px_20px_rgba(234,179,8,0.4)] hover:shadow-[0_8px_28px_rgba(234,179,8,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default EmployerInterviews;
