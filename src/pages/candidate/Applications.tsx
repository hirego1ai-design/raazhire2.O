import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, XCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL, endpoints, getAuthHeaders } from '../../lib/api';

interface Application {
    id: number;
    job_id: number;
    status: string;
    applied_at: string;
    cover_letter?: string;
    ai_screening_score?: number;
    job?: {
        id: number;
        title: string;
        location: string;
        work_mode: string;
        employment_type: string;
        salary_min: number;
        salary_max: number;
        salary_currency: string;
        status: string;
        employer?: {
            name: string;
            avatar_url: string;
        };
    };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    applied: { label: 'Applied', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Clock size={14} /> },
    pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <Clock size={14} /> },
    screened: { label: 'AI Screened', color: 'text-purple-600', bg: 'bg-purple-50', icon: <AlertCircle size={14} /> },
    shortlisted: { label: 'Shortlisted', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle size={14} /> },
    interview_scheduled: { label: 'Interview', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={14} /> },
    interviewed: { label: 'Interviewed', color: 'text-teal-600', bg: 'bg-teal-50', icon: <CheckCircle size={14} /> },
    offered: { label: 'Offer Received', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <CheckCircle size={14} /> },
    hired: { label: 'Hired', color: 'text-green-700', bg: 'bg-green-100', icon: <CheckCircle size={14} /> },
    rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle size={14} /> },
    withdrawn: { label: 'Withdrawn', color: 'text-gray-500', bg: 'bg-gray-100', icon: <XCircle size={14} /> },
};

const Applications: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await fetch(endpoints.candidate.applications, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                // Fallback to mock data if API fails
                setApplications([]);
                return;
            }

            const data = await response.json();
            setApplications(data.applications || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (appId: number) => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) return;

        setWithdrawingId(appId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/applications/${appId}/withdraw`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setApplications(prev =>
                    prev.map(app => app.id === appId ? { ...app, status: 'withdrawn' } : app)
                );
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to withdraw');
            }
        } catch (error) {
            console.error('Error withdrawing:', error);
            alert('Failed to withdraw application');
        } finally {
            setWithdrawingId(null);
        }
    };

    const filteredApps = filter === 'all'
        ? applications
        : applications.filter(a => a.status === filter);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatSalary = (min: number, max: number, currency: string = 'INR') => {
        if (!min && !max) return 'Negotiable';
        const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 });
        if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
        if (min) return `From ${formatter.format(min)}`;
        return `Up to ${formatter.format(max)}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
                <span className="ml-3 text-[var(--text-muted)]">Loading applications...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Applications</h1>
                <span className="text-sm text-[var(--text-muted)]">{applications.length} total</span>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'applied', 'screened', 'shortlisted', 'interview_scheduled', 'offered', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === status
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-page)]'
                            }`}
                    >
                        {status === 'all' ? 'All' : (statusConfig[status]?.label || status)}
                    </button>
                ))}
            </div>

            {/* Applications List */}
            {filteredApps.length === 0 ? (
                <div className="saas-card p-12 text-center">
                    <Briefcase className="mx-auto text-[var(--text-muted)] mb-4" size={48} />
                    <h3 className="text-lg font-bold mb-2">No Applications Found</h3>
                    <p className="text-[var(--text-muted)]">
                        {filter === 'all' ? "You haven't applied to any jobs yet." : `No applications with status "${filter}".`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredApps.map((app, index) => {
                        const config = statusConfig[app.status] || statusConfig['applied'];
                        return (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="saas-card p-5 hover:border-[var(--primary)] transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Company Avatar */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-lg">
                                            {app.job?.employer?.name?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--text-main)]">{app.job?.title || 'Job Title'}</h3>
                                            <p className="text-sm text-[var(--text-muted)]">{app.job?.employer?.name || 'Company'}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                                                {app.job?.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={12} /> {app.job.location}
                                                    </span>
                                                )}
                                                {app.job?.work_mode && (
                                                    <span className="px-2 py-0.5 rounded bg-[var(--bg-page)] text-[var(--text-muted)]">{app.job.work_mode}</span>
                                                )}
                                                {app.job?.salary_min && (
                                                    <span>{formatSalary(app.job.salary_min, app.job.salary_max, app.job.salary_currency)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* AI Score */}
                                        {app.ai_screening_score && (
                                            <div className="text-center">
                                                <div className="text-xs text-[var(--text-muted)]">AI Score</div>
                                                <div className="text-lg font-bold text-[var(--primary)]">{app.ai_screening_score}%</div>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.color} ${config.bg}`}>
                                            {config.icon}
                                            {config.label}
                                        </span>

                                        {/* Date */}
                                        <div className="text-right">
                                            <div className="text-xs text-[var(--text-muted)]">Applied</div>
                                            <div className="text-sm font-medium">{formatDate(app.applied_at)}</div>
                                        </div>

                                        {/* Withdraw Button */}
                                        {!['withdrawn', 'rejected', 'hired'].includes(app.status) && (
                                            <button
                                                onClick={() => handleWithdraw(app.id)}
                                                disabled={withdrawingId === app.id}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                                            >
                                                {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Applications;
