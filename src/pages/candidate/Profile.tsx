import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap, Folder,
    Share2, Edit2, Camera, UserPlus, MessageSquare, Trophy, Star,
    Zap, Shield, Check, Github, Linkedin, Globe, Twitter, Code, Play, Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SkillRadar, SkillCategories, SkillBar } from '../../components/SkillCharts';
import { endpoints } from '../../lib/api';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('about');
    const [isFollowing, setIsFollowing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connect' | 'pending' | 'connected'>('connect');

    const [profile, setProfile] = useState<any>(null);
    const [skills, setSkills] = useState<any>({ radar: [], pie: [], tech: [], soft: [] });
    const [experience, setExperience] = useState<any[]>([]);
    const [education, setEducation] = useState<any[]>([]);
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [gamification, setGamification] = useState<any>({ rank: 0, points: 0, masteryScore: 0, accuracy: 0, badges: [] });
    const [assessmentResults, setAssessmentResults] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {

                const response = await fetch(endpoints.profile, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();

                if (data.success && data.user) {
                    const u = data.user;
                    setProfile({
                        name: u.name || 'User',
                        title: u.profile?.title || 'No title set',
                        location: u.location || 'Not set',
                        email: u.email,
                        phone: u.phone || 'Not set',
                        bio: u.bio || 'No bio yet.',
                        avatar: u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                    });

                    if (u.profile) {
                        setSkills(u.profile.skills_radar || u.profile.skills_tech ? {
                            radar: u.profile.skills_radar || [],
                            tech: u.profile.skills_tech || [],
                            soft: u.profile.skills_soft || []
                        } : { radar: [], tech: [], soft: [] });
                        setExperience(u.profile.experience_details || []);

                        // Parse Education JSONB to array
                        let eduList = [];
                        if (u.profile.education_10th?.board) eduList.push({ ...u.profile.education_10th, degree: '10th Standard', institution: u.profile.education_10th.board });
                        if (u.profile.education_12th?.board) eduList.push({ ...u.profile.education_12th, degree: '12th Standard', institution: u.profile.education_12th.board });
                        if (u.profile.graduation?.degree) eduList.push({ ...u.profile.graduation, degree: u.profile.graduation.degree, institution: u.profile.graduation.college });
                        if (u.profile.post_graduation?.degree) eduList.push({ ...u.profile.post_graduation, degree: u.profile.post_graduation.degree, institution: u.profile.post_graduation.college });

                        setEducation(eduList);
                        setPortfolio(u.profile.portfolio_details || []); // Assuming we might add this later or fetch separately
                    }

                    // Fetch Gamification Data
                    try {
                        const gamificationRes = await fetch(endpoints.gamification, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
                        });
                        if (gamificationRes.ok) {
                            const gamificationData = await gamificationRes.json();
                            const stats = gamificationData.stats || {};
                            setGamification({
                                rank: stats.global_rank || 0,
                                points: stats.points || 0,
                                masteryScore: stats.skill_mastery || 0,
                                accuracy: stats.correct_rate || 0,
                                badges: gamificationData.badges?.map((b: any) => ({
                                    id: b.badge?.id,
                                    name: b.badge?.name,
                                    icon: <Trophy size={14} />, // Dynamic icons not supported easily from DB string
                                    color: b.badge?.color || 'text-yellow-400',
                                    bg: 'bg-yellow-400/10'
                                })) || []
                            });
                        }
                    } catch (gError) {
                        console.error("Error fetching gamification for profile:", gError);
                    }

                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                // Fallback to mock data if fetch fails
                setProfile({
                    name: 'John Doe',
                    title: 'Senior Full Stack Developer',
                    location: 'Bangalore, India',
                    email: 'john.doe@example.com',
                    phone: '+91 9876543210',
                    bio: 'Passionate Full Stack Developer with 5+ years of experience in building scalable web applications. Expert in React, Node.js, and cloud technologies.',
                    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                });
                // Also set mock data for other sections if fetch fails completely
                setSkills({
                    radar: [
                        { subject: 'React', A: 90, fullMark: 100 },
                        { subject: 'Node.js', A: 85, fullMark: 100 },
                        { subject: 'TypeScript', A: 88, fullMark: 100 },
                        { subject: 'Python', A: 75, fullMark: 100 },
                        { subject: 'AWS', A: 80, fullMark: 100 },
                        { subject: 'Docker', A: 78, fullMark: 100 }
                    ],
                    pie: [
                        { name: 'Technical', value: 15, color: '#00f3ff' },
                        { name: 'Soft Skills', value: 8, color: '#bc13fe' }
                    ],
                    tech: [
                        { name: 'React', score: 90 },
                        { name: 'Node.js', score: 85 },
                        { name: 'TypeScript', score: 88 },
                        { name: 'Python', score: 75 },
                        { name: 'AWS', score: 80 },
                        { name: 'Docker', score: 78 },
                        { name: 'MongoDB', score: 82 },
                        { name: 'PostgreSQL', score: 85 }
                    ],
                    soft: [
                        { name: 'Communication', score: 92 },
                        { name: 'Leadership', score: 85 },
                        { name: 'Problem Solving', score: 95 },
                        { name: 'Teamwork', score: 90 }
                    ]
                });
                setExperience([
                    {
                        id: 1,
                        company: 'Tech Corp Solutions',
                        position: 'Senior Full Stack Developer',
                        start_date: '2020-01',
                        end_date: null,
                        description: 'Leading development of enterprise web applications using React and Node.js'
                    },
                    {
                        id: 2,
                        company: 'StartUp Inc',
                        position: 'Full Stack Developer',
                        start_date: '2018-06',
                        end_date: '2019-12',
                        description: 'Built scalable microservices architecture and RESTful APIs'
                    }
                ]);
                setEducation([
                    {
                        id: 1,
                        degree: 'M.Tech in Artificial Intelligence',
                        institution: 'IIT Bangalore',
                        start_year: 2016,
                        end_year: 2018,
                        grade: '8.8 CGPA'
                    },
                    {
                        id: 2,
                        degree: 'B.Tech in Computer Science',
                        institution: 'IIT Bangalore',
                        start_year: 2012,
                        end_year: 2016,
                        grade: '8.5 CGPA'
                    }
                ]);
                setPortfolio([
                    {
                        id: 1,
                        title: 'E-Commerce Platform',
                        description: 'Full-stack e-commerce solution with React and Node.js',
                        url: 'https://github.com/johndoe/ecommerce',
                        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400'
                    },
                    {
                        id: 2,
                        title: 'Task Management App',
                        description: 'Real-time task management with WebSocket integration',
                        url: 'https://github.com/johndoe/taskmanager',
                        image: 'https://images.unsplash.com/photo-1540350394557-8d14678e7f91?w=400'
                    }
                ]);
                setGamification({
                    rank: 42,
                    points: 12500,
                    masteryScore: 88,
                    accuracy: 92,
                    badges: [
                        { id: 1, icon: <Trophy size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10', name: 'Top Performer' },
                        { id: 2, icon: <Trophy size={14} />, color: 'text-blue-400', bg: 'bg-blue-400/10', name: 'Fast Learner' },
                        { id: 3, icon: <Trophy size={14} />, color: 'text-green-400', bg: 'bg-green-400/10', name: 'Problem Solver' }
                    ]
                });
                setAssessmentResults({
                    overallScore: 88,
                    communication: 92,
                    knowledge: 85,
                    confidence: 87,
                    completedAt: new Date().toISOString()
                });
            }
        };

        fetchProfile();
    }, []);

    const tabs = [
        { id: 'about', label: 'About', icon: <User size={16} /> },
        { id: 'skills', label: 'Skills', icon: <Code size={16} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
        { id: 'portfolio', label: 'Portfolio', icon: <Folder size={16} /> },
        { id: 'assessment', label: 'Assessment', icon: <Star size={16} /> },
        { id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> },
    ];

    const handleConnect = () => {
        if (connectionStatus === 'connect') setConnectionStatus('pending');
    };

    if (!profile) return <div className="p-8 text-center text-white">Loading profile...</div>;

    return (
        <div className="max-w-7xl mx-auto pb-8 px-4">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-6 rounded-xl glass border border-[var(--glass-border)]"
            >
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-1">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Profile" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={20} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-1 text-[var(--text-primary)]">{profile.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-neon-cyan mb-3">
                            <Briefcase size={16} />
                            <span className="font-medium">{profile.title}</span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => setIsFollowing(!isFollowing)}
                            className={`btn-3d px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium ${isFollowing
                                ? 'btn-primary'
                                : 'btn-secondary'
                                }`}
                        >
                            {isFollowing ? <Check size={14} /> : <UserPlus size={14} />}
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button
                            onClick={handleConnect}
                            className={`btn-3d px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium ${connectionStatus === 'connected'
                                ? 'btn-primary'
                                : 'btn-secondary'
                                }`}
                        >
                            {connectionStatus === 'connected' ? <MessageSquare size={14} /> : <UserPlus size={14} />}
                            {connectionStatus === 'connect' && 'Connect'}
                            {connectionStatus === 'pending' && 'Pending'}
                            {connectionStatus === 'connected' && 'Message'}
                        </button>
                        <button className="btn-3d btn-ghost px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs">
                            <Share2 size={14} /> Share
                        </button>
                        <button className="btn-3d btn-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium">
                            <Edit2 size={14} /> Edit
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Video Introduction Section - Compact */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Video Card - Takes 2 columns on desktop */}
                    <div className="lg:col-span-2 p-5 rounded-xl glass border border-neon-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.08)] relative overflow-hidden">
                        {/* Decorative Corner Lines */}
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
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-green-400 text-xs font-medium">Active</span>
                                    </div>
                                    <button className="btn-3d btn-icon btn-ghost rounded-full p-1.5" title="Re-record Video">
                                        <Edit2 size={14} />
                                    </button>
                                    <button className="btn-3d btn-icon btn-ghost rounded-full p-1.5" title="Share Video">
                                        <Share2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/40 border-2 border-neon-cyan/30 group cursor-pointer shadow-[0_0_10px_rgba(0,243,255,0.1)]">
                                {/* Video Thumbnail */}
                                <img
                                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Video Introduction"
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                />

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-neon-cyan/20 backdrop-blur-sm border-2 border-neon-cyan flex items-center justify-center group-hover:scale-110 transition-transform hover:bg-neon-cyan/30">
                                        <Play className="text-neon-cyan ml-0.5" size={20} fill="currentColor" />
                                    </button>
                                </div>

                                {/* Video Info Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-medium text-sm">Hi, I'm Alex Johnson!</h4>
                                            <p className="text-gray-400 text-xs mt-0.5">Full Stack Developer</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock size={12} />
                                            <span>2:15</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Card */}
                    <div className="p-5 rounded-xl glass border border-[var(--glass-border)]">
                        <h3 className="text-base font-semibold mb-3 text-[var(--text-primary)]">Video Stats</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[var(--glass-border)]">
                                <span className="text-[var(--text-secondary)] text-xs">Views</span>
                                <span className="text-[var(--text-primary)] font-bold text-sm">1,234</span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-[var(--glass-border)]">
                                <span className="text-[var(--text-secondary)] text-xs">Avg. Watch Time</span>
                                <span className="text-neon-cyan font-bold text-sm">1:45</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)] text-xs">Completion Rate</span>
                                <span className="text-green-400 font-bold text-sm">82%</span>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--glass-border)]">
                            Your video is performing well! Keep it updated to attract more employers.
                        </p>
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
                        {/* About Me Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)] lg:col-span-2"
                        >
                            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)] flex items-center gap-2">
                                <User size={18} className="text-neon-cyan" /> About Me
                            </h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                                {profile.bio || 'Passionate Full Stack Developer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and Cloud Architecture. I love solving complex problems and optimizing performance. Currently looking for opportunities to work on AI-driven projects.'}
                            </p>
                            {profile.jobProfile && (
                                <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                                    <div className="text-xs text-[var(--text-secondary)] mb-1">Job Profile</div>
                                    <div className="text-sm font-medium text-neon-cyan">{profile.jobProfile}</div>
                                </div>
                            )}
                        </motion.div>

                        {/* Personal Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                        >
                            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">Personal Details</h3>
                            <div className="space-y-3">
                                {profile.dateOfBirth && (
                                    <div className="pb-2 border-b border-[var(--glass-border)]">
                                        <div className="text-[var(--text-secondary)] text-xs">Date of Birth</div>
                                        <div className="text-sm font-medium text-[var(--text-primary)] mt-1">{profile.dateOfBirth}</div>
                                    </div>
                                )}
                                {profile.currentAddress && (
                                    <div className="pb-2 border-b border-[var(--glass-border)]">
                                        <div className="text-[var(--text-secondary)] text-xs">Current Address</div>
                                        <div className="text-sm text-[var(--text-primary)] mt-1">{profile.currentAddress}</div>
                                    </div>
                                )}
                                {profile.permanentAddress && (
                                    <div>
                                        <div className="text-[var(--text-secondary)] text-xs">Permanent Address</div>
                                        <div className="text-sm text-[var(--text-primary)] mt-1">{profile.permanentAddress}</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Social Links Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)] lg:col-span-2"
                        >
                            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)] flex items-center gap-2">
                                <Globe size={18} className="text-blue-400" /> Social Links
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                                    <Github size={16} /> GitHub
                                </a>
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                                    <Linkedin size={16} /> LinkedIn
                                </a>
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                                    <Twitter size={16} /> Twitter
                                </a>
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
                                    <Globe size={16} /> Portfolio
                                </a>
                            </div>
                        </motion.div>

                        {/* Gamification Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                        >
                            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)] flex items-center gap-2">
                                <Trophy size={18} className="text-neon-purple" /> Achievements
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
                                    <span className="text-[var(--text-secondary)] text-xs">Global Rank</span>
                                    <span className="text-[var(--text-primary)] font-bold text-sm">#{gamification.rank.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
                                    <span className="text-[var(--text-secondary)] text-xs">Total Points</span>
                                    <span className="text-neon-pink font-bold text-sm">{gamification.points}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--text-secondary)] text-xs">Accuracy</span>
                                    <span className="text-green-400 font-bold text-sm">{gamification.accuracy}%</span>
                                </div>
                                <Link to="/candidate/gamification" className="block w-full py-2 mt-2 text-center text-xs font-medium text-[var(--text-primary)] bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 hover:border-neon-cyan/60 rounded-lg transition-all">
                                    View Dashboard →
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}

                {activeTab === 'skills' && (
                    <>
                        {/* Skill Radar Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2"
                        >
                            <SkillRadar data={skills.radar} />
                        </motion.div>

                        {/* Skill Categories Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <SkillCategories data={skills.pie} />
                        </motion.div>

                        {/* Technical Skills Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <SkillBar data={skills.tech} title="Top Technical Skills" color="#ff006e" />
                        </motion.div>

                        {/* Soft Skills Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <SkillBar data={skills.soft} title="Soft Skills" color="#bc13fe" />
                        </motion.div>
                    </>
                )}

                {activeTab === 'experience' && (
                    <>
                        {experience.map((exp, idx) => (
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
                                        <div className="text-neon-cyan text-sm mb-2">{exp.company} • {exp.start_date} - {exp.end_date || 'Present'}</div>
                                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{exp.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </>
                )}

                {activeTab === 'education' && (
                    <>
                        {/* From Registration Form - 10th */}
                        {profile.education10th?.board && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base text-[var(--text-primary)]">10th Standard</h3>
                                        <div className="text-[var(--text-secondary)] text-sm">{profile.education10th.board}</div>
                                        <div className="text-neon-cyan text-sm mt-1">{profile.education10th.percentage}% • {profile.education10th.year}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* From Registration Form - 12th */}
                        {profile.education12th?.board && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base text-[var(--text-primary)]">12th Standard</h3>
                                        <div className="text-[var(--text-secondary)] text-sm">{profile.education12th.board}</div>
                                        <div className="text-neon-cyan text-sm mt-1">{profile.education12th.percentage}% • {profile.education12th.year}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* From Registration Form - Graduation */}
                        {profile.graduation?.degree && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base text-[var(--text-primary)]">{profile.graduation.degree}</h3>
                                        <div className="text-[var(--text-secondary)] text-sm">{profile.graduation.college}</div>
                                        <div className="text-neon-cyan text-sm mt-1">{profile.graduation.percentage}% • {profile.graduation.year}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* From Registration Form - Post Graduation */}
                        {profile.postGraduation?.degree && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base text-[var(--text-primary)]">{profile.postGraduation.degree}</h3>
                                        <div className="text-[var(--text-secondary)] text-sm">{profile.postGraduation.college}</div>
                                        <div className="text-neon-cyan text-sm mt-1">{profile.postGraduation.percentage}% • {profile.postGraduation.year}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* From Database - Additional Education */}
                        {education.map((edu, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (idx + 4) * 0.1 }}
                                className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base text-[var(--text-primary)]">{edu.degree}</h3>
                                        <div className="text-[var(--text-secondary)] text-sm">{edu.institution} • {edu.start_year} - {edu.end_year}</div>
                                        <div className="text-[var(--text-secondary)] text-sm mt-2">{edu.description}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Empty State */}
                        {!profile.education10th?.board && !profile.education12th?.board && !profile.graduation?.degree && education.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:col-span-3 p-12 text-center rounded-xl glass border border-white/10 border-dashed"
                            >
                                <GraduationCap className="mx-auto mb-4 text-gray-500" size={48} />
                                <h3 className="text-xl font-bold mb-2">No Education Information</h3>
                                <p className="text-gray-400 mb-4">Add your educational qualifications to complete your profile</p>
                                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold">
                                    Add Education
                                </button>
                            </motion.div>
                        )}
                    </>
                )}

                {activeTab === 'portfolio' && (
                    <>
                        {portfolio.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--glass-border)] hover:border-neon-cyan/50 transition-all cursor-pointer"
                            >
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-medium flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm text-sm">
                                        <Folder size={16} /> View Details
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                    <div className="text-white font-semibold text-sm">{item.title}</div>
                                    <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                                </div>
                            </motion.div>
                        ))}
                    </>
                )}

                {activeTab === 'assessment' && (
                    <>
                        {assessmentResults ? (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="lg:col-span-2 p-6 rounded-xl glass border border-white/10"
                                >
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Star className="text-neon-cyan" size={24} />
                                        Latest Assessment Results
                                    </h3>
                                    <div className="text-center mb-6">
                                        <div className="text-5xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                                            {assessmentResults.overallScore}%
                                        </div>
                                        <p className="text-gray-400 mt-2">Overall Score</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 rounded-lg bg-white/5">
                                            <div className="text-2xl font-bold text-blue-400">{assessmentResults.communication}%</div>
                                            <div className="text-xs text-gray-400 mt-1">Communication</div>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-white/5">
                                            <div className="text-2xl font-bold text-purple-400">{assessmentResults.knowledge}%</div>
                                            <div className="text-xs text-gray-400 mt-1">Knowledge</div>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-white/5">
                                            <div className="text-2xl font-bold text-pink-400">{assessmentResults.confidence}%</div>
                                            <div className="text-xs text-gray-400 mt-1">Confidence</div>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-6 rounded-xl glass border border-white/10"
                                >
                                    <h3 className="font-bold mb-3">Completed At</h3>
                                    <p className="text-gray-400">{new Date(assessmentResults.completedAt).toLocaleString()}</p>
                                    <Link
                                        to="/candidate/jobs"
                                        className="mt-4 inline-block px-4 py-2 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-colors"
                                    >
                                        Take Another Assessment
                                    </Link>
                                </motion.div>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:col-span-3 p-12 text-center rounded-xl glass border border-white/10 border-dashed"
                            >
                                <Star className="mx-auto mb-4 text-gray-500" size={48} />
                                <h3 className="text-xl font-bold mb-2">No Assessment Results</h3>
                                <p className="text-gray-400 mb-4">Complete a live video assessment to see your results here</p>
                                <Link
                                    to="/candidate/jobs"
                                    className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold"
                                >
                                    Browse Jobs & Apply
                                </Link>
                            </motion.div>
                        )}
                    </>
                )}

                {activeTab === 'achievements' && (
                    <>
                        {/* Badges Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)] lg:col-span-2"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Earned Badges</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {gamification.badges.map((badge: any) => (
                                    <div key={badge.id} className={`p-4 rounded-lg ${badge.bg} border border-[var(--glass-border)] flex flex-col items-center text-center gap-2 group relative cursor-help transition-transform hover:scale-105`}>
                                        <div className={`${badge.color}`}>
                                            {badge.icon}
                                        </div>
                                        <span className="text-xs font-medium text-[var(--text-primary)]">{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Performance</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-secondary)] text-sm">Skill Mastery</span>
                                    <span className="text-neon-cyan font-bold">{gamification.masteryScore}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-secondary)] text-sm">Accuracy</span>
                                    <span className="text-green-400 font-bold">{gamification.accuracy}%</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
