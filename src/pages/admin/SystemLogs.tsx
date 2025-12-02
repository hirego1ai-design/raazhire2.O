import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, AlertTriangle, Info, CheckCircle, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { endpoints } from '../../lib/api';

interface LogEntry {
    id: number;
    timestamp: string;
    level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    message: string;
    source: string;
}



const SystemLogs: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Removed mock logs; will display empty state if fetch fails
    const fetchLogs = async () => {
        try {
            const response = await fetch(endpoints.logs);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            setLogs([]); // Fallback to empty array
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.source.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterLevel === 'ALL' || log.level === filterLevel;
        return matchesSearch && matchesFilter;
    });

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'INFO': return 'text-blue-400';
            case 'WARNING': return 'text-yellow-400';
            case 'ERROR': return 'text-red-400';
            case 'SUCCESS': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'INFO': return <Info size={16} />;
            case 'WARNING': return <AlertTriangle size={16} />;
            case 'ERROR': return <AlertTriangle size={16} />;
            case 'SUCCESS': return <CheckCircle size={16} />;
            default: return <Terminal size={16} />;
        }
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">System Logs</h1>
                    <p className="text-gray-400">Monitor system activities, errors, and security events.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchLogs}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Download size={18} />
                        Export Logs
                    </button>
                </div>
            </motion.div>

            {/* Search & Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl glass border border-white/10 flex flex-col md:flex-row gap-4"
            >
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search logs by message or source..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-neon-cyan transition-colors font-mono text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-500" />
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-neon-cyan text-white appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="ALL">All Levels</option>
                        <option value="INFO">Info</option>
                        <option value="WARNING">Warning</option>
                        <option value="ERROR">Error</option>
                        <option value="SUCCESS">Success</option>
                    </select>
                </div>
            </motion.div>

            {/* Logs Console */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl glass border border-white/10 overflow-hidden bg-[#0a0e17]"
            >
                <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5">
                    <Terminal size={16} className="text-gray-400" />
                    <span className="text-sm font-mono text-gray-400">console_output.log</span>
                </div>
                <div className="p-4 font-mono text-sm h-[600px] overflow-y-auto custom-scrollbar space-y-1">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 hover:bg-white/5 p-1 rounded transition-colors group">
                                <span className="text-gray-500 shrink-0 select-none">{log.timestamp}</span>
                                <span className={`font-bold shrink-0 w-20 flex items-center gap-1.5 ${getLevelColor(log.level)}`}>
                                    {getLevelIcon(log.level)}
                                    {log.level}
                                </span>
                                <span className="text-neon-purple shrink-0 w-32 select-none">[{log.source}]</span>
                                <span className="text-gray-300 break-all">{log.message}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            No logs found matching your criteria.
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SystemLogs;
