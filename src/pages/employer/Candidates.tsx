// src/pages/employer/Candidates.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Search, Filter, Plus, Download, Briefcase, Users, ArrowLeft,
    ChevronRight, MapPin, DollarSign, Clock, Star, Play,
    Mail, Phone, Calendar, CheckCircle, MessageSquare, Menu, Brain, ShieldAlert
} from 'lucide-react';
import CandidateCard, { type Candidate as CardCandidate } from '../../components/CandidateCard';
import { API_BASE_URL } from '../../lib/api';

type ViewMode = 'JOBS' | 'CANDIDATES' | 'PROFILE';
type RecommendationType = 'applied' | 'ai_recommended' | 'top_talent';

interface ExtendedCandidate extends CardCandidate {
    recommendationType?: RecommendationType;
    aiMatchScore?: number;
    // Additional Profile Fields
    fraudFlag?: boolean;
    aiStrengths?: string[];
    interviewReadiness?: number;
}

const Candidates: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // State Management
    const [viewMode, setViewMode] = useState<ViewMode>('JOBS');
    const [selectedJobId, setSelectedJobId] = useState<string | null>(searchParams.get('jobId'));
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | CardCandidate['status']>('All');

    const [jobs, setJobs] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<ExtendedCandidate[]>([]);
    const [aiRecommendedCandidates, setAiRecommendedCandidates] = useState<ExtendedCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'applied' | 'ai_recommended' | 'all'>('all');

    // Fetch Jobs first
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('sb-token');

                // Fetch Jobs
                let fetchedJobs = [];
                if (token) {
                    const jobResp = await fetch(`${API_BASE_URL}/api/employer/jobs`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (jobResp.ok) {
                        const data = await jobResp.json();
                        fetchedJobs = data.jobs || [];
                    }
                }
                setJobs(fetchedJobs);

                // If jobId is in URL, transition to CANDIDATES view
                const jobId = searchParams.get('jobId');
                if (jobId) {
                    setSelectedJobId(jobId);
                    await loadCandidatesForJob(jobId);
                    setViewMode('CANDIDATES');
                }
            } catch (error) {
                console.error("Error loading jobs:", error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const loadCandidatesForJob = async (jobId: string | null) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('sb-token');
            let apps: any[] = [];

            if (token) {
                const response = await fetch(`${API_BASE_URL}/api/applications/employer`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (jobId) {
                        apps = (data.applications || []).filter((a: any) => String(a.job_id) === String(jobId));
                    } else {
                        apps = data.applications || [];
                    }
                }
            }

            // Format applied candidates
            let appliedFormatted: ExtendedCandidate[] = [];
            if (apps.length > 0) {
                appliedFormatted = apps.map((app: any) => ({
                    id: app.candidate?.id || app.candidate_id,
                    applicationId: app.id,
                    name: app.candidate?.name || 'Applicant',
                    photoUrl: app.candidate?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.candidate?.name || 'User')}&background=random`,
                    videoUrl: app.resume_url || '',
                    appliedJobTitle: app.job?.title || 'Candidate',
                    experienceYears: app.candidate?.experience_years || 0,
                    skills: app.candidate?.skills ? (typeof app.candidate.skills === 'string' ? JSON.parse(app.candidate.skills) : app.candidate.skills) : [],
                    location: app.candidate?.location || 'Remote',
                    timezone: 'UTC',
                    aiScore: app.ai_screening_score || 0,
                    status: (app.status || 'applied') as CardCandidate['status'],
                    recommendationType: 'applied' as RecommendationType,
                    aiMatchScore: app.ai_screening_score || 0,
                    fraudFlag: app.candidate?.fraud_detection_flag || false,
                    aiStrengths: app.candidate?.ai_strengths || [],
                    interviewReadiness: app.candidate?.interview_readiness_score || 0
                }));
            }

            setCandidates(appliedFormatted);
            setAiRecommendedCandidates([]); // AI recommendations not yet implemented
        } catch (error) {
            console.error("Error loading candidates:", error);
            setCandidates([]);
            setAiRecommendedCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectJob = (jobId: string) => {
        setSelectedJobId(jobId);
        setSearchParams({ jobId });
        loadCandidatesForJob(jobId);
        setViewMode('CANDIDATES');
    };

    const handleSelectCandidate = (candidateId: string) => {
        setSelectedCandidateId(candidateId);
        setViewMode('PROFILE');
    };

    const handleBackToJobs = () => {
        setSelectedJobId(null);
        setSearchParams({});
        setViewMode('JOBS');
    };

    const handleBackToCandidates = () => {
        setSelectedCandidateId(null);
        setViewMode('CANDIDATES');
    };

    const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);

    // Normalize Candidate helper
    const normalizedSelectedCandidate = useMemo(() => {
        if (!selectedCandidateId) return null;

        // Search in applied candidates and AI recommended
        let raw = candidates.find(c => c.id === selectedCandidateId) ||
            aiRecommendedCandidates.find(c => c.id === selectedCandidateId);

        if (!raw) return null;

        return {
            id: raw.id,
            name: raw.name,
            photoUrl: raw.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.name)}`,
            videoUrl: raw.videoUrl || '',
            appliedJobTitle: raw.appliedJobTitle || 'Candidate',
            experienceYears: raw.experienceYears || 0,
            location: raw.location || 'Remote',
            aiScore: raw.aiScore || 0,
            skills: Array.isArray(raw.skills)
                ? raw.skills.map((s: any) => typeof s === 'string' ? s : s.skill)
                : [],
            recommendationType: raw.recommendationType || 'applied',
            fraudFlag: raw.fraudFlag,
            aiStrengths: raw.aiStrengths,
            interviewReadiness: raw.interviewReadiness
        };
    }, [candidates, aiRecommendedCandidates, selectedCandidateId]);

    const filteredCandidates = useMemo(() => {
        // Combine based on active tab
        let pool: ExtendedCandidate[] = [];
        if (activeTab === 'applied') {
            pool = candidates;
        } else if (activeTab === 'ai_recommended') {
            pool = aiRecommendedCandidates;
        } else {
            // 'all' - combine applied first
            pool = [...candidates, ...aiRecommendedCandidates];
        }

        return pool.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus, candidates, aiRecommendedCandidates, activeTab]);


    if (loading && viewMode === 'JOBS') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-[var(--text-muted)] font-medium">Assembling your pipeline...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <AnimatePresence mode="wait">
                {/* --- JOBS LIST VIEW --- */}
                {viewMode === 'JOBS' && (
                    <motion.div
                        key="jobs-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Candidate Management</h1>
                                <p className="text-[var(--text-muted)] mt-1 font-medium">Select a job post to manage its application pipeline.</p>
                            </div>
                            <button onClick={() => navigate('/employer/post-job')} className="btn-saas-primary">
                                <Plus size={18} /> Post New Job
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {jobs.length > 0 ? jobs.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => handleSelectJob(job.id)}
                                    className="saas-card p-6 flex items-center justify-between cursor-pointer group hover:border-indigo-600 transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                            <Briefcase size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-[var(--text-main)] group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                            <div className="flex gap-4 mt-1 text-sm font-bold text-[var(--text-muted)]">
                                                <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                                                <span className="flex items-center gap-1.5"><DollarSign size={14} /> ${job.salary_min}k - ${job.salary_max}k</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-center px-6 border-r border-[var(--border-subtle)]">
                                            <p className="text-2xl font-black text-indigo-600 leading-none">{job.applicant_count || 0}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Applicants</p>
                                        </div>
                                        <ChevronRight size={24} className="text-[var(--text-muted)] group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <Briefcase size={40} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500 font-medium">No job posts found.</p>
                                    <button onClick={() => navigate('/employer/post-job')} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Post your first job</button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* --- CANDIDATES LIST VIEW --- */}
                {viewMode === 'CANDIDATES' && (
                    <motion.div
                        key="candidates-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-4">
                            <button onClick={handleBackToJobs} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-[var(--border-subtle)] transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex-1">
                                <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">{selectedJob ? selectedJob.title : 'All Candidates'}</h1>
                                <p className="text-[var(--text-muted)] font-bold uppercase text-[10px] tracking-widest">
                                    {selectedJob ? `Managing pipeline for ${selectedJob.location}` : 'Viewing all applications'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-[var(--border-subtle)] rounded-xl text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:border-indigo-600 transition-all flex items-center gap-2">
                                    <Download size={14} /> Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Search & Stats */}
                        <div className="grid lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3">
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by name, skillset..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-600 transition-all text-sm"
                                        />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={e => setFilterStatus(e.target.value as any)}
                                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3.5 text-xs font-black uppercase focus:outline-none"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="applied">Applied</option>
                                        <option value="screened">AI Screened</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="hired">Hired</option>
                                    </select>
                                </div>
                            </div>
                            <div className="saas-card bg-gradient-to-br from-indigo-600 to-purple-600 p-5 flex items-center justify-between text-white">
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-80">Talent Pool</p>
                                    <p className="text-3xl font-black leading-none">{candidates.length + aiRecommendedCandidates.length}</p>
                                </div>
                                <Users size={32} className="opacity-40" />
                            </div>
                        </div>

                        {/* Talent Pool Tabs */}
                        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'all'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                All ({candidates.length + aiRecommendedCandidates.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('applied')}
                                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'applied'
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <CheckCircle size={14} /> Applied ({candidates.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('ai_recommended')}
                                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'ai_recommended'
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <Star size={14} /> AI Picks ({aiRecommendedCandidates.length})
                            </button>
                        </div>

                        {/* Candidate Grid */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : filteredCandidates.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredCandidates.map((candidate, idx) => (
                                    <motion.div
                                        key={candidate.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleSelectCandidate(candidate.id)}
                                        className="cursor-pointer"
                                    >
                                        <CandidateCard
                                            candidate={candidate}
                                            onViewProfile={handleSelectCandidate}
                                            onShortlist={(id) => console.log('shortlist', id)}
                                            onScheduleInterview={(id) => console.log('schedule', id)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="saas-card p-20 text-center flex flex-col items-center gap-6">
                                <Users size={48} className="text-[var(--text-muted)] opacity-20" />
                                <div className="max-w-xs">
                                    <h3 className="text-xl font-black text-[var(--text-main)] mb-2">No Candidates Found</h3>
                                    <p className="text-[var(--text-muted)] font-medium text-sm">No one has applied for this position yet or matches your filters.</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* --- CANDIDATE PROFILE DETAIL VIEW --- */}
                {viewMode === 'PROFILE' && normalizedSelectedCandidate && (
                    <motion.div
                        key="profile-view"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="space-y-6"
                    >
                        {/* Header Stats Bar */}
                        <div className="flex items-center justify-between bg-white p-3 border border-[var(--border-subtle)] rounded-2xl">
                            <button onClick={handleBackToCandidates} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all font-bold text-sm">
                                <ArrowLeft size={18} /> Back to Pipeline
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 border border-[var(--border-subtle)] rounded-xl text-xs font-black uppercase hover:border-indigo-600 transition-all">Download PDF</button>
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Hire Candidate</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Left Column: Core Identity */}
                            <div className="space-y-6">
                                <div className="saas-card p-8 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                                    <div className="relative inline-block mt-4">
                                        <img src={normalizedSelectedCandidate.photoUrl} alt={normalizedSelectedCandidate.name} className="w-32 h-32 rounded-full border-4 border-indigo-100 object-cover" />
                                        <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-[var(--text-main)] mt-4">{normalizedSelectedCandidate.name}</h2>
                                    <p className="text-indigo-600 font-black text-sm uppercase tracking-wide">{normalizedSelectedCandidate.appliedJobTitle}</p>

                                    {/* Fraud Alert */}
                                    {normalizedSelectedCandidate.fraudFlag && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-left">
                                            <ShieldAlert size={16} className="text-red-500 shrink-0" />
                                            <p className="text-xs font-bold text-red-600 leading-tight">AI Warning: Potential fraud/cheating detected in video interview.</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--border-subtle)]">
                                        <div className="text-center">
                                            <p className="text-xl font-black text-indigo-600">{normalizedSelectedCandidate.experienceYears}+</p>
                                            <p className="text-[9px] font-black uppercase text-[var(--text-muted)]">Exp. Years</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-black text-emerald-500">{normalizedSelectedCandidate.aiScore}%</p>
                                            <p className="text-[9px] font-black uppercase text-[var(--text-muted)]">AI Match</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-8 text-left">
                                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] font-medium">
                                            <MapPin size={16} className="text-indigo-500" /> {normalizedSelectedCandidate.location}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] font-medium">
                                            <Mail size={16} className="text-indigo-500" /> candidate@email.com
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] font-medium">
                                            <Phone size={16} className="text-indigo-500" /> +91 98765-XXXXX
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-8">
                                        <button className="flex-1 btn-saas-primary py-3 rounded-xl"><MessageSquare size={16} /> Chat</button>
                                        <button className="p-3 bg-gray-50 border border-[var(--border-subtle)] rounded-xl text-indigo-600 hover:border-indigo-600 transition-all"><Calendar size={20} /></button>
                                    </div>
                                </div>

                                <div className="saas-card p-6">
                                    <h4 className="text-sm font-black uppercase text-[var(--text-muted)] mb-4 tracking-widest">Core Skillset</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {normalizedSelectedCandidate.skills.map((skill: string) => (
                                            <span key={skill} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-black uppercase">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Insights Card (New) */}
                                <div className="saas-card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase text-indigo-900 mb-4 tracking-widest">
                                        <Brain size={16} className="text-indigo-600" /> AI Insights
                                    </h4>

                                    <div className="mb-4">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold text-indigo-700">Interview Readiness</span>
                                            <span className="text-lg font-black text-indigo-600">{normalizedSelectedCandidate.interviewReadiness || 0}%</span>
                                        </div>
                                        <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-indigo-600 h-full rounded-full"
                                                style={{ width: `${normalizedSelectedCandidate.interviewReadiness || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {normalizedSelectedCandidate.aiStrengths && normalizedSelectedCandidate.aiStrengths.length > 0 && (
                                        <div>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase mb-2 block">Top Strengths</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {normalizedSelectedCandidate.aiStrengths.slice(0, 4).map((s: string, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white border border-emerald-100 text-[10px] font-bold text-emerald-700 rounded-md shadow-sm">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Middle & Right: Video & Professional History */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Video Resume Panel */}
                                <div className="saas-card overflow-hidden">
                                    <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/30">
                                                <Play size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-[var(--text-main)]">Video Resume</h3>
                                                <p className="text-xs text-[var(--text-muted)]">Watch {normalizedSelectedCandidate.name}'s introduction</p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> AI Verified
                                        </span>
                                    </div>

                                    {/* Video Player Container */}
                                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative group">
                                        <video
                                            className="w-full h-full object-cover"
                                            controls
                                            poster={normalizedSelectedCandidate.photoUrl}
                                            preload="metadata"
                                        >
                                            <source
                                                src={normalizedSelectedCandidate.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                                                type="video/mp4"
                                            />
                                            Your browser does not support the video tag.
                                        </video>

                                        {!normalizedSelectedCandidate.videoUrl && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                                <div className="text-center text-white">
                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                                                        <Play size={32} className="text-white ml-1" />
                                                    </div>
                                                    <p className="font-black text-lg">Sample Video</p>
                                                    <p className="text-white/60 text-sm">Candidate hasn't uploaded a video resume yet</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Professional History (Experience) */}
                                <div className="saas-card p-0">
                                    <div className="p-6 border-b border-[var(--border-subtle)] flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <Briefcase size={18} />
                                        </div>
                                        <h3 className="text-lg font-black text-[var(--text-main)]">Professional History</h3>
                                    </div>
                                    <div className="p-8 space-y-8 relative">
                                        <div className="absolute left-[47px] top-10 bottom-10 w-0.5 bg-indigo-100"></div>

                                        {/* Dynamic Experience Items */}
                                        <div className="flex gap-8 relative z-10">
                                            <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm shadow-indigo-100">
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                            </div>
                                            <div className="pb-4">
                                                <h4 className="text-lg font-black text-[var(--text-main)] leading-tight">{normalizedSelectedCandidate.appliedJobTitle}</h4>
                                                <p className="text-indigo-600 font-black text-xs uppercase mt-1 tracking-wide">{normalizedSelectedCandidate.experienceYears} Years Experience</p>
                                                <p className="text-[var(--text-muted)] mt-2 text-sm leading-relaxed font-medium">
                                                    Detailed experience information not provided by candidate.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="saas-card p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                            <CheckCircle size={18} />
                                        </div>
                                        <h3 className="text-lg font-black text-[var(--text-main)]">Education & Certifications</h3>
                                    </div>
                                    <div className="p-4 text-sm text-[var(--text-muted)] bg-gray-50 rounded-lg border border-[var(--border-subtle)]">
                                        Education details not available.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Candidates;
