import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area
} from 'recharts';
import { Activity, Users, Brain, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

interface PerformanceSummary {
    period: { start: string, end: string, days: number };
    hiring: { avgSuccessRate: number, avgInterviewToSelection: number, totalHires: number };
    accuracy: { currentAccuracy: number, improvement: number };
    costs: { totalCost: number, avgDailyCost: number };
    feedback: { avgSubmissionRate: number, avgRating: number };
}

interface DailyMetric {
    metric_date: string;
    hiring_success_rate: number;
    model_accuracy: number;
    estimated_cost: number;
    feedback_submission_rate: number;
}

export default function PerformanceAnalytics() {
    const [summary, setSummary] = useState<PerformanceSummary | null>(null);
    const [metrics, setMetrics] = useState<DailyMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Summary
            const summaryRes = await fetch(`${API_BASE_URL}/api/ai/analytics/summary`);
            const summaryData = await summaryRes.json();

            if (summaryData.success) {
                setSummary(summaryData.summary);
            }

            // Fetch Charts Data (Last 30 Days)
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const metricsRes = await fetch(`${API_BASE_URL}/api/ai/analytics/metrics?startDate=${startDate}&endDate=${endDate}`);
            const metricsData = await metricsRes.json();

            if (metricsData.success) {
                setMetrics(metricsData.metrics);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading analytics...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-blue-600" />
                        System Performance Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Monitoring AI accuracy, hiring success, and operational costs
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Hiring Success Rate"
                    value={`${summary?.hiring.avgSuccessRate || 0}%`}
                    trend="+2.5%"
                    icon={<Users className="text-green-500" />}
                />
                <MetricCard
                    title="Model Accuracy"
                    value={`${summary?.accuracy.currentAccuracy || 0}%`}
                    trend={`+${summary?.accuracy.improvement || 0}%`}
                    icon={<Brain className="text-purple-500" />}
                />
                <MetricCard
                    title="Total Cost (30d)"
                    value={`$${summary?.costs.totalCost.toFixed(2) || '0.00'}`}
                    subtext={`Avg: $${summary?.costs.avgDailyCost.toFixed(2)}/day`}
                    icon={<DollarSign className="text-yellow-500" />}
                />
                <MetricCard
                    title="Feedback Rate"
                    value={`${summary?.feedback.avgSubmissionRate || 0}%`}
                    subtext={`Avg Rating: ${summary?.feedback.avgRating || 0}/5`}
                    icon={<TrendingUp className="text-blue-500" />}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Model Accuracy Trend */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white">
                        AI Model Accuracy Improvement
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics}>
                                <defs>
                                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="metric_date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                                <YAxis domain={[60, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="model_accuracy"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorAccuracy)"
                                    name="Accuracy %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hiring Success vs Feedback */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white">
                        Hiring Success vs. Feedback Rate
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="metric_date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="hiring_success_rate"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Success Rate %"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="feedback_submission_rate"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Feedback Rate %"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cost Analysis */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white">
                        Operational Cost Analysis (Daily)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="metric_date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                                <YAxis tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                                />
                                <Bar dataKey="estimated_cost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Est. Cost" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

function MetricCard({ title, value, trend, subtext, icon }: {
    title: string, value: string, trend?: string, subtext?: string, icon: React.ReactNode
}) {
    return (
        <div className="bg-white dark:bg-gray-800 p6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
            {subtext && (
                <div className="text-xs text-gray-400 mt-2">{subtext}</div>
            )}
        </div>
    );
}
