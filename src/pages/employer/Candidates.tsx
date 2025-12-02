// src/pages/employer/Candidates.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Download, Briefcase, Users } from 'lucide-react';
import CandidateCard, { type Candidate as CardCandidate } from '../../components/CandidateCard';
import { mockJobPosts, getCandidatesForJob } from '../../data/mockData';

const Candidates: React.FC = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | CardCandidate['status']>('All');
    const [candidates, setCandidates] = useState<CardCandidate[]>([]);
    const [jobTitle, setJobTitle] = useState<string>('');
    const [totalApplicants, setTotalApplicants] = useState<number>(0);

    React.useEffect(() => {
        const fetchCandidates = async () => {
            // Use mock data for demonstration
            let candidatesData;
            
            if (jobId) {
                // Get candidates for specific job
                candidatesData = getCandidatesForJob(jobId);
                const job = mockJobPosts.find(j => j.id === jobId);
                if (job) {
                    setJobTitle(job.title);
                }
                setTotalApplicants(candidatesData.length);
            } else {
                // Get all candidates with application data
                candidatesData = getCandidatesForJob('job_001'); // Show sample data
            }
            
            const formattedCandidates: CardCandidate[] = candidatesData
                .filter(c => c.id) // Filter out any undefined candidates
                .map(c => ({
                    id: c.id || '',
                    name: c.name || 'Unknown',
                    photoUrl: c.profile_photo || `https://ui-avatars.com/api/?name=${c.name || 'User'}&background=random`,
                    videoUrl: c.video_resume_url || '',
                    appliedJobTitle: (c as any).appliedAt ? 'Applied' : 'Available',
                    experienceYears: c.experience_years || 0,
                    skills: c.skills?.map(s => s.skill) || [],
                    location: c.location || 'Remote',
                    timezone: 'IST',
                    aiScore: (c as any).applicationScore || 85,
                    status: ((c as any).applicationStatus || 'applied') as CardCandidate['status']
                }));
            
            setCandidates(formattedCandidates);
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
    const handleShortlist = (id: string) => {
        // Update candidate status to shortlisted
        setCandidates(prev => prev.map(c => 
            c.id === id ? { ...c, status: 'shortlisted' as CardCandidate['status'] } : c
        ));
        console.log('Shortlisted candidate', id);
    };
    
    const handleSchedule = (id: string) => {
        // Navigate to interview schedule page
        navigate(`/employer/interview-schedule/${id}`);
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
