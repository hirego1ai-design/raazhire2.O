import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Briefcase, Cpu, DollarSign, Wallet, TrendingUp,
    RefreshCw, Download, Settings, CreditCard, Award, Star,
    Zap, Clock, Gift, CheckCircle, BarChart3, Package,
    ShieldCheck, AlertTriangle
} from 'lucide-react';
import '../../styles/premium-dark-theme.css';
import AdminButton3D from '../../components/AdminButton3D';
import { supabase } from '../../lib/supabase';

// ==================== CONSTANTS ====================

const PLAN_INFO: Record<string, { name: string; price: string; priceValue: number; color: string; icon: any; gradient: string; duration: string }> = {
    'free': { name: 'Free Plan', price: '₹0', priceValue: 0, color: 'text-gray-400', icon: Gift, gradient: 'from-gray-500/20 to-gray-400/10', duration: '24 Hours' },
    '1day': { name: '1 Day Plan', price: '₹499', priceValue: 499, color: 'text-blue-400', icon: Clock, gradient: 'from-blue-500/20 to-blue-400/10', duration: '24 Hours' },
    '3day': { name: '3 Days Plan', price: '₹999', priceValue: 999, color: 'text-purple-400', icon: Zap, gradient: 'from-purple-500/20 to-purple-400/10', duration: '3 Days' },
    '7day': { name: '7 Days Plan', price: '₹1,599', priceValue: 1599, color: 'text-emerald-400', icon: Star, gradient: 'from-emerald-500/20 to-emerald-400/10', duration: '7 Days' },
    '15day': { name: '15 Days Plan', price: '₹2,499', priceValue: 2499, color: 'text-amber-400', icon: TrendingUp, gradient: 'from-amber-500/20 to-amber-400/10', duration: '15 Days' },
    'pay-per-hire': { name: 'Pay-Per-Hire', price: 'Variable', priceValue: 0, color: 'text-indigo-400', icon: Award, gradient: 'from-indigo-500/20 to-indigo-400/10', duration: 'Until Hired' },
    'custom': { name: 'Custom Plan', price: 'Custom', priceValue: 0, color: 'text-pink-400', icon: Settings, gradient: 'from-pink-500/20 to-pink-400/10', duration: 'Custom' },
    'basic': { name: 'Basic Plan', price: '₹0', priceValue: 0, color: 'text-slate-400', icon: Package, gradient: 'from-slate-500/20 to-slate-400/10', duration: '-' },
};

