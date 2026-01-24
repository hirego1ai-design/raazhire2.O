import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Eye, Monitor, Maximize, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProctoringWrapperProps {
    children: React.ReactNode;
    onViolation: (type: string) => void;
    isActive: boolean;
}

const ProctoringWrapper: React.FC<ProctoringWrapperProps> = ({ children, onViolation, isActive }) => {
    const [warnings, setWarnings] = useState<string[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const addWarning = useCallback((message: string) => {
        setWarnings(prev => [...prev, message]);
        onViolation(message);

        // Clear warning after 4 seconds
        setTimeout(() => {
            setWarnings(prev => prev.slice(1));
        }, 4000);
    }, [onViolation]);

    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                addWarning('Tab switch detected! Integrity score impacted.');
            }
        };

        const handleBlur = () => {
            addWarning('Focus lost! Please stay within the secure assessment window.');
        };

        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullScreen(false);
                addWarning('Full screen exited! Secure mode requires full screen.');
            } else {
                setIsFullScreen(true);
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            addWarning('Right click interaction is restricted.');
        };

        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            addWarning('Copy/Paste operations are blocked in secure mode.');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
        };
    }, [isActive, addWarning]);

    const requestFullScreen = () => {
        document.documentElement.requestFullscreen().catch((e) => {
            console.error('Error attempting to enable full-screen mode:', e);
        });
    };

    return (
        <div className="relative min-h-screen saas-layout transition-colors duration-500">
            {/* Proctoring Status Bar */}
            {isActive && (
                <motion.div
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    className="fixed top-0 left-0 right-0 z-[60] bg-[var(--bg-surface)] border-b border-red-500/20 px-6 py-3 flex justify-between items-center shadow-lg"
                >
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <ShieldCheck size={20} className="text-red-500" />
                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                            </div>
                            <span className="font-black text-[10px] uppercase tracking-widest text-red-500">AI Proctoring Active</span>
                        </div>

                        <div className="h-4 w-px bg-[var(--border-subtle)]" />

                        <div className="flex items-center gap-5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                            <span className="flex items-center gap-1.5"><Eye size={12} className="text-red-500/60" /> Eye Tracking</span>
                            <span className="flex items-center gap-1.5"><Monitor size={12} className="text-red-500/60" /> Screen Recording</span>
                            <span className="flex items-center gap-1.5"><Lock size={12} className="text-red-500/60" /> Secure Env</span>
                        </div>
                    </div>

                    {!isFullScreen && (
                        <button
                            onClick={requestFullScreen}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-md shadow-red-500/20"
                        >
                            <Maximize size={12} />
                            Enforce Full Screen
                        </button>
                    )}
                </motion.div>
            )}

            {/* Warning Toasts */}
            <div className="fixed top-20 right-6 z-[70] space-y-3 max-w-sm pointer-events-none">
                <AnimatePresence>
                    {warnings.map((warning, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className="flex items-center gap-4 px-5 py-4 rounded-xl bg-red-600 text-white shadow-2xl border border-red-400/30 backdrop-blur-md"
                        >
                            <div className="p-2 bg-white/10 rounded-lg">
                                <AlertTriangle size={20} className="text-white" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Security Alert</h4>
                                <span className="font-bold text-xs">{warning}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Integrity Indicator Overlay (Subtle) */}
            {isActive && (
                <div className="fixed inset-0 pointer-events-none border-4 border-red-500/5 z-[55]" />
            )}

            {/* Main Content */}
            <div className={`${isActive ? 'pt-16' : ''} transition-all duration-300`}>
                {children}
            </div>
        </div>
    );
};

export default ProctoringWrapper;
