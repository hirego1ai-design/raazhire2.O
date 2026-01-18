import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award, Users, TrendingUp, CheckCircle, XCircle, Search,
    Clock, Star, Trophy, Target, Zap, Download, Eye, Filter,
    Calendar, BarChart2, BookOpen, Medal, Gift
} from 'lucide-react';
import AdminButton3D from '../../components/AdminButton3D';
import { endpoints } from '../../lib/api';
import { supabase } from '../../lib/supabase';

// Types
interface LearnerProgress {
    id: string;
    userId: string;
    userName: string;
    email: string;
    avatar: string;
    totalCoursesEnrolled: number;
    coursesCompleted: number;
    totalHoursLearned: number;
    currentStreak: number;
    badges: Badge[];
    certificates: Certificate[];
    level: number;
    xp: number;
    lastActive: string;
    joinDate: string;
}

interface Badge {
    id: string;
    name: string;
    icon: string;
    earnedAt?: string;
    description?: string;
    color?: string;
}

interface Certificate {
    id: string;
    courseName: string;
    issuedAt: string;
    grade: string;
}

interface GamificationSettings {
    xpPerLessonComplete: number;
    xpPerCourseComplete: number;
    xpPerBadgeEarned: number;
    streakBonusMultiplier: number;
    levelUpXpThreshold: number;
}

