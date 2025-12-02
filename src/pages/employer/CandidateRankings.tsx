import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../lib/api';

interface RankedCandidate {
    candidate_id: string;
    candidate_name: string;
    candidate_email: string;
    rank_position: number;
    composite_score: number;
    percentile: number;
    skill_match_score: number;
    interview_score: number;
    feedback_score: number;
    last_updated: string;
}

export default function CandidateRankings() {
    const { jobId } = useParams();
    const [rankings, setRankings] = useState<RankedCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/rankings/${jobId}`);
            const data = await response.json();

            if (data.success) {
                // Transform data to match interface if needed (depends on join query structure)
                const formattedRankings = data.rankings.map((r: any) => ({
                    ...r,
                    candidate_name: r.candidate_evaluations?.candidate_name || 'Unknown',
                    candidate_email: r.candidate_evaluations?.candidate_email || ''
                }));
                setRankings(formattedRankings);
                setLastUpdated(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error('Failed to fetch rankings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (jobId) {
            fetchRankings();
            // Poll for updates every 30 seconds
            const interval = setInterval(fetchRankings, 30000);
            return () => clearInterval(interval);
        }
    }, [jobId]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        Real-Time Candidate Rankings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        AI-driven ranking based on skills, interviews, and feedback
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        Last updated: {lastUpdated || 'Never'}
                    </span>
                    <button
                        onClick={fetchRankings}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Candidates"
                    value={rankings.length}
                    icon={<Users className="text-blue-500" />}
                />
                <StatCard
                    title="Top Score"
                    value={rankings.length > 0 ? `${rankings[0].composite_score}%` : 'N/A'}
                    icon={<Trophy className="text-yellow-500" />}
                />
                <StatCard
                    title="Avg. Score"
                    value={rankings.length > 0 ? `${Math.round(rankings.reduce((acc, curr) => acc + curr.composite_score, 0) / rankings.length)}%` : 'N/A'}
                    icon={<TrendingUp className="text-green-500" />}
                />
            </div>

            {/* Rankings List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Rank</th>
                                <th className="px-6 py-4 font-medium">Candidate</th>
                                <th className="px-6 py-4 font-medium">Composite Score</th>
                                <th className="px-6 py-4 font-medium">Percentile</th>
                                <th className="px-6 py-4 font-medium">Breakdown</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {rankings.map((candidate, index) => (
                                <motion.tr
                                    key={candidate.candidate_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-50 text-blue-600'}
                    `}>
                                            {candidate.rank_position}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {candidate.candidate_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {candidate.candidate_email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {candidate.composite_score}
                                            </span>
                                            <span className="text-xs text-gray-400">/ 100</span>
                                        </div>
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full"
                                                style={{ width: `${candidate.composite_score}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Top {100 - Math.floor(candidate.percentile)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 text-xs">
                                            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                Skill: {candidate.skill_match_score}
                                            </div>
                                            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                Int: {candidate.interview_score}
                                            </div>
                                            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                Feed: {candidate.feedback_score}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {index < 3 ? (
                                            <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                                                <ArrowUp size={14} /> Recommended
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-sm">Considering</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {rankings.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500">
                            No rankings available yet. Complete interviews to generate data.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {icon}
            </div>
            <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            </div>
        </div>
    );
}
