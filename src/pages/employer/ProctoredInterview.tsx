import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Video, VideoOff, Mic, MicOff, Monitor, MonitorOff,
    AlertTriangle, CheckCircle, XCircle, Clock, User,
    MessageSquare, FileText, X, Send, Eye, EyeOff
} from 'lucide-react';

interface ActivityLog {
    timestamp: Date;
    type: 'tab_switch' | 'window_blur' | 'copy' | 'paste' | 'screenshot' | 'join' | 'leave';
    description: string;
    severity: 'low' | 'medium' | 'high';
}

interface InterviewData {
    id: number;
    candidateName: string;
    role: string;
    date: string;
    time: string;
    duration: string;
    avatar: string;
}

const ProctoredInterview: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showActivityLog, setShowActivityLog] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [notes, setNotes] = useState('');
    const [candidateOnline, setCandidateOnline] = useState(true);
    const [candidateVideoOn, setCandidateVideoOn] = useState(true);
    const [candidateAudioOn, setCandidateAudioOn] = useState(true);

    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
        {
            timestamp: new Date(),
            type: 'join',
            description: 'Candidate joined the interview',
            severity: 'low'
        },
        {
            timestamp: new Date(Date.now() - 120000),
            type: 'tab_switch',
            description: 'Candidate switched to another tab',
            severity: 'high'
        },
        {
            timestamp: new Date(Date.now() - 300000),
            type: 'window_blur',
            description: 'Interview window lost focus',
            severity: 'medium'
        }
    ]);

    // Mock interview data
    const interview: InterviewData = {
        id: Number(id),
        candidateName: "Sarah Johnson",
        role: "Senior Frontend Developer",
        date: "2025-11-30",
        time: "10:00 AM",
        duration: "45 mins",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    };

    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    const handleEndInterview = () => {
        if (window.confirm('Are you sure you want to end this interview?')) {
            navigate('/employer/interviews');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Proctored Interview</h1>
                    <p className="text-gray-400 text-sm">{interview.candidateName} - {interview.role}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10" style={{ borderRadius: '0px' }}>
                        <Clock className="text-neon-cyan" size={18} />
                        <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
                    </div>
                    <button
                        onClick={handleEndInterview}
                        className="px-6 py-2 bg-gradient-to-b from-red-500 to-red-600 text-white font-semibold border-b-4 border-red-700 hover:from-red-600 hover:to-red-700 active:border-b-2 active:translate-y-0.5 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        style={{ borderRadius: '0px' }}
                    >
                        End Interview
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Video Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Candidate Video */}
                    <div className="bg-[#0f1629] border-2 border-white/10 overflow-hidden" style={{ borderRadius: '0px' }}>
                        <div className="aspect-video bg-black/50 relative flex items-center justify-center">
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className={`px-3 py-1 border text-xs font-medium ${candidateOnline ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`} style={{ borderRadius: '0px' }}>
                                    {candidateOnline ? '● ONLINE' : '● OFFLINE'}
                                </div>
                                {candidateVideoOn ? (
                                    <Video className="text-green-400" size={20} />
                                ) : (
                                    <VideoOff className="text-red-400" size={20} />
                                )}
                                {candidateAudioOn ? (
                                    <Mic className="text-green-400" size={20} />
                                ) : (
                                    <MicOff className="text-red-400" size={20} />
                                )}
                            </div>

                            {/* Candidate Video Preview */}
                            <div className="text-center">
                                <img
                                    src={interview.avatar}
                                    alt={interview.candidateName}
                                    className="w-32 h-32 object-cover border-4 border-white/20 mx-auto mb-4"
                                    style={{ borderRadius: '0px' }}
                                />
                                <p className="text-white font-bold text-lg">{interview.candidateName}</p>
                                <p className="text-gray-400 text-sm">Candidate Camera</p>
                            </div>

                            {/* Warning Overlay */}
                            {activityLogs.filter(log => log.severity === 'high').length > 0 && (
                                <div className="absolute top-4 right-4 bg-red-500/20 border-2 border-red-500 px-4 py-2 flex items-center gap-2" style={{ borderRadius: '0px' }}>
                                    <AlertTriangle className="text-red-400" size={20} />
                                    <span className="text-red-400 font-semibold text-sm">Suspicious Activity Detected</span>
                                </div>
                            )}
                        </div>

                        {/* Employer Controls */}
                        <div className="p-4 bg-[#0a0e27] border-t border-white/10 flex justify-between items-center">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsVideoOn(!isVideoOn)}
                                    className={`p-3 ${isVideoOn ? 'bg-white/10' : 'bg-red-500/20'} border border-white/20 hover:bg-white/20 transition-colors`}
                                    style={{ borderRadius: '0px' }}
                                >
                                    {isVideoOn ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-red-400" />}
                                </button>
                                <button
                                    onClick={() => setIsAudioOn(!isAudioOn)}
                                    className={`p-3 ${isAudioOn ? 'bg-white/10' : 'bg-red-500/20'} border border-white/20 hover:bg-white/20 transition-colors`}
                                    style={{ borderRadius: '0px' }}
                                >
                                    {isAudioOn ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-red-400" />}
                                </button>
                                <button
                                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                                    className={`p-3 ${isScreenSharing ? 'bg-neon-cyan/20' : 'bg-white/10'} border border-white/20 hover:bg-white/20 transition-colors`}
                                    style={{ borderRadius: '0px' }}
                                >
                                    {isScreenSharing ? <Monitor size={20} className="text-neon-cyan" /> : <MonitorOff size={20} className="text-white" />}
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowChat(!showChat)}
                                    className={`p-3 ${showChat ? 'bg-neon-purple/20' : 'bg-white/10'} border border-white/20 hover:bg-white/20 transition-colors`}
                                    style={{ borderRadius: '0px' }}
                                >
                                    <MessageSquare size={20} className={showChat ? 'text-neon-purple' : 'text-white'} />
                                </button>
                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className={`p-3 ${showNotes ? 'bg-yellow-400/20' : 'bg-white/10'} border border-white/20 hover:bg-white/20 transition-colors`}
                                    style={{ borderRadius: '0px' }}
                                >
                                    <FileText size={20} className={showNotes ? 'text-yellow-400' : 'text-white'} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat/Notes Section */}
                    {(showChat || showNotes) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-[#0f1629] border-2 border-white/10 p-6"
                            style={{ borderRadius: '0px' }}
                        >
                            {showChat && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <MessageSquare className="text-neon-purple" size={20} />
                                        Chat with Candidate
                                    </h3>
                                    <div className="h-48 bg-black/30 border border-white/10 p-4 mb-4 overflow-y-auto" style={{ borderRadius: '0px' }}>
                                        <p className="text-gray-400 text-sm text-center">No messages yet</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                                            style={{ borderRadius: '0px' }}
                                        />
                                        <button
                                            className="px-4 py-2 bg-gradient-to-b from-neon-purple to-purple-600 text-white font-semibold border-b-4 border-purple-700 hover:from-purple-600 hover:to-purple-700 active:border-b-2 active:translate-y-0.5 transition-all"
                                            style={{ borderRadius: '0px' }}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showNotes && !showChat && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <FileText className="text-yellow-400" size={20} />
                                        Interview Notes
                                    </h3>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Take notes during the interview..."
                                        rows={8}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 resize-none"
                                        style={{ borderRadius: '0px' }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Activity Monitoring Sidebar */}
                <div className="space-y-6">
                    {/* Activity Summary */}
                    <div className="bg-[#0f1629] border-2 border-white/10 p-6" style={{ borderRadius: '0px' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Eye className="text-neon-cyan" size={20} />
                                Activity Monitor
                            </h3>
                            <button
                                onClick={() => setShowActivityLog(!showActivityLog)}
                                className="text-gray-400 hover:text-white"
                            >
                                {showActivityLog ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30" style={{ borderRadius: '0px' }}>
                                <span className="text-sm text-gray-300">High Priority</span>
                                <span className="text-lg font-bold text-red-400">
                                    {activityLogs.filter(log => log.severity === 'high').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30" style={{ borderRadius: '0px' }}>
                                <span className="text-sm text-gray-300">Medium Priority</span>
                                <span className="text-lg font-bold text-yellow-400">
                                    {activityLogs.filter(log => log.severity === 'medium').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30" style={{ borderRadius: '0px' }}>
                                <span className="text-sm text-gray-300">Low Priority</span>
                                <span className="text-lg font-bold text-green-400">
                                    {activityLogs.filter(log => log.severity === 'low').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log */}
                    {showActivityLog && (
                        <div className="bg-[#0f1629] border-2 border-white/10 p-6" style={{ borderRadius: '0px' }}>
                            <h3 className="text-lg font-bold text-white mb-4">Activity Log</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {activityLogs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 border ${getSeverityColor(log.severity)}`}
                                        style={{ borderRadius: '0px' }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs font-mono">
                                                {log.timestamp.toLocaleTimeString()}
                                            </span>
                                            {log.severity === 'high' && <AlertTriangle size={14} />}
                                            {log.severity === 'medium' && <AlertTriangle size={14} />}
                                            {log.severity === 'low' && <CheckCircle size={14} />}
                                        </div>
                                        <p className="text-sm">{log.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Candidate Info */}
                    <div className="bg-[#0f1629] border-2 border-white/10 p-6" style={{ borderRadius: '0px' }}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User className="text-neon-cyan" size={20} />
                            Candidate Info
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-400">Name</p>
                                <p className="text-white font-medium">{interview.candidateName}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Role</p>
                                <p className="text-white font-medium">{interview.role}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Duration</p>
                                <p className="text-white font-medium">{interview.duration}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProctoredInterview;
