import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Send,
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    UserPlus,
    Briefcase,
    TrendingUp,
    MapPin,
    Plus,
    Smile,
    Link as LinkIcon,
    Info,
    Rocket,
    Building2,
    CheckCircle2,
    User,
    Search,
    ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

interface FeedItem {
    id: string | number;
    type: 'job' | 'application' | 'alert';
    title: string;
    subtitle: string;
    content: string;
    timestamp: string;
    tags?: string[];
    actionLabel?: string;
    actionLink?: string;
}

const UniversalDashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isEmployer = location.pathname.startsWith('/employer');
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('sb-token');
                const userStr = localStorage.getItem('sb-user');
                const user = userStr ? JSON.parse(userStr) : null;

                if (user) {
                    setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
                    setUserRole(isEmployer ? 'Recruiter' : 'Candidate'); // refine if role is in metadata
                }

                if (!token) return;

                let items: FeedItem[] = [];

                if (isEmployer) {
                    // Fetch recent applications or candidates
                    // For now, let's fetch Jobs as "Your Active Jobs"
                    const res = await fetch(`${API_BASE_URL}/api/employer/jobs`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const jobs = data.jobs || [];
                        items = jobs.slice(0, 5).map((job: any) => ({
                            id: job.id,
                            type: 'job',
                            title: job.title,
                            subtitle: `${job.applicant_count || 0} Applicants • ${job.location}`,
                            content: `Active job post. Expires on ${new Date(job.expires_at).toLocaleDateString()}.`,
                            timestamp: new Date(job.created_at).toLocaleDateString(),
                            tags: [job.employment_type, job.work_mode],
                            actionLabel: 'Manage Candidates',
                            actionLink: `/employer/candidates?jobId=${job.id}`
                        }));
                    }
                } else {
                    // Fetch recent jobs for candidates
                    const res = await fetch(`${API_BASE_URL}/api/jobs?limit=5`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const jobs = data.jobs || [];
                        items = jobs.map((job: any) => ({
                            id: job.id,
                            type: 'job',
                            title: job.employer?.name || 'Top Company',
                            subtitle: job.title,
                            content: `${job.description?.substring(0, 120)}...`,
                            timestamp: new Date(job.created_at).toLocaleDateString(),
                            tags: [job.location, job.salary_min ? `$${job.salary_min}k+` : 'Competitive'],
                            actionLabel: 'View Job',
                            actionLink: `/jobs/${job.id}`
                        }));
                    }
                }

                setFeedItems(items);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isEmployer]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">

            {/* Left Column: Profile & Stats */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                <div className="saas-card overflow-hidden">
                    <div className={`h-20 bg-gradient-to-br ${isEmployer ? 'from-emerald-500 to-teal-600' : 'from-indigo-500 to-purple-600'}`} />
                    <div className="px-6 pb-6 -mt-10 text-center">
                        <div className={`w-20 h-20 rounded-2xl ${isEmployer ? 'bg-emerald-600' : 'bg-indigo-600'} flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg border-4 border-[var(--bg-surface)]`}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-lg font-bold">{userName}</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-4">{userRole}</p>

                        <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border-subtle)]">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[var(--text-muted)]">Profile Completion</span>
                                <span className={`font-bold ${isEmployer ? 'text-emerald-500' : 'text-indigo-600'}`}>75%</span>
                            </div>
                            <div className="w-full bg-[var(--bg-page)] h-1.5 rounded-full overflow-hidden">
                                <div className={`${isEmployer ? 'bg-emerald-500' : 'bg-indigo-600'} h-full w-[75%]`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="saas-card p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Quick Stats</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isEmployer ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600'}`}>
                                {isEmployer ? <Building2 size={16} /> : <Briefcase size={16} />}
                            </div>
                            <div>
                                <div className="text-sm font-bold">--</div>
                                <div className="text-[10px] text-[var(--text-muted)]">{isEmployer ? "Active Roles" : "Applications"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Column: Feed / Activity */}
            <div className="lg:col-span-6 space-y-6">
                {/* Action Bar */}
                <div className="saas-card p-6">
                    <div className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-lg ${isEmployer ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center`}>
                            {isEmployer ? <Plus size={20} /> : <Search size={20} />}
                        </div>
                        <div className="flex-1">
                            {isEmployer ? (
                                <button onClick={() => navigate('/employer/post-job')} className="w-full text-left bg-transparent text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                                    Post a new job opportunity...
                                </button>
                            ) : (
                                <button onClick={() => navigate('/jobs')} className="w-full text-left bg-transparent text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                                    Search for your next dream job...
                                </button>
                            )}
                        </div>
                        <button className="btn-saas-primary text-xs px-4" onClick={() => navigate(isEmployer ? '/employer/post-job' : '/jobs')}>
                            {isEmployer ? 'Post Job' : 'Find Jobs'}
                        </button>
                    </div>
                </div>

                {/* Feed Items */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-[var(--text-main)] px-2">
                        {isEmployer ? 'Your Recent Job Posts' : 'Recommended Jobs'}
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : feedItems.length > 0 ? (
                        <AnimatePresence>
                            {feedItems.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="saas-card p-6 group hover:border-indigo-500/30 transition-all cursor-pointer"
                                    onClick={() => item.actionLink && navigate(item.actionLink)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${isEmployer ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {item.title.charAt(0)}
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold leading-tight text-[var(--text-main)]">{item.title}</h5>
                                                <p className="text-[10px] text-[var(--text-muted)] font-medium">{item.subtitle}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] bg-[var(--bg-page)] px-2 py-1 rounded text-[var(--text-muted)] font-bold">
                                            {item.timestamp}
                                        </span>
                                    </div>

                                    <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed line-clamp-2">
                                        {item.content}
                                    </p>

                                    {item.tags && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {item.tags.map((tag, i) => (
                                                <span key={i} className="text-[10px] px-2 py-1 bg-[var(--bg-page)] rounded text-[var(--text-muted)] font-bold uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center text-xs font-black uppercase tracking-widest text-indigo-600 group-hover:underline">
                                        {item.actionLabel} <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="saas-card p-10 text-center">
                            <Rocket size={40} className="mx-auto text-[var(--text-muted)] opacity-20 mb-4" />
                            <h4 className="font-bold text-[var(--text-main)]">No activity yet</h4>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                {isEmployer ? 'Post a job to start finding talent.' : 'Explore jobs to find your next opportunity.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Info */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                <div className="saas-card p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/30">
                    <div className="flex items-center gap-2 text-[var(--primary)] mb-4">
                        <Info size={18} />
                        <h4 className="font-bold text-sm">{isEmployer ? "Success-Based Hiring" : "Pay-Per-Hire (PPH)"}</h4>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                        {isEmployer
                            ? "Only pay when you settle on a candidate. Our Success-Based model ensures your budget is linked directly to your hiring ROI."
                            : "Look for the PPH badge! Employers pay our platform directly for successful hires. It's always free for talented candidates like you."}
                    </p>
                    <button className="text-[var(--primary)] text-xs font-bold hover:underline flex items-center gap-1">
                        Learn more <Plus size={12} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default UniversalDashboard;
