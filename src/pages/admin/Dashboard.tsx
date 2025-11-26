import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Server, Activity, Cpu, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import '../../styles/premium-dark-theme.css';

const AdminDashboard: React.FC = () => {
    const stats = [
        { label: 'Total Revenue', value: '$124,500', icon: DollarSign, color: 'text-green-400' },
        { label: 'Credits Sold', value: '45,000', icon: Wallet, color: 'text-yellow-400' },
        { label: 'Total Users', value: '5,432', icon: Users, color: 'text-neon-cyan' },
        { label: 'Active Jobs', value: '890', icon: Briefcase, color: 'text-neon-purple' },
    ];

    const aiServices = [
        { name: 'Gemini Pro', status: 'Active', latency: '120ms', usage: '45%' },
        { name: 'OpenAI GPT-4', status: 'Active', latency: '250ms', usage: '30%' },
        { name: 'Claude 3', status: 'Standby', latency: '-', usage: '0%' },
        { name: 'DeepSeek', status: 'Active', latency: '180ms', usage: '25%' },
    ];

    return (
        <div className="space-y-8 bg-black/90 p-6 rounded-2xl glass">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">System Overview</h1>
                    <p className="text-gray-400">Key metrics and AI service health.</p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-xl glass hover:border-neon-pink/50 transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 blur-2xl ${stat.color.replace('text-', 'bg-')}`} />
                    </motion.div>
                ))}
            </div>

            {/* Revenue Chart Placeholder */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 p-6 rounded-xl glass border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={24} /> Revenue Trend
                    </h3>
                    <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-400">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
                {/* Simple bar chart mock */}
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="w-full bg-white/5 rounded-t-lg relative group">
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500/20 to-green-400/50 rounded-t-lg transition-all duration-500 group-hover:from-green-500/30 group-hover:to-green-400/60" style={{ height: `${h}%` }} />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-green-400">{h * 100}</div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500 px-4">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </motion.div>

            {/* Recent System Logs */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-xl glass border border-white/10">
                <h3 className="text-xl font-bold mb-6">Recent System Logs</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="p-3 rounded-lg bg-white/5 text-sm font-mono border-l-2 border-neon-cyan/50 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>2025-11-19</span><span>21:45:0{i}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-neon-cyan font-bold">INFO</span>
                                <span className="text-gray-300 truncate">Processed video assessment #{1230 + i}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* AI Service Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-xl glass border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Cpu className="text-neon-pink" size={24} /> AI Service Status
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aiServices.map((svc, i) => (
                        <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-lg">{svc.name}</span>
                                <div className={`w-2 h-2 rounded-full ${svc.status === 'Active' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)' : 'bg-yellow-400'}`} />
                            </div>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex justify-between"><span>Status</span><span className={svc.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}>{svc.status}</span></div>
                                <div className="flex justify-between"><span>Latency</span><span>{svc.latency}</span></div>
                                <div className="flex justify-between"><span>Load</span><span>{svc.usage}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
