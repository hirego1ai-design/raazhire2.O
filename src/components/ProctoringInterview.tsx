import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Mic, Video, Monitor, ShieldAlert, Maximize, Minimize } from 'lucide-react';

interface Interview {
    id: number;
    candidateName: string;
    role: string;
    participants?: string[];
    roundTag?: string;
}

interface ProctoringInterviewProps {
    interview: Interview;
    onClose: () => void;
}

const ProctoringInterview: React.FC<ProctoringInterviewProps> = ({ interview, onClose }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [focusLost, setFocusLost] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Enforce Full Screen
    const enterFullScreen = async () => {
        try {
            if (containerRef.current) {
                await containerRef.current.requestFullscreen();
                setIsFullScreen(true);
            }
        } catch (err) {
            console.error("Error attempting to enable full-screen mode:", err);
        }
    };

    useEffect(() => {
        enterFullScreen();

        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullScreen(false);
                setWarnings(prev => prev + 1);
                // Optionally force it back or show a blocking modal
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setFocusLost(true);
                setWarnings(prev => prev + 1);
            } else {
                setFocusLost(false);
            }
        };

        const handleBlur = () => {
            setFocusLost(true);
            setWarnings(prev => prev + 1);
        };

        const handleFocus = () => {
            setFocusLost(false);
        };

        // Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Disable Copy/Paste
        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            alert("Copy/Paste is disabled during the interview.");
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-black text-white overflow-hidden">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-[#0a0e27]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-mono text-red-500 font-bold tracking-wider">REC</span>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div>
                        <h2 className="font-bold text-sm">{interview.role}</h2>
                        <p className="text-xs text-gray-400">{interview.roundTag} • {interview.candidateName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <ShieldAlert size={14} className={warnings > 0 ? "text-red-500" : "text-green-500"} />
                        <span className="text-xs font-mono">Warnings: {warnings}</span>
                    </div>
                    <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        End Interview
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="absolute inset-0 pt-16 flex">
                {/* Main Video Feed (Candidate) */}
                <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
                    <video
                        src="https://www.w3schools.com/html/mov_bbb.mp4"
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-cover"
                    />

                    {/* Overlay Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                        <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Mic size={20} />
                        </button>
                        <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Video size={20} />
                        </button>
                        <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Monitor size={20} />
                        </button>
                    </div>
                </div>

                {/* Sidebar (Participants & Chat) */}
                <div className="w-80 bg-[#0a0e27] border-l border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="font-bold text-sm mb-3">Participants</h3>
                        <div className="space-y-3">
                            {interview.participants?.map((p, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                                        {p.charAt(0)}
                                    </div>
                                    <span className="text-sm text-gray-300">{p}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                                    You
                                </div>
                                <span className="text-sm text-gray-300">Me (Host)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-4">
                        <h3 className="font-bold text-sm mb-3">Live Notes</h3>
                        <textarea
                            className="w-full h-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-neon-cyan/50"
                            placeholder="Type internal notes here..."
                        />
                    </div>
                </div>
            </div>

            {/* Focus Lost Overlay */}
            <AnimatePresence>
                {focusLost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-center p-8"
                    >
                        <AlertTriangle size={64} className="text-red-500 mb-6 animate-bounce" />
                        <h2 className="text-3xl font-bold text-white mb-2">FOCUS LOST!</h2>
                        <p className="text-gray-400 max-w-md mb-8">
                            You have switched tabs or minimized the window. This action has been logged.
                            Please return to the interview immediately to avoid disqualification.
                        </p>
                        <button
                            onClick={() => {
                                enterFullScreen();
                                setFocusLost(false);
                            }}
                            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                        >
                            Return to Interview
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full Screen Warning Overlay (if user exits FS manually) */}
            {!isFullScreen && !focusLost && (
                <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center text-center p-8">
                    <Maximize size={48} className="text-neon-cyan mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Full Screen Required</h2>
                    <p className="text-gray-400 mb-6">This interview must be conducted in full-screen mode.</p>
                    <button
                        onClick={enterFullScreen}
                        className="px-6 py-2 bg-neon-cyan text-black rounded-lg font-bold hover:bg-cyan-400"
                    >
                        Enable Full Screen
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProctoringInterview;
