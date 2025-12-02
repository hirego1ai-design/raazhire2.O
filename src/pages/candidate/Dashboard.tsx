import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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
}

const CandidateDashboard: React.FC = () => {
    const [interviews, setInterviews] = React.useState<Interview[]>([]);
    const [jobs, setJobs] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState([
        { label: 'Profile Completion', value: '0%', icon: TrendingUp, color: 'text-neon-cyan' },
        { label: 'Pending Assessments', value: '0', icon: Clock, color: 'text-neon-purple' },
        { label: 'Jobs Applied', value: '0', icon: CheckCircle, color: 'text-green-400' },
        { label: 'Interviews', value: '0', icon: AlertCircle, color: 'text-neon-pink' },
    ]);

    React.useEffect(() => {
        // Use mock data for testing
        const mockInterviews: Interview[] = [
            {
                id: 1,
                candidateName: 'You',
                role: 'Senior Full Stack Developer',
                date: new Date(Date.now() + 86400000).toISOString(),
                time: '10:00 AM',
                type: 'Technical',
                status: 'Scheduled',
                avatar: 'https://ui-avatars.com/api/?name=You&background=4f46e5&color=fff',
                roundTag: 'Round 1'
            },
            {
                id: 2,
                candidateName: 'You',
                role: 'UI/UX Designer',
                date: new Date(Date.now() + 172800000).toISOString(),
                time: '2:00 PM',
                type: 'HR',
                status: 'Scheduled',
                avatar: 'https://ui-avatars.com/api/?name=You&background=10b981&color=fff',
                roundTag: 'Round 2'
            }
        ];

        const mockJobs = [
            {
                id: 1,
                title: 'Senior Frontend Developer',
                company: 'TechCorp Solutions',
                location: 'Remote'
            },
            {
                id: 2,
                title: 'Full Stack Engineer',
                company: 'InnovateAI Labs',
                location: 'Bangalore, India'
            },
            {
                id: 3,
                title: 'React Developer',
                company: 'StartUp Inc',
                location: 'Mumbai, India'
            }
        ];

        setInterviews(mockInterviews);
        setJobs(mockJobs);
        setStats([
            { label: 'Profile Completion', value: '85%', icon: TrendingUp, color: 'text-neon-cyan' },
            { label: 'Pending Assessments', value: '3', icon: Clock, color: 'text-neon-purple' },
            { label: 'Jobs Applied', value: '12', icon: CheckCircle, color: 'text-green-400' },
            { label: 'Interviews', value: mockInterviews.length.toString(), icon: AlertCircle, color: 'text-neon-pink' },
        ]);
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

            {/* Recommended Jobs */}
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
                        {jobs.length > 0 ? jobs.map((job) => (
                            <div key={job.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-neon-cyan">{job.title}</h4>
                                        <p className="text-sm text-gray-400">{job.company} • {job.location}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-neon-purple/20 text-neon-purple">New</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400">No jobs found.</p>
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
                            <p className="text-sm text-gray-400 mb-3">For Frontend Developer Role at TechCorp</p>
                            <button className="btn-premium">Start Assessment</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CandidateDashboard;
