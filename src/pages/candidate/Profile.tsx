import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap, Folder,
    Share2, Edit2, Camera, UserPlus, MessageSquare, Trophy, Star,
    Zap, Shield, Check, Github, Linkedin, Globe, Twitter, Play, Clock,
    Video, Users, Award, TrendingUp, ChevronRight, Eye
} from 'lucide-react';
import { endpoints } from '../../lib/api';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [isEmployerView, setIsEmployerView] = useState(false);

    const isYouTube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const id = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
        // modestbranding=1, rel=0, showinfo=0, controls=1 and other params to minimize YT branding
        return `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1`;
    };

    // Mock completeness
    const completeness = 85;

    useEffect(() => {
        const fetchProfile = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            try {
                const response = await fetch(endpoints.profile, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setProfile(data.user);
                        return;
                    }
                }
                throw new Error('API failed');
            } catch (error) {
                console.error('Error fetching profile, using fallback:', error);
                // Fallback to mock data after a delay if fetch fails
                setTimeout(() => {
                    setProfile({
                        name: "John Doe",
                        location: "San Francisco, CA",
                        bio: "Passionate about building scalable web applications and AI-driven solutions. 10+ years of experience in React, Node.js, and Cloud Architecture.",
                        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3",
                        profile: { title: "Senior Full Stack Developer" }
                    });
                }, 500);
            }
        };
        fetchProfile();
    }, []);

    if (!profile && !isEmployerView) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-[var(--primary-light)] border-t-[var(--primary)] rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">Syncing your profile...</p>
        </div>
    );

    const UserData = profile;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className={`saas-card overflow-hidden transition-all duration-500 ${isEmployerView ? 'border-[var(--primary)] ring-4 ring-[var(--primary-light)]' : ''}`}>
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
                    <button
                        onClick={() => setIsEmployerView(!isEmployerView)}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-white/20"
                    >
                        <Eye size={16} /> {isEmployerView ? "Back to Edit" : "Preview as Employer"}
                    </button>
                    {!isEmployerView && (
                        <button className="absolute bottom-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-lg backdrop-blur-sm border border-white/10">
                            <Camera size={18} />
                        </button>
                    )}
                </div>
                <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12">
                    <div className="relative group">
                        <img
                            src={UserData.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3"}
                            alt="Avatar"
                            className="w-32 h-32 rounded-[2rem] border-8 border-[var(--bg-surface)] object-cover shadow-xl"
                        />
                        {!isEmployerView && (
                            <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                                <Camera size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold">{UserData.name}</h1>
                                <p className="text-[var(--text-muted)] font-medium">{UserData.profile?.title || "Product Designer"}</p>
                            </div>
                            {!isEmployerView && (
                                <button className="btn-saas-primary flex items-center gap-2">
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--text-muted)] font-bold">
                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {UserData.location}</span>
                            <span className="flex items-center gap-1.5"><Briefcase size={14} /> Available for hire</span>
                            <span className="flex items-center gap-1.5 text-[var(--primary)]"><Zap size={14} /> 98% Match Rate</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Stats & Progress */}
                {!isEmployerView && (
                    <div className="lg:col-span-4 space-y-6">
                        {/* Video Resume Section - NEW */}
                        <div className="saas-card overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl">
                                        <Video size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Video Resume</h3>
                                        <p className="text-[10px] text-[var(--text-muted)]">Your introduction video</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded-full">AI Verified</span>
                            </div>

                            {/* Video Player */}
                            <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative group">
                                {isYouTube(UserData.video_resume_url) ? (
                                    <iframe
                                        className="w-full h-full border-0"
                                        src={getEmbedUrl(UserData.video_resume_url)}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        className="w-full h-full object-cover"
                                        controls
                                        poster={UserData.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3"}
                                        preload="metadata"
                                    >
                                        <source
                                            src={UserData.video_resume_url || "https://www.w3schools.com/html/mov_bbb.mp4"}
                                            type="video/mp4"
                                        />
                                        Your browser does not support video.
                                    </video>
                                )}

                                {/* Overlay for no video */}
                                {!UserData.video_resume_url && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                        <div className="text-center">
                                            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                                                <Play size={24} className="text-white ml-1" />
                                            </div>
                                            <p className="text-white font-bold text-sm">No video uploaded</p>
                                            <button
                                                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"
                                                onClick={() => window.location.href = '/candidate/video-resume'}
                                            >
                                                Upload Video
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI Analysis Stats */}
                            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
                                <div className="text-center p-2 bg-white rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-[8px] font-black uppercase text-[var(--text-muted)]">Confidence</p>
                                    <p className="text-lg font-black text-indigo-600">92%</p>
                                </div>
                                <div className="text-center p-2 bg-white rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-[8px] font-black uppercase text-[var(--text-muted)]">Communication</p>
                                    <p className="text-lg font-black text-emerald-600">A+</p>
                                </div>
                            </div>
                        </div>

                        <div className="saas-card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-sm">Profile Completeness</h3>
                                <span className="text-[var(--primary)] font-bold">{completeness}%</span>
                            </div>
                            <div className="w-full bg-[var(--bg-page)] h-2 rounded-full mb-6">
                                <div className="bg-[var(--primary)] h-full transition-all duration-1000" style={{ width: `${completeness}%` }}></div>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    { label: "Add your work experience", done: true },
                                    { label: "Upload a video resume", done: !!UserData.video_resume_url },
                                    { label: "Connect your Github", done: true },
                                    { label: "Complete 3 skill assessments", done: false },
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs">
                                        {item.done ? <CheckCircle2 size={14} className="text-green-500" /> : <Clock size={14} className="text-gray-300" />}
                                        <span className={item.done ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)] font-medium'}>{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="saas-card p-6">
                            <h3 className="font-bold text-sm mb-4">Badges & Achievements</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square bg-[var(--bg-page)] rounded-xl flex items-center justify-center text-[var(--primary)] border border-transparent hover:border-[var(--primary)] transition-all cursor-help" title="Top 1% React Developer">
                                        <Award size={20} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Resume Section for Employer Preview Mode */}
                {isEmployerView && (
                    <div className="lg:col-span-4 space-y-6">
                        <div className="saas-card overflow-hidden border-2 border-indigo-200">
                            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Video size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Video Resume</h3>
                                        <p className="text-[10px] opacity-80">{UserData.name}'s introduction</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-emerald-400 text-emerald-900 text-[9px] font-black uppercase rounded-full">AI Verified</span>
                            </div>

                            <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative group">
                                {isYouTube(UserData.video_resume_url) ? (
                                    <iframe
                                        className="w-full h-full border-0"
                                        src={getEmbedUrl(UserData.video_resume_url)}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        className="w-full h-full object-cover"
                                        controls
                                        poster={UserData.avatar_url}
                                        preload="metadata"
                                    >
                                        <source
                                            src={UserData.video_resume_url || "https://www.w3schools.com/html/mov_bbb.mp4"}
                                            type="video/mp4"
                                        />
                                    </video>
                                )}
                            </div>

                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 grid grid-cols-4 gap-2">
                                <div className="text-center p-2 bg-white rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-[7px] font-black uppercase text-[var(--text-muted)]">Confidence</p>
                                    <p className="text-base font-black text-indigo-600">92%</p>
                                </div>
                                <div className="text-center p-2 bg-white rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-[7px] font-black uppercase text-[var(--text-muted)]">Comm.</p>
                                    <p className="text-base font-black text-emerald-600">A+</p>
                                </div>
                                <div className="text-center p-2 bg-white rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-[7px] font-black uppercase text-[var(--text-muted)]">English</p>
                                    <p className="text-base font-black text-purple-600">Pro</p>
                                </div>
                                <div className="text-center p-2 bg-white rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-[7px] font-black uppercase text-[var(--text-muted)]">Body</p>
                                    <p className="text-base font-black text-amber-600">88%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="saas-card overflow-hidden">
                        <div className="flex border-b border-[var(--border-subtle)] px-6">
                            {['Summary', 'Experience', 'Skills', 'Preferences'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === tab.toLowerCase() ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'summary' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <p className="text-[var(--text-main)] leading-relaxed">{UserData.bio}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                            <div className="p-4 bg-[var(--bg-page)] rounded-2xl border border-[var(--border-subtle)]">
                                                <h4 className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-2">Social Presence</h4>
                                                <div className="flex gap-4">
                                                    <Github className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer" size={20} />
                                                    <Linkedin className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer" size={20} />
                                                    <Globe className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer" size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'experience' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        {[
                                            { role: "Senior Frontend Engineer", company: "Meta", duration: "2021 - Present", desc: "Leading the UI development for core advertising platforms." },
                                            { role: "Software Engineer", company: "Uber", duration: "2018 - 2021", desc: "Optimizing real-time dispatch systems using Node.js and React." }
                                        ].map((exp, i) => (
                                            <div key={i} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-px before:h-[calc(100%+2rem)] before:bg-[var(--border-subtle)] last:before:h-0">
                                                <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[var(--primary)] ring-4 ring-[var(--primary-light)]"></div>
                                                <h4 className="font-bold">{exp.role}</h4>
                                                <p className="text-sm font-bold text-[var(--primary)] mb-1">{exp.company}</p>
                                                <p className="text-xs text-[var(--text-muted)] mb-2">{exp.duration}</p>
                                                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{exp.desc}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                                {activeTab === 'skills' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-[var(--text-muted)] mb-4">Core Competencies</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Docker", "Python"].map(skill => (
                                                    <span key={skill} className="px-3 py-1 bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold rounded-lg border border-[var(--primary)]">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'preferences' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-[var(--bg-page)] rounded-xl border border-[var(--border-subtle)]">
                                                <div className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1">Work Preference</div>
                                                <div className="text-sm font-bold">Remote / Hybrid</div>
                                            </div>
                                            <div className="p-4 bg-[var(--bg-page)] rounded-xl border border-[var(--border-subtle)]">
                                                <div className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1">Expected Salary</div>
                                                <div className="text-sm font-bold">$120k - $160k</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper components
const CheckCircle2 = ({ size, className }: any) => <Check size={size} className={className} />;

export default Profile;
