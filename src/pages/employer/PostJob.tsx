import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Sparkles, Zap, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../lib/api';
import { supabase } from '../../lib/supabase';

const JOB_TYPES = [
    { id: 'basic', name: 'Basic', credits: 10, description: 'Standard listing, visible for 30 days.' },
    { id: 'standard', name: 'Standard', credits: 15, description: 'Includes email alerts to matching candidates.' },
    { id: 'premium', name: 'Premium', credits: 25, description: 'Top of search results + Social Media boost.' },
    { id: 'urgent', name: 'Urgent Hiring', credits: 30, description: 'Highlighted as Urgent + SMS alerts.' },
    { id: 'interview', name: 'Interview-Ready', credits: 40, description: 'Pre-screened candidates only.' },
];

const PostJob: React.FC = () => {
    const navigate = useNavigate();
    const [walletBalance, setWalletBalance] = useState(450); // Mock balance
    const [selectedType, setSelectedType] = useState(JOB_TYPES[0]);

    const [jobData, setJobData] = useState({
        title: '',
        type: 'Full-time',
        location: '',
        salaryMin: '',
        salaryMax: '',
        description: '',
        requirements: '',
        skills: '',
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setJobData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateDescription = async () => {
        if (!jobData.title) {
            alert('Please enter a job title first.');
            return;
        }
        setIsGenerating(true);
        try {
            const response = await fetch(endpoints.generateJobDescription, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: jobData.title }),
            });
            if (!response.ok) throw new Error('Generation failed');
            const data = await response.json();
            setJobData(prev => ({
                ...prev,
                description: data.description,
                requirements: data.requirements,
            }));
        } catch (error) {
            console.error("Generation error:", error);
            alert("Failed to generate description. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (walletBalance < selectedType.credits) {
            alert('Insufficient credits! Please buy more credits.');
            return;
        }

        if (window.confirm(`This will deduct ${selectedType.credits} credits from your wallet. Proceed?`)) {
            try {
                // Use API instead of direct Supabase
                const response = await fetch(endpoints.jobs, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
                    },
                    body: JSON.stringify({
                        title: jobData.title,
                        type: jobData.type,
                        location: jobData.location,
                        salary_min: jobData.salaryMin,
                        salary_max: jobData.salaryMax,
                        description: jobData.description,
                        requirements: jobData.requirements,
                        skills: jobData.skills.split(',').map(s => s.trim()),
                        job_type: selectedType.id,
                        work_mode: 'On-site' // Defaulting for now as form doesn't have it explicitly
                    })
                });

                if (!response.ok) throw new Error('Failed to post job');

                setWalletBalance(prev => prev - selectedType.credits);
                console.log('Posting job:', { ...jobData, jobType: selectedType });
                alert('Job posted successfully!');
                navigate('/employer/dashboard');
            } catch (error) {
                console.error('Error posting job:', error);
                alert('Failed to post job. Please try again.');
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
                    <p className="text-gray-400">Create a job listing and let our AI find the perfect candidates for you.</p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center gap-2">
                    <span className="text-sm text-yellow-400 font-bold">Wallet Balance:</span>
                    <span className="text-xl font-bold text-white">{walletBalance} Credits</span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Job Form */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="p-6 rounded-xl glass border border-white/10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Job Title</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            name="title"
                                            value={jobData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Senior Frontend Developer"
                                            className="w-full bg-black/20 border border-white/10 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Employment Type</label>
                                    <select
                                        name="type"
                                        value={jobData.type}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 text-white rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            name="location"
                                            value={jobData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Remote, New York, NY"
                                            className="w-full bg-black/20 border border-white/10 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Salary Range</label>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="salaryMin"
                                                value={jobData.salaryMin}
                                                onChange={handleChange}
                                                placeholder="Min"
                                                className="w-full bg-black/20 border border-white/10 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600"
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="salaryMax"
                                                value={jobData.salaryMax}
                                                onChange={handleChange}
                                                placeholder="Max"
                                                className="w-full bg-black/20 border border-white/10 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-gray-400 font-medium">Job Description</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={isGenerating}
                                        className="text-xs flex items-center gap-1 text-neon-cyan hover:opacity-70 transition-colors disabled:opacity-50"
                                    >
                                        <Sparkles size={14} />
                                        {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
                                    </button>
                                </div>
                                <textarea
                                    name="description"
                                    value={jobData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Describe the role and responsibilities..."
                                    className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-4 focus:outline-none focus:border-neon-cyan transition-colors resize-none placeholder:text-gray-600"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Requirements</label>
                                <textarea
                                    name="requirements"
                                    value={jobData.requirements}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="- List key requirements..."
                                    className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-4 focus:outline-none focus:border-neon-cyan transition-colors resize-none placeholder:text-gray-600"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Required Skills (Comma separated)</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={jobData.skills}
                                    onChange={handleChange}
                                    placeholder="e.g. React, Node.js, Python"
                                    className="w-full bg-black/20 border border-white/10 text-white rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                    </motion.form>
                </div>

                {/* Right Column: Job Type Selection */}
                <div className="space-y-6">
                    <div className="p-6 rounded-xl glass border border-white/10 sticky top-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Zap className="text-yellow-400" size={20} /> Select Job Type
                        </h3>
                        <div className="space-y-3">
                            {JOB_TYPES.map((type) => (
                                <div
                                    key={type.id}
                                    onClick={() => setSelectedType(type)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedType.id === type.id
                                        ? 'bg-neon-cyan/10 border-neon-cyan'
                                        : 'bg-white/5 border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-bold ${selectedType.id === type.id ? 'text-neon-cyan' : 'text-white'}`}>
                                            {type.name}
                                        </span>
                                        <span className="text-sm font-bold text-yellow-400">{type.credits} Credits</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{type.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Wallet Balance</span>
                                <span className="text-white">{walletBalance} Credits</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Cost</span>
                                <span className="text-red-400">-{selectedType.credits} Credits</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2">
                                <span className="text-white">Remaining</span>
                                <span className={`${walletBalance >= selectedType.credits ? 'text-green-400' : 'text-red-500'}`}>
                                    {walletBalance - selectedType.credits} Credits
                                </span>
                            </div>

                            {walletBalance < selectedType.credits ? (
                                <div className="p-3 rounded bg-red-500/20 border border-red-500/30 flex items-start gap-2">
                                    <AlertTriangle className="text-red-400 shrink-0" size={16} />
                                    <p className="text-xs text-red-300">Insufficient credits. Please purchase a credit bundle to post this job.</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="w-full btn-3d btn-primary py-3 flex items-center justify-center gap-2 font-bold"
                                >
                                    <CheckCircle size={18} /> Post Job Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostJob;
