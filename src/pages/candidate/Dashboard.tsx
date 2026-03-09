import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, MapPin, Briefcase, ArrowRight, Users, ChevronRight, Brain, ShieldAlert } from 'lucide-react';
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
    const [interviews, setInterviews] = React.useState<any[]>([]);
    const [recommendedJobs, setRecommendedJobs] = React.useState<any[]>([]);
    const [fraudAlert, setFraudAlert] = React.useState(false);
    const [stats, setStats] = React.useState([
        { label: 'Profile Completion', value: '0%', icon: TrendingUp, color: 'text-neon-cyan' },
        { label: 'AI Score', value: 'N/A', icon: Brain, color: 'text-neon-purple' },
        { label: 'Jobs Applied', value: '0', icon: CheckCircle, color: 'text-green-400' },
        { label: 'Interviews', value: '0', icon: AlertCircle, color: 'text-neon-pink' },
    ]);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch candidate stats
                const statsResponse = await fetch(endpoints.candidate.stats, {
                    headers: getAuthHeaders()
                });
                const statsData = await statsResponse.json();

                // Fetch interviews
                const interviewsResponse = await fetch(endpoints.interviews.candidate, {
                    headers: getAuthHeaders()
                });
                const interviewsData = await interviewsResponse.json();

                if (statsData.success) {
                    const s = statsData.stats;
                    setStats(prev => prev.map(stat => {
                        if (stat.label === 'Jobs Applied') return { ...stat, value: (s.totalApplications || 0).toString() };
                        if (stat.label === 'Interviews') return { ...stat, value: (s.interviewsScheduled || 0).toString() };
                        return stat;
                    }));
                }

                // Fetch real profile data for AI scores
                const profileResponse = await fetch(endpoints.profile, { headers: getAuthHeaders() });
                const profileData = await profileResponse.json();

                if (profileData.success && profileData.user) {
                    const p = profileData.user;
                    setStats(prev => prev.map(stat => {
                        if (stat.label === 'Profile Completion') return { ...stat, value: `${p.profile_completeness_score || 0}%` };
                        if (stat.label === 'AI Score') return { ...stat, value: p.ai_overall_score ? `${p.ai_overall_score}/100` : 'N/A' };
                        return stat;
                    }));
                    if (p.fraud_detection_flag) setFraudAlert(true);
                }

                if (interviewsData.success && interviewsData.interviews && interviewsData.interviews.length > 0) {
                    setInterviews(interviewsData.interviews);
                }

                // Fetch recommended jobs
                const jobsResponse = await fetch(endpoints.jobs);
                const jobsData = await jobsResponse.json();
                if (jobsData.success) {
                    setRecommendedJobs(jobsData.jobs.slice(0, 3).map((job: any) => ({
                        id: job.id,
                        title: job.title,
                        company: job.employer?.name || 'Top Company',
                        location: job.location,
                        salary: job.salary_min && job.salary_max ? `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k` : 'Competitive',
                        match: job.ai_match_percentage || 0 // Use real score if available
                    })));
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8 bg-space-dark p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
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
        </div>
    );
};

export default CandidateDashboard;
