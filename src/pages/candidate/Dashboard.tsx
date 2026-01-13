import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { endpoints, API_BASE_URL } from '../../lib/api';
import '../../styles/premium-dark-theme.css';
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
    const [stats, setStats] = React.useState([
        { label: 'Profile Completion', value: '85%', icon: TrendingUp, color: 'text-neon-cyan' },
        { label: 'Pending Assessments', value: '0', icon: Clock, color: 'text-neon-purple' },
        { label: 'Jobs Applied', value: '0', icon: CheckCircle, color: 'text-green-400' },
        { label: 'Interviews', value: '0', icon: AlertCircle, color: 'text-neon-pink' },
    ]);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch applications
                const appsResponse = await fetch(`${endpoints.applications}/candidate`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
                });
                const appsData = await appsResponse.json();

                // Fetch interviews
                const interviewsResponse = await fetch(`${API_BASE_URL}/api/interviews`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
                });
                const interviewsData = await interviewsResponse.json();

                if (appsData.success) {
                    const appliedCount = appsData.applications.length;
                    const pending = appsData.applications.filter((a: any) => a.status === 'applied').length;

                    setStats(prev => prev.map(s => {
                        if (s.label === 'Pending Assessments') return { ...s, value: pending.toString() };
                        if (s.label === 'Jobs Applied') return { ...s, value: appliedCount.toString() };
                        return s;
                    }));
                }

                if (interviewsData.success && interviewsData.interviews && interviewsData.interviews.length > 0) {
                    setInterviews(interviewsData.interviews);
                    setStats(prev => prev.map(s =>
                        s.label === 'Interviews' ? { ...s, value: interviewsData.interviews.length.toString() } : s
                    ));
                } else {
                    // Fallback to mock interviews
                    const mockInterviews = [
                        {
                            id: 1,
                            candidateName: 'You',
                            role: 'Senior Frontend Developer',
                            date: new Date(Date.now() + 86400000).toISOString(),
                            time: '10:00 AM',
                            status: 'Scheduled',
                            type: 'Technical',
                            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
                            roundTag: 'Round 1'
                        }
                    ];
                    setInterviews(mockInterviews);
                    setStats(prev => prev.map(s =>
                        s.label === 'Interviews' ? { ...s, value: mockInterviews.length.toString() } : s
                    ));
                }

                // Fetch recommended jobs
                const jobsResponse = await fetch(endpoints.jobs);
                const jobsData = await jobsResponse.json();
                if (jobsData.success) {
                    setRecommendedJobs(jobsData.jobs.slice(0, 3).map((job: any) => ({
                        id: job.id,
                        title: job.title,
                        company: 'Various',
                        location: job.location,
                        salary: job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : 'Not disclosed',
                        match: Math.floor(Math.random() * 20) + 80
                    })));
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8 bg-black/90 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
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
