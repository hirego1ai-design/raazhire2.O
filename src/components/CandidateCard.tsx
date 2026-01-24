// src/components/CandidateCard.tsx
import React, { useState } from 'react';
import { Play, CheckCircle, Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Candidate {
    id: string;
    name: string;
    photoUrl: string;
    videoUrl: string;
    appliedJobTitle: string;
    experienceYears: number;
    skills: string[];
    location: string;
    timezone: string;
    aiScore: number;
    status: 'applied' | 'screened' | 'shortlisted' | 'interview_scheduled' | 'hired';
    applicationId?: string;
}

interface Props {
    candidate: Candidate;
    onShortlist?: (id: string) => void;
    onScheduleInterview?: (id: string) => void;
    onViewProfile?: (id: string) => void;
}

const CandidateCard: React.FC<Props> = ({ candidate, onShortlist, onScheduleInterview, onViewProfile }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const navigate = useNavigate();

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPlaying(true);
    };

    const handlePause = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPlaying(false);
    };

    const handleMainAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onViewProfile) {
            onViewProfile(candidate.id);
        } else {
            navigate(`/employer/candidate/${candidate.id}`);
        }
    };

    const statusStyles: Record<string, { bg: string, text: string, border: string }> = {
        applied: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
        screened: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
        shortlisted: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
        interview_scheduled: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
        hired: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20' },
    };

    const style = statusStyles[candidate.status] || statusStyles.applied;

    const isYouTube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const id = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
        return `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1`;
    };

    return (
        <div
            className="saas-card overflow-hidden group border-2 border-transparent hover:border-indigo-600/30 transition-all duration-300"
            onClick={handleMainAction}
        >
            {/* Video/Image Header */}
            <div className="relative h-48 bg-gray-900 overflow-hidden cursor-pointer group/vid" onClick={handlePlay}>
                {isPlaying ? (
                    isYouTube(candidate.videoUrl) ? (
                        <iframe
                            className="w-full h-full border-0"
                            src={getEmbedUrl(candidate.videoUrl)}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <video
                            src={candidate.videoUrl}
                            autoPlay
                            muted
                            onEnded={() => setIsPlaying(false)}
                            className="w-full h-full object-cover"
                        />
                    )
                ) : (
                    <>
                        <img
                            src={candidate.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random`}
                            alt="preview"
                            className="w-full h-full object-cover opacity-60 group-hover/vid:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover/vid:scale-125 transition-all duration-300 shadow-xl shadow-black/20">
                                <Play size={22} className="text-white fill-white ml-1" />
                            </div>
                        </div>
                    </>
                )}

                {/* AI Score Badge - Premium Look */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-2">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[11px] font-black text-white tracking-widest uppercase">{candidate.aiScore}% Match</span>
                </div>
            </div>

            <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-black text-[var(--text-main)] leading-tight group-hover:text-indigo-600 transition-colors">
                            {candidate.name}
                        </h3>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-80">{candidate.appliedJobTitle}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${style.bg} ${style.text} ${style.border}`}>
                        {candidate.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-[var(--border-subtle)]">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Experience</span>
                        <span className="text-sm font-black text-[var(--text-main)]">{candidate.experienceYears}+ Years</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Location</span>
                        <span className="text-sm font-black text-[var(--text-main)] flex items-center justify-end gap-1">
                            <CheckCircle size={10} className="text-emerald-500" /> {candidate.location}
                        </span>
                    </div>
                </div>

                {/* Skills Ribbon */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                    {candidate.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100/50 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                            {skill}
                        </span>
                    ))}
                    {candidate.skills.length > 3 && (
                        <span className="px-2.5 py-1 bg-gray-50 text-[10px] font-black text-[var(--text-muted)] uppercase rounded-lg">
                            +{candidate.skills.length - 3}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleMainAction}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Deep View
                    </button>
                    {(onShortlist || onScheduleInterview) && (
                        <div className="flex gap-2">
                            {onShortlist && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onShortlist(candidate.id); }}
                                    className="p-3 border border-emerald-500/20 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                                    title="Shortlist"
                                >
                                    <CheckCircle size={18} />
                                </button>
                            )}
                            {onScheduleInterview && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onScheduleInterview(candidate.id); }}
                                    className="p-3 border border-purple-500/20 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"
                                    title="Schedule Interview"
                                >
                                    <Calendar size={18} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateCard;
