// CandidateCard.tsx
// A reusable card component for displaying candidate summary with video preview
// This component is used in the Employer Dashboard to list candidates.

import React, { useState } from 'react';
import { Play, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Candidate {
    id: string;
    name: string;
    photoUrl: string;
    videoUrl: string; // URL to short video preview (e.g., 10s clip)
    appliedJobTitle: string;
    experienceYears: number;
    skills: string[];
    location: string;
    timezone: string;
    aiScore: number; // 0-100
    status: 'applied' | 'screened' | 'shortlisted' | 'interview_scheduled' | 'hired';
}

interface Props {
    candidate: Candidate;
    onShortlist?: (id: string) => void;
    onScheduleInterview?: (id: string) => void;
}

const CandidateCard: React.FC<Props> = ({ candidate, onShortlist, onScheduleInterview }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const navigate = useNavigate();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const statusColors: Record<string, string> = {
        applied: 'bg-gray-500/20 text-gray-300',
        screened: 'bg-blue-500/20 text-blue-300',
        shortlisted: 'bg-green-500/20 text-green-300',
        interview_scheduled: 'bg-purple-500/20 text-purple-300',
        hired: 'bg-yellow-500/20 text-yellow-300',
    };

    return (
        <div className="bg-[#0f111a] border border-white/10 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
            <div className="p-4 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <img src={candidate.photoUrl} alt={candidate.name} className="w-16 h-16 rounded-full object-cover" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
                        <p className="text-sm text-gray-400">{candidate.appliedJobTitle}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[candidate.status]}`}> {candidate.status.replace('_', ' ')} </span>
                </div>

                {/* Video Preview */}
                <div className="relative w-full h-48 bg-black/30 rounded-lg overflow-hidden cursor-pointer" onClick={handlePlay}>
                    {isPlaying ? (
                        <video src={candidate.videoUrl} autoPlay muted onEnded={handlePause} className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <Play size={48} className="absolute inset-0 m-auto text-neon-cyan" />
                            {/* Thumbnail placeholder */}
                            <img src={candidate.photoUrl} alt="preview" className="w-full h-full object-cover opacity-70" />
                        </>
                    )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div>Experience: {candidate.experienceYears} yr</div>
                    <div>Location: {candidate.location} ({candidate.timezone})</div>
                    <div className="col-span-2 flex flex-wrap gap-1">
                        {candidate.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-white/5 rounded text-xs text-neon-cyan border border-neon-cyan/20">
                                {skill}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle size={16} className="text-green-400" /> AI Score: {candidate.aiScore}%
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => navigate(`/employer/candidate/${candidate.id}`)}
                        className="px-3 py-1 rounded bg-white/5 text-sm text-neon-cyan border border-neon-cyan/20 hover:bg-white/10"
                    >
                        View Profile
                    </button>
                    {onShortlist && (
                        <button
                            onClick={() => onShortlist(candidate.id)}
                            className="px-3 py-1 rounded bg-green-500/10 text-sm text-green-300 border border-green-300 hover:bg-green-500/20"
                        >
                            Shortlist
                        </button>
                    )}
                    {onScheduleInterview && (
                        <button
                            onClick={() => onScheduleInterview(candidate.id)}
                            className="px-3 py-1 rounded bg-purple-500/10 text-sm text-purple-300 border border-purple-300 hover:bg-purple-500/20"
                        >
                            Schedule Interview
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateCard;
