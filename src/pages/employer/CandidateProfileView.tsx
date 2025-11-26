// src/pages/employer/CandidateProfileView.tsx
// Employer view of candidate profile with actions (Shortlist, Schedule Interview)

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap, Folder,
    ArrowLeft, Star, Calendar, CheckCircle, Play, Clock, Code,
    Github, Linkedin, Globe, Twitter, MessageSquare,
    Download, Share2
} from 'lucide-react';
import { getCandidateById } from '../../data/mockCandidates';
import { SkillRadar, SkillCategories, SkillBar } from '../../components/SkillCharts';

const CandidateProfileView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('about');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showShortlistConfirm, setShowShortlistConfirm] = useState(false);

    const candidate = id ? getCandidateById(id) : undefined;

    if (!candidate) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Candidate Not Found</h2>
                    <p className="text-gray-400 mb-4">The candidate you're looking for doesn't exist.</p>
                    <button onClick={() => navigate('/employer/candidates')} className="btn-3d btn-primary">
                        Back to Candidates
                    </button>
                </div>
            </div>
        );
    }

    const handleShortlist = () => {
        console.log('Shortlisting candidate:', candidate.id);
        setShowShortlistConfirm(true);
        setTimeout(() => setShowShortlistConfirm(false), 3000);
    };

    const handleScheduleInterview = () => {
        setShowScheduleModal(true);
    };

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Scheduling interview for:', candidate.id);
        setShowScheduleModal(false);
        // In real app, this would send interview invite
    };

    const tabs = [
        { id: 'about', label: 'About', icon: <User size={16} /> },
        { id: 'skills', label: 'Skills', icon: <Code size={16} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
        { id: 'portfolio', label: 'Portfolio', icon: <Folder size={16} /> },
    ];

    const radarData = [
        { subject: 'Frontend', A: candidate.technicalSkills[0]?.score || 0, fullMark: 100 },
        { subject: 'Backend', A: candidate.technicalSkills[1]?.score || 0, fullMark: 100 },
        { subject: 'DevOps', A: 75, fullMark: 100 },
        { subject: 'Design', A: 70, fullMark: 100 },
        { subject: 'Soft Skills', A: candidate.softSkills[0]?.score || 0, fullMark: 100 },
        { subject: 'Testing', A: 80, fullMark: 100 },
    ];

    const pieData = [
        { name: 'Technical', value: 60, color: '#00f3ff' },
        { name: 'Soft Skills', value: 25, color: '#bc13fe' },
        { name: 'Tools', value: 15, color: '#ff006e' },
    ];

    const statusColors: Record<string, string> = {
        applied: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        screened: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        shortlisted: 'bg-green-500/20 text-green-300 border-green-500/30',
        interview_scheduled: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        hired: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };

    return (
        <div className="max-w-7xl mx-auto pb-8 px-4">
            {/* Back Button */}
            <button
                onClick={() => navigate('/employer/candidates')}
                className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Candidates
            </button>

            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-6 rounded-xl glass border border-[var(--glass-border)]"
            >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-1">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden">
                                <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-[#0f111a] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h1 className="text-3xl font-bold mb-1 text-[var(--text-primary)]">{candidate.name}</h1>
                                <div className="flex items-center gap-2 text-neon-cyan mb-2">
                                    <Briefcase size={16} />
                                    <span className="font-medium">{candidate.currentRole}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[candidate.status]}`}>
                                    {candidate.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                                    <Star className="text-yellow-400" size={14} fill="currentColor" />
                                    <span className="text-green-400 font-bold text-sm">{candidate.aiScore}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)] mb-4">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {candidate.location}</span>
                            <span className="flex items-center gap-1"><Mail size={14} /> {candidate.email}</span>
                            <span className="flex items-center gap-1"><Phone size={14} /> {candidate.phone}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {candidate.timezone}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleShortlist}
                                className="btn-3d btn-primary px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                            >
                                <CheckCircle size={16} />
                                Shortlist Candidate
                            </button>
                            <button
                                onClick={handleScheduleInterview}
                                className="btn-3d btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                            >
                                <Calendar size={16} />
                                Schedule Interview
                            </button>
                            <button className="btn-3d btn-ghost px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                                <MessageSquare size={16} />
                                Message
                            </button>
                            <button className="btn-3d btn-ghost px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                                <Download size={16} />
                                Download Resume
                            </button>
                            <button className="btn-3d btn-ghost px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                                <Share2 size={16} />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Video Introduction Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 p-5 rounded-xl glass border border-neon-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.08)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-neon-cyan/30 rounded-tl-xl" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-neon-purple/30 rounded-br-xl" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-neon-cyan/20">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                                        <Play size={16} />
                                    </div>
                                    <h3 className="text-base font-semibold text-[var(--text-primary)]">Video Introduction</h3>
                                </div>
                                <div className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-green-400 text-xs font-medium">Available</span>
                                </div>
                            </div>

                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/40 border-2 border-neon-cyan/30 group cursor-pointer shadow-[0_0_10px_rgba(0,243,255,0.1)]">
                                <img
                                    src={candidate.photoUrl}
                                    alt="Video Introduction"
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="w-14 h-14 rounded-full bg-neon-cyan/20 backdrop-blur-sm border-2 border-neon-cyan flex items-center justify-center group-hover:scale-110 transition-transform hover:bg-neon-cyan/30">
                                        <Play className="text-neon-cyan ml-0.5" size={20} fill="currentColor" />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-medium text-sm">Hi, I'm {candidate.name}!</h4>
                                            <p className="text-gray-400 text-xs mt-0.5">{candidate.currentRole}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock size={12} />
                                            <span>{candidate.videoStats.avgWatchTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="p-5 rounded-xl glass border border-[var(--glass-border)]">
                        <h3 className="text-base font-semibold mb-3 text-[var(--text-primary)]">Candidate Stats</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[var(--glass-border)]">
                                <span className="text-[var(--text-secondary)] text-xs">Experience</span>
                                <span className="text-[var(--text-primary)] font-bold text-sm">{candidate.experienceYears}+ Years</span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-[var(--glass-border)]">
                                <span className="text-[var(--text-secondary)] text-xs">AI Match Score</span>
                                <span className="text-neon-cyan font-bold text-sm">{candidate.aiScore}%</span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-[var(--glass-border)]">
                                <span className="text-[var(--text-secondary)] text-xs">Profile Views</span>
                                <span className="text-green-400 font-bold text-sm">{candidate.videoStats.views}</span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-[var(--glass-border)]">
                                <span className="text-[var(--text-secondary)] text-xs">Global Rank</span>
                                <span className="text-neon-purple font-bold text-sm">#{candidate.gamification.rank}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)] text-xs">Accuracy</span>
                                <span className="text-yellow-400 font-bold text-sm">{candidate.gamification.accuracy}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 p-2 rounded-xl glass border border-[var(--glass-border)] overflow-x-auto"
            >
                <div className="flex gap-2 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-lg'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--glass-border)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Content Based on Active Tab */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'about' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)] lg:col-span-2"
                        >
                            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)] flex items-center gap-2">
                                <User size={18} className="text-neon-cyan" /> About
                            </h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{candidate.bio}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                        >
                            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)] flex items-center gap-2">
                                <Globe size={18} className="text-blue-400" /> Social Links
                            </h3>
                            <div className="space-y-2">
                                {candidate.socialLinks.github && (
                                    <a href={candidate.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                                        <Github size={16} /> GitHub
                                    </a>
                                )}
                                {candidate.socialLinks.linkedin && (
                                    <a href={candidate.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                                        <Linkedin size={16} /> LinkedIn
                                    </a>
                                )}
                                {candidate.socialLinks.twitter && (
                                    <a href={candidate.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                                        <Twitter size={16} /> Twitter
                                    </a>
                                )}
                                {candidate.socialLinks.portfolio && (
                                    <a href={candidate.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                                        <Globe size={16} /> Portfolio
                                    </a>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)] lg:col-span-3"
                        >
                            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">Top Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((skill) => (
                                    <span key={skill} className="px-3 py-1.5 bg-white/5 rounded-lg text-sm text-neon-cyan border border-neon-cyan/20">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}

                {activeTab === 'skills' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2"
                        >
                            <SkillRadar data={radarData} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <SkillCategories data={pieData} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <SkillBar data={candidate.technicalSkills} title="Technical Skills" color="#ff006e" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <SkillBar data={candidate.softSkills} title="Soft Skills" color="#bc13fe" />
                        </motion.div>
                    </>
                )}

                {activeTab === 'experience' && (
                    <>
                        {candidate.experience.map((exp, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-neon-purple/10 text-neon-purple">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-[var(--text-primary)]">{exp.role}</h3>
                                        <div className="text-neon-cyan text-sm mb-2">{exp.company} • {exp.period}</div>
                                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{exp.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </>
                )}

                {activeTab === 'education' && (
                    <>
                        {candidate.education.map((edu, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-neon-pink/10 text-neon-pink">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base text-[var(--text-primary)]">{edu.degree}</h3>
                                        <div className="text-[var(--text-secondary)] text-sm">{edu.institution} • {edu.period}</div>
                                        {edu.specialization && (
                                            <div className="text-[var(--text-secondary)] text-sm mt-2">Specialization: {edu.specialization}</div>
                                        )}
                                        {edu.gpa && (
                                            <div className="text-[var(--text-secondary)] text-sm mt-1">GPA: {edu.gpa}</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </>
                )}

                {activeTab === 'portfolio' && (
                    <>
                        {candidate.portfolio.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: item.id * 0.05 }}
                                className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--glass-border)] hover:border-neon-cyan/50 transition-all cursor-pointer"
                            >
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-medium flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm text-sm">
                                        <Folder size={16} /> View Details
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                    <div className="text-white font-semibold text-sm">{item.title}</div>
                                    <div className="text-xs text-gray-400 mt-1">{item.technologies.join(' • ')}</div>
                                </div>
                            </motion.div>
                        ))}
                    </>
                )}
            </div>

            {/* Shortlist Confirmation Toast */}
            {showShortlistConfirm && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-8 right-8 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm"
                >
                    <CheckCircle className="text-green-400" size={24} />
                    <div>
                        <div className="font-semibold text-white">Candidate Shortlisted!</div>
                        <div className="text-sm text-gray-300">{candidate.name} has been added to your shortlist.</div>
                    </div>
                </motion.div>
            )}

            {/* Schedule Interview Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-md p-6"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-white">Schedule Interview</h2>
                        <p className="text-gray-400 mb-6">Schedule an interview with {candidate.name}</p>
                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Interview Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Interview Time</label>
                                <input
                                    type="time"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Interview Type</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors text-white">
                                    <option value="video">Video Call</option>
                                    <option value="phone">Phone Call</option>
                                    <option value="in-person">In-Person</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors text-white resize-none"
                                    rows={3}
                                    placeholder="Add any notes or special instructions..."
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowScheduleModal(false)}
                                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-3d btn-primary px-6 py-2">
                                    Schedule Interview
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CandidateProfileView;
