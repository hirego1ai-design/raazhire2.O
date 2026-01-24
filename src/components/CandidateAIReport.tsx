import React from 'react';
import { motion } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Brain, Zap, MessageSquare, Award, CheckCircle, Target, Activity } from 'lucide-react';

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
        { subject: 'Communication', A: data.layer3?.score || 0, fullMark: 100 },
        { subject: 'Knowledge', A: data.layer2?.score || 0, fullMark: 100 },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Score Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="saas-card p-6 relative overflow-hidden flex flex-col justify-center items-center text-center border-2 border-[var(--primary)]"
                >
                    <div className="absolute -top-4 -right-4 p-4 opacity-5">
                        <Brain size={120} className="text-[var(--primary)]" />
                    </div>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-2">Overall Match Score</p>
                    <div className="relative">
                        <span className="text-6xl font-black text-[var(--primary)]">{data.finalScore}</span>
                        <span className="text-sm font-bold text-[var(--text-muted)] absolute -right-8 bottom-2">/100</span>
                    </div>
                    <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold ${data.finalScore > 80 ? 'bg-green-500/10 text-green-600' :
                        data.finalScore > 60 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                        {data.rank} Rank
                    </div>
                </motion.div>

                {/* Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 md:col-span-2 saas-card p-6 h-[280px]"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Target size={18} className="text-[var(--primary)]" />
                        <h3 className="font-bold text-sm">Competency DNA</h3>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="var(--border-subtle)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Score"
                                dataKey="A"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                fill="var(--primary)"
                                fillOpacity={0.15}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-surface)',
                                    borderColor: 'var(--border-subtle)',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* AI Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="saas-card p-6 bg-[var(--primary-light)] border-[var(--primary)]/20"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Activity size={18} className="text-[var(--primary)]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-main)]">AI Executive Insight</h3>
                </div>
                <p className="text-sm text-[var(--text-main)] leading-relaxed italic pr-4">
                    "{data.summary}"
                </p>
            </motion.div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical Analysis */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="saas-card p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">Technical Proficiency</h3>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">Domain & Knowledge Mapping</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-[var(--text-muted)]">Domain Mastery</span>
                                <span className="text-blue-600">{data.layer2?.domainKnowledge}</span>
                            </div>
                            <div className="w-full bg-[var(--bg-page)] rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.layer2?.score}%` }}
                                    className="bg-blue-500 h-2 rounded-full"
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-3">Detected Keywords</h4>
                            <div className="flex flex-wrap gap-1.5 font-bold">
                                {data.layer2?.detectedTerms?.map((term, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] bg-[var(--bg-page)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                                        {term}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <ul className="space-y-2.5">
                            {data.layer2?.details?.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--text-main)] font-medium">
                                    <CheckCircle size={14} className="mt-0.5 text-green-500 shrink-0" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Behavioral Analysis */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="saas-card p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">Behavioral Analysis</h3>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">Soft Skill & Emotional Tone</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)]">
                            <span className="text-xs font-bold text-[var(--text-muted)]">Emotional Aura</span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${data.layer3?.emotionalTone === 'Positive' ? 'bg-green-500/10 text-green-600' :
                                data.layer3?.emotionalTone === 'Negative' ? 'bg-red-500/10 text-red-600' :
                                    'bg-indigo-500/10 text-indigo-600'
                                }`}>
                                {data.layer3?.emotionalTone}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-3">Personality Traits</h4>
                            <div className="flex flex-wrap gap-1.5 font-bold">
                                {data.layer3?.traits?.map((trait, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] bg-[var(--bg-page)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <ul className="space-y-2.5">
                            {data.layer3?.details?.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--text-main)] font-medium">
                                    <Award size={14} className="mt-0.5 text-orange-500 shrink-0" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CandidateAIReport;
