import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Info } from 'lucide-react';

interface JobCardProps {
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    logo: string;
    tags: string[];
    description?: string;
    onJoin?: () => void;
}

export default function JobCard({ title, company, location, salary, type, logo, tags, description, onJoin }: JobCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="glass glass-hover rounded-2xl p-6 shadow-3d-purple hover:shadow-3d-cyan cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center text-2xl font-bold border border-white/10 group-hover:border-neon-cyan/50 transition-colors">
                    {logo}
                </div>

                {/* Job Info */}
                <div className="flex-1 space-y-3">
                    <div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-gradient transition-all">
                            {title}
                        </h3>
                        <p className="text-gray-400">{company}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-neon-cyan" />
                            {location}
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign size={16} className="text-neon-purple" />
                            {salary}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={16} className="text-neon-pink" />
                            {type}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300 group-hover:border-neon-cyan/50 transition-colors"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => setShowDetails(true)}
                            className="btn-3d btn-ghost flex items-center gap-1"
                        >
                            <Info size={14} /> Details
                        </button>
                        {onJoin && (
                            <button
                                onClick={onJoin}
                                className="btn-3d btn-primary flex items-center gap-1"
                            >
                                Join
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Overlay */}
            {showDetails && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                >
                    <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold text-white mb-2">{title} - Details</h3>
                        <p className="text-gray-300 mb-4">{description || 'No detailed description provided.'}</p>
                        <button
                            onClick={() => setShowDetails(false)}
                            className="btn-3d btn-ghost mt-2"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
