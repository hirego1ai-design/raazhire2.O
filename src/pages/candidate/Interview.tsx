import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Video, VideoOff, Mic, MicOff, AlertTriangle,
    Clock, Shield, Eye, EyeOff, MessageSquare,
    Send, FileText, CheckCircle, XCircle, LogOut
} from 'lucide-react';

interface TabSwitchWarning {
    count: number;
    timestamp: Date;
}

const CandidateInterview: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [hasPermissions, setHasPermissions] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isFocused, setIsFocused] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [chatMessages, setChatMessages] = useState<Array<{ text: string, from: 'employer' | 'candidate', timestamp: Date }>>([]);
    const [chatMessage, setChatMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Mock interview data
    const interview = {
        id: Number(id),
        employerName: "TechCorp Inc.",
        role: "Senior Frontend Developer",
        interviewer: "John Doe",
        duration: "45 mins",
        scheduledTime: "10:00 AM"
    };

    // Request camera and microphone permissions
    useEffect(() => {
        const requestPermissions = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermissions(true);
            } catch (error) {
                console.error('Error accessing media devices:', error);
                alert('Camera and microphone access is required for the interview');
            }
        };

        requestPermissions();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Tab switch detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsFocused(false);
                setTabSwitchCount(prev => prev + 1);
                setShowWarning(true);

                // Block after 3 tab switches
                if (tabSwitchCount >= 2) {
                    setIsBlocked(true);
                    alert('⚠️ Interview Terminated: You have switched tabs too many times. The employer has been notified.');
                }

                setTimeout(() => setShowWarning(false), 5000);
            } else {
                setIsFocused(true);
            }
        };

        const handleWindowBlur = () => {
            setIsFocused(false);
            setTabSwitchCount(prev => prev + 1);
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            alert('⚠️ Copying is disabled during the interview');
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            alert('⚠️ Pasting is disabled during the interview');
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            alert('⚠️ Right-click is disabled during the interview');
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable Print Screen, F12, etc.
            if (
                e.key === 'PrintScreen' ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
                alert('⚠️ This action is disabled during the interview');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [tabSwitchCount]);

    // Timer
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

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
            }
        }
    };

    const handleLeaveInterview = () => {
        if (window.confirm('Are you sure you want to leave the interview?')) {
            navigate('/candidate/interviews');
        }
    };

    const sendMessage = () => {
        if (chatMessage.trim()) {
            setChatMessages([...chatMessages, {
                text: chatMessage,
                from: 'candidate',
                timestamp: new Date()
            }]);
            setChatMessage('');
        }
    };

    if (isBlocked) {
        return (
            <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-6">
                <div className="bg-[#0f1629] border-4 border-red-500 p-12 max-w-2xl text-center" style={{ borderRadius: '0px' }}>
                    <XCircle className="mx-auto mb-6 text-red-500" size={80} />
                    <h1 className="text-3xl font-bold text-white mb-4">Interview Terminated</h1>
                    <p className="text-gray-300 mb-6 text-lg">
                        You have violated interview protocols by switching tabs multiple times.
                        The employer has been notified of this activity.
                    </p>
                    <button
                        onClick={() => navigate('/candidate/interviews')}
                        className="px-8 py-3 bg-gradient-to-b from-red-500 to-red-600 text-white font-semibold border-b-4 border-red-700 hover:from-red-600 hover:to-red-700 active:border-b-2 active:translate-y-0.5 transition-all"
                        style={{ borderRadius: '0px' }}
                    >
                        Return to Interviews
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] p-6">
            {/* Warning Banner */}
            <AnimatePresence>
                {(showWarning || tabSwitchCount > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full"
                    >
                        <div className="bg-red-500 border-4 border-red-700 p-4 flex items-center gap-4" style={{ borderRadius: '0px' }}>
                            <AlertTriangle className="text-white flex-shrink-0" size={32} />
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">⚠️ ANTI-CHEATING WARNING</h3>
                                <p className="text-white text-sm">
                                    Tab switching detected! ({tabSwitchCount}/3) - Your activity is being monitored and recorded.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Interview in Progress</h1>
                    <p className="text-gray-400 text-sm">{interview.employerName} - {interview.role}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10" style={{ borderRadius: '0px' }}>
                        <Shield className={tabSwitchCount === 0 ? 'text-green-400' : tabSwitchCount < 3 ? 'text-yellow-400' : 'text-red-400'} size={18} />
                        <span className="text-white text-sm font-medium">Violations: {tabSwitchCount}/3</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10" style={{ borderRadius: '0px' }}>
                        <Clock className="text-neon-cyan" size={18} />
                        <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
                    </div>
                    <button
                        onClick={handleLeaveInterview}
                        className="px-6 py-2 bg-gradient-to-b from-red-500 to-red-600 text-white font-semibold border-b-4 border-red-700 hover:from-red-600 hover:to-red-700 active:border-b-2 active:translate-y-0.5 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        style={{ borderRadius: '0px' }}
                    >
                        <LogOut size={18} className="inline mr-2" />
                        Leave
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Candidate Camera */}
                    <div className="bg-[#0f1629] border-2 border-white/10 overflow-hidden" style={{ borderRadius: '0px' }}>
                        <div className="aspect-video bg-black relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />

                            {/* Status Indicators */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="px-3 py-1 bg-red-500 border border-red-700 text-xs font-bold text-white flex items-center gap-2" style={{ borderRadius: '0px' }}>
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    RECORDING
                                </div>
                                <div className="px-3 py-1 bg-green-500/20 border border-green-500 text-xs font-medium text-green-400" style={{ borderRadius: '0px' }}>
                                    ● MONITORED
                                </div>
                            </div>

                            {/* Controls Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={toggleVideo}
                                        className={`p-4 ${isVideoOn ? 'bg-white/20' : 'bg-red-500'} border-2 border-white/30 hover:bg-white/30 transition-all`}
                                        style={{ borderRadius: '0px' }}
                                    >
                                        {isVideoOn ? <Video size={24} className="text-white" /> : <VideoOff size={24} className="text-white" />}
                                    </button>
                                    <button
                                        onClick={toggleAudio}
                                        className={`p-4 ${isAudioOn ? 'bg-white/20' : 'bg-red-500'} border-2 border-white/30 hover:bg-white/30 transition-all`}
                                        style={{ borderRadius: '0px' }}
                                    >
                                        {isAudioOn ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
                                    </button>
                                    <button
                                        onClick={() => setShowChat(!showChat)}
                                        className={`p-4 ${showChat ? 'bg-neon-purple/30' : 'bg-white/20'} border-2 border-white/30 hover:bg-white/30 transition-all`}
                                        style={{ borderRadius: '0px' }}
                                    >
                                        <MessageSquare size={24} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat */}
                    {showChat && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-[#0f1629] border-2 border-white/10 p-6"
                            style={{ borderRadius: '0px' }}
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <MessageSquare className="text-neon-purple" size={20} />
                                Chat with Interviewer
                            </h3>
                            <div className="h-48 bg-black/30 border border-white/10 p-4 mb-4 overflow-y-auto space-y-2" style={{ borderRadius: '0px' }}>
                                {chatMessages.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center">No messages yet</p>
                                ) : (
                                    chatMessages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`p-2 ${msg.from === 'candidate' ? 'bg-neon-cyan/10 border-l-4 border-neon-cyan' : 'bg-purple-500/10 border-l-4 border-purple-500'}`}
                                            style={{ borderRadius: '0px' }}
                                        >
                                            <p className="text-white text-sm">{msg.text}</p>
                                            <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                                    style={{ borderRadius: '0px' }}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="px-4 py-2 bg-gradient-to-b from-neon-purple to-purple-600 text-white font-semibold border-b-4 border-purple-700 hover:from-purple-600 hover:to-purple-700 active:border-b-2 active:translate-y-0.5 transition-all"
                                    style={{ borderRadius: '0px' }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Proctoring Rules */}
                    <div className="bg-[#0f1629] border-2 border-yellow-500/30 p-6" style={{ borderRadius: '0px' }}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="text-yellow-400" size={20} />
                            Proctoring Rules
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <Eye className="text-neon-cyan flex-shrink-0 mt-0.5" size={16} />
                                <p className="text-gray-300">Keep your camera ON at all times</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                                <p className="text-gray-300">Do NOT switch tabs (Max 3 violations)</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                                <p className="text-gray-300">Copying/Pasting is disabled</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Eye className="text-purple-400 flex-shrink-0 mt-0.5" size={16} />
                                <p className="text-gray-300">Your screen activity is monitored</p>
                            </div>
                        </div>
                    </div>

                    {/* Interview Info */}
                    <div className="bg-[#0f1629] border-2 border-white/10 p-6" style={{ borderRadius: '0px' }}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="text-neon-cyan" size={20} />
                            Interview Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-400">Company</p>
                                <p className="text-white font-medium">{interview.employerName}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Role</p>
                                <p className="text-white font-medium">{interview.role}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Interviewer</p>
                                <p className="text-white font-medium">{interview.interviewer}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Duration</p>
                                <p className="text-white font-medium">{interview.duration}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className={`border-2 p-6 ${isFocused ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`} style={{ borderRadius: '0px' }}>
                        <div className="flex items-center gap-3">
                            {isFocused ? (
                                <CheckCircle className="text-green-400" size={24} />
                            ) : (
                                <AlertTriangle className="text-red-400 animate-pulse" size={24} />
                            )}
                            <div>
                                <p className={`font-bold ${isFocused ? 'text-green-400' : 'text-red-400'}`}>
                                    {isFocused ? 'Interview Active' : 'Window Not Focused!'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {isFocused ? 'All systems normal' : 'Return to interview immediately'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateInterview;
