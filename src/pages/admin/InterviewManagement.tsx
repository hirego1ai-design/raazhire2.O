import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, Users, Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
    Eye, Monitor, Lock, Unlock, Play, Pause, SkipForward, UserCheck,
    FileText, Download, Send, MessageSquare, Shield, Activity, Camera,
    Mic, MicOff, VideoOff, Maximize, Settings, BarChart, TrendingUp
} from 'lucide-react';

// --- Types ---
type InterviewStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
type InterviewRound = 'screening' | 'technical' | 'hr' | 'final';
type ProctoringStatus = 'normal' | 'warning' | 'violation';

interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    experience: string;
    resumeUrl?: string;
}

interface InterviewSession {
    id: string;
    candidate: Candidate;
    jobId: string;
    jobTitle: string;
    round: InterviewRound;
    status: InterviewStatus;
    scheduledDate: string;
    scheduledTime: string;
    duration: number; // minutes
    interviewers: string[];
    currentInterviewer?: string;
    proctoringEnabled: boolean;
    proctoringStatus?: ProctoringStatus;
    violations: ProctoringViolation[];
    recordingUrl?: string;
    notes: string;
    score?: number;
    decision?: 'pass' | 'fail' | 'pending';
}

interface ProctoringViolation {
    id: string;
    timestamp: string;
    type: 'tab-switch' | 'face-not-detected' | 'multiple-faces' | 'exit-fullscreen' | 'suspicious-activity';
    severity: 'low' | 'medium' | 'high';
    description: string;
}

import { supabase } from '../../lib/supabase';

// ... existing imports

// ... Types ...

