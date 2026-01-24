import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    Search,
    Filter,
    Send,
    MoreHorizontal,
    ThumbsUp,
    MessageSquare,
    CheckCircle2
} from 'lucide-react';

const CommentReplies: React.FC = () => {
    const [selectedCourse, setSelectedCourse] = useState('all');

    const comments = [
        {
            id: 1,
            user: { name: 'David Smith', avatar: 'DS' },
            course: 'Advanced React & AI',
            text: 'I really love the section on Prompt Engineering. Could you provide some more examples of complex system instructions?',
            time: '2 hours ago',
            replied: false,
            likes: 12
        },
        {
            id: 2,
            user: { name: 'Elena Gilbert', avatar: 'EG' },
            course: 'Data Science Fundamentals',
            text: 'The pandas documentation link in lesson 3 seems to be outdated. Other than that, amazing content!',
            time: '5 hours ago',
            replied: true,
            reply: 'Thank you Elena! I will update the link right away.',
            likes: 4
        },
        {
            id: 3,
            user: { name: 'Chris Evans', avatar: 'CE' },
            course: 'Advanced React & AI',
            text: 'Will we be covering vector databases in the next module?',
            time: '1 day ago',
            replied: false,
            likes: 25
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Interactions</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage questions, feedback, and discussion from your learners.</p>
                </div>

                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
                        <Search size={18} className="text-slate-400" />
                        <input type="text" placeholder="Search comments..." className="bg-transparent border-none outline-none text-sm w-48" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filter */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">Filter by Course</h3>
                        <div className="space-y-2">
                            {['All Courses', 'Advanced React & AI', 'Data Science Fundamentals', 'UI/UX Design Masterclass'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCourse(c.toLowerCase())}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCourse === c.toLowerCase()
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">Status</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold bg-slate-50 text-slate-900">Unreplied (12)</button>
                                <button className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50">All Comments</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Feed */}
                <div className="lg:col-span-3 space-y-6">
                    {comments.map((comment) => (
                        <motion.div
                            layout
                            key={comment.id}
                            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 border-l-4 border-l-transparent hover:border-l-indigo-600 transition-all"
                        >
                            <div className="flex gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-lg">
                                    {comment.user.avatar}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg leading-none">{comment.user.name}</h4>
                                            <p className="text-xs text-indigo-600 font-bold mt-1.5 uppercase tracking-wider bg-indigo-50 inline-block px-2 py-0.5 rounded-md">
                                                {comment.course}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-slate-400 font-medium block">{comment.time}</span>
                                            {comment.replied && (
                                                <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1 mt-1">
                                                    <CheckCircle2 size={12} /> Replied
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 font-medium mt-4 leading-relaxed text-base italic line-clamp-2">
                                        "{comment.text}"
                                    </p>

                                    <div className="flex items-center gap-6 mt-6">
                                        <button className="flex items-center gap-2 text-slate-400 text-xs font-bold hover:text-indigo-600 transition-colors">
                                            <ThumbsUp size={16} /> {comment.likes} Likes
                                        </button>
                                        <button className="flex items-center gap-2 text-slate-400 text-xs font-bold hover:text-emerald-500 transition-colors">
                                            <MessageSquare size={16} /> Mark as Important
                                        </button>
                                    </div>

                                    {/* Educator Reply Section */}
                                    <div className="mt-8 pt-8 border-t border-slate-50">
                                        {comment.replied ? (
                                            <div className="bg-slate-50 p-6 rounded-2xl relative">
                                                <div className="absolute -top-3 left-6 px-2 py-0.5 bg-indigo-600 text-[9px] font-black text-white rounded uppercase tracking-widest">Your Reply</div>
                                                <p className="text-sm text-slate-700 font-medium">{comment.reply}</p>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-4 rounded-3xl flex gap-3 border border-slate-100">
                                                <input
                                                    type="text"
                                                    placeholder="Type your answer here..."
                                                    className="flex-1 bg-transparent border-none outline-none text-sm px-4"
                                                />
                                                <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 uppercase tracking-widest">
                                                    Reply <Send size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommentReplies;
