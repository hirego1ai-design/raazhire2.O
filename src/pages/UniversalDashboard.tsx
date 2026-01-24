import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Send,
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    UserPlus,
    Briefcase,
    TrendingUp,
    MapPin,
    Plus,
    Smile,
    Link as LinkIcon,
    Info,
    Rocket,
    Building2,
    CheckCircle2
} from 'lucide-react';

interface Post {
    id: number;
    type: 'social' | 'job';
    author: {
        name: string;
        title: string;
        avatar: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp: string;
    isPPH?: boolean;
}

const UniversalDashboard: React.FC = () => {
    const location = useLocation();
    const [posts, setPosts] = useState<Post[]>([
        {
            id: 1,
            type: 'social',
            author: {
                name: "Sarah Chen",
                title: "AI Researcher at DeepMind",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1"
            },
            content: "Just published our latest findings on multi-modal LLMs! The future of autonomous talent matching is looking incredibly bright. 🚀 #AI #TechTrends",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3",
            likes: 124,
            comments: 12,
            timestamp: "2h ago"
        },
        {
            id: 101,
            type: 'job',
            author: {
                name: "TechCorp Global",
                title: "Enterprise Technology",
                avatar: "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-1.2.1"
            },
            content: "Hiring: Senior Backend Engineer (Node.js/Go). Join our core infrastructure team to build the next generation of cloud services.",
            isPPH: true,
            likes: 45,
            comments: 8,
            timestamp: "Promoted"
        },
        {
            id: 2,
            type: 'social',
            author: {
                name: "Marcus Miller",
                title: "Engineering Manager @ TechCorp",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1"
            },
            content: "We're hiring 5 Senior Backend Engineers! If you love working on low-latency systems and distributed architecture, hit me up. Distributed-first team. 💻",
            likes: 32,
            comments: 5,
            timestamp: "5h ago"
        }
    ]);

    const [newPostContent, setNewPostContent] = useState("");

    const isEmployer = location.pathname.startsWith('/employer');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Profile & Stats */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                <div className="saas-card overflow-hidden">
                    <div className={`h-20 bg-gradient-to-br ${isEmployer ? 'from-emerald-500 to-teal-600' : 'from-indigo-500 to-purple-600'}`} />
                    <div className="px-6 pb-6 -mt-10 text-center">
                        {isEmployer ? (
                            <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg border-4 border-[var(--bg-surface)]">
                                S
                            </div>
                        ) : (
                            <img
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                                className="w-20 h-20 rounded-2xl border-4 border-[var(--bg-surface)] mx-auto mb-4 object-cover shadow-lg"
                                alt="Profile"
                            />
                        )}
                        <h3 className="text-lg font-bold">{isEmployer ? "Stripe Inc." : "John Doe"}</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-4">{isEmployer ? "Enterprise Partner" : "Senior Full Stack Developer"}</p>

                        <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border-subtle)]">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[var(--text-muted)]">{isEmployer ? "Platform Utilization" : "Profile Strength"}</span>
                                <span className={`font-bold ${isEmployer ? 'text-emerald-500' : 'text-indigo-600'}`}>{isEmployer ? '92%' : '85%'}</span>
                            </div>
                            <div className="w-full bg-[var(--bg-page)] h-1.5 rounded-full overflow-hidden">
                                <div className={`${isEmployer ? 'bg-emerald-500' : 'bg-indigo-600'} h-full ${isEmployer ? 'w-[92%]' : 'w-[85%]'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="saas-card p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{isEmployer ? "Global Presence" : "Performance"}</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isEmployer ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600'}`}>
                                {isEmployer ? <Building2 size={16} /> : <TrendingUp size={16} />}
                            </div>
                            <div>
                                <div className="text-sm font-bold">{isEmployer ? "14" : "1.2k"}</div>
                                <div className="text-[10px] text-[var(--text-muted)]">{isEmployer ? "Active Roles" : "Profile Views"}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isEmployer ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'}`}>
                                {isEmployer ? <Plus size={16} /> : <Rocket size={16} />}
                            </div>
                            <div>
                                <div className="text-sm font-bold">{isEmployer ? "124" : "12"}</div>
                                <div className="text-[10px] text-[var(--text-muted)]">{isEmployer ? "New Applications" : "Job Matches"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Column: Combined Feed */}
            <div className="lg:col-span-6 space-y-6">
                {/* Create Post */}
                <div className="saas-card p-6">
                    <div className="flex gap-4">
                        {isEmployer ? (
                            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                S
                            </div>
                        ) : (
                            <img
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                                className="w-10 h-10 rounded-lg object-cover"
                                alt=""
                            />
                        )}
                        <div className="flex-1">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Share an update or post a question..."
                                className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none min-h-[60px]"
                            />
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-subtle)]">
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-[var(--bg-page)] rounded-lg text-[var(--text-muted)] transition-colors"><ImageIcon size={18} /></button>
                                    <button className="p-2 hover:bg-[var(--bg-page)] rounded-lg text-[var(--text-muted)] transition-colors"><LinkIcon size={18} /></button>
                                    <button className="p-2 hover:bg-[var(--bg-page)] rounded-lg text-[var(--text-muted)] transition-colors"><Smile size={18} /></button>
                                </div>
                                <button className="btn-saas-primary text-xs px-6">Post</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Items */}
                <AnimatePresence>
                    {posts.map(post => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="saas-card p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                        <h5 className="text-sm font-bold leading-tight">{post.author.name}</h5>
                                        <p className="text-[10px] text-[var(--text-muted)]">{post.author.title} • {post.timestamp}</p>
                                    </div>
                                </div>
                                {post.isPPH && (
                                    <span className="pph-badge text-[10px] flex items-center gap-1">
                                        <CheckCircle2 size={10} /> PPH Role
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-[var(--text-main)] mb-4 leading-relaxed">
                                {post.content}
                            </p>

                            {post.image && (
                                <img src={post.image} alt="" className="w-full h-64 object-cover rounded-xl mb-4 border border-[var(--border-subtle)]" />
                            )}

                            <div className="flex items-center gap-6 pt-4 border-t border-[var(--border-subtle)]">
                                <button className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                                    <Heart size={18} />
                                    <span className="text-xs font-medium">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                                    <MessageCircle size={18} />
                                    <span className="text-xs font-medium">{post.comments}</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors ml-auto">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Right Column: PPH & Suggestions */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                <div className="saas-card p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/30">
                    <div className="flex items-center gap-2 text-[var(--primary)] mb-4">
                        <Info size={18} />
                        <h4 className="font-bold text-sm">{isEmployer ? "Success-Based Hiring" : "Pay-Per-Hire (PPH)"}</h4>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                        {isEmployer
                            ? "Only pay when you settle on a candidate. Our Success-Based model ensures your budget is linked directly to your hiring ROI."
                            : "Look for the PPH badge! Employers pay our platform directly for successful hires. It's always free for talented candidates like you."}
                    </p>
                    <button className="text-[var(--primary)] text-xs font-bold hover:underline flex items-center gap-1">
                        Learn more <Plus size={12} />
                    </button>
                </div>

                <div className="saas-card p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
                        {isEmployer ? "Rising Talent" : "Suggested Companies"}
                    </h4>
                    <div className="space-y-4">
                        {(isEmployer ? [
                            { name: "Alex Rivera", industry: "Senior DevOps", logo: User },
                            { name: "Priya Sharma", industry: "Full Stack UI", logo: User },
                            { name: "David Chen", industry: "ML Architect", logo: User }
                        ] : [
                            { name: "Vercel", industry: "Cloud Tech", logo: Building2 },
                            { name: "Anthropic", industry: "AI Safety", logo: Rocket },
                            { name: "Linear", industry: "Productivity", logo: Building2 }
                        ]).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary-light)] transition-colors">
                                    <item.logo size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate group-hover:text-[var(--primary)] transition-colors">{item.name}</div>
                                    <div className="text-[10px] text-[var(--text-muted)]">{item.industry}</div>
                                </div>
                                <button className="p-1 px-3 border border-[var(--border-subtle)] rounded-lg text-xs font-bold hover:bg-[var(--bg-page)] transition-colors">
                                    {isEmployer ? "View" : "Follow"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UniversalDashboard;