const InterviewManagement: React.FC = () => {
    const [interviews, setInterviews] = useState<InterviewSession[]>([]);
    const [selectedInterview, setSelectedInterview] = useState<InterviewSession | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'in-progress' | 'completed'>('all');
    const [showProctoringPanel, setShowProctoringPanel] = useState(false);

    useEffect(() => {
        const fetchInterviews = async () => {
            if (!supabase) return;

            const { data, error } = await supabase
                .from('interviews')
                .select(`
                    *,
                    candidate:candidates(id, name, email, phone, current_role, experience_years),
                    job:jobs(id, title)
                `)
                .order('date', { ascending: true });

            if (data) {
                const formattedInterviews: InterviewSession[] = data.map((int: any) => ({
                    id: int.id,
                    candidate: {
                        id: int.candidate?.id || 'Unknown',
                        name: int.candidate?.name || 'Unknown Candidate',
                        email: int.candidate?.email || '',
                        phone: int.candidate?.phone || '',
                        position: int.candidate?.current_role || 'Applicant',
                        experience: `${int.candidate?.experience_years || 0} years`,
                    },
                    jobId: int.job?.id || '',
                    jobTitle: int.job?.title || 'Unknown Job',
                    round: int.round_name || 'screening', // Assuming round_name column or default
                    status: int.status || 'scheduled',
                    scheduledDate: int.date,
                    scheduledTime: int.time,
                    duration: int.duration || 30,
                    interviewers: [], // Placeholder as this might need another join
                    currentInterviewer: 'Not assigned',
                    proctoringEnabled: true, // Defaulting to true for now
                    proctoringStatus: 'normal', // Default
                    violations: [], // Fetch from proctoring logs if available
                    notes: int.notes || '',
                    score: int.score,
                    decision: int.decision || 'pending'
                }));
                setInterviews(formattedInterviews);
            }
        };

        fetchInterviews();
    }, []);


    // Filter interviews
    const filteredInterviews = interviews.filter(interview => {
        if (activeTab === 'all') return true;
        return interview.status === activeTab;
    });

    // --- Status Badge ---
    const StatusBadge = ({ status }: { status: InterviewStatus }) => {
        const colors = {
            scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'in-progress': 'bg-green-500/20 text-green-400 border-green-500/30',
            completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs border ${colors[status]} capitalize`}>
                {status.replace('-', ' ')}
            </span>
        );
    };

    // --- Proctoring Status Badge ---
    const ProctoringBadge = ({ status }: { status?: ProctoringStatus }) => {
        if (!status) return null;
        const colors = {
            normal: 'bg-green-500/20 text-green-400 border-green-500/30',
            warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            violation: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 ${colors[status]}`}>
                <Shield size={12} />
                {status}
            </span>
        );
    };

    // --- Interview Detail Modal ---
    const InterviewDetailModal = ({ interview, onClose }: { interview: InterviewSession, onClose: () => void }) => {
        const [localNotes, setLocalNotes] = useState(interview.notes);
        const [localScore, setLocalScore] = useState(interview.score || 0);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-[#0f111a]/95 backdrop-blur z-10 p-6 border-b border-white/10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Video className="text-neon-cyan" size={28} />
                                    Interview Session: {interview.id}
                                </h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <StatusBadge status={interview.status} />
                                    {interview.proctoringEnabled && <ProctoringBadge status={interview.proctoringStatus} />}
                                    <span className="text-sm text-gray-400">Round: {interview.round}</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                                <XCircle size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Candidate & Interview Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Candidate Details */}
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <UserCheck className="text-neon-purple" size={20} />
                                    Candidate Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Name</label>
                                        <p className="text-white font-medium">{interview.candidate.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Position</label>
                                        <p className="text-white font-medium">{interview.candidate.position}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Email</label>
                                        <p className="text-white font-medium">{interview.candidate.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Phone</label>
                                        <p className="text-white font-medium">{interview.candidate.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Experience</label>
                                        <p className="text-white font-medium">{interview.candidate.experience}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Resume</label>
                                        <button className="text-neon-cyan hover:underline text-sm flex items-center gap-1">
                                            <Download size={14} /> Download
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Interview Schedule */}
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Calendar className="text-green-400" size={20} />
                                    Schedule & Interviewers
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Date</label>
                                        <p className="text-white font-medium">{interview.scheduledDate}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Time</label>
                                        <p className="text-white font-medium">{interview.scheduledTime}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Duration</label>
                                        <p className="text-white font-medium">{interview.duration} minutes</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Current Interviewer</label>
                                        <p className="text-white font-medium">{interview.currentInterviewer || 'Not assigned'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-2">Interview Panel</label>
                                    <div className="flex flex-wrap gap-2">
                                        {interview.interviewers.map((interviewer, idx) => (
                                            <span key={idx} className="px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple text-sm border border-neon-purple/20">
                                                {interviewer}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Proctoring Violations */}
                            {interview.proctoringEnabled && interview.violations.length > 0 && (
                                <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                                        <AlertTriangle size={20} />
                                        Proctoring Violations ({interview.violations.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {interview.violations.map((violation) => (
                                            <div key={violation.id} className="p-3 rounded-lg bg-black/20 border border-red-500/20">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs ${violation.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                                        violation.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {violation.severity}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{violation.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-white font-medium capitalize">{violation.type.replace('-', ' ')}</p>
                                                <p className="text-xs text-gray-400 mt-1">{violation.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Actions & Evaluation */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    {interview.status === 'in-progress' && (
                                        <>
                                            <button className="w-full py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2">
                                                <Eye size={16} /> Monitor Live
                                            </button>
                                            <button className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                                                <Lock size={16} /> Force Fullscreen
                                            </button>
                                        </>
                                    )}
                                    <button className="w-full py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
                                        <Send size={16} /> Send Reminder
                                    </button>
                                    <button className="w-full py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2">
                                        <Calendar size={16} /> Reschedule
                                    </button>
                                </div>
                            </div>

                            {/* Evaluation */}
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-bold mb-4">Evaluation</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">Score (0-100)</label>
                                        <input
                                            type="number"
                                            value={localScore}
                                            onChange={(e) => setLocalScore(parseInt(e.target.value))}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-center text-2xl font-bold"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">Notes</label>
                                        <textarea
                                            value={localNotes}
                                            onChange={(e) => setLocalNotes(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white h-32 resize-none"
                                            placeholder="Add interview notes..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2">
                                            <CheckCircle size={16} /> Pass
                                        </button>
                                        <button className="py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                                            <XCircle size={16} /> Fail
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Transfer to Next Round */}
                            {interview.decision === 'pass' && (
                                <div className="p-6 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
                                    <h3 className="text-lg font-bold mb-4 text-neon-cyan">Transfer to Next Round</h3>
                                    <div className="space-y-3">
                                        <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white">
                                            <option value="technical">Technical Round</option>
                                            <option value="hr">HR Round</option>
                                            <option value="final">Final Round</option>
                                        </select>
                                        <input
                                            type="date"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                        <input
                                            type="time"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                        <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white">
                                            <option>Select Interviewer</option>
                                            <option>HR Manager</option>
                                            <option>Tech Lead</option>
                                            <option>CTO</option>
                                        </select>
                                        <button className="w-full btn-3d btn-primary py-2 flex items-center justify-center gap-2">
                                            <SkipForward size={16} /> Schedule Next Round
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                        Interview & Screening Management
                    </h1>
                    <p className="text-gray-400">Monitor live interviews, manage proctoring, and evaluate candidates</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-3d btn-primary px-4 py-2 flex items-center gap-2">
                        <Calendar size={18} /> Schedule Interview
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Interviews', value: interviews.length, icon: Video, color: 'text-neon-cyan' },
                    { label: 'In Progress', value: interviews.filter(i => i.status === 'in-progress').length, icon: Activity, color: 'text-green-400' },
                    { label: 'Scheduled', value: interviews.filter(i => i.status === 'scheduled').length, icon: Calendar, color: 'text-blue-400' },
                    { label: 'Violations', value: interviews.reduce((acc, i) => acc + i.violations.length, 0), icon: AlertTriangle, color: 'text-red-400' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={stat.color} size={24} />
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                {(['all', 'scheduled', 'in-progress', 'completed'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative capitalize ${activeTab === tab ? 'text-neon-cyan' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab.replace('-', ' ')}
                        {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" />}
                    </button>
                ))}
            </div>

            {/* Interviews Table */}
            <div className="rounded-xl glass border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Candidate</th>
                            <th className="p-4">Position</th>
                            <th className="p-4">Round</th>
                            <th className="p-4">Schedule</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Proctoring</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredInterviews.map((interview) => (
                            <tr key={interview.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div>
                                        <div className="font-bold text-white">{interview.candidate.name}</div>
                                        <div className="text-xs text-gray-500">{interview.id}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">{interview.jobTitle}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded bg-neon-purple/10 text-neon-purple text-xs capitalize">
                                        {interview.round}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-gray-300">{interview.scheduledDate}</div>
                                    <div className="text-xs text-gray-500">{interview.scheduledTime}</div>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={interview.status} />
                                </td>
                                <td className="p-4">
                                    {interview.proctoringEnabled ? (
                                        <div className="flex flex-col gap-1">
                                            <ProctoringBadge status={interview.proctoringStatus} />
                                            {interview.violations.length > 0 && (
                                                <span className="text-xs text-red-400">{interview.violations.length} violations</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-500">Disabled</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => setSelectedInterview(interview)}
                                        className="text-neon-cyan hover:underline text-sm"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Interview Detail Modal */}
            <AnimatePresence>
                {selectedInterview && (
                    <InterviewDetailModal
                        interview={selectedInterview}
                        onClose={() => setSelectedInterview(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default InterviewManagement;