const COLOR_OPTIONS = [
    { color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-400/10' },
    { color: 'text-rose-400', gradient: 'from-rose-500/20 to-rose-400/10' },
    { color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-400/10' },
    { color: 'text-lime-400', gradient: 'from-lime-500/20 to-lime-400/10' },
    { color: 'text-violet-400', gradient: 'from-violet-500/20 to-violet-400/10' },
    { color: 'text-teal-400', gradient: 'from-teal-500/20 to-teal-400/10' },
];

// ==================== TYPES ====================

interface PlanCard {
    planId: string;
    name: string;
    price: string;
    priceValue: number;
    jobCount: number;
    color: string;
    icon: any;
    gradient: string;
    duration: string;
    revenue: number;
    fromDB: boolean;
    dbPriceINR?: number;
    dbPriceUSD?: number;
    isActive?: boolean;
}

interface DashboardStats {
    totalUsers: number;
    activeJobs: number;
    totalJobs: number;
    totalRevenue: number;
}

interface LogEntry {
    id: string;
    level: string;
    message: string;
    created_at: string;
}

interface AIServiceStatus {
    name: string;
    status: string;
}

// ==================== HELPER FUNCTIONS ====================

const formatCurrency = (amount: number): string => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
};

const groupJobsByType = (jobsList: any[]): Record<string, number> => {
    return jobsList.reduce((acc, job) => {
        const planId = job.job_type || 'basic';
        acc[planId] = (acc[planId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
};

// ==================== COMPONENT ====================

const AdminDashboard: React.FC = () => {
    // State Management
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeJobs: 0,
        totalJobs: 0,
        totalRevenue: 0
    });
    const [planCards, setPlanCards] = useState<PlanCard[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [aiStatus, setAiStatus] = useState<AIServiceStatus[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dbTableExists, setDbTableExists] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);

    // Data Fetching - Optimized with useCallback
    const fetchAdminData = useCallback(async () => {
        if (!supabase) {
            setErrors(['Supabase connection not available']);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrors([]);
        const newErrors: string[] = [];

        try {
            // === 1. Fetch Total Users ===
            let usersCount = 0;
            try {
                const { count, error } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true });
                if (error) {
                    console.error('Users query error:', error);
                    newErrors.push('Could not fetch users count');
                } else {
                    usersCount = count || 0;
                }
            } catch (e) {
                console.error('Users fetch failed:', e);
            }

            // === 2. Fetch ALL Jobs ===
            let jobsList: any[] = [];
            try {
                const { data, error } = await supabase
                    .from('employer_job_posts')
                    .select('id, status, job_type, created_at');
                if (error) {
                    console.error('Jobs query error:', error);
                    newErrors.push('Could not fetch jobs');
                } else {
                    jobsList = data || [];
                }
            } catch (e) {
                console.error('Jobs fetch failed:', e);
            }

            const activeCount = jobsList.filter(j => j.status === 'active').length;
            const jobCountByType = groupJobsByType(jobsList);

            // === 3. Fetch Subscription Plans ===
            let dbPlans: any[] = [];
            let tableExists = true;
            try {
                const { data, error } = await supabase
                    .from('subscription_plans')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (error) {
                    console.warn('subscription_plans table error:', error.message);
                    if (error.message?.includes('does not exist') || error.code === '42P01') {
                        tableExists = false;
                        newErrors.push('subscription_plans table not found');
                    } else {
                        newErrors.push('Error reading subscription_plans: ' + error.message);
                    }
                } else {
                    dbPlans = data || [];
                }
            } catch (e) {
                console.warn('subscription_plans fetch failed:', e);
                tableExists = false;
            }
            setDbTableExists(tableExists);

            // === 4. Build Plan Cards - Memoized ===
            const cards: PlanCard[] = [];
            const coveredIds = new Set<string>();
            let computedRevenue = 0;

            if (dbPlans.length > 0) {
                dbPlans.forEach((dbPlan: any, idx: number) => {
                    const planId = dbPlan.id?.toString() || `db-${idx}`;
                    coveredIds.add(planId);
                    const jobCount = jobCountByType[planId] || 0;
                    const priceINR = dbPlan.price_inr || 0;
                    const revenue = jobCount * priceINR;
                    computedRevenue += revenue;

                    const c = COLOR_OPTIONS[idx % COLOR_OPTIONS.length];

                    cards.push({
                        planId,
                        name: dbPlan.name || 'Unnamed Plan',
                        price: priceINR > 0 ? `₹${priceINR.toLocaleString('en-IN')}` : (dbPlan.price_usd > 0 ? `$${dbPlan.price_usd}` : '₹0'),
                        priceValue: priceINR,
                        jobCount,
                        color: c.color,
                        icon: CreditCard,
                        gradient: c.gradient,
                        duration: dbPlan.duration || '-',
                        revenue,
                        fromDB: true,
                        dbPriceINR: priceINR,
                        dbPriceUSD: dbPlan.price_usd || 0,
                        isActive: dbPlan.is_active !== false,
                    });
                });
            }

            // Add plans from jobs table
            const allKnownPlanIds = Object.keys(PLAN_INFO);
            Object.keys(jobCountByType).forEach(id => {
                if (!allKnownPlanIds.includes(id)) allKnownPlanIds.push(id);
            });

            allKnownPlanIds.forEach(planId => {
                if (coveredIds.has(planId)) return;

                const info = PLAN_INFO[planId];
                const jobCount = jobCountByType[planId] || 0;

                if (jobCount === 0 && dbPlans.length > 0) return;

                const priceVal = info?.priceValue || 0;
                const revenue = jobCount * priceVal;
                computedRevenue += revenue;

                cards.push({
                    planId,
                    name: info?.name || planId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    price: info?.price || '₹0',
                    priceValue: priceVal,
                    jobCount,
                    color: info?.color || 'text-gray-400',
                    icon: info?.icon || Package,
                    gradient: info?.gradient || 'from-gray-500/20 to-gray-400/10',
                    duration: info?.duration || '-',
                    revenue,
                    fromDB: false,
                });
            });

            cards.sort((a, b) => b.jobCount - a.jobCount || b.priceValue - a.priceValue);

            // Update State
            setStats({
                totalUsers: usersCount,
                activeJobs: activeCount,
                totalJobs: jobsList.length,
                totalRevenue: computedRevenue
            });
            setPlanCards(cards);

            // === 5. Fetch System Logs ===
            try {
                const { data: systemLogs } = await supabase
                    .from('system_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (systemLogs) setLogs(systemLogs);
            } catch (e) {
                console.warn('system_logs fetch skipped:', e);
            }

            // === 6. Fetch AI Status ===
            try {
                const { data: keys } = await supabase.from('api_keys').select('provider');
                const activeProviders = keys?.map(k => k.provider) || [];
                setAiStatus([
                    { name: 'Gemini Pro', status: activeProviders.includes('gemini') ? 'Active' : 'Inactive' },
                    { name: 'OpenAI GPT-4', status: activeProviders.includes('gpt4') ? 'Active' : 'Inactive' },
                    { name: 'Claude 3', status: activeProviders.includes('claude') ? 'Active' : 'Standby' },
                    { name: 'DeepSeek', status: activeProviders.includes('deepseek') ? 'Active' : 'Standby' },
                ]);
            } catch (e) {
                console.warn('api_keys fetch skipped:', e);
                setAiStatus([
                    { name: 'Gemini Pro', status: 'Unknown' },
                    { name: 'OpenAI GPT-4', status: 'Unknown' },
                    { name: 'Claude 3', status: 'Unknown' },
                    { name: 'DeepSeek', status: 'Unknown' },
                ]);
            }
        } catch (error) {
            console.error('Admin dashboard error:', error);
            newErrors.push('Unexpected error loading dashboard');
        } finally {
            setErrors(newErrors);
            setIsLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // Refresh Handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAdminData();
        setIsRefreshing(false);
    };

    // Memoized Top Stats
    const topStats = useMemo(() => [
        { label: 'Estimated Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-green-400' },
        { label: 'Total Jobs Posted', value: stats.totalJobs.toString(), icon: Briefcase, color: 'text-neon-purple' },
        { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'text-neon-cyan' },
        { label: 'Active Jobs', value: stats.activeJobs.toString(), icon: CreditCard, color: 'text-amber-400' },
    ], [stats]);

    // Render
    return (
        <div className="space-y-8 bg-black/90 p-6 rounded-2xl glass">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">System Overview</h1>
                    <p className="text-gray-400">Real-time metrics from database.</p>
                </div>
                <div className="flex items-center gap-3">
                    <AdminButton3D
                        variant="outline"
                        size="sm"
                        icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </AdminButton3D>
                    <AdminButton3D variant="info" size="sm" icon={<Download className="w-4 h-4" />}>
                        Export Report
                    </AdminButton3D>
                    <AdminButton3D variant="primary" size="sm" icon={<Settings className="w-4 h-4" />}>
                        Configure
                    </AdminButton3D>
                </div>
            </motion.div>

            {/* Error Notices */}
            {errors.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {errors.map((err, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                            <AlertTriangle size={18} className="shrink-0" />
                            <span>{err}</span>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topStats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-xl glass hover:border-neon-pink/50 transition-colors relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-2xl font-bold text-white">{isLoading ? '...' : stat.value}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 blur-2xl ${stat.color.replace('text-', 'bg-')}`} />
                    </motion.div>
                ))}
            </div>

            {/* Job Posting Plans Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl glass border border-white/10"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <BarChart3 className="text-neon-cyan" size={24} />
                        Job Posting Plans — Usage & Pricing
                    </h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                        {planCards.length} plans • {stats.totalJobs} total posts
                    </span>
                </div>

                {!dbTableExists && !isLoading && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                        <AlertTriangle className="text-amber-400 mt-0.5 shrink-0" size={18} />
                        <div>
                            <p className="text-amber-400 text-sm font-bold">subscription_plans table not found</p>
                            <p className="text-amber-400/70 text-xs mt-1">
                                Run the SQL file <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">server/add_subscription_plans_table.sql</code> in your Supabase SQL Editor.
                            </p>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon-cyan" />
                    </div>
                ) : planCards.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="mx-auto mb-4 text-gray-600" size={48} />
                        <p className="text-gray-400 text-lg font-bold mb-2">No Plans or Jobs Found</p>
                        <p className="text-gray-500 text-sm">Post a job first, or go to <span className="text-neon-cyan font-bold">Admin → Job & Pricing</span> to create plans.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {planCards.map((plan, i) => {
                            const Icon = plan.icon;
                            const percentage = stats.totalJobs > 0 ? Math.round((plan.jobCount / stats.totalJobs) * 100) : 0;

                            return (
                                <motion.div
                                    key={plan.planId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.07 }}
                                    className={`relative p-5 rounded-2xl bg-gradient-to-br ${plan.gradient} border border-white/10 hover:border-white/25 transition-all duration-300 group overflow-hidden`}
                                >
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                        {plan.fromDB && (
                                            <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 px-1.5 py-0.5 rounded-full">
                                                <ShieldCheck size={8} /> DB
                                            </span>
                                        )}
                                        {plan.isActive === false && (
                                            <span className="text-[8px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                                                Off
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mb-3 mt-1">
                                        <div className={`p-2.5 rounded-xl bg-white/5 ${plan.color} group-hover:scale-110 transition-transform`}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm leading-tight">{plan.name}</h4>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{plan.duration}</span>
                                        </div>
                                    </div>

                                    <div className="mb-1">
                                        <span className={`text-xl font-black ${plan.color}`}>{plan.price}</span>
                                        {plan.priceValue > 0 && <span className="text-xs text-gray-500 ml-1">/post</span>}
                                        {plan.dbPriceUSD && plan.dbPriceUSD > 0 && (
                                            <span className="text-xs text-gray-500 ml-2">(${plan.dbPriceUSD} USD)</span>
                                        )}
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-3xl font-black text-white">{plan.jobCount}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">jobs posted</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-gray-500">Usage</span>
                                            <span className={plan.color}>{percentage}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(percentage, 2)}%` }}
                                                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                className={`h-full rounded-full bg-gradient-to-r ${plan.gradient.replace('/20', '/80').replace('/10', '/60')}`}
                                            />
                                        </div>
                                    </div>

                                    {plan.priceValue > 0 && plan.jobCount > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Revenue</span>
                                                <span className="text-sm font-black text-green-400">{formatCurrency(plan.revenue)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {plan.jobCount === 0 && (
                                        <div className="mt-2 text-center">
                                            <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">No posts yet</span>
                                        </div>
                                    )}

                                    <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-10 blur-2xl ${plan.color.replace('text-', 'bg-')}`} />
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {!isLoading && stats.totalRevenue > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <DollarSign className="text-green-400" size={20} />
                            <span className="text-sm font-bold text-gray-300">Total Estimated Revenue from Paid Plans</span>
                        </div>
                        <span className="text-xl font-black text-green-400">{formatCurrency(stats.totalRevenue)}</span>
                    </motion.div>
                )}
            </motion.div>

            {/* Recent System Logs */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-xl glass border border-white/10">
                <h3 className="text-xl font-bold mb-6 text-white">Recent System Logs</h3>
                <div className="space-y-4">
                    {logs.length > 0 ? logs.map((log, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5 text-sm font-mono border-l-2 border-neon-cyan/50 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{new Date(log.created_at).toLocaleDateString()}</span>
                                <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-neon-cyan font-bold">{log.level || 'INFO'}</span>
                                <span className="text-gray-300 truncate">{log.message}</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-400">No logs found.</p>
                    )}
                </div>
            </motion.div>

            {/* AI Service Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-6 rounded-xl glass border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <Cpu className="text-neon-pink" size={24} /> AI Service Status
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aiStatus.map((svc, i) => (
                        <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-lg text-white">{svc.name}</span>
                                <div className={`w-2 h-2 rounded-full ${svc.status === 'Active' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-yellow-400'}`} />
                            </div>
                            <div className="text-sm text-gray-400">
                                <div className="flex justify-between">
                                    <span>Status</span>
                                    <span className={svc.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}>{svc.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
