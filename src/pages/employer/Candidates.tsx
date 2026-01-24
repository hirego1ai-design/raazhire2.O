// src/pages/employer/Candidates.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Search, Filter, Plus, Download, Briefcase, Users, ArrowLeft,
    ChevronRight, MapPin, DollarSign, Clock, Star, Play,
    Mail, Phone, Calendar, CheckCircle, MessageSquare
} from 'lucide-react';
import CandidateCard, { type Candidate as CardCandidate } from '../../components/CandidateCard';
import { mockJobPosts, mockCandidates, getCandidatesForJob, getTalentPoolForJob, getTopTalentPool } from '../../data/mockData';
import { API_BASE_URL } from '../../lib/api';

type ViewMode = 'JOBS' | 'CANDIDATES' | 'PROFILE';
type RecommendationType = 'applied' | 'ai_recommended' | 'top_talent';

interface ExtendedCandidate extends CardCandidate {
    recommendationType?: RecommendationType;
    aiMatchScore?: number;
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

    // Fetch Jobs first if needed
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

                if (fetchedJobs.length === 0) {
                    fetchedJobs = mockJobPosts; // Fallback to mock
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
                setJobs(mockJobPosts);
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

            // If no job selected, show top talent pool
            if (!jobId) {
                const topTalent = getTopTalentPool(20);
                const formatted: ExtendedCandidate[] = topTalent.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    photoUrl: c.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
                    videoUrl: c.video_resume_url || '',
                    appliedJobTitle: c.job_profile || c.title || 'Talent',
                    experienceYears: c.experience_years || 0,
                    skills: c.skills ? c.skills.map((s: any) => s.skill) : [],
                    location: c.location || 'Remote',
                    timezone: 'UTC',
                    aiScore: c.aiMatchScore || Math.round((c.points / 3500) * 100),
                    status: 'applied' as CardCandidate['status'],
                    recommendationType: 'top_talent' as RecommendationType,
                    aiMatchScore: c.aiMatchScore
                }));
                setCandidates(formatted);
                setAiRecommendedCandidates([]);
                setLoading(false);
                return;
            }

            // Job-specific talent pool
            let apps: any[] = [];
            if (token) {
                const response = await fetch(`${API_BASE_URL}/api/applications/employer`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    apps = (data.applications || []).filter((a: any) => a.job_id === jobId);
                }
            }

            // Get combined talent pool from mock data
            const talentPool = getTalentPoolForJob(jobId);

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
                    experienceYears: 3,
                    skills: app.candidate?.skills ? JSON.parse(app.candidate.skills) : ['TypeScript'],
                    location: app.candidate?.location || 'Remote',
                    timezone: 'UTC',
                    aiScore: app.ai_score || 82,
                    status: (app.status || 'applied') as CardCandidate['status'],
                    recommendationType: 'applied' as RecommendationType,
                    aiMatchScore: app.ai_score || 82
                }));
            } else {
                // Use mock applied candidates
                appliedFormatted = talentPool.applied.map((app: any) => ({
                    id: app.id || Math.random().toString(),
                    name: app.name || 'Anonymous',
                    photoUrl: app.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name || 'User')}&background=random`,
                    videoUrl: app.video_resume_url || '',
                    appliedJobTitle: app.title || app.job_profile || 'Candidate',
                    experienceYears: app.experience_years || 0,
                    skills: app.skills ? app.skills.map((s: any) => typeof s === 'string' ? s : s.skill) : [],
                    location: app.location || 'Remote',
                    timezone: 'UTC',
                    aiScore: app.aiMatchScore || app.applicationScore || 75,
                    status: (app.applicationStatus || 'applied') as CardCandidate['status'],
                    recommendationType: 'applied' as RecommendationType,
                    aiMatchScore: app.aiMatchScore || app.applicationScore
                }));
            }

            // Format AI-recommended candidates
            const aiRecommendedFormatted: ExtendedCandidate[] = talentPool.aiRecommended.map((c: any) => ({
                id: c.id,
                name: c.name,
                photoUrl: c.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
                videoUrl: c.video_resume_url || '',
                appliedJobTitle: c.job_profile || c.title || 'Recommended Talent',
                experienceYears: c.experience_years || 0,
                skills: c.skills ? c.skills.map((s: any) => typeof s === 'string' ? s : s.skill) : [],
                location: c.location || 'Remote',
                timezone: 'UTC',
                aiScore: c.aiMatchScore || 70,
                status: 'screened' as CardCandidate['status'], // Mark AI recommended as pre-screened
                recommendationType: 'ai_recommended' as RecommendationType,
                aiMatchScore: c.aiMatchScore
            }));

            setCandidates(appliedFormatted);
            setAiRecommendedCandidates(aiRecommendedFormatted);
        } catch (error) {
            console.error("Error loading candidates:", error);
            // Fallback to mock
            const talentPool = getTalentPoolForJob(jobId || '');
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

    // Normalize Candidate helper to fix lint errors and field mismatches
    const normalizedSelectedCandidate = useMemo(() => {
        if (!selectedCandidateId) return null;

        // Search in applied candidates, AI recommended, and mock data
        let raw = candidates.find(c => c.id === selectedCandidateId) ||
            aiRecommendedCandidates.find(c => c.id === selectedCandidateId) ||
            (mockCandidates.find(c => c.id === selectedCandidateId) as any);

        if (!raw) return null;

        // Map mock fields to our standard interface if needed
        return {
            id: raw.id,
            name: raw.name,
            photoUrl: raw.photoUrl || raw.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.name)}`,
            videoUrl: raw.videoUrl || raw.video_resume_url || '',
            appliedJobTitle: raw.appliedJobTitle || raw.title || raw.job_profile || 'Candidate',
            experienceYears: raw.experienceYears || raw.experience_years || 0,
            location: raw.location || 'Remote',
            aiScore: raw.aiScore || raw.aiMatchScore || 85,
            skills: Array.isArray(raw.skills)
                ? raw.skills.map((s: any) => typeof s === 'string' ? s : s.skill)
                : [],
            recommendationType: raw.recommendationType || 'applied'
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
            // 'all' - combine applied first, then AI recommended
            pool = [...candidates, ...aiRecommendedCandidates];
        }

        return pool.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus, candidates, aiRecommendedCandidates, activeTab]);

    // Also search AI-recommended when looking for a candidate in profile view
    const normalizedSelectedCandidateSource = useMemo(() => {
        if (!selectedCandidateId) return null;
        return candidates.find(c => c.id === selectedCandidateId) ||
            aiRecommendedCandidates.find(c => c.id === selectedCandidateId) ||
            (mockCandidates.find(c => c.id === selectedCandidateId) as any);
    }, [candidates, aiRecommendedCandidates, selectedCandidateId]);


    if (loading && viewMode === 'JOBS') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-[var(--text-muted)] font-medium">Assembing your pipeline...</p>
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
                            {jobs.map((job) => (
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
                            ))}
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
                                <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">{selectedJob?.title}</h1>
                                <p className="text-[var(--text-muted)] font-bold uppercase text-[10px] tracking-widest">Managing pipeline for {selectedJob?.location}</p>
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

                        {/* AI Recommendation Banner */}
                        {activeTab === 'ai_recommended' && aiRecommendedCandidates.length > 0 && (
                            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                                    <Star size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-[var(--text-main)]">AI-Powered Talent Discovery</h4>
                                    <p className="text-sm text-[var(--text-muted)]">These candidates match your job requirements based on skills, experience, and profile strength. They haven't applied yet—reach out to them!</p>
                                </div>
                            </div>
                        )}

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
                            </div>

                            {/* Middle & Right: Video & Professional History */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Video Resume Panel - ENHANCED */}
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
                                        {/* Always show video - use sample if no URL */}
                                        <video
                                            className="w-full h-full object-cover"
                                            controls
                                            poster={normalizedSelectedCandidate.photoUrl}
                                            preload="metadata"
                                        >
                                            {/* Use candidate's video URL or a sample video */}
                                            <source
                                                src={normalizedSelectedCandidate.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                                                type="video/mp4"
                                            />
                                            Your browser does not support the video tag.
                                        </video>

                                        {/* Video Overlay Info */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xl font-black">Hi, I'm {normalizedSelectedCandidate.name}</p>
                                            <p className="text-white/70 text-sm font-medium">{normalizedSelectedCandidate.appliedJobTitle}</p>
                                        </div>

                                        {/* If no video URL, show overlay message */}
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

                                    {/* AI Analysis Metrics */}
                                    <div className="p-6 bg-gradient-to-r from-gray-50 to-indigo-50/30 grid grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-white rounded-xl border border-[var(--border-subtle)]">
                                            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Confidence</p>
                                            <p className="text-xl font-black text-indigo-600 mt-1">92%</p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-xl border border-[var(--border-subtle)]">
                                            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Communication</p>
                                            <p className="text-xl font-black text-emerald-600 mt-1">A+</p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-xl border border-[var(--border-subtle)]">
                                            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">English</p>
                                            <p className="text-xl font-black text-purple-600 mt-1">Pro</p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-xl border border-[var(--border-subtle)]">
                                            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Body Language</p>
                                            <p className="text-xl font-black text-amber-600 mt-1">88%</p>
                                        </div>
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

                                        {/* Mock Experience Items */}
                                        {[
                                            {
                                                role: normalizedSelectedCandidate.appliedJobTitle || 'Lead Software Engineer',
                                                company: 'Google / Vertex AI',
                                                period: '2021 - Present',
                                                desc: 'Leading a team of 12 engineers in building next-gen AI interfaces and scaling model deployment workflows.'
                                            },
                                            {
                                                role: 'Senior Full Stack Developer',
                                                company: 'Amazon Web Services',
                                                period: '2018 - 2021',
                                                desc: 'Architected high-throughput data processing pipelines for AWS QuickSight using Node.js and React.'
                                            },
                                            {
                                                role: 'Software Engineer',
                                                company: 'StartUp Alpha',
                                                period: '2015 - 2018',
                                                desc: 'Full-stack development of early-stage products, helping scale the user base from 0 to 1M monthly active users.'
                                            }
                                        ].map((exp, idx) => (
                                            <div key={idx} className="flex gap-8 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm shadow-indigo-100">
                                                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                                </div>
                                                <div className="pb-4">
                                                    <h4 className="text-lg font-black text-[var(--text-main)] leading-tight">{exp.role}</h4>
                                                    <p className="text-indigo-600 font-black text-xs uppercase mt-1 tracking-wide">{exp.company} • {exp.period}</p>
                                                    <p className="text-[var(--text-muted)] mt-2 text-sm leading-relaxed font-medium">
                                                        {exp.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
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
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-4 rounded-xl bg-gray-50 border border-[var(--border-subtle)]">
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Master of Science</p>
                                            <p className="text-sm font-black text-[var(--text-main)] mt-1">Computer Science & AI</p>
                                            <p className="text-xs font-bold text-indigo-600 mt-0.5">Stanford University • 2020</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-gray-50 border border-[var(--border-subtle)]">
                                            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">B.Tech</p>
                                            <p className="text-sm font-black text-[var(--text-main)] mt-1">Information Technology</p>
                                            <p className="text-xs font-bold text-indigo-600 mt-0.5">IIT Bombay • 2015</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Candidates;
