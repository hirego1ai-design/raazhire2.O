import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/api';
import { Link2, Users, Briefcase, DollarSign, Activity, FileCheck, Copy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ReferralDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [referralLink, setReferralLink] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                // Fetch the link
                const linkResponse = await apiGet(`${API_BASE_URL}/api/referrals/link`);
                if (linkResponse.success) setReferralLink(linkResponse.link);

                // Fetch full stats
                const statsResponse = await apiGet(`${API_BASE_URL}/api/referrals/dashboard`);
                if (statsResponse.success) setStats(statsResponse.stats);
            } catch (error) {
                console.error("Failed to fetch referral info", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardInfo();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-gradient-to-r from-[var(--primary)] to-indigo-600 p-8 rounded-[2rem] text-white">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Referrals & Affiliates</h1>
                    <p className="text-white/80 max-w-lg text-sm">
                        Earn rewards under the PPH model by inviting candidates or onboarding companies. 
                        Get paid securely when your referred candidates successfully clear their lock-in period!
                    </p>
                </div>
                <Users size={64} className="opacity-20" />
            </div>

            <div className="saas-card p-6">
                <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase mb-4 tracking-wider">Your Personal Referral Link</h2>
                <div className="flex space-x-4">
                    <div className="flex-1 flex items-center bg-[var(--bg-page)] rounded-xl border border-[var(--border-subtle)] px-4 py-3">
                        <Link2 size={18} className="text-[var(--text-muted)] mr-3" />
                        <span className="font-mono text-sm tracking-wide text-[var(--text-main)] w-full">{referralLink || "Generating..."}</span>
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="btn-saas-primary whitespace-nowrap px-8 flex items-center justify-center gap-2"
                    >
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied Link!' : 'Copy Link'}
                    </button>
                </div>
            </div>

            <h2 className="text-xl font-bold pt-4">Your Intelligence Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="saas-card p-5">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={18} /></div>
                        <h3 className="text-sm font-bold text-[var(--text-muted)]">Link Clicks</h3>
                    </div>
                    <p className="text-3xl font-black text-[var(--text-main)]">{stats?.totalClicks || 0}</p>
                </div>
                <div className="saas-card p-5">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={18} /></div>
                        <h3 className="text-sm font-bold text-[var(--text-muted)]">Total Signups</h3>
                    </div>
                    <p className="text-3xl font-black text-[var(--text-main)]">{stats?.totalSignups || 0}</p>
                </div>
                <div className="saas-card p-5 border-2 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Briefcase size={18} /></div>
                        <h3 className="text-sm font-bold text-[var(--text-muted)]">Candidates Hired</h3>
                    </div>
                    <p className="text-3xl font-black text-emerald-600">{stats?.totalHires || 0}</p>
                </div>
                <div className="saas-card p-5 bg-gradient-to-br from-indigo-50 to-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-600 text-white rounded-lg"><DollarSign size={18} /></div>
                            <h3 className="text-sm font-bold text-[var(--text-muted)]">Approved Payouts</h3>
                        </div>
                    </div>
                    <p className="text-3xl font-black text-indigo-600">${stats?.earnings?.approved || 0}</p>
                </div>
            </div>

            {stats?.earnings?.pending > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/50 flex items-start space-x-4">
                    <Activity className="text-amber-600 shrink-0" size={24} />
                    <div>
                        <h3 className="font-bold text-amber-700">Pending Lock-in Payouts: ${stats.earnings.pending}</h3>
                        <p className="text-sm text-amber-600/80">
                            You have earnings maturing. The payouts will be authorized once your candidates clear their mandatory employment lock-in period and the company completes the PPH payment.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralDashboard;
