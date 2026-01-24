import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    MapPin,
    Briefcase,
    Clock,
    DollarSign,
    CheckCircle2,
    MoreVertical,
    Star,
    ChevronDown,
    LayoutGrid,
    List,
    Plus
} from 'lucide-react';
import { endpoints } from '../../lib/api';

const Jobs: React.FC = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(endpoints.jobs);
                if (!response.ok) throw new Error('Failed to fetch jobs');
                const data = await response.json();
                if (data.jobs && data.jobs.length > 0) {
                    setJobs(data.jobs.map((j: any) => ({
                        id: j.id,
                        title: j.title,
                        company: "TechCorp Global",
                        location: j.location,
                        type: j.type || "Full-time",
                        salary: j.salary_min && j.salary_max ? `$${(j.salary_min / 1000).toFixed(0)}k - $${(j.salary_max / 1000).toFixed(0)}k` : "Negotiable",
                        isPPH: Math.random() > 0.5, // Mocking PPH status
                        posted: "2d ago",
                        logo: "https://images.unsplash.com/photo-15499231-f129b911e442?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                    })));
                } else {
                    // Mock data
                    const mockJobs = [
                        { id: 1, title: 'Senior Frontend Engineer', company: 'Linear', location: 'Remote', type: 'Full-time', salary: '$120k - $160k', isPPH: true, posted: '1d ago', logo: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?ixlib=rb-1.2.1' },
                        { id: 2, title: 'Product Designer', company: 'Airbnb', location: 'San Francisco', type: 'Contract', salary: '$90k - $130k', isPPH: false, posted: '3h ago', logo: 'https://images.unsplash.com/photo-1585238341267-1cfec2046a55?ixlib=rb-1.2.1' },
                        { id: 3, title: 'Backend Developer (Go)', company: 'Vercel', location: 'Europe (Remote)', type: 'Full-time', salary: '$140k - $180k', isPPH: true, posted: '5d ago', logo: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-1.2.1' },
                    ];
                    setJobs(mockJobs);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Filters */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                <div className="saas-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2"><Filter size={18} /> Filters</h3>
                        <button className="text-xs text-[var(--primary)] font-bold">Clear All</button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Employment Type</label>
                            <div className="space-y-2">
                                {["Full-time", "Contract", "Freelance", "Internship"].map(type => (
                                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-4 h-4 rounded border border-[var(--border-subtle)] group-hover:border-[var(--primary)] transition-colors flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-sm bg-[var(--primary)] scale-0 group-hover:scale-100 transition-transform"></div>
                                        </div>
                                        <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Salary Range</label>
                            <input type="range" className="w-full accent-[var(--primary)]" />
                            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-2">
                                <span>$50k</span>
                                <span>$200k+</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Model</label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-10 h-5 bg-[var(--border-subtle)] rounded-full relative transition-colors group-hover:bg-[var(--primary-light)]">
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform"></div>
                                </div>
                                <span className="text-sm font-bold text-[var(--primary)]">PPH Roles Only</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Column: Job List */}
            <div className="lg:col-span-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                    <h2 className="text-xl font-bold">Recommended for you</h2>
                    <div className="flex items-center gap-2 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
                        <button className="p-2 bg-[var(--bg-page)] rounded-lg text-[var(--primary)]"><List size={18} /></button>
                        <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"><LayoutGrid size={18} /></button>
                    </div>
                </div>

                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} className="saas-card p-5 group hover:border-[var(--primary)] transition-all">
                            <div className="flex items-start gap-4">
                                <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover border border-[var(--border-subtle)]" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors truncate">{job.title}</h3>
                                            <p className="text-sm font-medium text-[var(--text-muted)]">{job.company}</p>
                                        </div>
                                        <button className="text-[var(--text-muted)] hover:text-[var(--text-main)]"><MoreVertical size={18} /></button>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-4">
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                            <MapPin size={14} /> {job.location}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                            <Briefcase size={14} /> {job.type}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                            <DollarSign size={14} /> {job.salary}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                            <Clock size={14} /> {job.posted}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-subtle)]">
                                        <div>
                                            {job.isPPH && (
                                                <span className="pph-badge text-[10px] flex items-center gap-1" title="Employer pays per hire, free for candidates">
                                                    <CheckCircle2 size={10} /> PPH Role
                                                </span>
                                            )}
                                        </div>
                                        <button className="btn-saas-primary text-xs px-6">Apply Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Recommended / Spotlight */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                <div className="saas-card p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" /> Hiring Spotlight
                    </h4>
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] hover:translate-y-[-2px] transition-transform cursor-pointer">
                            <div className="text-[var(--primary)] text-[10px] font-black uppercase mb-2">Featured Partner</div>
                            <h5 className="text-sm font-bold mb-1">Stripe</h5>
                            <p className="text-xs text-[var(--text-muted)] mb-3">Building the economic infrastructure of the internet.</p>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold">12 Open Roles</span>
                                <button className="text-[var(--primary)] text-[10px] font-black uppercase">View Jobs</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="saas-card p-6">
                    <h4 className="text-sm font-bold mb-4">Quick Links</h4>
                    <div className="space-y-2">
                        {["Saved Jobs", "Salary Insights", "Resume Builder", "Interview Prep"].map(link => (
                            <button key={link} className="w-full text-left p-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--primary)] transition-all flex items-center justify-between group">
                                {link}
                                <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Jobs;
