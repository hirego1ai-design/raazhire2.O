import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User } from 'lucide-react';
import DashboardJobCard from '../../components/DashboardJobCard';

const Jobs: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Find Jobs');

    const jobs = [
        {
            title: 'Senior Cyberneticist',
            location: 'Job Location',
            salary: 'Salary + Currency',
            payCycle: 'Pay Cycle',
            workMode: 'Work Mode',
            jobType: 'On-site',
            matchPercentage: 92,
            colorTheme: 'green' as const,
            logo: 'H'
        },
        {
            title: 'Job Title',
            location: 'Job Location',
            salary: 'Salary Cycle',
            payCycle: 'Pay Cycle',
            workMode: 'Work Mode',
            jobType: 'Hybrid',
            matchPercentage: 92,
            colorTheme: 'blue' as const,
            logo: 'H'
        },
        {
            title: 'Senior Cyberneticist',
            location: 'Job Location',
            salary: 'Salary + Currency',
            payCycle: 'Pay Cycle',
            workMode: 'Work Mode',
            jobType: 'On-site',
            matchPercentage: 92,
            colorTheme: 'pink' as const,
            logo: 'H'
        },
        {
            title: 'AI Ethics Architect',
            location: 'Job Location',
            salary: 'Salary + Currency',
            payCycle: 'Pay Cycle',
            workMode: 'Work Mode',
            jobType: 'Remote',
            matchPercentage: 92,
            colorTheme: 'purple' as const, // Using purple/gold theme from image
            logo: 'H'
        },
        {
            title: 'Senior Cyberneticist',
            location: 'Job Location',
            salary: 'Salary + Currency',
            payCycle: 'Pay Cycle',
            workMode: 'Work Mode',
            jobType: 'On-site',
            matchPercentage: 92,
            colorTheme: 'blue' as const,
            logo: 'H'
        },
        {
            title: 'Skill Match',
            location: 'Job Location',
            salary: 'Salary + Currency',
            payCycle: 'Pay Cycle',
            workMode: 'Work Mode',
            jobType: 'Hybrid',
            matchPercentage: 92,
            colorTheme: 'purple' as const,
            logo: 'H'
        }
    ];

    return (
        <div className="min-h-screen bg-[#050511] text-white p-4 md:p-8 font-outfit relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                {/* Top Navigation Bar */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center font-bold text-white">
                            H
                        </div>
                        <span className="text-xl font-bold tracking-wide">HireGo AI</span>
                    </div>

                    <div className="flex-1 max-w-md w-full relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-cyan/50 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                            <User size={20} className="text-gray-300" />
                        </button>
                    </div>
                </motion.div>

                {/* Secondary Nav & Filter */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                        {['Home', 'Find Jobs', 'Messages'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab
                                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 text-white shadow-lg border border-white/10'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-neon-cyan/30 transition-all">
                            <span className="text-sm font-medium">Filter</span>
                            <Filter size={16} className="text-gray-400" />
                        </button>

                        {/* Dropdown Preview (Visual only as per image) */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0e27]/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
                            <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-sm text-gray-300">Matters</div>
                            <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-sm text-gray-300">Job Location</div>
                            <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-sm text-gray-300">Remote Only</div>
                        </div>
                    </div>
                </motion.div>

                {/* Job Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                        >
                            <DashboardJobCard {...job} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Jobs;
