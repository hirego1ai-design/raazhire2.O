// Employer Dashboard - Premium Dark Theme
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Calendar, DollarSign, FileText, CreditCard, Plus, CheckCircle, Eye, ChevronRight, Search, Filter, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { API_BASE_URL } from '../../lib/api';
import '../../styles/premium-dark-theme.css';

type PricingModel = 'subscription' | 'pph';

interface StatCard {
    label: string;
    value: string;
    icon: any;
    color: string;
    onClick?: () => void;
}

import { supabase } from '../../lib/supabase';
import { mockJobPosts, mockApplications, mockCandidates, getCandidatesForJob, getJobsForEmployer } from '../../data/mockData';

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

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats from backend
                const response = await fetch(`${API_BASE_URL}/api/employer/stats`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
                    }
                });
                const data = await response.json();

                if (data.success) {
                    setStats(prev => ({
                        ...prev,
                        ...data.stats,
                        due: (data.stats.hires || 0) * 50000
                    }));
                }

                // Fetch recent applications/candidates
                const appsResponse = await fetch(`${API_BASE_URL}/api/applications/employer`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
                    }
                });
                const appsData = await appsResponse.json();
                if (appsData.success) {
                    setRecentApplicants(appsData.applications.slice(0, 5).map((app: any) => ({
                        name: app.candidate?.name || 'Unknown',
                        role: app.job?.title || 'Unknown',
                        score: Math.floor(Math.random() * 20) + 75, // Placeholder score
                        status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
                        date: new Date(app.created_at).toLocaleDateString(),
                        isPremium: Math.random() > 0.7
                    })));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    // Navigation handlers
    const handleTotalCandidatesClick = () => navigate('/employer/candidates');
    const handleShortlistedClick = () => navigate('/employer/candidates?filter=shortlisted');
    const handleRejectedClick = () => navigate('/employer/candidates?filter=rejected');
    const handlePendingClick = () => navigate('/employer/candidates?filter=pending');
    const handleInterviewsClick = () => navigate('/employer/interviews');
    const handleMakeAgreementClick = () => navigate('/employer/make-agreement');
    const handlePostPPHJobClick = () => navigate('/employer/post-job?model=pph');
    const handlePostSubscriptionJobClick = () => navigate('/employer/post-job?model=subscription');
    const handleMyJobsClick = () => navigate('/employer/jobs');

    const subscriptionStats: StatCard[] = [
        { label: 'Total Candidates', value: stats.totalCandidates.toString(), icon: Users, color: 'text-neon-purple', onClick: handleTotalCandidatesClick },
        { label: 'Active Jobs', value: stats.activeJobs.toString(), icon: Briefcase, color: 'text-neon-cyan' },
        { label: 'Shortlisted', value: stats.shortlisted.toString(), icon: CheckCircle, color: 'text-green-400', onClick: handleShortlistedClick },
        { label: 'Interviews', value: stats.interviews.toString(), icon: Calendar, color: 'text-yellow-400', onClick: handleInterviewsClick },
        { label: 'Pending', value: stats.pending.toString(), icon: Clock, color: 'text-orange-400', onClick: handlePendingClick },
    ];

    const pphStats: StatCard[] = [
        { label: 'Hires', value: stats.hires.toString(), icon: CheckCircle, color: 'text-green-400' },
        { label: 'Due', value: `₹${stats.due}`, icon: DollarSign, color: 'text-yellow-400' },
        { label: 'Shortlisted', value: stats.shortlisted.toString(), icon: Users, color: 'text-neon-purple', onClick: handleShortlistedClick },
        { label: 'Pending', value: stats.pending.toString(), icon: Clock, color: 'text-orange-400', onClick: handlePendingClick },
        { label: 'HIA', value: '0', icon: FileText, color: 'text-blue-400' }, // Placeholder
    ];

    return (
        <div className="space-y-6 pb-20 bg-black/90 p-6 rounded-2xl glass">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-xs text-gray-400">Welcome back, TechCorp Inc.</p>
                </div>
                {/* Pricing Toggle */}
                <div className="bg-black/40 p-1.5 rounded-full flex items-center border border-white/10 shadow-inner">
                    <button
                        onClick={() => setPricingModel('subscription')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${pricingModel === 'subscription'
                            ? 'bg-gradient-to-r from-neon-cyan to-blue-500 text-white shadow-[0_4px_15px_rgba(6,182,212,0.4)] transform scale-105'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Briefcase size={16} /> Subscription
                    </button>
                    <button
                        onClick={() => setPricingModel('pph')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${pricingModel === 'pph'
                            ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-[0_4px_15px_rgba(34,197,94,0.4)] transform scale-105'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <DollarSign size={16} /> Pay-Per-Hire
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
                {pricingModel === 'pph' ? (
                    <>
                        <Button onClick={handleMyJobsClick} variant="info" size="md" icon={<Briefcase size={18} />}>My Jobs</Button>
                        <Button onClick={handleMakeAgreementClick} variant="purple" size="md" icon={<FileText size={18} />}>New Agreement</Button>
                        <Button variant="ghost" size="md" icon={<Eye size={18} />}>Status</Button>
                        <Button variant="warning" size="md" icon={<CreditCard size={18} />}>Pay Due</Button>
                        <Button onClick={handlePostPPHJobClick} variant="success" size="md" icon={<Plus size={18} />} className="ml-auto">Post PPH Job</Button>
                    </>
                ) : (
                    <>
                        <Button onClick={handleMyJobsClick} variant="info" size="md" icon={<Briefcase size={18} />}>My Jobs</Button>
                        <Button variant="ghost" size="md" icon={<Plus size={18} />}>Buy Credits</Button>
                        <Button onClick={handlePostSubscriptionJobClick} variant="info" size="md" icon={<Plus size={18} />} className="ml-auto">Post Job</Button>
                    </>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {(pricingModel === 'subscription' ? subscriptionStats : pphStats).map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={stat.onClick}
                        className={`p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden ${stat.onClick ? 'hover:-translate-y-1' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</span>
                            <stat.icon size={16} className={`${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white leading-none">{stat.value}</span>
                        </div>
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color.replace('text-', 'from-')}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Applicants */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users size={18} className="text-neon-cyan" /> Recent Applicants</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="text" placeholder="Search..." className="pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:border-neon-cyan outline-none w-40" />
                            </div>
                            <button className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white"><Filter size={14} /></button>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4 font-medium">Candidate</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Score</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentApplicants.map((app, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{app.name}</div>
                                            {app.isPremium && <span className="text-[10px] text-yellow-400">★ Premium</span>}
                                        </td>
                                        <td className="p-4 text-gray-300">{app.role}</td>
                                        <td className="p-4"><span className={`font-bold ${app.score >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>{app.score}%</span></td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] border ${app.status === 'Shortlisted' ? 'border-green-500/30 text-green-400 bg-green-500/10' : app.status === 'Interview' ? 'border-neon-purple/30 text-neon-purple bg-neon-purple/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'}`}>{app.status}</span>
                                        </td>
                                        <td className="p-4 text-right"><button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><ChevronRight size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-3 border-t border-white/10 text-center">
                            <button onClick={() => navigate('/employer/candidates')} className="text-xs text-gray-400 hover:text-white transition-colors">View All Candidates</button>
                        </div>
                    </div>
                </div>
                {/* Side Panel */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Clock size={18} className="text-orange-400" /> Activity & Alerts</h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-1"><FileText size={14} /></div>
                            <div>
                                <h4 className="text-sm font-bold text-white">New Agreement Signed</h4>
                                <p className="text-xs text-gray-400 mt-0.5">PPH Agreement #2024-01 active.</p>
                                <span className="text-[10px] text-gray-500">2 hours ago</span>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 mt-1"><DollarSign size={14} /></div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Payment Pending</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Invoice #INV-002 is due.</p>
                                <button className="mt-2 text-[10px] font-bold text-black bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-300 transition-colors">Pay Now</button>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-lg bg-neon-purple/10 text-neon-purple mt-1"><Calendar size={14} /></div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Interview Reminder</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Sarah Johnson at 3:00 PM.</p>
                                <span className="text-[10px] text-gray-500">In 45 mins</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerDashboard;
