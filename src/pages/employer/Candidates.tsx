// src/pages/employer/Candidates.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Download, Briefcase, Users } from 'lucide-react';
import CandidateCard, { type Candidate as CardCandidate } from '../../components/CandidateCard';
import { mockJobPosts, getCandidatesForJob } from '../../data/mockData';
import { API_BASE_URL } from '../../lib/api';

const Candidates: React.FC = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | CardCandidate['status']>('All');
    const [candidates, setCandidates] = useState<CardCandidate[]>([]);
    const [jobTitle, setJobTitle] = useState<string>('');
    const [totalApplicants, setTotalApplicants] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchCandidates = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('sb-token');
                if (!token) {
                    console.error("No authentication token found.");
                    setLoading(false);
                    return;
                }

                // 1. Fetch Applications (Employer)
                const response = await fetch(`${API_BASE_URL}/api/applications/employer`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch applications');
                const data = await response.json();

                let apps = data.applications || [];

                // 2. Filter by Job ID if present
                if (jobId) {
                    apps = apps.filter((app: any) => app.job_id === jobId);
                    // Set job title from the first application or fetch job details separately if needed
                    if (apps.length > 0 && apps[0].job) {
                        setJobTitle(apps[0].job.title);
                    } else if (apps.length === 0) {
                        // Fetch job details explicitly if no apps yet to show title
                        const jobResponse = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
                        if (jobResponse.ok) {
                            const jobData = await jobResponse.json();
                            setJobTitle(jobData.job?.title || 'Unknown Job');
                        }
                    }
                }

                setTotalApplicants(apps.length);

                // 3. Transform to CandidateCard format
                const formatted: CardCandidate[] = apps.map((app: any) => ({
                    id: app.candidate?.id || app.candidate_id, // This is the candidate_id for navigation
                    applicationId: app.id, // Store application_id for status updates
                    name: app.candidate?.name || 'Applicant',
                    photoUrl: app.candidate?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.candidate?.name || 'User')}&background=random`,
                    videoUrl: app.resume_url || '', // Using resume as placeholder or if video is stored there
                    appliedJobTitle: app.job?.title || 'Unknown Role',
                    experienceYears: 0, // Not in application table, implies fetching profile separately if needed
                    skills: [], // Not in application table
                    location: 'Remote', // Placeholder
                    timezone: 'UTC',
                    aiScore: app.ai_score || 0, // Assuming ai_score exists or 0
                    status: (app.status || 'applied') as CardCandidate['status']
                }));

                setCandidates(formatted);
            } catch (error) {
                console.error("Error loading candidates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [jobId]);

    // Filtered list – memoized for performance
    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchesSearch =
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.appliedJobTitle.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus, candidates]);

    const navigate = useNavigate();

    // Handlers for actions
    const handleShortlist = async (candidateId: string) => {
        try {
            // Find the application ID associated with this candidateId and current jobId
            const candidateToUpdate = candidates.find(c => c.id === candidateId && (jobId ? (c as any).jobId === jobId : true));
            if (!candidateToUpdate || !(candidateToUpdate as any).applicationId) {
                console.error("Application ID not found for candidate:", candidateId);
                alert('Failed to update status: Application ID missing.');
                return;
            }
            const applicationId = (candidateToUpdate as any).applicationId;

            // Optimistic update
            setCandidates(prev => prev.map(c =>
                c.id === candidateId ? { ...c, status: 'shortlisted' as CardCandidate['status'] } : c
            ));

            const token = localStorage.getItem('sb-token');
            if (!token) {
                console.error("No authentication token found.");
                alert('Failed to update status: Authentication required.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'shortlisted' })
            });

            if (!response.ok) throw new Error('Failed to update status');
            console.log('Shortlisted candidate', candidateId, 'Application ID:', applicationId);

        } catch (error) {
            console.error('Error shortlisting:', error);
            alert('Failed to update status');
            // Revert optimistic update if API call fails
            setCandidates(prev => prev.map(c =>
                c.id === candidateId ? { ...c, status: 'applied' as CardCandidate['status'] } : c // Assuming 'applied' was previous status
            ));
        }
    };

    const handleSchedule = (candidateId: string) => {
        // Navigate to interview schedule page
        // candidateId is the candidate's profile ID, which InterviewSchedule.tsx expects.
        navigate(`/employer/interview-schedule/${candidateId}${jobId ? `?jobId=${jobId}` : ''}`);
    };

    return (
        <div className="space-y-8">
            {/* Job-Specific Banner */}
            {jobId && jobTitle && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-pink-500/10 border border-neon-cyan/30 rounded-2xl p-6 shadow-lg"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center shadow-lg">
                                <Briefcase size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{jobTitle}</h2>
                                <p className="text-gray-400 text-sm">Viewing candidates for this approved job post</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 flex items-center gap-2">
                                <Users size={16} className="text-green-400" />
                                <span className="text-white font-semibold">{totalApplicants} Applicants</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white">
                        {jobId ? 'Job Candidates' : 'All Candidates'}
                    </h1>
                    <p className="text-gray-400">
                        {jobId
                            ? 'Review and manage candidates who applied for this job post'
                            : 'Manage and track your candidate pipeline across all jobs'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-3d btn-secondary flex items-center gap-1.5">
                        <Download size={14} /> Export
                    </button>
                    {!jobId && (
                        <button className="btn-3d btn-primary flex items-center gap-1.5">
                            <Plus size={14} /> Add Candidate
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Search & Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or job title..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors text-white"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-3 text-gray-500" size={18} />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors appearance-none text-white"
                    >
                        <option value="All">All Status</option>
                        <option value="applied">Applied</option>
                        <option value="screened">Screened</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="hired">Hired</option>
                    </select>
                </div>
            </motion.div>

            {/* Candidate Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCandidates.map((candidate, idx) => (
                    <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                    >
                        <CandidateCard
                            candidate={candidate}
                            onShortlist={handleShortlist}
                            onScheduleInterview={handleSchedule}
                        />
                    </motion.div>
                ))}
                {filteredCandidates.length === 0 && (
                    <div className="text-center col-span-full py-12">
                        <div className="mx-auto w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                            <Users size={40} className="text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-lg mb-2">
                            {jobId
                                ? 'No candidates have applied for this job post yet'
                                : 'No candidates match your criteria'}
                        </p>
                        <p className="text-gray-500 text-sm">
                            {jobId
                                ? 'Candidates will appear here once they apply for this position'
                                : 'Try adjusting your search or filter options'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Candidates;
