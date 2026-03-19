import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, MapPin, Briefcase, ArrowRight, Users, ChevronRight, Brain, ShieldAlert, RefreshCw } from 'lucide-react';
import { endpoints, API_BASE_URL, getAuthHeaders } from '../../lib/api';
import InterviewCard from '../../components/InterviewCard';

interface Interview {
    id: number;
    candidateName: string;
    role: string;
    date: string; // ISO string
    time: string;
    type: 'Video' | 'Technical' | 'HR';
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    avatar: string;
    participants?: string[];
    roundTag?: string;
    jobTitle?: string;
    company?: string;
}

const CandidateDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = React.useState<any[]>([]);
    const [recommendedJobs, setRecommendedJobs] = React.useState<any[]>([]);
    const [fraudAlert, setFraudAlert] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [stats, setStats] = useState([
        { label: 'Profile Completion', value: '0%', icon: TrendingUp, color: 'text-neon-cyan' },
        { label: 'AI Score', value: 'N/A', icon: Brain, color: 'text-neon-purple' },
        { label: 'Jobs Applied', value: '0', icon: CheckCircle, color: 'text-green-400' },
        { label: 'Interviews', value: '0', icon: AlertCircle, color: 'text-neon-pink' },
    ]);

    React.useEffect(() => {
        // SECURITY: Authentication check
        const token = localStorage.getItem('sb-token');
        const userStr = localStorage.getItem('sb-user');
        
        if (!token || !userStr) {
            console.warn('[Candidate Dashboard] No authentication found, redirecting to signin');
            navigate('/signin', { replace: true });
            return;
        }

        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Fetch candidate stats
                const statsResponse = await fetch(endpoints.candidate.stats, {
                    headers: getAuthHeaders()
                });
                
                if (!statsResponse.ok) {
                    if (statsResponse.status === 401 || statsResponse.status === 403) {
                        throw new Error('Authentication failed');
                    }
                }
                
                const statsData = await statsResponse.json();

                // Fetch interviews
                const interviewsResponse = await fetch(endpoints.interviews.candidate, {
                    headers: getAuthHeaders()
                });
                const interviewsData = await interviewsResponse.json();

                if (statsData.success) {
                    const s = statsData.stats;
                    setStats(prev => {
                        const newStats = [...prev];
                        const jobsAppliedIndex = newStats.findIndex(stat => stat.label === 'Jobs Applied');
                        const interviewsIndex = newStats.findIndex(stat => stat.label === 'Interviews');
                        
                        if (jobsAppliedIndex >= 0) newStats[jobsAppliedIndex].value = (s.totalApplications || 0).toString();
                        if (interviewsIndex >= 0) newStats[interviewsIndex].value = (s.interviewsScheduled || 0).toString();
                        
                        return newStats;
                    });
                }

                // Fetch real profile data for AI scores
                const profileResponse = await fetch(endpoints.profile, { headers: getAuthHeaders() });
                const profileData = await profileResponse.json();

                if (profileData.success && profileData.user) {
                    const p = profileData.user;
                    setStats(prev => {
                        const newStats = [...prev];
                        const completionIndex = newStats.findIndex(stat => stat.label === 'Profile Completion');
                        const aiScoreIndex = newStats.findIndex(stat => stat.label === 'AI Score');
                        
                        if (completionIndex >= 0) newStats[completionIndex].value = `${p.profile_completeness_score || 0}%`;
                        if (aiScoreIndex >= 0) newStats[aiScoreIndex].value = p.ai_overall_score ? `${p.ai_overall_score}/100` : 'N/A';
                        
                        return newStats;
                    });
                    
                    if (p.fraud_detection_flag) {
                        setFraudAlert(true);
                    } else {
                        setFraudAlert(false);
                    }
                }

                if (interviewsData.success && interviewsData.interviews && interviewsData.interviews.length > 0) {
                    setInterviews(interviewsData.interviews);
                }

                // Fetch recommended jobs with null safety
                const jobsResponse = await fetch(endpoints.jobs);
                const jobsData = await jobsResponse.json();
                if (jobsData.success && jobsData.jobs) {
                    setRecommendedJobs(jobsData.jobs.slice(0, 3).map((job: any) => ({
                        id: job.id,
                        title: job.title,
                        company: job.employer?.name || 'Top Company',
                        location: job.location,
                        salary: job.salary_min && job.salary_max ? `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k` : 'Competitive',
                        match: job.ai_match_percentage || 85
                    })));
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard';
                setError(errorMessage);
                
                // Redirect on auth errors
                if (errorMessage.includes('Authentication')) {
                    navigate('/signin', { replace: true });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    return (
        <div className="space-y-8 bg-space-dark p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
            {/* Error Banner */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center justify-between"
                >
                    <div className="flex items-start space-x-3">
                        <ShieldAlert className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-500">Error Loading Dashboard</h3>
                            <p className="text-sm text-red-200/70">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <RefreshCw size={14} /> Retry
                    </button>
                </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading your dashboard...</p>
                    </div>
                </div>
            )}

            {!isLoading && (
                <>
                    {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-2xl bg-gradient-to-r from-space-blue to-space-dark border border-white/10"
            >
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back! 👋
                </h1>
                <p className="text-gray-400">
                    Your AI-powered career journey is on track.
                </p>
            </motion.div>

            {/* Fraud Alert Banner */}
            {fraudAlert && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start space-x-4"
                >
                    <ShieldAlert className="text-red-500 shrink-0" />
                    <div>
                        <h3 className="font-bold text-red-500">Account Flagged for Review</h3>
                        <p className="text-sm text-red-200/70">
                            Our AI security system has detected potential inconsistencies in your profile or activity.
                            Your account is under review. This may affect your visibility to employers.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-neon-cyan/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Upcoming Interviews */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {interviews.length > 0 ? (
                        interviews.map((interview) => (
                            <InterviewCard key={interview.id} interview={interview} />
                        ))
                    ) : (
                        <p className="text-gray-400">No upcoming interviews scheduled.</p>
                    )}
                </div>
            </div>

            {/* Recommendations & Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recommended Jobs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-4">Recommended Jobs</h3>
                    <div className="space-y-4">
                        {recommendedJobs.length > 0 ? recommendedJobs.map((job) => (
                            <div key={job.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-neon-cyan">{job.title}</h4>
                                        <p className="text-sm text-gray-400">{job.location} • {job.salary}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-neon-purple/20 text-neon-purple">{job.match}% Match</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400">No recommended jobs found.</p>
                        )}
                    </div>
                </motion.div>

                {/* Upcoming Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-4">Upcoming Actions</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-neon-purple/30 bg-neon-purple/5">
                            <h4 className="font-semibold text-white">Complete Video Assessment</h4>
                            <p className="text-sm text-gray-400 mb-3">Keep your profile updated for better reach.</p>
                            <button className="btn-premium">Start Assessment</button>
                        </div>
                    </div>
                </motion.div>
            </div>
                </>
            )}
        </div>
    );
};

export default CandidateDashboard;
