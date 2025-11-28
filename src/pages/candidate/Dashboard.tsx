import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import '../../styles/premium-dark-theme.css';
import InterviewCard from '../../components/InterviewCard';
import { supabase } from '../../lib/supabase';

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

const mockInterviews: Interview[] = [
    {
        id: 1,
        candidateName: 'Sarah Johnson',
        role: 'Senior Frontend Developer',
        date: '2024-03-20T10:00:00Z',
        time: '10:00 AM',
        type: 'Video',
        status: 'Scheduled',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        participants: ['HR Alice', 'HR Bob'],
        roundTag: 'Round 1',
    },
    {
        id: 2,
        candidateName: 'Michael Chen',
        role: 'Full Stack Engineer',
        date: '2024-03-21T14:00:00Z',
        time: '2:00 PM',
        type: 'Technical',
        status: 'Scheduled',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        participants: ['HR Carol'],
        roundTag: 'Round 2',
    },
];

const CandidateDashboard: React.FC = () => {
    const [interviews, setInterviews] = React.useState<Interview[]>([]);

    React.useEffect(() => {
        // Initial fetch
        const fetchInterviews = async () => {
            if (supabase) {
                const { data, error } = await supabase
                    .from('interviews')
                    .select('*')
                    .order('date', { ascending: true });

                if (!error && data) {
                    setInterviews(data as Interview[]);
                } else {
                    setInterviews(mockInterviews);
                }
            } else {
                // Fallback to mock data if Supabase is not configured
                setInterviews(mockInterviews);
            }
        };

        fetchInterviews();

        // Real-time subscription
        const channel = supabase?.channel('public:interviews')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setInterviews(prev => [...prev, payload.new as Interview]);
                } else if (payload.eventType === 'UPDATE') {
                    setInterviews(prev => prev.map(i => i.id === payload.new.id ? payload.new as Interview : i));
                } else if (payload.eventType === 'DELETE') {
                    setInterviews(prev => prev.filter(i => i.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            if (channel) {
                supabase?.removeChannel(channel);
            }
        };
    }, []);

    const stats = [
        { label: 'Profile Completion', value: '85%', icon: TrendingUp, color: 'text-neon-cyan' },
        { label: 'Pending Assessments', value: '2', icon: Clock, color: 'text-neon-purple' },
        { label: 'Jobs Applied', value: '12', icon: CheckCircle, color: 'text-green-400' },
        { label: 'Interviews', value: interviews.length.toString(), icon: AlertCircle, color: 'text-neon-pink' },
    ];

    return (
        <div className="space-y-8 bg-black/90 p-6 rounded-2xl glass">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-2xl bg-gradient-to-r from-space-blue to-space-dark border border-white/10"
            >
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, <span className="text-gradient">John Doe</span>! 👋
                </h1>
                <p className="text-gray-400">
                    Your AI-powered career journey is on track. You have 2 pending assessments.
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
                        className="p-6 rounded-xl glass hover:border-neon-cyan/50 transition-colors"
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
                    className="p-6 rounded-xl glass border border-white/10"
                >
                    <h3 className="text-xl font-bold mb-4">Recommended Jobs</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-neon-cyan">Senior React Developer</h4>
                                        <p className="text-sm text-gray-400">TechCorp Inc. • Remote</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-neon-purple/20 text-neon-purple">98% Match</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Upcoming Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-xl glass border border-white/10"
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
