import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Users, 
    Filter, 
    Target, 
    CheckCircle, 
    Calendar, 
    UserCheck, 
    Search,
    ArrowRight,
    Briefcase,
    MapPin,
    Clock,
    TrendingUp,
    Database,
    RefreshCw,
    Star,
    Eye,
    MessageSquare,
    X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CandidateCard, { type Candidate as CardCandidate } from '../../components/CandidateCard';

interface PipelineStage {
    id: string;
    name: string;
    count: number;
    icon: any;
    color: string;
}

interface JobDetails {
    id: string;
    title: string;
    location: string;
    type: string;
    status: string;
    salary_min: number;
    salary_max: number;
    description: string;
    requirements: string;
    skills: string[];
    created_at: string;
}

type CandidateSource = 'applicants' | 'database';

const JobDetail: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    
    const [job, setJob] = useState<JobDetails | null>(null);
    const [activeSource, setActiveSource] = useState<CandidateSource>('applicants');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSkills, setFilterSkills] = useState<string[]>([]);
    
    // Applicants data
    const [applicants, setApplicants] = useState<CardCandidate[]>([]);
    
    // Database candidates with rotation
    const [dbCandidates, setDbCandidates] = useState<CardCandidate[]>([]);
    const [rotationOffset, setRotationOffset] = useState(0);
    
    // Pipeline stages
    const [pipeline, setPipeline] = useState<PipelineStage[]>([
        { id: 'applied', name: 'Applied', count: 0, icon: Users, color: 'text-blue-400' },
        { id: 'screened', name: 'Screened', count: 0, icon: Filter, color: 'text-purple-400' },
        { id: 'shortlisted', name: 'Shortlisted', count: 0, icon: Target, color: 'text-yellow-400' },
        { id: 'interview_scheduled', name: 'Interview', count: 0, icon: Calendar, color: 'text-green-400' },
        { id: 'hired', name: 'Hired', count: 0, icon: UserCheck, color: 'text-emerald-400' }
    ]);

    // Fetch job details
    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!supabase || !jobId) return;

            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (data) {
                setJob(data as JobDetails);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    // Fetch applicants and pipeline counts
    useEffect(() => {
        const fetchApplicants = async () => {
            if (!supabase || !jobId) return;

            // Fetch all applications for this job
            const { data: applications } = await supabase
                .from('applications')
                .select(`
                    *,
                    candidate:candidates(id, name, email, skills, location, experience_years, phone)
                `)
                .eq('job_id', jobId)
                .order('created_at', { ascending: false });

            if (applications) {
                // Update pipeline counts
                const stageCounts = {
                    applied: applications.filter(a => a.status === 'applied' || a.status === 'pending').length,
                    screened: applications.filter(a => a.status === 'screened').length,
                    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
                    interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
                    hired: applications.filter(a => a.status === 'hired').length
                };

                setPipeline(prev => prev.map(stage => ({
                    ...stage,
                    count: stageCounts[stage.id as keyof typeof stageCounts] || 0
                })));

                // Format applicants
                const formattedApplicants: CardCandidate[] = applications.map((app: any) => ({
                    id: app.candidate?.id,
                    name: app.candidate?.name || 'Unknown',
                    photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(app.candidate?.name || 'User')}&background=random`,
                    videoUrl: '',
                    appliedJobTitle: job?.title || 'Unknown',
                    experienceYears: app.candidate?.experience_years || 0,
                    skills: app.candidate?.skills || [],
                    location: app.candidate?.location || 'Remote',
                    timezone: 'UTC',
                    aiScore: app.score || 0,
                    status: app.status as any,
                    appliedDate: new Date(app.created_at).toLocaleDateString()
                }));

                setApplicants(formattedApplicants);
            }
        };

        fetchApplicants();
    }, [jobId, job?.title]);

    // Fetch database candidates with fair rotation algorithm
    useEffect(() => {
        const fetchDatabaseCandidates = async () => {
            if (!supabase || !job) return;

            // Fair rotation algorithm: Use time-based offset and skill matching
            const currentHour = new Date().getHours();
            const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
            const rotationSeed = (dayOfYear * 24 + currentHour) % 10;

            // Fetch candidates matching job skills
            const { data: allCandidates } = await supabase
                .from('candidates')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100); // Get larger pool for rotation

            if (allCandidates) {
                // Calculate match scores with fair distribution
                const scoredCandidates = allCandidates.map((candidate: any, index: number) => {
                    // Skill match score
                    const candidateSkills = candidate.skills || [];
                    const jobSkills = job.skills || [];
                    const matchingSkills = candidateSkills.filter((skill: string) => 
                        jobSkills.some((js: string) => js.toLowerCase().includes(skill.toLowerCase()))
                    );
                    const skillScore = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 100 : 50;

                    // Experience score
                    const experienceScore = Math.min(100, (candidate.experience_years || 0) * 10);

                    // Rotation fairness score (ensures everyone gets visibility)
                    const rotationBoost = ((index + rotationSeed) % 10) * 5;

                    // Composite score with rotation fairness
                    const compositeScore = Math.round(
                        (skillScore * 0.5) + 
                        (experienceScore * 0.3) + 
                        (rotationBoost * 0.2)
                    );

                    return {
                        ...candidate,
                        matchScore: compositeScore,
                        rotationIndex: (index + rotationSeed) % allCandidates.length
                    };
                });

                // Sort by composite score with rotation
                const sortedCandidates = scoredCandidates.sort((a, b) => {
                    // Mix top performers with rotating candidates
                    const aScore = a.matchScore + (a.rotationIndex % 3 === 0 ? 15 : 0);
                    const bScore = b.matchScore + (b.rotationIndex % 3 === 0 ? 15 : 0);
                    return bScore - aScore;
                });

                // Format for display (take top 20)
                const formattedCandidates: CardCandidate[] = sortedCandidates.slice(0, 20).map((candidate: any) => ({
                    id: candidate.id,
                    name: candidate.name || 'Unknown',
                    photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name || 'User')}&background=random`,
                    videoUrl: '',
                    appliedJobTitle: job.title,
                    experienceYears: candidate.experience_years || 0,
                    skills: candidate.skills || [],
                    location: candidate.location || 'Remote',
                    timezone: 'UTC',
                    aiScore: candidate.matchScore || 0,
                    status: 'pending' as any,
                    isRecommended: true
                }));

                setDbCandidates(formattedCandidates);
                setRotationOffset(rotationSeed);
            }
        };

        if (activeSource === 'database') {
            fetchDatabaseCandidates();
        }
    }, [activeSource, job]);

    // Refresh database candidates (manual rotation)
    const handleRefreshDatabase = () => {
        setRotationOffset(prev => (prev + 1) % 10);
        // Trigger re-fetch by toggling source
        const currentSource = activeSource;
        setActiveSource('applicants');
        setTimeout(() => setActiveSource(currentSource), 100);
    };

    // Filter candidates based on search and skills
    const filteredCandidates = (activeSource === 'applicants' ? applicants : dbCandidates).filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSkills = filterSkills.length === 0 || 
                            filterSkills.some(fs => candidate.skills.some(cs => cs.toLowerCase().includes(fs.toLowerCase())));
        return matchesSearch && matchesSkills;
    });

    const handleShortlist = async (candidateId: string) => {
        console.log('Shortlist candidate', candidateId);
        // TODO: Update application status
    };

    const handleScheduleInterview = async (candidateId: string) => {
        console.log('Schedule interview', candidateId);
        // TODO: Navigate to interview scheduling
    };

    if (!job) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading job details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Job Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg">
                                <Briefcase className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> {job.type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <TrendingUp size={14} /> ${job.salary_min}k - ${job.salary_max}k
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {job.skills?.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded text-xs text-neon-cyan">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/employer/dashboard')}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm text-white"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </motion.div>

            {/* Pipeline Visualization */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="text-neon-purple" size={20} />
                    Hiring Pipeline
                </h2>
                <div className="grid grid-cols-5 gap-4">
                    {pipeline.map((stage, idx) => (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative"
                        >
                            <div className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <stage.icon size={18} className={stage.color} />
                                    {idx < pipeline.length - 1 && (
                                        <ArrowRight size={16} className="text-gray-600 absolute -right-8 top-1/2 -translate-y-1/2" />
                                    )}
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">{stage.count}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">{stage.name}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Candidate Source Toggle */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between"
            >
                <div className="bg-black/40 p-1.5 rounded-full flex items-center border border-white/10">
                    <button
                        onClick={() => setActiveSource('applicants')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                            activeSource === 'applicants'
                                ? 'bg-gradient-to-r from-neon-cyan to-blue-500 text-white shadow-[0_4px_15px_rgba(6,182,212,0.4)]'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Users size={16} /> Applicants ({applicants.length})
                    </button>
                    <button
                        onClick={() => setActiveSource('database')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                            activeSource === 'database'
                                ? 'bg-gradient-to-r from-neon-purple to-purple-600 text-white shadow-[0_4px_15px_rgba(168,85,247,0.4)]'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Database size={16} /> Candidate Database
                    </button>
                </div>

                {activeSource === 'database' && (
                    <button
                        onClick={handleRefreshDatabase}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm text-white"
                    >
                        <RefreshCw size={16} /> Refresh Recommendations
                    </button>
                )}
            </motion.div>

            {/* Info Banner */}
            <AnimatePresence>
                {activeSource === 'database' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border border-neon-purple/30 rounded-xl p-4"
                    >
                        <div className="flex items-start gap-3">
                            <Star className="text-neon-purple mt-0.5" size={20} />
                            <div className="flex-1">
                                <h3 className="text-white font-bold mb-1">Fair Rotation Algorithm Active</h3>
                                <p className="text-sm text-gray-400">
                                    Our algorithm ensures every candidate gets visibility by rotating recommendations 
                                    based on time and skill match. Top performers are balanced with equally qualified candidates 
                                    to give everyone a fair chance. Rotation offset: #{rotationOffset}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or skills..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors text-white"
                    />
                </div>
                <button className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-white">
                    <Filter size={18} /> Filters
                </button>
            </motion.div>

            {/* Candidates Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCandidates.map((candidate, idx) => (
                    <motion.div
                        key={`${activeSource}-${candidate.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <CandidateCard
                            candidate={candidate}
                            onShortlist={handleShortlist}
                            onScheduleInterview={handleScheduleInterview}
                        />
                    </motion.div>
                ))}
                {filteredCandidates.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <Database className="mx-auto mb-4 text-gray-600" size={48} />
                        <p className="text-gray-400">
                            {activeSource === 'applicants' 
                                ? 'No applicants yet for this job.'
                                : 'No matching candidates found in database.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetail;
