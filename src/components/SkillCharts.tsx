import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface SkillData {
    subject: string;
    A: number; // Score
    fullMark: number;
}

interface CategoryData {
    [key: string]: any;
    name: string;
    value: number;
    color: string;
}

interface TopSkillData {
    name: string;
    score: number;
}

interface SkillChartsProps {
    radarData: SkillData[];
    pieData: CategoryData[];
    barData: TopSkillData[];
}

export const SkillRadar: React.FC<{ data: SkillData[] }> = ({ data }) => (
    <div className="p-4 rounded-xl glass border border-white/10 h-full">
        <h3 className="text-lg font-semibold mb-4 text-center text-neon-cyan">Skill Strength Radar</h3>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skill Level"
                        dataKey="A"
                        stroke="#00f3ff"
                        strokeWidth={2}
                        fill="#00f3ff"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                        itemStyle={{ color: '#00f3ff' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const SkillCategories: React.FC<{ data: CategoryData[] }> = ({ data }) => (
    <div className="p-4 rounded-xl glass border border-[var(--glass-border)] h-full">
        <h3 className="text-lg font-semibold mb-4 text-center text-neon-purple">Skill Categories</h3>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-[var(--text-secondary)] text-xs">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const SkillBar: React.FC<{ data: TopSkillData[], title?: string, color?: string }> = ({ data, title = "Top Technical Skills", color = "#ff006e" }) => (
    <div className="p-4 rounded-xl glass border border-[var(--glass-border)] h-full">
        <h3 className={`text-lg font-semibold mb-4 text-center`} style={{ color: color }}>{title}</h3>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: 'var(--glass-border)' }}
                        contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="score" fill={color} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const SkillCharts: React.FC<SkillChartsProps> = ({ radarData, pieData, barData }) => {
    return (
        <div className="space-y-8">
            <SkillRadar data={radarData} />
            <SkillCategories data={pieData} />
            <SkillBar data={barData} />
        </div>
    );
};

export default SkillCharts;
