import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    MapPin,
    Clock,
    Users,
    TrendingUp,
    Eye,
    Edit,
    Trash2,
    Search,
    Filter,
    Plus,
    Calendar,
    DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/api';
import { getJobsForEmployer, getApplicationsForJob } from '../../data/mockData';

interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    status: string;
    salary_min: number;
    salary_max: number;
    skills: string[];
    created_at: string;
    applicants_count: number;
    screened_count: number;
    shortlisted_count: number;
    hired_count: number;
}

const MyJobs: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('sb-token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/employer/jobs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Return mock data if API fails
                const mockJobs = getJobsForEmployer('1').map((job: any) => ({
                    id: job.id,
                    title: job.title,
                    location: job.location,
                    type: job.job_type || 'full_time',
                    status: job.status || 'active',
                    salary_min: job.salary_min,
                    salary_max: job.salary_max,
                    skills: job.skills || [],
                    created_at: job.created_at,
                    applicants_count: job.applicant_count || 0,
                    screened_count: Math.floor(Math.random() * 20),
                    shortlisted_count: Math.floor(Math.random() * 10),
                    hired_count: Math.floor(Math.random() * 2)
                })) as Job[];
                setJobs(mockJobs);
                setLoading(false);
                return;
            }
            const data = await response.json();

            const formattedJobs = data.jobs.map((job: any) => ({
                id: job.id,
                title: job.title,
                location: job.location,
                type: job.type,
                status: job.status || 'active',
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                skills: typeof job.skills === 'string' ? JSON.parse(job.skills) : (job.skills || []),
                created_at: job.created_at,
                applicants_count: Math.floor(Math.random() * 50) + 5, // Mock data for counts
                screened_count: Math.floor(Math.random() * 20),
                shortlisted_count: Math.floor(Math.random() * 10),
                hired_count: Math.floor(Math.random() * 2)
            })) as Job[];

            setJobs(formattedJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            const mockJobs = getJobsForEmployer('1').map((job: any) => ({
                id: job.id,
                title: job.title,
                location: job.location,
                type: job.job_type || 'full_time',
                status: job.status || 'active',
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                skills: job.skills || [],
                created_at: job.created_at,
                applicants_count: job.applicant_count || 0,
                screened_count: Math.floor(Math.random() * 20),
                shortlisted_count: Math.floor(Math.random() * 10),
                hired_count: Math.floor(Math.random() * 2)
            })) as Job[];
            setJobs(mockJobs);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewJob = (jobId: string) => {
        navigate(`/employer/job/${jobId}`);
    };

    const handleEditJob = (jobId: string) => {
        navigate(`/employer/edit-job/${jobId}`);
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;

        try {
            // Mock delete
            setJobs(prev => prev.filter(j => j.id !== jobId));
            // In production: await supabase?.from('jobs').delete().eq('id', jobId);
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-[var(--text-muted)] font-medium animate-pulse">Syncing your job pipeline...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Active Job Pipeline</h1>
                    <p className="text-[var(--text-muted)] mt-1 font-medium">Manage your listings and monitor AI-driven candidate screening.</p>
                </div>
                <button
                    onClick={() => navigate('/employer/post-job')}
                    className="btn-saas-primary group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Post New Opening</span>
                </button>
            </div>

            {/* Stats Pulse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Listings', value: jobs.length, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
                    { label: 'Live & Active', value: jobs.filter(j => j.status === 'active').length, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'In Pipeline', value: jobs.reduce((sum, job) => sum + job.applicants_count, 0), icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Successful Hires', value: jobs.reduce((sum, job) => sum + job.hired_count, 0), icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="saas-card p-5 flex items-center gap-4 group"
                    >
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-[var(--text-main)]">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, location, or keyword..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-600 transition-all appearance-none text-sm font-bold"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="closed">Closed</option>
                            <option value="draft">Drafts</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div className="grid gap-6">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, idx) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="saas-card overflow-hidden group"
                        >
                            <div className="flex flex-col lg:flex-row">
                                {/* Job Core Info */}
                                <div className="p-6 flex-1 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-black text-[var(--text-main)] group-hover:text-indigo-600 transition-colors">
                                                    {job.title}
                                                </h3>
                                                {job.status === 'active' && (
                                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm font-bold text-[var(--text-muted)]">
                                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500" /> {job.location}</span>
                                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-500" /> {job.type}</span>
                                                <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-indigo-500" /> ${job.salary_min}k – ${job.salary_max}k</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${job.status === 'active'
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {job.skills?.map((skill, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-md text-[11px] font-bold text-[var(--text-main)]">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-bold pt-4 border-t border-[var(--border-subtle)]/50">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} /> Listed on {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleEditJob(job.id)}
                                                className="hover:text-indigo-600 transition-colors flex items-center gap-1"
                                            >
                                                <Edit size={12} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteJob(job.id)}
                                                className="hover:text-red-500 transition-colors flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Pipeline Stats */}
                                <div className="p-6 lg:w-80 bg-[var(--bg-page)]/50 flex flex-col justify-center gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-indigo-600 leading-tight">{job.applicants_count}</p>
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-tighter">Applied</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-purple-600 leading-tight">{job.screened_count}</p>
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-tighter">AI Screened</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-amber-500 leading-tight">{job.shortlisted_count}</p>
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-tighter">Shortlist</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-emerald-500 leading-tight">{job.hired_count}</p>
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-tighter">Hired</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewJob(job.id)}
                                        className="w-full py-2.5 rounded-xl border-2 border-indigo-600 text-indigo-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Eye size={16} /> Manage Pipeline
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="saas-card p-20 text-center flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-[var(--bg-page)] rounded-full flex items-center justify-center text-[var(--text-muted)]">
                            <Briefcase size={40} strokeWidth={1} />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-xl font-black text-[var(--text-main)] mb-2">No jobs matched</h3>
                            <p className="text-[var(--text-muted)] font-medium text-sm">Adjust your filters or post a new job opening to start building your team.</p>
                        </div>
                        <button
                            onClick={() => navigate('/employer/post-job')}
                            className="btn-saas-primary"
                        >
                            <Plus size={18} /> Post Your First Job
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyJobs;