const UpskillLearnerProgress: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'learners' | 'certificates' | 'badges' | 'gamification'>('learners');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLearner, setSelectedLearner] = useState<LearnerProgress | null>(null);

    const [learners, setLearners] = useState<LearnerProgress[]>([]);
    const [gamificationSettings, setGamificationSettings] = useState<GamificationSettings>({
        xpPerLessonComplete: 50,
        xpPerCourseComplete: 500,
        xpPerBadgeEarned: 100,
        streakBonusMultiplier: 1.5,
        levelUpXpThreshold: 500
    });
    const [predefinedBadges, setPredefinedBadges] = useState<Badge[]>([]);

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            if (!supabase) {
                console.warn('Supabase not configured');
                return;
            }
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Fetch Learners
            const learnersRes = await fetch(endpoints.admin.upskill.learners, { headers });
            if (learnersRes.ok) {
                const data = await learnersRes.json();
                if (data.success) setLearners(data.learners);
            }

            // Fetch Gamification
            const gameRes = await fetch(endpoints.admin.upskill.gamification, { headers });
            if (gameRes.ok) {
                const data = await gameRes.json();
                if (data.success) setGamificationSettings(data.settings);
            }

            // Fetch Badges
            const badgesRes = await fetch(endpoints.admin.upskill.badges, { headers });
            if (badgesRes.ok) {
                const data = await badgesRes.json();
                if (data.success) setPredefinedBadges(data.badges);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const saveGamificationSettings = async () => {
        try {
            if (!supabase) {
                alert('Authentication not configured');
                return;
            }
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(endpoints.admin.upskill.gamification, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(gamificationSettings)
            });

            if (response.ok) {
                alert('Gamification settings saved successfully!');
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving gamification:', error);
            alert('Error saving settings');
        }
    };

    const filteredLearners = learners.filter(l =>
        l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const LearnerDetailModal = ({ learner, onClose }: { learner: LearnerProgress, onClose: () => void }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start sticky top-0 bg-[#0f111a] z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-2xl font-bold text-white">
                            {learner.userName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{learner.userName}</h2>
                            <p className="text-gray-400">{learner.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan text-xs font-bold">
                                    Level {learner.level}
                                </span>
                                <span className="text-xs text-gray-500">{learner.xp} XP</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="p-6 grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <div className="text-2xl font-bold text-white">{learner.coursesCompleted}/{learner.totalCoursesEnrolled}</div>
                        <div className="text-xs text-gray-500">Courses Completed</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <div className="text-2xl font-bold text-neon-cyan">{learner.totalHoursLearned}h</div>
                        <div className="text-xs text-gray-500">Hours Learned</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <div className="text-2xl font-bold text-orange-400">{learner.currentStreak} 🔥</div>
                        <div className="text-xs text-gray-500">Day Streak</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <div className="text-2xl font-bold text-purple-400">{learner.badges.length}</div>
                        <div className="text-xs text-gray-500">Badges Earned</div>
                    </div>
                </div>

                {/* Certificates & Badges */}
                <div className="p-6 grid grid-cols-2 gap-6">
                    {/* Certificates */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <Award className="text-yellow-400" size={20} />
                            Certificates ({learner.certificates.length})
                        </h3>
                        <div className="space-y-3">
                            {learner.certificates.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No certificates yet</p>
                            ) : (
                                learner.certificates.map(cert => (
                                    <div key={cert.id} className="p-3 rounded-lg bg-black/20 flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-white">{cert.courseName}</div>
                                            <div className="text-xs text-gray-500">{cert.issuedAt}</div>
                                        </div>
                                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-sm font-bold">
                                            Grade: {cert.grade}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <Medal className="text-neon-purple" size={20} />
                            Badges ({learner.badges.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {learner.badges.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No badges yet</p>
                            ) : (
                                learner.badges.map(badge => (
                                    <div key={badge.id} className="px-3 py-2 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-white/10 text-sm">
                                        <span className="text-white font-medium">{badge.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* XP Progress */}
                <div className="p-6">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Level Progress</span>
                            <span className="text-sm text-neon-cyan font-bold">
                                {learner.xp % gamificationSettings.levelUpXpThreshold}/{gamificationSettings.levelUpXpThreshold} XP to next level
                            </span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all"
                                style={{ width: `${(learner.xp % gamificationSettings.levelUpXpThreshold) / gamificationSettings.levelUpXpThreshold * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Upskill Learner Progress
                    </h1>
                    <p className="text-gray-400">Track learner achievements, certificates, and gamification</p>
                </div>
                <div className="flex gap-3">
                    <AdminButton3D
                        variant="outline"
                        size="sm"
                        icon={<Download size={14} />}
                    >
                        Export Report
                    </AdminButton3D>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1 overflow-x-auto">
                {[
                    { id: 'learners', label: 'Learners', icon: Users },
                    { id: 'certificates', label: 'Certificates', icon: Award },
                    { id: 'badges', label: 'Badges', icon: Medal },
                    { id: 'gamification', label: 'Gamification', icon: Trophy }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab.id ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon size={16} className="inline-block mr-2 mb-0.5" />
                        {tab.label}
                        {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Learners Tab */}
                {activeTab === 'learners' && (
                    <motion.div
                        key="learners"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Active Learners', value: learners.length, icon: Users, color: 'text-neon-cyan' },
                                { label: 'Total Certificates', value: learners.reduce((acc, l) => acc + l.certificates.length, 0), icon: Award, color: 'text-yellow-400' },
                                { label: 'Total Badges Earned', value: learners.reduce((acc, l) => acc + l.badges.length, 0), icon: Medal, color: 'text-purple-400' },
                                { label: 'Avg. Hours Learned', value: Math.round(learners.reduce((acc, l) => acc + l.totalHoursLearned, 0) / learners.length), icon: Clock, color: 'text-green-400' }
                            ].map((stat, idx) => (
                                <div key={idx} className="p-6 rounded-xl glass border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <stat.icon className={stat.color} size={24} />
                                        <span className="text-3xl font-bold text-white">{stat.value}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search learners..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-white/20 transition-colors"
                            />
                        </div>

                        {/* Learners Table */}
                        <div className="rounded-xl glass border border-white/10 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="p-4">Learner</th>
                                        <th className="p-4">Level</th>
                                        <th className="p-4">Courses</th>
                                        <th className="p-4">Hours</th>
                                        <th className="p-4">Streak</th>
                                        <th className="p-4">Badges</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLearners.map(learner => (
                                        <tr key={learner.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center font-bold text-white">
                                                        {learner.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{learner.userName}</div>
                                                        <div className="text-xs text-gray-500">{learner.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded bg-neon-cyan/20 text-neon-cyan text-sm font-bold">
                                                    Lvl {learner.level}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                {learner.coursesCompleted}/{learner.totalCoursesEnrolled}
                                            </td>
                                            <td className="p-4 text-gray-300">{learner.totalHoursLearned}h</td>
                                            <td className="p-4">
                                                <span className="text-orange-400 font-bold">{learner.currentStreak} 🔥</span>
                                            </td>
                                            <td className="p-4 text-gray-300">{learner.badges.length}</td>
                                            <td className="p-4 text-right">
                                                <AdminButton3D
                                                    onClick={() => setSelectedLearner(learner)}
                                                    variant="info"
                                                    size="sm"
                                                    icon={<Eye size={14} />}
                                                >
                                                    View
                                                </AdminButton3D>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                    <motion.div
                        key="badges"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-end">
                            <AdminButton3D
                                variant="primary"
                                size="md"
                                icon={<Gift size={18} />}
                            >
                                Create New Badge
                            </AdminButton3D>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {predefinedBadges.map(badge => (
                                <div key={badge.id} className="p-6 rounded-xl glass border border-white/10 hover:border-neon-cyan/30 transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`p-4 rounded-xl bg-white/5 ${badge.color || 'text-neon-cyan'}`}>
                                            <Award size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{badge.name}</h3>
                                            <p className="text-sm text-gray-400">{badge.description || 'Badge achievement'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Awarded to <span className="text-neon-cyan font-bold">{Math.floor(Math.random() * 100)}</span> learners</span>
                                        <button className="text-neon-cyan hover:underline">Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Gamification Tab */}
                {activeTab === 'gamification' && (
                    <motion.div
                        key="gamification"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="p-6 rounded-xl glass border border-white/10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Trophy className="text-yellow-400" size={24} />
                                XP & Level Settings
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">XP Per Lesson Complete</label>
                                    <input
                                        type="number"
                                        value={gamificationSettings.xpPerLessonComplete}
                                        onChange={(e) => setGamificationSettings({ ...gamificationSettings, xpPerLessonComplete: parseInt(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">XP Per Course Complete</label>
                                    <input
                                        type="number"
                                        value={gamificationSettings.xpPerCourseComplete}
                                        onChange={(e) => setGamificationSettings({ ...gamificationSettings, xpPerCourseComplete: parseInt(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">XP Per Badge Earned</label>
                                    <input
                                        type="number"
                                        value={gamificationSettings.xpPerBadgeEarned}
                                        onChange={(e) => setGamificationSettings({ ...gamificationSettings, xpPerBadgeEarned: parseInt(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Level Up XP Threshold</label>
                                    <input
                                        type="number"
                                        value={gamificationSettings.levelUpXpThreshold}
                                        onChange={(e) => setGamificationSettings({ ...gamificationSettings, levelUpXpThreshold: parseInt(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Streak Bonus Multiplier</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={gamificationSettings.streakBonusMultiplier}
                                        onChange={(e) => setGamificationSettings({ ...gamificationSettings, streakBonusMultiplier: parseFloat(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <AdminButton3D
                                    variant="success"
                                    size="md"
                                    icon={<CheckCircle size={18} />}
                                    onClick={saveGamificationSettings}
                                >
                                    Save Gamification Settings
                                </AdminButton3D>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Certificates Tab */}
                {activeTab === 'certificates' && (
                    <motion.div
                        key="certificates"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="p-6 rounded-xl glass border border-white/10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Award className="text-yellow-400" size={24} />
                                Certificate Settings
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div>
                                        <div className="font-medium text-white">Auto-Issue Certificates</div>
                                        <div className="text-sm text-gray-400">Automatically issue certificates when a course is completed</div>
                                    </div>
                                    <button className="relative w-12 h-6 rounded-full bg-neon-cyan transition-colors">
                                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white translate-x-0" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div>
                                        <div className="font-medium text-white">Require Minimum Score</div>
                                        <div className="text-sm text-gray-400">Only issue certificates if learner passes with minimum score</div>
                                    </div>
                                    <input
                                        type="number"
                                        defaultValue={60}
                                        className="w-20 bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-center"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div>
                                        <div className="font-medium text-white">Include Grade on Certificate</div>
                                        <div className="text-sm text-gray-400">Display learner's grade on the certificate</div>
                                    </div>
                                    <button className="relative w-12 h-6 rounded-full bg-neon-cyan transition-colors">
                                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white translate-x-0" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div className="flex items-start gap-3">
                                    <Award className="text-yellow-400 shrink-0" size={20} />
                                    <div className="text-sm text-yellow-200/80">
                                        <p className="font-bold mb-1">Certificate Template</p>
                                        <p>Upload a custom certificate template from the design settings to personalize certificates.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Learner Detail Modal */}
            <AnimatePresence>
                {selectedLearner && (
                    <LearnerDetailModal learner={selectedLearner} onClose={() => setSelectedLearner(null)} />
                )}
            </AnimatePresence>
        </div >
    );
};

export default UpskillLearnerProgress;
