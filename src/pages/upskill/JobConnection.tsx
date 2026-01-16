import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    ChevronRight,
    Filter,
    Star,
    TrendingUp,
    Award,
    Target,
    ArrowRight,
    CheckCircle,
    Building2,
    Zap
} from 'lucide-react';

// ============================================
// JOB CARD WITH MATCH %
// ============================================
interface JobCardProps {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    match: number;
    skills: string[];
    postedDays: number;
    delay: number;
}

const JobCard: React.FC<JobCardProps> = ({
    id,
    title,
    company,
    location,
    salary,
    type,
    match,
    skills,
    postedDays,
    delay
}) => {
    const navigate = useNavigate();

    const getMatchColor = (match: number) => {
        if (match >= 90) return 'bg-soft-emerald-50 border-soft-emerald-500 text-soft-emerald-700';
        if (match >= 75) return 'bg-ai-cyan-50 border-ai-cyan-500 text-ai-cyan-700';
        return 'bg-electric-indigo-50 border-electric-indigo-500 text-electric-indigo-700';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="bg-white rounded-card-xl p-8 shadow-premium hover:shadow-premium-lg transition-all cursor-pointer group"
            onClick={() => navigate(`/job/${id}`)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-electric-indigo-600 transition-colors">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-5 h-5" />
                        <span className="font-semibold">{company}</span>
                    </div>
                </div>
                <div className={`px-6 py-3 border-2 rounded-pill ${getMatchColor(match)} flex flex-col items-center min-w-[100px]`}>
                    <div className="text-3xl font-extrabold">{match}%</div>
                    <div className="text-xs font-semibold uppercase">Match</div>
                </div>
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold text-gray-900">{salary}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{type}</span>
                </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-3">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 4).map((skill, index) => (
                        <span
                            key={index}
                            className="px-4 py-2 bg-cloud-grey text-gray-700 rounded-pill text-sm font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                    {skills.length > 4 && (
                        <span className="px-4 py-2 bg-electric-indigo-50 text-electric-indigo-600 rounded-pill text-sm font-semibold">
                            +{skills.length - 4} more
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <span className="text-sm text-gray-500">Posted {postedDays} days ago</span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-indigo text-white rounded-pill font-bold shadow-glow-indigo flex items-center gap-2"
                >
                    Apply Now
                    <ChevronRight className="w-5 h-5" />
                </motion.button>
            </div>
        </motion.div>
    );
};

// ============================================
// SKILL CONNECTION VISUAL
// ============================================
const SkillConnectionDiagram: React.FC = () => {
    const userSkills = ['Python', 'Data Analysis', 'SQL', 'Visualization'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-electric-indigo-50 to-ai-cyan-50 rounded-section-xl p-12 shadow-premium mb-16"
        >
            <h3 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
                Your Skills → Job Matches
            </h3>
            <div className="flex items-center justify-center gap-8 flex-wrap">
                {/* User Skills */}
                <div className="flex flex-col gap-3">
                    <div className="text-center mb-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-indigo rounded-card-xl flex items-center justify-center mb-3 shadow-glow-indigo">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                        <p className="font-bold text-gray-900">Your Skills</p>
                    </div>
                    {userSkills.map((skill, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="px-6 py-3 bg-white rounded-pill shadow-soft font-semibold text-gray-900 border-2 border-electric-indigo-200"
                        >
                            {skill}
                        </motion.div>
                    ))}
                </div>

                {/* Connection Arrow */}
                <div className="hidden md:block">
                    <motion.div
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowRight className="w-16 h-16 text-electric-indigo-400" strokeWidth={3} />
                    </motion.div>
                </div>

                {/* Matched Jobs */}
                <div className="flex flex-col gap-3">
                    <div className="text-center mb-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-cyan rounded-card-xl flex items-center justify-center mb-3 shadow-glow-cyan">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <p className="font-bold text-gray-900">Matched Jobs</p>
                    </div>
                    {['Data Analyst', 'BI Developer', 'Python Developer'].map((job, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="px-6 py-3 bg-white rounded-pill shadow-soft font-semibold text-gray-900 border-2 border-ai-cyan-200 flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5 text-soft-emerald-500" />
                            {job}
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const JobConnection: React.FC = () => {
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState<'all' | 'high-match' | 'recent'>('all');

    const jobs = [
        {
            id: '1',
            title: 'Junior Data Analyst',
            company: 'TechCorp Inc.',
            location: 'Remote',
            salary: '$65K-$80K',
            type: 'Full-time',
            match: 95,
            skills: ['Python', 'SQL', 'Data Visualization', 'Statistics', 'Pandas'],
            postedDays: 2
        },
        {
            id: '2',
            title: 'Data Science Intern',
            company: 'AI Innovations',
            location: 'Hybrid - San Francisco',
            salary: '$50K-$60K',
            type: 'Internship',
            match: 88,
            skills: ['Python', 'Machine Learning', 'Data Analysis', 'NumPy'],
            postedDays: 5
        },
        {
            id: '3',
            title: 'Business Intelligence Analyst',
            company: 'DataDriven Co.',
            location: 'On-site - New York',
            salary: '$70K-$85K',
            type: 'Full-time',
            match: 82,
            skills: ['SQL', 'Tableau', 'Data Modeling', 'PowerBI', 'Excel'],
            postedDays: 3
        },
        {
            id: '4',
            title: 'Python Developer',
            company: 'CodeBase Labs',
            location: 'Remote',
            salary: '$75K-$90K',
            type: 'Full-time',
            match: 78,
            skills: ['Python', 'Django', 'APIs', 'PostgreSQL'],
            postedDays: 7
        },
        {
            id: '5',
            title: 'Analytics Associate',
            company: 'Finance First',
            location: 'Hybrid - Chicago',
            salary: '$60K-$75K',
            type: 'Full-time',
            match: 76,
            skills: ['Excel', 'SQL', 'Data Analysis', 'Financial Modeling'],
            postedDays: 4
        },
        {
            id: '6',
            title: 'Data Engineer Trainee',
            company: 'CloudScale Systems',
            location: 'Remote',
            salary: '$55K-$70K',
            type: 'Entry-level',
            match: 72,
            skills: ['Python', 'SQL', 'ETL', 'AWS', 'Data Pipelines'],
            postedDays: 6
        }
    ];

    const filteredJobs = jobs.filter(job => {
        if (filterType === 'high-match') return job.match >= 85;
        if (filterType === 'recent') return job.postedDays <= 3;
        return true;
    });

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            {/* Hero */}
            <section className="bg-gradient-premium pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-pill shadow-soft mb-6">
                            <Zap className="w-6 h-6 text-electric-indigo-500" />
                            <span className="font-bold text-gray-900">AI-Powered Job Matching</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                            Your Perfect Job Matches
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Based on your Data Science skills, we've found <strong>{jobs.length} opportunities</strong> that match your profile
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Skill Connection Diagram */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <SkillConnectionDiagram />
                </div>
            </section>

            {/* Filters */}
            <section className="py-8 px-4 bg-white shadow-soft sticky top-20 z-40">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        {[
                            { value: 'all', label: 'All Jobs', icon: Briefcase },
                            { value: 'high-match', label: 'High Match (85%+)', icon: Star },
                            { value: 'recent', label: 'Recently Posted', icon: Clock }
                        ].map((filter) => (
                            <motion.button
                                key={filter.value}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterType(filter.value as any)}
                                className={`
                                    px-6 py-3 rounded-pill font-semibold text-sm whitespace-nowrap
                                    flex items-center gap-2 transition-all duration-300
                                    ${filterType === filter.value
                                        ? 'bg-gradient-indigo text-white shadow-glow-indigo'
                                        : 'bg-cloud-grey text-gray-700 hover:bg-deep-grey'
                                    }
                                `}
                            >
                                <filter.icon className="w-4 h-4" />
                                {filter.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Listings */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {filteredJobs.length} Jobs Found
                        </h2>
                        <p className="text-gray-600">Sorted by match percentage (highest first)</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {filteredJobs.map((job, index) => (
                            <JobCard key={job.id} {...job} delay={index * 0.1} />
                        ))}
                    </div>

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-20">
                            <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No jobs match this filter</h3>
                            <p className="text-gray-600">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-electric-indigo-500 to-ai-cyan-500">
                <div className="container mx-auto max-w-5xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Target className="w-16 h-16 mx-auto text-white mb-6" />
                        <h2 className="text-4xl font-extrabold text-white mb-4">
                            Ready to Apply?
                        </h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            With your verified skills and AI-matched profile, you're ahead of the competition
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/upskill/dashboard')}
                                className="px-8 py-4 bg-white text-electric-indigo-600 rounded-pill font-bold text-lg shadow-soft"
                            >
                                View My Profile
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/upskill/certificate/1')}
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-pill font-bold text-lg"
                            >
                                Download Certificate
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default JobConnection;
