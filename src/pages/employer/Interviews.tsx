import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, X, Calendar, Clock, User, MapPin, Phone, Mail, Briefcase, ArrowRight, CalendarCheck, CalendarX, VideoIcon as Video, Star, CheckCircle } from 'lucide-react';
import ScheduleInterviewModal from '../../components/ScheduleInterviewModal';
import { API_BASE_URL } from '../../lib/api';
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

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/interviews/employer`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
                });
                const data = await response.json();

                if (data.success && data.interviews) {
                    const formattedInterviews: Interview[] = data.interviews.map((int: any) => ({
                        id: int.id,
                        candidateName: int.candidate?.name || 'Unknown',
                        role: int.job?.title || 'Unknown',
                        date: int.scheduled_date || int.date,
                        time: new Date(int.scheduled_date || int.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        duration: int.duration || "45 mins",
                        type: int.type,
                        status: int.status,
                        avatar: int.candidate?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(int.candidate?.name || 'User')}&background=random`,
                        email: int.candidate?.email,
                        phone: int.candidate?.phone,
                        location: int.candidate?.location || "Remote",
                        interviewer: int.interviewer,
                        meetingLink: int.meeting_link,
                        notes: int.notes,
                        cancellationReason: int.cancellation_reason
                    }));
                    setInterviews(formattedInterviews);
                } else {
                    // Fallback mock data
                    setInterviews([
                        {
                            id: 1,
                            candidateName: "Priya Sharma",
                            role: "Senior Full Stack Developer",
                            date: "2024-12-05",
                            time: "10:30 AM",
                            duration: "60 mins",
                            type: "Technical",
                            status: "Scheduled",
                            avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=random",
                            interviewer: "Sarah Conners"
                        },
                        {
                            id: 2,
                            candidateName: "Rahul Verma",
                            role: "Data Scientist",
                            date: "2024-12-05",
                            time: "02:00 PM",
                            duration: "45 mins",
                            type: "Video",
                            status: "Pending",
                            avatar: "https://ui-avatars.com/api/?name=Rahul+Verma&background=random",
                            interviewer: "David Miller"
                        }
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch interviews:', error);
            }
        };

        fetchInterviews();
    }, []);

    const handleSchedule = async (data: any) => {
        const newInterview: Interview = {
            id: Date.now(),
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'Completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'Selected': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Interview Pipeline</h1>
                    <p className="text-[var(--text-muted)] mt-1 font-medium">Coordinate and track candidate assessments live.</p>
                </div>
                <button
                    onClick={() => setShowScheduleModal(true)}
                    className="btn-saas-primary group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>New Interview Slot</span>
                </button>
            </div>

            {/* Smart Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search candidates or job roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['all', 'scheduled', 'completed', 'pending', 'cancelled'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setFilterStatus(filter)}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl border transition-all shrink-0
                                ${filterStatus === filter
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-indigo-600/30'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredInterviews.map((interview, index) => (
                        <motion.div
                            key={interview.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="saas-card flex flex-col group overflow-hidden"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-page)] p-0.5 border border-[var(--border-subtle)] overflow-hidden shrink-0">
                                            <img src={interview.avatar} alt={interview.candidateName} className="w-full h-full object-cover rounded-lg" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-[var(--text-main)] group-hover:text-indigo-600 transition-colors truncate max-w-[150px]">
                                                {interview.candidateName}
                                            </h3>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{interview.role}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(interview.status)}`}>
                                        {interview.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-page)] rounded-xl border border-[var(--border-subtle)]/50">
                                        <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600">
                                            <Calendar size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase">Date</span>
                                            <span className="text-[11px] font-bold text-[var(--text-main)]">
                                                {new Date(interview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-page)] rounded-xl border border-[var(--border-subtle)]/50">
                                        <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-600">
                                            <Clock size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase">Time</span>
                                            <span className="text-[11px] font-bold text-[var(--text-main)] italic">{interview.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-3 border-t border-[var(--border-subtle)]/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black">
                                            {interview.interviewer?.charAt(0) || 'AI'}
                                        </div>
                                        <span className="text-[10px] font-bold text-[var(--text-muted)]">Interviewer: <span className="text-[var(--text-main)]">{interview.interviewer || 'AI Assistant'}</span></span>
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${interview.type === 'Technical' ? 'text-amber-500' : 'text-indigo-600'}`}>
                                        {interview.type}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-[var(--bg-page)]/50 border-t border-[var(--border-subtle)] flex gap-2">
                                <button
                                    onClick={() => handleJoinInterview(interview)}
                                    disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                                >
                                    <Video size={14} /> Start
                                </button>
                                <button
                                    onClick={() => handleRescheduleInterview(interview)}
                                    disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                    className="px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-xl text-[var(--text-main)] hover:border-indigo-600/30 transition-all disabled:opacity-30"
                                >
                                    <CalendarCheck size={14} />
                                </button>
                                <button
                                    onClick={() => handleCancelInterview(interview)}
                                    disabled={interview.status === 'Cancelled' || interview.status === 'Completed'}
                                    className="px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-xl text-[var(--text-main)] hover:text-red-500 hover:border-red-500/30 transition-all disabled:opacity-30"
                                >
                                    <CalendarX size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty Context */}
            {filteredInterviews.length === 0 && (
                <div className="saas-card p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-[var(--bg-page)] rounded-full flex items-center justify-center text-[var(--text-muted)] border-4 border-[var(--border-subtle)]">
                        <Calendar size={40} strokeWidth={1} />
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-xl font-black text-[var(--text-main)] mb-2">No interviews found</h3>
                        <p className="text-[var(--text-muted)] font-medium text-sm">Schedule candidate sessions or adjust your current filter settings.</p>
                    </div>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="btn-saas-primary"
                    >
                        Schedule First Session
                    </button>
                </div>
            )}

            {/* Modals using SaaS theme */}
            <ScheduleInterviewModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSchedule={handleSchedule}
            />

            {/* Reschedule Modal */}
            {showRescheduleModal && selectedInterview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="saas-card p-8 w-full max-w-md shadow-2xl relative"
                    >
                        <button onClick={() => setShowRescheduleModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)]">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-2">Reschedule Session</h2>
                        <p className="text-sm text-[var(--text-muted)] mb-6 font-medium">Changing time for <span className="text-indigo-600 font-bold">{selectedInterview.candidateName}</span></p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">New Date</label>
                                <input
                                    type="date"
                                    defaultValue={selectedInterview.date}
                                    className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-600 text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">New Time</label>
                                <input
                                    type="time"
                                    defaultValue="10:00"
                                    className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-600 text-sm font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="btn-saas-primary text-sm uppercase tracking-widest"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && selectedInterview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="saas-card p-8 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-2">Cancel Interview</h2>
                        <p className="text-sm text-[var(--text-muted)] mb-6 font-medium">Removing <span className="text-red-500 font-bold">{selectedInterview.candidateName}</span> from the schedule.</p>

                        <textarea
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Reason for cancellation (required)..."
                            rows={3}
                            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl py-3 px-4 focus:outline-none focus:border-red-500 text-sm font-medium mb-8"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm font-black uppercase tracking-widest text-[var(--text-muted)]"
                            >
                                Back
                            </button>
                            <button
                                onClick={confirmCancelInterview}
                                disabled={!cancellationReason.trim()}
                                className="py-3 bg-red-600 text-white rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-700 transition-colors"
                            >
                                Terminate
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && selectedInterview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="saas-card p-8 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight mb-2">Rate Candidate</h2>
                        <p className="text-sm text-[var(--text-muted)] mb-6 font-medium">Share your final assessment for <span className="text-indigo-600 font-bold">{selectedInterview.candidateName}</span>.</p>

                        <div className="flex justify-center gap-3 mb-8 p-4 bg-[var(--bg-page)] rounded-2xl border border-[var(--border-subtle)]/50">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="hover:scale-125 transition-all transform active:scale-90"
                                >
                                    <Star
                                        size={32}
                                        className={star <= rating ? 'text-amber-500 fill-amber-500' : 'text-[var(--text-muted)] hover:text-amber-400'}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={ratingFeedback}
                            onChange={(e) => setRatingFeedback(e.target.value)}
                            placeholder="Optional performance feedback..."
                            rows={3}
                            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-600 text-sm font-medium mb-8"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setShowRatingModal(false);
                                    setRating(0);
                                }}
                                className="py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-sm font-black uppercase tracking-widest text-[var(--text-muted)]"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => {
                                    setInterviews(interviews.map(i =>
                                        i.id === selectedInterview.id ? { ...i, rating: rating } : i
                                    ));
                                    setShowRatingModal(false);
                                }}
                                disabled={rating === 0}
                                className="btn-saas-primary text-sm uppercase tracking-widest disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default EmployerInterviews;
