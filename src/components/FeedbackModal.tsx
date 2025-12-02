import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../lib/api';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    candidateId: string;
    interviewId: string;
    employerId: string;
    onSubmitSuccess: () => void;
}

export default function FeedbackModal({
    isOpen,
    onClose,
    candidateName,
    candidateId,
    interviewId,
    employerId,
    onSubmitSuccess
}: FeedbackModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [ratings, setRatings] = useState({
        technical: 0,
        communication: 0,
        cultureFit: 0,
        overall: 0
    });

    const [feedback, setFeedback] = useState({
        strengths: '',
        weaknesses: '',
        comments: '',
        decision: '' as 'hire' | 'reject' | 'maybe' | 'next_round',
        rejectionReason: ''
    });

    const handleRating = (category: keyof typeof ratings, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    const handleSubmit = async () => {
        if (!feedback.decision) {
            setError('Please select a hiring decision');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/feedback/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token exists
                },
                body: JSON.stringify({
                    interviewId,
                    candidateId,
                    employerId,
                    technicalRating: ratings.technical,
                    communicationRating: ratings.communication,
                    cultureFitRating: ratings.cultureFit,
                    overallRating: ratings.overall,
                    strengths: feedback.strengths.split(',').map(s => s.trim()).filter(Boolean),
                    weaknesses: feedback.weaknesses.split(',').map(s => s.trim()).filter(Boolean),
                    detailedComments: feedback.comments,
                    hiringDecision: feedback.decision,
                    rejectionReason: feedback.rejectionReason
                })
            });

            if (!response.ok) throw new Error('Failed to submit feedback');

            onSubmitSuccess();
            onClose();
        } catch (err) {
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Interview Feedback</h2>
                            <p className="text-blue-100 text-sm mt-1">Mandatory for {candidateName}</p>
                        </div>
                        {/* Close button disabled to enforce mandatory feedback */}
                        {/* <button onClick={onClose} className="text-white/80 hover:text-white"><X size={24} /></button> */}
                    </div>

                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {/* Step 1: Ratings */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">
                                1. Performance Ratings
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <RatingInput
                                    label="Technical Skills"
                                    value={ratings.technical}
                                    onChange={(v) => handleRating('technical', v)}
                                />
                                <RatingInput
                                    label="Communication"
                                    value={ratings.communication}
                                    onChange={(v) => handleRating('communication', v)}
                                />
                                <RatingInput
                                    label="Culture Fit"
                                    value={ratings.cultureFit}
                                    onChange={(v) => handleRating('cultureFit', v)}
                                />
                                <RatingInput
                                    label="Overall Rating"
                                    value={ratings.overall}
                                    onChange={(v) => handleRating('overall', v)}
                                />
                            </div>

                            {/* Step 2: Qualitative Feedback */}
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2 pt-4">
                                2. Detailed Feedback
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Key Strengths (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="e.g. React, Leadership, Problem Solving"
                                        value={feedback.strengths}
                                        onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Areas for Improvement
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="e.g. System Design, SQL optimization"
                                        value={feedback.weaknesses}
                                        onChange={(e) => setFeedback({ ...feedback, weaknesses: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Additional Comments
                                </label>
                                <textarea
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-24"
                                    placeholder="Detailed observations about the candidate..."
                                    value={feedback.comments}
                                    onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                                />
                            </div>

                            {/* Step 3: Decision */}
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2 pt-4">
                                3. Hiring Decision
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['hire', 'next_round', 'maybe', 'reject'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setFeedback({ ...feedback, decision: option as any })}
                                        className={`p-3 rounded-lg border-2 transition-all capitalize ${feedback.decision === option
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                            }`}
                                    >
                                        {option.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>

                            {feedback.decision === 'reject' && (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Reason for Rejection
                                    </label>
                                    <select
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        value={feedback.rejectionReason}
                                        onChange={(e) => setFeedback({ ...feedback, rejectionReason: e.target.value })}
                                    >
                                        <option value="">Select a reason...</option>
                                        <option value="technical_skills">Lacks Technical Skills</option>
                                        <option value="culture_fit">Culture Fit Issue</option>
                                        <option value="communication">Communication Skills</option>
                                        <option value="salary">Salary Expectations</option>
                                        <option value="experience">Insufficient Experience</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t flex justify-end gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !feedback.decision}
                            className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${isSubmitting || !feedback.decision
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                                }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback & Complete'}
                            {!isSubmitting && <CheckCircle size={18} />}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function RatingInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`p-1 transition-colors ${star <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                            }`}
                    >
                        <Star size={24} fill={star <= value ? "currentColor" : "none"} />
                    </button>
                ))}
            </div>
        </div>
    );
}
