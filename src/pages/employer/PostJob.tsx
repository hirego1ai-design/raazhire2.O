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
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-[var(--text-main)] italic">New Opportunity</h1>
                    <p className="text-[var(--text-muted)] font-medium mt-1">Broadcast high-frequency talent signals across the ecosystem.</p>
                </div>
                <div className="px-6 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-end shadow-sm">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">Available Liquidity</span>
                    <span className="text-2xl font-black text-amber-500">{walletBalance} <span className="text-[10px] uppercase font-black text-amber-500/60">Credits</span></span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Job Form */}
                <div className="lg:col-span-8 space-y-6">
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="saas-card p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Job Classification</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="title"
                                            value={jobData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Principal Architect"
                                            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold text-sm placeholder:text-[var(--text-muted)]/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Fulfillment Type</label>
                                    <select
                                        name="type"
                                        value={jobData.type}
                                        onChange={handleChange}
                                        className="w-full h-14 bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl px-4 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Geographical Node</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="location"
                                            value={jobData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Remote / London, UK"
                                            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold text-sm placeholder:text-[var(--text-muted)]/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Budget Allocation</label>
                                    <div className="flex gap-4">
                                        <div className="relative group flex-1">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="salaryMin"
                                                value={jobData.salaryMin}
                                                onChange={handleChange}
                                                placeholder="Min"
                                                className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all font-bold text-sm placeholder:text-[var(--text-muted)]/50"
                                            />
                                        </div>
                                        <div className="relative group flex-1">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="salaryMax"
                                                value={jobData.salaryMax}
                                                onChange={handleChange}
                                                placeholder="Max"
                                                className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all font-bold text-sm placeholder:text-[var(--text-muted)]/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Briefing Document</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={isGenerating}
                                        className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isGenerating ? <Zap size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                        {isGenerating ? 'Synthesizing...' : 'AI Synthesize JD'}
                                    </button>
                                </div>
                                <textarea
                                    name="description"
                                    value={jobData.description}
                                    onChange={handleChange}
                                    rows={8}
                                    placeholder="Define the mission objectives..."
                                    className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl p-6 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-medium text-sm resize-none placeholder:text-[var(--text-muted)]/50 leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Core Requirements</label>
                                <textarea
                                    name="requirements"
                                    value={jobData.requirements}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="- Absolute essentials for mission success..."
                                    className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl p-6 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-medium text-sm resize-none placeholder:text-[var(--text-muted)]/50 leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Specific Tech Stack (Comma separated)</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={jobData.skills}
                                    onChange={handleChange}
                                    placeholder="e.g. React, Node.js, Kubernetes"
                                    className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold text-sm placeholder:text-[var(--text-muted)]/50"
                                />
                            </div>
                        </div>
                    </motion.form>
                </div>

                {/* Right Column: Job Type Selection */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="saas-card p-8 sticky top-6">
                        <h3 className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <Zap className="text-amber-500" size={18} /> Priority Tier
                        </h3>
                        <div className="space-y-4">
                            {JOB_TYPES.map((type) => (
                                <div
                                    key={type.id}
                                    onClick={() => setSelectedType(type)}
                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedType.id === type.id
                                        ? 'bg-indigo-600/5 border-indigo-600 shadow-lg shadow-indigo-600/10'
                                        : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-indigo-600/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-black uppercase tracking-widest ${selectedType.id === type.id ? 'text-indigo-600' : 'text-[var(--text-main)]'}`}>
                                            {type.name}
                                        </span>
                                        <span className="text-[10px] font-black text-amber-500 uppercase">{type.credits} <span className="text-[8px] opacity-60">CR</span></span>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold leading-relaxed">{type.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-[var(--border-subtle)] space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-[var(--text-muted)]">Current Assets</span>
                                    <span className="text-[var(--text-main)] italic">{walletBalance}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-[var(--text-muted)]">Mission Cost</span>
                                    <span className="text-red-500 italic">-{selectedType.credits}</span>
                                </div>
                                <div className="flex justify-between items-baseline border-t border-[var(--border-subtle)] pt-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Projected Reserve</span>
                                    <span className={`text-2xl font-black italic ${walletBalance >= selectedType.credits ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {walletBalance - selectedType.credits}
                                    </span>
                                </div>
                            </div>

                            {walletBalance < selectedType.credits ? (
                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-4">
                                    <AlertTriangle className="text-red-500 shrink-0" size={16} />
                                    <p className="text-[10px] text-red-700 font-bold leading-relaxed uppercase">Insufficient Liquidity detected for this tier. System override required.</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transform hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle size={18} /> Initialize Rollout
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
