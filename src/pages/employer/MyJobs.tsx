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

            if (!response.ok) throw new Error('Failed to fetch jobs');
            const data = await response.json();

            // For each job, we would ideally fetch application counts from a summary endpoint
            // but for now we can just use the job data. 
            // In a real app, you'd join with application counts in the SQL query.
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
                applicants_count: 0, // Would be fetched from backend in production
                screened_count: 0,
                shortlisted_count: 0,
                hired_count: 0
            })) as Job[];

            setJobs(formattedJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
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
        console.log('Edit job:', jobId);
        // TODO: Implement edit functionality
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;

        try {
            await supabase?.from('jobs').delete().eq('id', jobId);
            setJobs(prev => prev.filter(j => j.id !== jobId));
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Jobs</h1>
                    <p className="text-gray-400">Manage your job postings and track hiring progress</p>
                </div>
                <button
                    onClick={() => navigate('/employer/post-job')}
                    className="px-4 py-2.5 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Post New Job
                </button>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 uppercase">Total Jobs</span>
                        <Briefcase size={16} className="text-neon-cyan" />
                    </div>
                    <div className="text-2xl font-bold text-white">{jobs.length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 uppercase">Active</span>
                        <TrendingUp size={16} className="text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {jobs.filter(j => j.status === 'active').length}
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 uppercase">Total Applicants</span>
                        <Users size={16} className="text-neon-purple" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {jobs.reduce((sum, job) => sum + job.applicants_count, 0)}
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 uppercase">Total Hired</span>
                        <Users size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {jobs.reduce((sum, job) => sum + job.hired_count, 0)}
                    </div>
                </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors text-white"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-3 text-gray-500" size={18} />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors appearance-none text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </motion.div>

            {/* Jobs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job, idx) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group"
                    >
                        {/* Job Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                                    {job.title}
                                </h3>
                                <div className="flex flex-col gap-1 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} /> {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {job.type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign size={12} /> ${job.salary_min}k - ${job.salary_max}k
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'active'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                                    }`}>
                                    {job.status}
                                </span>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mb-4">
                            {job.skills?.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded text-xs text-neon-cyan">
                                    {skill}
                                </span>
                            ))}
                            {job.skills?.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-500/10 border border-gray-500/30 rounded text-xs text-gray-400">
                                    +{job.skills.length - 3}
                                </span>
                            )}
                        </div>

                        {/* Pipeline Stats */}
                        <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-white/10">
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-400">{job.applicants_count}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Applied</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-400">{job.screened_count}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Screened</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-yellow-400">{job.shortlisted_count}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Shortlist</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-400">{job.hired_count}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Hired</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleViewJob(job.id)}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg text-white text-sm font-bold hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
                            >
                                <Eye size={14} /> View Details
                            </button>
                            <button
                                onClick={() => handleEditJob(job.id)}
                                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <Edit size={14} className="text-gray-400" />
                            </button>
                            <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
                            >
                                <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                            </button>
                        </div>

                        {/* Posted Date */}
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar size={10} /> Posted {new Date(job.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredJobs.length === 0 && (
                <div className="text-center py-12">
                    <Briefcase className="mx-auto mb-4 text-gray-600" size={48} />
                    <p className="text-gray-400">No jobs found. Post your first job to get started!</p>
                    <button
                        onClick={() => navigate('/employer/post-job')}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all inline-flex items-center gap-2"
                    >
                        <Plus size={18} /> Post Your First Job
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyJobs;
