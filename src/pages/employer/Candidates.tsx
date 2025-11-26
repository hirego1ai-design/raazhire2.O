// src/pages/employer/Candidates.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Download } from 'lucide-react';
import CandidateCard from '../../components/CandidateCard';
import { MOCK_CANDIDATES } from '../../data/mockCandidates';

// Map the full Candidate type to the CardCandidate interface expected by CandidateCard
interface CardCandidate {
    id: string;
    name: string;
    photoUrl: string;
    videoUrl: string;
    appliedJobTitle: string;
    experienceYears: number;
    skills: string[];
    location: string;
    timezone: string;
    aiScore: number;
    status: 'applied' | 'screened' | 'shortlisted' | 'interview_scheduled' | 'hired';
}

const Candidates: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | CardCandidate['status']>('All');

    // Filtered list – memoized for performance
    const filteredCandidates = useMemo(() => {
        return MOCK_CANDIDATES.filter(c => {
            const matchesSearch =
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.appliedJobTitle.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus]);

    // Handlers for actions – currently just console.log (replace with real logic later)
    const handleShortlist = (id: string) => {
        console.log('Shortlist candidate', id);
    };
    const handleSchedule = (id: string) => {
        console.log('Schedule interview for', id);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Candidates</h1>
                    <p className="text-gray-400">Manage and track your candidate pipeline.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-3d btn-secondary flex items-center gap-1.5">
                        <Download size={14} /> Export
                    </button>
                    <button className="btn-3d btn-primary flex items-center gap-1.5">
                        <Plus size={14} /> Add Candidate
                    </button>
                </div>
            </motion.div>

            {/* Search & Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or job title..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors text-white"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-3 text-gray-500" size={18} />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors appearance-none text-white"
                    >
                        <option value="All">All Status</option>
                        <option value="applied">Applied</option>
                        <option value="screened">Screened</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="hired">Hired</option>
                    </select>
                </div>
            </motion.div>

            {/* Candidate Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCandidates.map((candidate, idx) => (
                    <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                    >
                        <CandidateCard
                            candidate={candidate}
                            onShortlist={handleShortlist}
                            onScheduleInterview={handleSchedule}
                        />
                    </motion.div>
                ))}
                {filteredCandidates.length === 0 && (
                    <p className="text-center text-gray-400 col-span-full">No candidates match your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default Candidates;
