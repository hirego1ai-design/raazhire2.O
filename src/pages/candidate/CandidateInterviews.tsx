import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, XCircle, ArrowRight, Video, Monitor, Mic, Wifi, FileText, Building2, AlertTriangle, CalendarClock, CalendarX, CalendarCheck, X } from 'lucide-react';
import CompactInterviewCard from '../../components/CompactInterviewCard';
import ProctoringInterview from '../../components/ProctoringInterview';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Interview {
    id: number;
    candidateName: string;
    companyName: string;
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
    stage?: 'Applied' | 'Shortlisted' | 'Scheduled';
    cancellationReason?: string;
}

const stages = ['Round 1', 'Round 2', 'Round 3', 'Final'];

const CandidateInterviews: React.FC = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [activeProctoring, setActiveProctoring] = useState<Interview | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    // Fetch Data
    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interviews/candidate`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
                });

                const data = await res.json();

                if (data.success && data.interviews) {
                    const formattedInterviews: Interview[] = data.interviews.map((int: any) => ({
                        id: int.id,
                        candidateName: 'Me',
                        companyName: int.employer?.name || 'Unknown Company',
                        role: int.job?.title || 'Unknown Role',
                        date: new Date(int.scheduled_date).toLocaleDateString(),
                        time: new Date(int.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: int.type,
                        status: int.status,
                        avatar: int.employer?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(int.employer?.name || 'Company')}&background=random`,
                        participants: [],
                        roundTag: int.round || 'Round 1',
                        jobDescription: int.job?.description,
                        companyProfile: int.job?.company || "Company profile...",
                        instructions: "Please be ready 5 mins early."
                    }));
                    setInterviews(formattedInterviews);
                } else {
                    setInterviews([]);
                }
            } catch (err) {
                console.error("Failed to fetch interviews", err);
            }
        };

        fetchInterviews();
    }, []);

    const openDetails = (interview: Interview) => {
        setSelectedInterview(interview);
        setDetailsOpen(true);
    };

    const handleCancelClick = () => {
        setDetailsOpen(false);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        if (selectedInterview && cancellationReason.trim()) {
            // Optimistic update
            const updatedInterviews = interviews.map(i =>
                i.id === selectedInterview.id ? { ...i, status: 'Cancelled', cancellationReason } as Interview : i
            );
            setInterviews(updatedInterviews);

            if (supabase) {
                const { error } = await supabase
                    .from('interviews')
                    .update({
                        status: 'Cancelled',
                        cancellation_reason: cancellationReason
                    })
                    .eq('id', selectedInterview.id);

                if (error) {
                    console.error('Error cancelling interview:', error);
                    // Revert if failed (optional, but good practice)
                    // For now we just log it
                }
            }

            setShowCancelModal(false);
            setCancellationReason('');
        }
    };

    const handleRescheduleClick = () => {
        setDetailsOpen(false);
        setShowRescheduleModal(true);
    };

    const confirmReschedule = async () => {
        // In a real app, this might create a "Reschedule Request" record
        // For now, we'll just update the status to 'Pending' and log the request
        if (selectedInterview) {
            // Optimistic update
            const updatedInterviews = interviews.map(i =>
                i.id === selectedInterview.id ? { ...i, status: 'Pending' } as Interview : i
            );
            setInterviews(updatedInterviews);

            if (supabase) {
                const { error } = await supabase
                    .from('interviews')
                    .update({
                        status: 'Pending',
                        // Assuming we have fields for reschedule request
                        // reschedule_requested: true,
                        // reschedule_reason: ...
                    })
                    .eq('id', selectedInterview.id);

                if (error) {
                    console.error('Error rescheduling interview:', error);
                }
            }

            setShowRescheduleModal(false);
            alert('Interview reschedule request sent! The employer will be notified.');
            setSelectedInterview(null);
        }
    };

    const handleJoinInterview = () => {
        if (selectedInterview) {
            navigate(`/candidate/interview/${selectedInterview.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#050511] text-white p-6 font-outfit">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                        My Interviews
                    </h1>
                    <p className="text-gray-400">Track and manage your interview schedule by round</p>
                </motion.div>

                {/* Interview Funnel by Rounds */}
                <div className="space-y-6">
                    {stages.map((stage) => {
                        const stageInterviews = interviews.filter(i => i.roundTag === stage);
                        if (stageInterviews.length === 0) return null;

                        return (
                            <div key={stage} className="space-y-3">
                                <h2 className="text-xl font-bold text-neon-cyan">{stage}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {stageInterviews.map((interview) => (
                                        <CompactInterviewCard
                                            key={interview.id}
                                            interview={interview}
                                            onClick={() => openDetails(interview)}
                                            onCancel={() => {
                                                setSelectedInterview(interview);
                                                setShowCancelModal(true);
                                            }}
                                            onReschedule={() => {
                                                setSelectedInterview(interview);
                                                setShowRescheduleModal(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Details Modal */}
                <AnimatePresence>
                    {detailsOpen && selectedInterview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#0a0e27] border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                                style={{ borderRadius: '0px' }}
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-neon-purple/10 to-transparent flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={selectedInterview.avatar}
                                            alt={selectedInterview.companyName}
                                            className="w-16 h-16 object-cover border border-white/10"
                                            style={{ borderRadius: '0px' }}
                                        />
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedInterview.companyName}</h2>
                                            <p className="text-gray-400">{selectedInterview.role}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setDetailsOpen(false)} className="text-gray-400 hover:text-white">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 overflow-y-auto space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-4 border border-white/5" style={{ borderRadius: '0px' }}>
                                            <h4 className="text-sm font-semibold text-gray-300 mb-1">Interview Type</h4>
                                            <p className="text-white flex items-center gap-2"><Video size={16} className="text-neon-purple" /> {selectedInterview.type}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 border border-white/5" style={{ borderRadius: '0px' }}>
                                            <h4 className="text-sm font-semibold text-gray-300 mb-1">Round</h4>
                                            <p className="text-white">{selectedInterview.roundTag}</p>
                                        </div>
                                    </div>

                                    <section>
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <Building2 size={18} className="text-neon-cyan" /> Company Profile
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {selectedInterview.companyProfile || "No company profile available."}
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <FileText size={18} className="text-neon-cyan" /> Job Description
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {selectedInterview.jobDescription || "No job description available."}
                                        </p>
                                    </section>

                                    <section className="bg-yellow-500/5 border border-yellow-500/20 p-4" style={{ borderRadius: '0px' }}>
                                        <h3 className="text-lg font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                                            <AlertTriangle size={18} /> Important Instructions
                                        </h3>
                                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                            <li>Ensure you are in a quiet environment.</li>
                                            <li>Stable internet connection is required.</li>
                                            <li>Camera and Microphone access will be requested.</li>
                                            <li>Tab switching is monitored and limited to 3 violations.</li>
                                        </ul>
                                    </section>

                                    {/* Device Check */}
                                    <div className="border-t border-white/10 pt-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">System Check</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="flex flex-col items-center p-3 bg-white/5 border border-white/10" style={{ borderRadius: '0px' }}>
                                                <Monitor className="text-green-400 mb-2" size={24} />
                                                <span className="text-xs text-gray-300">Camera</span>
                                                <span className="text-[10px] text-green-400">Ready</span>
                                            </div>
                                            <div className="flex flex-col items-center p-3 bg-white/5 border border-white/10" style={{ borderRadius: '0px' }}>
                                                <Mic className="text-green-400 mb-2" size={24} />
                                                <span className="text-xs text-gray-300">Microphone</span>
                                                <span className="text-[10px] text-green-400">Ready</span>
                                            </div>
                                            <div className="flex flex-col items-center p-3 bg-white/5 border border-white/10" style={{ borderRadius: '0px' }}>
                                                <Wifi className="text-green-400 mb-2" size={24} />
                                                <span className="text-xs text-gray-300">Internet</span>
                                                <span className="text-[10px] text-green-400">Strong</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer with 3D Carved Buttons */}
                                <div className="p-6 border-t border-white/10 bg-[#050511] flex justify-end gap-3">
                                    <button
                                        onClick={handleCancelClick}
                                        disabled={selectedInterview.status === 'Cancelled' || selectedInterview.status === 'Completed'}
                                        className="px-5 py-2.5 bg-gradient-to-b from-red-500 to-red-600 text-white font-semibold border-b-4 border-red-700 hover:from-red-600 hover:to-red-700 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-2"
                                        style={{ borderRadius: '0px' }}
                                    >
                                        <CalendarX size={18} />
                                        Cancel Interview
                                    </button>
                                    <button
                                        onClick={handleRescheduleClick}
                                        disabled={selectedInterview.status === 'Cancelled' || selectedInterview.status === 'Completed'}
                                        className="px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold border-b-4 border-blue-700 hover:from-blue-600 hover:to-blue-700 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
                                        style={{ borderRadius: '0px' }}
                                    >
                                        <CalendarCheck size={18} />
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={handleJoinInterview}
                                        disabled={selectedInterview.status === 'Cancelled' || selectedInterview.status === 'Completed'}
                                        className="px-6 py-2.5 bg-gradient-to-b from-green-500 to-green-600 text-white font-bold border-b-4 border-green-700 hover:from-green-600 hover:to-green-700 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-2"
                                        style={{ borderRadius: '0px' }}
                                    >
                                        Join Interview <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Cancel Modal */}
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
                                    You are about to cancel your interview with <span className="font-bold text-white">{selectedInterview.companyName}</span> for the <span className="font-bold text-white">{selectedInterview.role}</span> position.
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
                                    onClick={confirmCancel}
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
                                    onClick={() => {
                                        setShowRescheduleModal(false);
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Date</label>
                                    <input
                                        type="date"
                                        defaultValue={selectedInterview.date}
                                        className="w-full px-4 py-3 bg-[#0a0e27] border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                                        style={{ borderRadius: '0px' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Time</label>
                                    <input
                                        type="time"
                                        defaultValue="10:00"
                                        className="w-full px-4 py-3 bg-[#0a0e27] border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                                        style={{ borderRadius: '0px' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Rescheduling (Optional)</label>
                                    <textarea
                                        placeholder="Optional: Explain why you need to reschedule..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-[#0a0e27] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 resize-none"
                                        style={{ borderRadius: '0px' }}
                                    />
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/30 p-3" style={{ borderRadius: '0px' }}>
                                    <p className="text-xs text-yellow-400 flex items-start gap-2">
                                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                        <span>The employer will be notified and must approve your reschedule request.</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowRescheduleModal(false);
                                    }}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                                    style={{ borderRadius: '0px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReschedule}
                                    className="flex-1 py-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold border-b-4 border-blue-700 hover:from-blue-600 hover:to-blue-700 active:border-b-2 active:translate-y-0.5 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                    style={{ borderRadius: '0px' }}
                                >
                                    Request Reschedule
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeProctoring && (
                    <ProctoringInterview
                        interview={activeProctoring}
                        onClose={() => setActiveProctoring(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default CandidateInterviews;
