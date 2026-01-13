import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Video, Calendar, Clock, User, Mail, Phone, MapPin,
    CheckCircle, XCircle, ArrowLeft, Edit, AlertCircle,
    Briefcase, Star, FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface InterviewSchedule {
    id: string;
    candidateId: string;
    date: string;
    time: string;
    duration: number;
    meetingLink?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    notes?: string;
    cancelReason?: string;
}

const InterviewSchedulePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const navigate = useNavigate();

    const [candidate, setCandidate] = useState<any | null>(null);
    const [interview, setInterview] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [notes, setNotes] = useState('');
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
    const [isShortlisted, setIsShortlisted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !supabase) return;
            setLoading(true);

            try {
                // Fetch candidate details
                const { data: candidateData, error: candidateError } = await supabase
                    .from('candidates')
                    .select('*, user:users(email, phone)') // Assuming relation or fields exist
                    .eq('id', id)
                    .single();

                if (candidateError) {
                    console.error('Error fetching candidate:', candidateError);
                } else if (candidateData) {
                    setCandidate({
                        id: candidateData.id,
                        name: candidateData.full_name || 'Candidate', // Adjust field name
                        profile_photo: candidateData.profile_photo_url, // Adjust field name
                        job_profile: candidateData.current_role || 'Applicant', // Adjust field name
                        skills: candidateData.skills || [], // Adjust structure if needed
                        email: candidateData.email || candidateData.user?.email, // Fallback
                        phone: candidateData.phone || candidateData.user?.phone, // Fallback
                        location: candidateData.location,
                        experience_years: candidateData.experience_years
                    });
                }

                // Fetch existing interview
                let query = supabase
                    .from('interviews')
                    .select('*')
                    .eq('candidate_id', id);

                if (jobId) {
                    query = query.eq('job_id', jobId);
                }

                // Get the most recent one if multiple
                const { data: interviewData, error: interviewError } = await query
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (interviewData) {
                    setInterview({
                        id: interviewData.id,
                        candidateId: interviewData.candidate_id,
                        date: new Date(interviewData.scheduled_date).toISOString().split('T')[0],
                        time: new Date(interviewData.scheduled_date).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                        duration: interviewData.duration_minutes || 45,
                        meetingLink: interviewData.meeting_link,
                        status: interviewData.status?.toLowerCase() || 'scheduled',
                        notes: interviewData.notes,
                        cancelReason: interviewData.cancellation_reason
                    });
                    setNotes(interviewData.notes || '');
                } else {
                    // Initialize empty state for new interview
                    setInterview(null); // Explicitly null to show "Schedule" UI
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, jobId]);


    const handleShortlist = () => {
        setIsShortlisted(true);
        // TODO: Update application status in DB
        alert('Candidate shortlisted successfully!');
    };

    const handleCreateInterview = async () => {
        if (!rescheduleData.date || !rescheduleData.time) {
            alert('Please select date and time');
            return;
        }

        try {
            const scheduledDate = new Date(`${rescheduleData.date}T${rescheduleData.time}`);
            const { data: { user } } = await supabase!.auth.getUser();

            const { data, error } = await supabase!
                .from('interviews')
                .insert([{
                    candidate_id: id,
                    employer_id: user?.id,
                    job_id: jobId, // Might be null if not passed, handle responsibly
                    scheduled_date: scheduledDate.toISOString(),
                    duration_minutes: 45,
                    status: 'Scheduled',
                    meeting_link: `https://meet.google.com/${Math.random().toString(36).substring(7)}`,
                    type: 'Video'
                }])
                .select()
                .single();

            if (error) throw error;

            setInterview({
                id: data.id,
                candidateId: data.candidate_id,
                date: rescheduleData.date,
                time: rescheduleData.time,
                duration: data.duration_minutes,
                meetingLink: data.meeting_link,
                status: 'scheduled',
                notes: ''
            });

            setShowRescheduleModal(false); // Close generic modal if used
            alert('Interview scheduled successfully!');

        } catch (error) {
            console.error('Error creating interview:', error);
            alert('Failed to schedule interview');
        }
    };

    const handleCancelInterview = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        if (interview) {
            try {
                const { error } = await supabase!
                    .from('interviews')
                    .update({
                        status: 'Cancelled',
                        cancellation_reason: cancelReason
                    })
                    .eq('id', interview.id);

                if (error) throw error;

                setInterview({ ...interview, status: 'cancelled', cancelReason });
                setShowCancelModal(false);
                alert('Interview cancelled successfully');
            } catch (error) {
                console.error('Error cancelling interview:', error);
                alert('Failed to cancel interview');
            }
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleData.date || !rescheduleData.time) {
            alert('Please select both date and time');
            return;
        }

        if (!interview) {
            // If no interview exists, treat as create
            handleCreateInterview();
            return;
        }

        if (interview) {
            try {
                const scheduledDate = new Date(`${rescheduleData.date}T${rescheduleData.time}`);
                const { error } = await supabase!
                    .from('interviews')
                    .update({
                        scheduled_date: scheduledDate.toISOString(),
                        status: 'Rescheduled' // Or keep 'Scheduled'
                    })
                    .eq('id', interview.id);

                if (error) throw error;

                setInterview({
                    ...interview,
                    date: rescheduleData.date,
                    time: rescheduleData.time,
                    status: 'rescheduled'
                });
                setShowRescheduleModal(false);
                alert('Interview rescheduled successfully');
            } catch (error) {
                console.error('Error rescheduling interview:', error);
                alert('Failed to reschedule interview');
            }
        }
    };

    const handleJoinInterview = () => {
        if (interview?.meetingLink) {
            window.open(interview.meetingLink, '_blank');
        }
    };

    const handleSaveNotes = async () => {
        if (interview) {
            try {
                const { error } = await supabase!
                    .from('interviews')
                    .update({ notes })
                    .eq('id', interview.id);

                if (error) throw error;

                setInterview({ ...interview, notes });
                setShowNotesModal(false);
                alert('Notes saved successfully');
            } catch (error) {
                console.error('Error saving notes:', error);
                alert('Failed to save notes');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading details...</p>
                </div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
                <p>Candidate not found.</p>
            </div>
        );
    }

    const interviewDateTime = new Date(`${interview.date}T${interview.time}`);
    const formattedDate = interviewDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = interviewDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/employer/candidates')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Candidates
                </button>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Status Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-2xl border-2 ${interview.status === 'scheduled' ? 'bg-blue-500/10 border-blue-500/30' :
                        interview.status === 'cancelled' ? 'bg-red-500/10 border-red-500/30' :
                            interview.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                                'bg-yellow-500/10 border-yellow-500/30'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {interview.status === 'scheduled' && <Clock className="text-blue-400" size={24} />}
                            {interview.status === 'cancelled' && <XCircle className="text-red-400" size={24} />}
                            {interview.status === 'completed' && <CheckCircle className="text-green-400" size={24} />}
                            {interview.status === 'rescheduled' && <Calendar className="text-yellow-400" size={24} />}
                            <div>
                                <h2 className="text-xl font-bold text-white capitalize">
                                    Interview {interview.status}
                                </h2>
                                {interview.status === 'cancelled' && interview.cancelReason && (
                                    <p className="text-sm text-red-300 mt-1">Reason: {interview.cancelReason}</p>
                                )}
                            </div>
                        </div>
                        {isShortlisted && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                                <Star className="text-yellow-400" size={18} fill="currentColor" />
                                <span className="text-green-300 font-semibold">Shortlisted</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Candidate Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-6"
                        >
                            <div className="flex items-start gap-6">
                                <img
                                    src={candidate.profile_photo || `https://ui-avatars.com/api/?name=${candidate.name}&background=random`}
                                    alt={candidate.name}
                                    className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500/30"
                                />
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-white mb-2">{candidate.name}</h1>
                                    <p className="text-gray-400 mb-3">{candidate.job_profile}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {candidate.skills?.slice(0, 3).map((skill: any, idx: number) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                                            >
                                                {typeof skill === 'string' ? skill : (skill.skill || JSON.stringify(skill))}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Mail size={16} className="text-blue-400" />
                                            {candidate.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Phone size={16} className="text-blue-400" />
                                            {candidate.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <MapPin size={16} className="text-blue-400" />
                                            {candidate.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Briefcase size={16} className="text-blue-400" />
                                            {candidate.experience_years} years exp
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Schedule Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar className="text-blue-400" size={24} />
                                Interview Schedule
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                        <p className="text-gray-400 text-sm mb-1">Date</p>
                                        <p className="text-white font-semibold">{formattedDate}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                        <p className="text-gray-400 text-sm mb-1">Time</p>
                                        <p className="text-white font-semibold">{formattedTime}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                        <p className="text-gray-400 text-sm mb-1">Duration</p>
                                        <p className="text-white font-semibold">{interview.duration} minutes</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                        <p className="text-gray-400 text-sm mb-1">Meeting Link</p>
                                        <button
                                            onClick={handleJoinInterview}
                                            className="text-blue-400 hover:text-blue-300 font-semibold text-sm underline"
                                        >
                                            Join Meeting
                                        </button>
                                    </div>
                                </div>

                                {interview.notes && (
                                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                        <p className="text-gray-400 text-sm mb-2">Notes</p>
                                        <p className="text-white text-sm">{interview.notes}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                            <div className="space-y-3">
                                {interview.status === 'scheduled' && (
                                    <>
                                        <button
                                            onClick={handleJoinInterview}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2"
                                        >
                                            <Video size={18} />
                                            Join Interview
                                        </button>

                                        <button
                                            onClick={() => setShowRescheduleModal(true)}
                                            className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-600/50 flex items-center justify-center gap-2"
                                        >
                                            <Edit size={18} />
                                            Reschedule
                                        </button>

                                        <button
                                            onClick={handleShortlist}
                                            disabled={isShortlisted}
                                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all border flex items-center justify-center gap-2 ${isShortlisted
                                                ? 'bg-green-500/20 text-green-300 border-green-500/30 cursor-not-allowed'
                                                : 'bg-slate-700/50 hover:bg-green-500/20 text-white hover:text-green-300 border-slate-600/50 hover:border-green-500/30'
                                                }`}
                                        >
                                            <Star size={18} />
                                            {isShortlisted ? 'Shortlisted' : 'Shortlist Candidate'}
                                        </button>

                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition-all border border-red-500/30 flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} />
                                            Cancel Interview
                                        </button>
                                    </>
                                )}

                                {interview.status === 'cancelled' && (
                                    <div className="text-center py-8">
                                        <XCircle className="text-red-400 mx-auto mb-3" size={48} />
                                        <p className="text-red-300 font-semibold">Interview Cancelled</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowNotesModal(true)}
                                    className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-600/50 flex items-center justify-center gap-2"
                                >
                                    <FileText size={18} />
                                    {interview.notes ? 'Edit Notes' : 'Add Notes'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Cancel Modal */}
                {showCancelModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCancelModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Cancel Interview</h3>
                            <p className="text-gray-400 mb-4">Please provide a reason for cancellation:</p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Enter cancellation reason..."
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                                rows={4}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCancelInterview}
                                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Reschedule Modal */}
                {showRescheduleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowRescheduleModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Reschedule Interview</h3>
                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-gray-300 mb-2">New Date</label>
                                    <input
                                        type="date"
                                        value={rescheduleData.date}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">New Time</label>
                                    <input
                                        type="time"
                                        value={rescheduleData.time}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRescheduleModal(false)}
                                    className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReschedule}
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                                >
                                    Reschedule
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Notes Modal */}
                {showNotesModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowNotesModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Interview Notes</h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add your notes about the candidate..."
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                rows={6}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNotesModal(false)}
                                    className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                                >
                                    Save Notes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InterviewSchedulePage;
