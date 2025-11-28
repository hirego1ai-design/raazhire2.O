import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Video, Users } from 'lucide-react';

interface ScheduleInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (interviewData: any) => void;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ isOpen, onClose, onSchedule }) => {
    const [formData, setFormData] = useState({
        candidateName: '',
        role: '',
        date: '',
        time: '',
        type: 'Video',
        participants: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.candidateName || !formData.date || !formData.time) return;

        onSchedule({
            ...formData,
            participants: formData.participants.split(',').map(p => p.trim()).filter(Boolean)
        });
        onClose();
        // Reset form
        setFormData({
            candidateName: '',
            role: '',
            date: '',
            time: '',
            type: 'Video',
            participants: ''
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0a0e27] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-neon-purple/10 to-transparent">
                            <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    <User size={14} /> Candidate Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.candidateName}
                                    onChange={e => setFormData({ ...formData, candidateName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                                    placeholder="e.g. Sarah Johnson"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    <User size={14} /> Role
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                                    placeholder="e.g. Senior Frontend Developer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <Calendar size={14} /> Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <Clock size={14} /> Time
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    <Video size={14} /> Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                                >
                                    <option value="Video">Video Interview</option>
                                    <option value="Technical">Technical Round</option>
                                    <option value="HR">HR Round</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    <Users size={14} /> Participants (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.participants}
                                    onChange={e => setFormData({ ...formData, participants: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                                    placeholder="e.g. HR Alice, Tech Lead Bob"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-neon-purple/20"
                                >
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ScheduleInterviewModal;
