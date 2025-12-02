import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp, CheckCircle, Award, Star, Brain,
    Mic, Eye, Clock, BarChart3, Home
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

const AssessmentResult: React.FC = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            // Fetch latest assessment result
            const { data } = await supabase
                .from('assessment_results')
                .select('*')
                .eq('user_id', user.id)
                .eq('job_id', jobId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setResult({
                    overallScore: data.score || 85,
                    communication: data.communication_score || 88,
                    knowledge: data.knowledge_score || 82,
                    confidence: data.confidence_score || 90,
                    clarity: data.clarity_score || 86,
                    professionalism: data.professionalism_score || 92,
                    completedAt: data.completed_at,
                    feedback: data.ai_feedback || 'Excellent performance! You demonstrated strong communication skills and technical knowledge.'
                });
            } else {
                // Mock data for demo
                setResult({
                    overallScore: 85,
                    communication: 88,
                    knowledge: 82,
                    confidence: 90,
                    clarity: 86,
                    professionalism: 92,
                    completedAt: new Date().toISOString(),
                    feedback: 'Excellent performance! You demonstrated strong communication skills and technical knowledge.'
                });
            }

            setLoading(false);
        };

        fetchResult();
    }, [jobId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-neon-cyan mx-auto mb-4" />
                    <p className="text-gray-400">Loading your results...</p>
                </div>
            </div>
        );
    }

    const pieData = [
        { name: 'Communication', value: result.communication, color: '#00f3ff' },
        { name: 'Knowledge', value: result.knowledge, color: '#bc13fe' },
        { name: 'Confidence', value: result.confidence, color: '#ff006e' },
    ];

    const radarData = [
        { subject: 'Communication', A: result.communication, fullMark: 100 },
        { subject: 'Knowledge', A: result.knowledge, fullMark: 100 },
        { subject: 'Confidence', A: result.confidence, fullMark: 100 },
        { subject: 'Clarity', A: result.clarity, fullMark: 100 },
        { subject: 'Professional', A: result.professionalism, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen bg-[#0a0e27] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-block p-4 rounded-full bg-green-500/20 mb-4">
                        <CheckCircle className="text-green-400" size={64} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Assessment Complete!</h1>
                    <p className="text-gray-400 text-lg">Your results have been saved to your profile</p>
                </motion.div>

                {/* Overall Score */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 p-8 rounded-xl glass border border-neon-cyan/30 text-center"
                >
                    <h2 className="text-xl mb-4 text-gray-400">Overall Score</h2>
                    <div className="text-7xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                        {result.overallScore}%
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                        <Award className="text-green-400" size={20} />
                        <span className="text-green-400 font-bold">Excellent Performance</span>
                    </div>
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Radar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <BarChart3 className="text-neon-purple" size={24} />
                            Skill Breakdown
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#ffffff20" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                                    <Radar name="Score" dataKey="A" stroke="#00f3ff" fill="#00f3ff" fillOpacity={0.6} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#00f3ff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="text-neon-cyan" size={24} />
                            Score Distribution
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {pieData.map((item, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                                    <div className="text-xs text-gray-400">{item.name}</div>
                                    <div className="text-lg font-bold" style={{ color: item.color }}>{item.value}%</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Detailed Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
                >
                    <MetricCard icon={<Mic />} label="Communication" value={result.communication} color="text-blue-400" />
                    <MetricCard icon={<Brain />} label="Knowledge" value={result.knowledge} color="text-purple-400" />
                    <MetricCard icon={<Star />} label="Confidence" value={result.confidence} color="text-pink-400" />
                    <MetricCard icon={<Eye />} label="Clarity" value={result.clarity} color="text-cyan-400" />
                    <MetricCard icon={<Award />} label="Professional" value={result.professionalism} color="text-green-400" />
                    <MetricCard icon={<Clock />} label="Completion" value={100} color="text-yellow-400" />
                </motion.div>

                {/* AI Feedback */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 rounded-xl glass border border-white/10 mb-8"
                >
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Brain className="text-neon-purple" size={24} />
                        AI Feedback
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{result.feedback}</p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <Link to="/candidate/profile" className="btn-3d btn-primary px-8 py-3 flex items-center gap-2">
                        <Eye size={20} />
                        View in Profile
                    </Link>
                    <Link to="/candidate/jobs" className="btn-3d btn-ghost px-8 py-3 flex items-center gap-2">
                        <Home size={20} />
                        Browse Jobs
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
    <div className="p-4 rounded-xl glass border border-white/10">
        <div className={`mb-2 ${color}`}>{icon}</div>
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <div className="text-2xl font-bold">{value}%</div>
    </div>
);

export default AssessmentResult;
