import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Target, Award, Zap, Shield, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { endpoints } from '../../lib/api';

const GamificationDashboard: React.FC = () => {
    const [userStats, setUserStats] = useState({
        level: 'Bronze',
        points: 0,
        nextLevelPoints: 1000,
        globalRank: 0,
        totalCandidates: 0,
        skillMastery: 0,
        correctRate: 0,
        challengesCompleted: 0,
        totalAttempts: 0,
        streak: 0
    });
    const [improvementTrend, setImprovementTrend] = useState<any[]>([]);
    const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [suggestedChallenges, setSuggestedChallenges] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('sb-token');
                if (!token) return;

                const response = await fetch(endpoints.gamification, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch gamification data');
                const data = await response.json();
                const { stats, badges, challenges, history } = data;

                if (stats) {
                    setUserStats({
                        level: stats.level || 'Bronze',
                        points: stats.points || 0,
                        nextLevelPoints: stats.next_level_points || 1000,
                        globalRank: stats.global_rank || 0,
                        totalCandidates: stats.total_candidates || 0,
                        skillMastery: stats.skill_mastery || 0,
                        correctRate: stats.correct_rate || 0,
                        challengesCompleted: stats.challenges_completed || 0,
                        totalAttempts: stats.total_attempts || 0,
                        streak: stats.streak || 0
                    });
                }

                if (history && history.length > 0) {
                    setImprovementTrend(history.map((h: any) => ({
                        day: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
                        score: h.score
                    })));
                }

                // If history is empty, maybe create a mock trend for visualization
                if (!history || history.length === 0) {
                    setImprovementTrend([
                        { day: 'Mon', score: 65 }, { day: 'Tue', score: 68 },
                        { day: 'Wed', score: 75 }, { day: 'Thu', score: 72 },
                        { day: 'Fri', score: 80 }, { day: 'Sat', score: 85 },
                        { day: 'Sun', score: 88 }
                    ]);
                }

                if (badges) {
                    setBadges(badges.map((ub: any) => ({
                        id: ub.badge?.id,
                        icon: <Trophy size={20} />,
                        color: ub.badge?.color || 'text-yellow-400',
                        bg: 'bg-yellow-400/10',
                        name: ub.badge?.name || 'Badge'
                    })));
                }

                if (challenges) {
                    setSuggestedChallenges(challenges.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        category: c.category,
                        points: c.points,
                        difficulty: c.difficulty
                    })));
                }

                // Fetch Skills specifically for the category performance
                // Can still use supabase directly for this if not in the main endpoint, 
                // or assume we add it to the endpoint. The endpoint we made didn't include skills.
                if (supabase) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { data: skills } = await supabase.from('candidate_skills').select('*').eq('user_id', user.id);
                        if (skills) {
                            setCategoryPerformance(skills.map((s: any) => ({
                                name: s.skill,
                                score: s.score || 0, // Field is 'score' in schema, was 'mastery_level' in prev code
                                color: '#00f3ff'
                            })));
                        }
                    }
                }

            } catch (error) {
                console.error("Error fetching gamification data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">My Progress</h1>
                    <p className="text-[var(--text-secondary)]">Track your skill growth and achievements.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center gap-2">
                        <Trophy className="text-amber-400" size={20} />
                        <span className="font-bold text-amber-400">{userStats.level} Level</span>
                    </div>
                </div>
            </motion.div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 border-[var(--glass-border)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[var(--text-secondary)] text-sm">Global Rank</p>
                            <h3 className="text-2xl font-bold text-neon-purple">#{userStats.globalRank.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 rounded-lg bg-neon-purple/10 text-neon-purple">
                            <Award size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">Out of {userStats.totalCandidates.toLocaleString()} candidates worldwide.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 border-[var(--glass-border)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[var(--text-secondary)] text-sm">Skill Mastery</p>
                            <h3 className="text-3xl font-bold text-neon-cyan">{userStats.skillMastery}%</h3>
                        </div>
                        <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                            <Target size={24} />
                        </div>
                    </div>
                    <div className="w-full bg-[var(--card-bg)] rounded-full h-1.5">
                        <div className="bg-neon-cyan h-1.5 rounded-full" style={{ width: `${userStats.skillMastery}%` }}></div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 border-[var(--glass-border)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[var(--text-secondary)] text-sm">Total Points</p>
                            <h3 className="text-3xl font-bold text-neon-pink">{userStats.points}</h3>
                        </div>
                        <div className="p-2 rounded-lg bg-neon-pink/10 text-neon-pink">
                            <Star size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{userStats.nextLevelPoints - userStats.points} points to next level</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 border-[var(--glass-border)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[var(--text-secondary)] text-sm">Challenges</p>
                            <h3 className="text-3xl font-bold text-green-400">{userStats.challengesCompleted}</h3>
                        </div>
                        <div className="p-2 rounded-lg bg-green-400/10 text-green-400">
                            <BarChart2 size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{userStats.totalAttempts} Total Attempts ({userStats.correctRate}% Accuracy)</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Improvement Trend */}
                    <div className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 border-[var(--glass-border)]">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
                            <TrendingUp className="text-neon-cyan" size={20} />
                            Skill Improvement Trend (Last 7 Days)
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={improvementTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                    <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                                        cursor={{ stroke: 'var(--glass-border)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#00f3ff"
                                        strokeWidth={3}
                                        dot={{ fill: '#00f3ff', strokeWidth: 2 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Performance */}
                    <div className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 border-[var(--glass-border)]">
                        <h3 className="text-lg font-semibold mb-6 text-[var(--text-primary)]">Category Performance</h3>
                        <div className="space-y-4">
                            {categoryPerformance.map((cat, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--text-primary)] font-medium">{cat.name}</span>
                                        <span className="text-[var(--text-secondary)]">{cat.score}% Mastery</span>
                                    </div>
                                    <div className="h-2 bg-[var(--card-bg)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    {/* Badges */}
                    <div className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 border-[var(--glass-border)]">
                        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Earned Badges</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {badges.map((badge) => (
                                <div key={badge.id} className={`p-3 rounded-lg border border-[var(--glass-border)] flex flex-col items-center text-center gap-2 ${badge.bg}`}>
                                    <div className={`${badge.color}`}>
                                        {badge.icon}
                                    </div>
                                    <span className="text-xs font-medium text-[var(--text-primary)]">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggested Challenges */}
                    <div className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 border-[var(--glass-border)]">
                        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Recommended for You</h3>
                        <div className="space-y-4">
                            {suggestedChallenges.map((challenge) => (
                                <div key={challenge.id} className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-neon-cyan/10 text-neon-cyan">
                                            {challenge.category}
                                        </span>
                                        <span className="text-xs text-[var(--text-secondary)]">+{challenge.points} pts</span>
                                    </div>
                                    <h4 className="font-medium text-[var(--text-primary)] mb-1 group-hover:text-neon-cyan transition-colors">{challenge.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                        <span className={`w-2 h-2 rounded-full ${challenge.difficulty === 'Hard' ? 'bg-red-400' : 'bg-yellow-400'
                                            }`} />
                                        {challenge.difficulty}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-3d btn-ghost w-full mt-4">
                            View All Challenges
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GamificationDashboard;
