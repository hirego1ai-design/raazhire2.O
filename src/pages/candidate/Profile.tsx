import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap, Folder,
    Share2, Edit2, Camera, UserPlus, MessageSquare, Trophy, Star,
    Zap, Shield, Check, Github, Linkedin, Globe, Twitter, Code, Play, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SkillRadar, SkillCategories, SkillBar } from '../../components/SkillCharts';

const Profile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('about');
    const [isFollowing, setIsFollowing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connect' | 'pending' | 'connected'>('connect');

    // Mock Data
    const radarData = [
        { subject: 'Frontend', A: 90, fullMark: 100 },
        { subject: 'Backend', A: 85, fullMark: 100 },
        { subject: 'DevOps', A: 65, fullMark: 100 },
        { subject: 'Design', A: 70, fullMark: 100 },
        { subject: 'Soft Skills', A: 88, fullMark: 100 },
        { subject: 'Testing', A: 75, fullMark: 100 },
    ];

    const pieData = [
        { name: 'Technical', value: 60, color: '#00f3ff' },
        { name: 'Soft Skills', value: 25, color: '#bc13fe' },
        { name: 'Tools', value: 15, color: '#ff006e' },
    ];

    const techSkills = [
        { name: 'React', score: 95 },
        { name: 'Node.js', score: 88 },
        { name: 'TypeScript', score: 90 },
        { name: 'Python', score: 75 },
        { name: 'AWS', score: 70 },
    ];

    const softSkills = [
        { name: 'Communication', score: 92 },
        { name: 'Leadership', score: 85 },
        { name: 'Problem Solving', score: 95 },
        { name: 'Teamwork', score: 90 },
    ];

    const gamificationStats = {
        rank: 1250,
        totalCandidates: 98000,
        points: 2450,
        masteryScore: 850,
        accuracy: 92,
        badges: [
            { id: 1, icon: <Zap size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10', name: 'React Expert' },
            { id: 2, icon: <Shield size={14} />, color: 'text-green-400', bg: 'bg-green-400/10', name: 'Bug Hunter' },
            { id: 3, icon: <Trophy size={14} />, color: 'text-purple-400', bg: 'bg-purple-400/10', name: 'Top 10%' },
            { id: 4, icon: <Star size={14} />, color: 'text-blue-400', bg: 'bg-blue-400/10', name: 'Consistent' },
        ]
    };

    const tabs = [
        { id: 'about', label: 'About', icon: <User size={16} /> },
        { id: 'skills', label: 'Skills', icon: <Code size={16} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
        { id: 'portfolio', label: 'Portfolio', icon: <Folder size={16} /> },
        { id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> },
    ];

    const handleConnect = () => {
        if (connectionStatus === 'connect') setConnectionStatus('pending');
    };

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
                        <h1 className="text-3xl font-bold mb-1 text-[var(--text-primary)]">Alex Johnson</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-neon-cyan mb-3">
                            <Briefcase size={16} />
                            <span className="font-medium">Full Stack Developer</span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1"><MapPin size={14} /> San Francisco, CA</span>
                            <span className="flex items-center gap-1"><Mail size={14} /> alex.j@example.com</span>
                            <span className="flex items-center gap-1"><Phone size={14} /> +1 (555) 123-4567</span>
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
                                Passionate Full Stack Developer with 5+ years of experience building scalable web applications.
                                Expertise in React, Node.js, and Cloud Architecture. I love solving complex problems and optimizing performance.
                                Currently looking for opportunities to work on AI-driven projects.
                            </p>
                        </motion.div>

                        {/* Quick Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)]"
                        >
                            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)]">
                                    <div className="text-[var(--text-secondary)] text-xs">Experience</div>
                                    <div className="text-xl font-bold text-[var(--text-primary)]">5+ Years</div>
                                </div>
                                <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)]">
                                    <div className="text-[var(--text-secondary)] text-xs">Projects</div>
                                    <div className="text-xl font-bold text-[var(--text-primary)]">24</div>
                                </div>
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
                                    <span className="text-[var(--text-primary)] font-bold text-sm">#{gamificationStats.rank.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
                                    <span className="text-[var(--text-secondary)] text-xs">Total Points</span>
                                    <span className="text-neon-pink font-bold text-sm">{gamificationStats.points}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--text-secondary)] text-xs">Accuracy</span>
                                    <span className="text-green-400 font-bold text-sm">{gamificationStats.accuracy}%</span>
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
                            <SkillRadar data={radarData} />
                        </motion.div>

                        {/* Skill Categories Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <SkillCategories data={pieData} />
                        </motion.div>

                        {/* Technical Skills Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <SkillBar data={techSkills} title="Top Technical Skills" color="#ff006e" />
                        </motion.div>

                        {/* Soft Skills Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <SkillBar data={softSkills} title="Soft Skills" color="#bc13fe" />
                        </motion.div>
                    </>
                )}

                {activeTab === 'experience' && (
                    <>
                        {[
                            { role: 'Senior Frontend Engineer', company: 'TechCorp Inc.', period: '2022 - Present', desc: 'Leading the frontend team, migrating legacy codebase to React 18.' },
                            { role: 'Full Stack Developer', company: 'StartUp Flow', period: '2020 - 2022', desc: 'Built the MVP from scratch using MERN stack. Scaled to 100k users.' },
                            { role: 'Junior Developer', company: 'WebSolutions', period: '2018 - 2020', desc: 'Developed responsive websites and e-commerce platforms.' }
                        ].map((exp, idx) => (
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
                                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{exp.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </>
                )}

                {activeTab === 'education' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-xl glass border border-[var(--glass-border)] lg:col-span-2"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-neon-pink/10 text-neon-pink">
                                    <GraduationCap size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-[var(--text-primary)]">Master of Computer Science</h3>
                                    <div className="text-[var(--text-secondary)] text-sm">Stanford University • 2016 - 2018</div>
                                    <div className="text-[var(--text-secondary)] text-sm mt-2">Specialization: Artificial Intelligence & Machine Learning</div>
                                </div>
                            </div>
                        </motion.div>

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
                                    <h3 className="font-semibold text-base text-[var(--text-primary)]">B.S. Computer Engineering</h3>
                                    <div className="text-[var(--text-secondary)] text-sm">MIT • 2012 - 2016</div>
                                    <div className="text-[var(--text-secondary)] text-sm mt-2">GPA: 3.9/4.0</div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {activeTab === 'portfolio' && (
                    <>
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: item * 0.05 }}
                                className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--glass-border)] hover:border-neon-cyan/50 transition-all cursor-pointer"
                            >
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-medium flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm text-sm">
                                        <Folder size={16} /> View Details
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                    <div className="text-white font-semibold text-sm">AI Hiring Platform {item}</div>
                                    <div className="text-xs text-gray-400 mt-1">React • Node.js • AI</div>
                                </div>
                            </motion.div>
                        ))}
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
                                {gamificationStats.badges.map((badge) => (
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
                                    <span className="text-neon-cyan font-bold">{gamificationStats.masteryScore}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-secondary)] text-sm">Accuracy</span>
                                    <span className="text-green-400 font-bold">{gamificationStats.accuracy}%</span>
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
