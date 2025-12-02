import React from 'react';
import { motion } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { Brain, Zap, MessageSquare, Award, CheckCircle, AlertTriangle } from 'lucide-react';

interface AIReportProps {
    data: {
        finalScore: number;
        rank: string;
        summary: string;
        layer1: {
            score: number;
            details: string[];
        };
        layer2: {
            score: number;
            detectedTerms: string[];
            domainKnowledge: string;
            details: string[];
        };
        layer3: {
            score: number;
            traits: string[];
            emotionalTone: string;
            details: string[];
        };
    };
}

const CandidateAIReport: React.FC<AIReportProps> = ({ data }) => {
    if (!data) return null;

    const radarData = [
        { subject: 'Screening', A: data.layer1?.score || 0, fullMark: 100 },
        { subject: 'Technical', A: data.layer2?.score || 0, fullMark: 100 },
        { subject: 'Behavioral', A: data.layer3?.score || 0, fullMark: 100 },
        { subject: 'Communication', A: data.layer3?.score || 0, fullMark: 100 }, // Proxy
        { subject: 'Knowledge', A: data.layer2?.score || 0, fullMark: 100 },   // Proxy
    ];

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Score Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-1 p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-neon-cyan/30 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Brain size={100} className="text-neon-cyan" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">AI Composite Score</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-6xl font-bold text-white">{data.finalScore}</span>
                        <span className="text-xl text-gray-500 mb-2">/100</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${data.finalScore > 80 ? 'bg-green-500/20 text-green-400' :
                                data.finalScore > 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {data.rank}
                        </div>
                        <span className="text-xs text-gray-400">Rank among candidates</span>
                    </div>
                </motion.div>

                {/* Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 h-[250px]"
                >
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Candidate DNA Analysis</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Candidate"
                                dataKey="A"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fill="#06b6d4"
                                fillOpacity={0.3}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F3F4F6' }}
                                itemStyle={{ color: '#06b6d4' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical Analysis */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-neon-purple/20 text-neon-purple">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Technical Proficiency</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Domain Knowledge</span>
                                <span className="text-neon-purple font-medium">{data.layer2?.domainKnowledge}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-neon-purple h-2 rounded-full"
                                    style={{ width: `${data.layer2?.score}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-black/20 p-3 rounded-lg">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Detected Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.layer2?.detectedTerms?.map((term, i) => (
                                    <span key={i} className="px-2 py-1 rounded text-xs bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                                        {term}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {data.layer2?.details?.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                    <CheckCircle size={14} className="mt-1 text-green-400 shrink-0" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Behavioral Analysis */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-neon-pink/20 text-neon-pink">
                            <MessageSquare size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Behavioral & Soft Skills</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-sm text-gray-400">Emotional Tone</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.layer3?.emotionalTone === 'Positive' ? 'bg-green-500/20 text-green-400' :
                                    data.layer3?.emotionalTone === 'Negative' ? 'bg-red-500/20 text-red-400' :
                                        'bg-blue-500/20 text-blue-400'
                                }`}>
                                {data.layer3?.emotionalTone}
                            </span>
                        </div>

                        <div className="bg-black/20 p-3 rounded-lg">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Personality Traits</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.layer3?.traits?.map((trait, i) => (
                                    <span key={i} className="px-2 py-1 rounded text-xs bg-neon-pink/10 text-neon-pink border border-neon-pink/20">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {data.layer3?.details?.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                    <Award size={14} className="mt-1 text-yellow-400 shrink-0" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>

            {/* AI Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-xl bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 border border-white/10"
            >
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Executive Summary</h3>
                <p className="text-gray-200 leading-relaxed">
                    {data.summary}
                </p>
            </motion.div>
        </div>
    );
};

export default CandidateAIReport;
