import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Target, Award, Zap, Shield, BarChart2, ChevronRight, Activity, Flame } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { endpoints } from '../../lib/api';

const GamificationDashboard: React.FC = () => {
    const [userStats, setUserStats] = useState({
        level: 'Bronze',
        points: 450,
        nextLevelPoints: 1000,
        globalRank: 1242,
        totalCandidates: 15420,
        skillMastery: 68,
        correctRate: 84,
        challengesCompleted: 12,
        totalAttempts: 18,
        streak: 3
    });
    const [improvementTrend, setImprovementTrend] = useState([
        { day: 'Mon', score: 65 }, { day: 'Tue', score: 68 },
        { day: 'Wed', score: 75 }, { day: 'Thu', score: 72 },
        { day: 'Fri', score: 80 }, { day: 'Sat', score: 85 },
        { day: 'Sun', score: 88 }
    ]);
    const [categoryPerformance, setCategoryPerformance] = useState([
        { name: 'Frontend', score: 92, color: 'var(--primary)' },
        { name: 'Backend', score: 75, color: '#4F46E5' },
        { name: 'Algorithms', score: 65, color: '#8B5CF6' }
    ]);
    const [badges, setBadges] = useState([
        { id: 1, name: 'First Milestone', icon: <Trophy size={18} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { id: 2, name: 'Fast Learner', icon: <Zap size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { id: 3, name: 'Secure Coder', icon: <Shield size={18} />, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('sb-token');
                if (!token) return;
                const response = await fetch(endpoints.gamification, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.stats) setUserStats(data.stats);
                }
            } catch (error) {
                console.warn("Using mock gamification data");
            }
        };
        fetchData();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Growth Analytics</h1>
                    <p className="text-[var(--text-muted)] font-medium">Your progress is monitored and ranked by AI hiring agents.</p>
                </div>
                <div className="flex items-center gap-3 saas-card px-4 py-2 border-[var(--primary)] bg-[var(--primary-light)]">
                    <Flame className="text-orange-500 animate-bounce" size={20} />
                    <div className="text-left">
                        <p className="text-[8px] font-black uppercase text-orange-600 leading-none">Day Streak</p>
                        <p className="text-sm font-black text-[var(--text-main)]">{userStats.streak} Days</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Global Rank', value: `#${userStats.globalRank}`, subtebt: `of ${userStats.totalCandidates.toLocaleString()}`, icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Skill Mastery', value: `${userStats.skillMastery}%`, subtebt: 'Overall score', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Points', value: userStats.points, subtebt: `${userStats.nextLevelPoints - userStats.points} till Silver`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Challenges', value: userStats.challengesCompleted, subtebt: `${userStats.correctRate}% accuracy`, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="saas-card p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-[var(--text-main)] italic leading-none mb-2">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-[var(--text-muted)]">{stat.subtebt}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="saas-card p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} className="text-[var(--primary)]" /> Performance Trend</h3>
                            <button className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--primary)] uppercase tracking-widest">Last 30 Days</button>
                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={improvementTrend}>
                                    <defs>
                                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                        cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#scoreColor)"
                                        dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="saas-card p-6">
                        <h3 className="font-bold mb-6">Subject Proficiency</h3>
                        <div className="space-y-6">
                            {categoryPerformance.map((cat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-[var(--text-main)]">{cat.name}</span>
                                        <span className="text-xs font-black text-[var(--primary)]">{cat.score}%</span>
                                    </div>
                                    <div className="h-2 bg-[var(--bg-page)] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.score}%` }}
                                            className="h-full bg-[var(--primary)] rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="saas-card p-6">
                        <h4 className="text-sm font-bold mb-6">Unlocked Badges</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {badges.map(badge => (
                                <div key={badge.id} className="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-[var(--primary)] transition-all flex flex-col items-center gap-3 text-center">
                                    <div className={`p-3 rounded-full ${badge.bg} ${badge.color}`}>
                                        {badge.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-[var(--text-main)]">{badge.name}</span>
                                </div>
                            ))}
                            <div className="p-4 rounded-2xl border border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center text-center opacity-40">
                                <div className="p-3 rounded-full bg-gray-100 text-gray-400">
                                    <Star size={18} />
                                </div>
                                <span className="text-[8px] font-black uppercase mt-2">Locked</span>
                            </div>
                        </div>
                    </div>

                    <div className="saas-card p-6 bg-gradient-to-br from-[var(--primary)] to-indigo-700 text-white border-0">
                        <Zap size={32} className="mb-4 text-amber-300" />
                        <h4 className="font-black italic text-lg leading-tight mb-2">Ready for a<br />New Challenge?</h4>
                        <p className="text-xs text-white/80 mb-6">Current AI trends show high demand for Go developers. Complete the Go assessment to gain 200 points.</p>
                        <button className="w-full py-3 bg-white text-[var(--primary)] rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                            Explore Labs
                        </button>
                    </div>

                    <div className="saas-card p-6">
                        <h4 className="text-sm font-bold mb-4">Milestone Progress</h4>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold">Silver Tier</span>
                                    <span className="text-[10px] font-bold">450 / 1000</span>
                                </div>
                                <div className="h-1 bg-white rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[45%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationDashboard;
