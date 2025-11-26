import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock } from 'lucide-react';

interface JobCardProps {
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    logo: string;
    tags: string[];
}

export default function JobCard({ title, company, location, salary, type, logo, tags }: JobCardProps) {
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
                </div>

                {/* Apply Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn-3d btn-primary px-6 py-2 text-sm"
                >
                    Apply
                </motion.button>
            </div>
        </motion.div>
    );
}
