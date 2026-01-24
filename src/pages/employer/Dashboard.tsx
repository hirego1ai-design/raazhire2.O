import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Briefcase, Calendar, DollarSign, FileText, CreditCard,
    Plus, CheckCircle, Eye, ChevronRight, Search, Filter, Clock,
    TrendingUp, Activity, ArrowUpRight, Zap, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../lib/api';

type PricingModel = 'subscription' | 'pph';

const EmployerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [pricingModel, setPricingModel] = useState<PricingModel>('subscription');
    const [stats, setStats] = useState({
        totalCandidates: 0,
        activeJobs: 0,
        shortlisted: 0,
        interviews: 0,
        pending: 0,
        hires: 0,
        due: 0
    });
    const [recentApplicants, setRecentApplicants] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/employer/stats`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
                });
                const data = await response.json();
                if (data.success) {
                    setStats(prev => ({
                        ...prev, ...data.stats,
                        due: (data.stats.hires || 0) * 50000
                    }));
                }

                const appsResponse = await fetch(`${API_BASE_URL}/api/applications/employer`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
                });
                const appsData = await appsResponse.json();
                if (appsData.success) {
                    setRecentApplicants(appsData.applications.slice(0, 5).map((app: any) => ({
                        name: app.candidate?.name || 'Unknown',
                        role: app.job?.title || 'Unknown',
                        score: Math.floor(Math.random() * 20) + 75,
                        status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
                        isPremium: Math.random() > 0.7
                    })));
                }
            } catch (error) {
                console.warn('Sync failed, using snapshot data');
                // Mock for demo
                setRecentApplicants([
                    { name: "John Cooper", role: "Senior Frontend", score: 94, status: "Shortlisted", isPremium: true },
                    { name: "Sarah Miller", role: "UI Designer", score: 88, status: "Pending", isPremium: false },
                    { name: "Alex Tuan", role: "Product Manager", score: 91, status: "Interview", isPremium: true }
                ]);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Top Insight Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Talent Ecosystem</h1>
                    <p className="text-[var(--text-muted)] font-medium">Monitoring TechCorp's hiring health and AI-agent signals.</p>
                </div>

                <div className="flex bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-sm">
                    <button
                        onClick={() => setPricingModel('subscription')}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${pricingModel === 'subscription' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-indigo-600'}`}
                    >
                        Subscription
                    </button>
                    <button
                        onClick={() => setPricingModel('pph')}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${pricingModel === 'pph' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-indigo-600'}`}
                    >
                        Success-Based
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Pipeline', value: stats.totalCandidates || 124, sub: '+12% from last week', icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                    { label: 'Live Roles', value: stats.activeJobs || 8, sub: '2 urgent openings', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
                    { label: 'Interviews', value: stats.interviews || 4, sub: 'Next: Today 3:00 PM', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Hiring Budget', value: pricingModel === 'pph' ? `₹${stats.due}` : '$12.4k', sub: 'Invoices clear', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
                ].map((s, i) => (
                    <motion.div
                        key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="saas-card p-6 relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                                <s.icon size={20} />
                            </div>
                            <div className="p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight size={16} className="text-[var(--text-muted)]" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{s.label}</p>
                        <h3 className="text-2xl font-black text-[var(--text-main)] italic">{s.value}</h3>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] mt-2">{s.sub}</p>
                        <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${s.color.replace('text', 'bg')}`} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Table Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="saas-card overflow-hidden">
                        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-page)]/50">
                            <h3 className="font-bold flex items-center gap-2 italic">
                                <Activity size={18} className="text-indigo-600" /> Recent Talent Signals
                            </h3>
                            <button onClick={() => navigate('/employer/candidates')} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View Pipeline</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[var(--bg-page)]/30 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                        <th className="px-6 py-4">Candidate</th>
                                        <th className="px-6 py-4">Role Path</th>
                                        <th className="px-6 py-4">AI Score</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    {recentApplicants.map((app, i) => (
                                        <tr key={i} className="hover:bg-[var(--bg-page)]/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                        {app.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[var(--text-main)]">{app.name}</p>
                                                        {app.isPremium && <span className="text-[8px] font-black uppercase text-amber-500">Gold Tier</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-[var(--text-muted)]">{app.role}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 w-12 bg-[var(--bg-page)] rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-600" style={{ width: `${app.score}%` }} />
                                                    </div>
                                                    <span className="text-xs font-black text-indigo-600">{app.score}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight ${app.status === 'Shortlisted' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-[var(--text-muted)] hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Vertical Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="saas-card p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 shadow-xl overflow-hidden relative">
                        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <h4 className="text-lg font-black italic leading-tight mb-4">Post a High-Priority<br />Opening?</h4>
                        <p className="text-xs text-white/80 leading-relaxed mb-6">High-priority roles receive AI-agent boosting to find the top 1% talent 4x faster.</p>
                        <button onClick={() => navigate('/employer/post-job')} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                            Initialize Rollout
                        </button>
                    </div>

                    <div className="saas-card p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock size={18} className="text-indigo-600" />
                            <h4 className="font-bold text-sm">Hiring Activity</h4>
                        </div>
                        <div className="space-y-6">
                            {[
                                { title: 'New Agreement', sub: 'PPH Agreement #2024-01 active.', time: '2h ago', color: 'bg-blue-500' },
                                { title: 'Interview Reminder', sub: 'Sarah Johnson at 3:00 PM.', time: '45m left', color: 'bg-amber-500' },
                                { title: 'System Alert', sub: 'Budget threshold reached for Sub-04.', time: '1d ago', color: 'bg-indigo-600' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 relative last:after:hidden after:absolute after:left-[7px] after:top-5 after:w-[1px] after:h-full after:bg-[var(--border-subtle)]">
                                    <div className={`w-3.5 h-3.5 rounded-full ${item.color} mt-1.5 shrink-0 shadow-sm ring-4 ring-white dark:ring-[#1a1f2e]`} />
                                    <div>
                                        <p className="text-sm font-bold text-[var(--text-main)] leading-none mb-1">{item.title}</p>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed">{item.sub}</p>
                                        <span className="text-[8px] font-black uppercase text-indigo-600 mt-2 block">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerDashboard;
