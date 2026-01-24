import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    TrendingUp,
    Star,
    Clock,
    ArrowUpRight,
    Play,
    MessageCircle,
    Radio,
    Plus,
    Video,
    FileText,
    CheckSquare,
    Bell,
    Calendar,
    MoreHorizontal,
    ThumbsUp,
    AlertCircle,
    FolderOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EducatorDashboard: React.FC = () => {
    // Mock Data
    const stats = [
        { label: 'Total Students', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%' },
        { label: 'Revenue', value: '$12.4k', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+8.2%' },
        { label: 'Avg. Rating', value: '4.8', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', change: '+0.1' },
        { label: 'Pending Tasks', value: '5', icon: CheckSquare, color: 'text-rose-600', bg: 'bg-rose-50', change: 'Urgent' },
    ];

    const upcomingTasks = [
        { id: 1, title: 'Review Final Projects', course: 'React Mastery', due: 'Today', priority: 'high' },
        { id: 2, title: 'Upload "Hooks" Lesson', course: 'Advanced React', due: 'Tomorrow', priority: 'medium' },
        { id: 3, title: 'Reply to 12 Comments', course: 'General', due: 'In 2 days', priority: 'low' },
    ];

    const recentFeedback = [
        { student: 'Alex M.', course: 'Data Science', rating: 5, comment: 'The visualization module was mind-blowing! Thanks.', time: '2h ago' },
        { student: 'Sarah K.', course: 'UX Design', rating: 4, comment: 'Great content, but audio usage slightly low in Ch. 3.', time: '5h ago' },
    ];

    const contentDrafts = [
        { title: 'AI Ethics Module', type: 'Video Lesson', progress: 75, lastEdited: '2h ago' },
        { title: 'System Design Interview', type: 'Course', progress: 30, lastEdited: '1d ago' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-1">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Educator Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your curriculum, track performance, and engage with students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar size={18} />
                        <span>Schedule</span>
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        <Plus size={18} />
                        <span>Create New</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${stat.change === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</h3>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid (Bento Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN (8 cols) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Quick Actions & Drafts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="text-xl font-black mb-6 relative z-10">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center gap-2 transition-all border border-white/10">
                                    <Video size={24} className="text-indigo-200" />
                                    <span className="text-xs font-bold">Upload Video</span>
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center gap-2 transition-all border border-white/10">
                                    <Radio size={24} className="text-rose-300" />
                                    <span className="text-xs font-bold">Go Live</span>
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center gap-2 transition-all border border-white/10">
                                    <FileText size={24} className="text-emerald-200" />
                                    <span className="text-xs font-bold">New Article</span>
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center gap-2 transition-all border border-white/10">
                                    <FolderOpen size={24} className="text-amber-200" />
                                    <span className="text-xs font-bold">Resources</span>
                                </button>
                            </div>
                        </div>

                        {/* Content Drafts */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900">Content Drafts</h3>
                                <button className="text-indigo-600 text-xs font-black">VIEW ALL</button>
                            </div>
                            <div className="space-y-4">
                                {contentDrafts.map((draft, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{draft.title}</h4>
                                                <p className="text-xs text-slate-500">{draft.type}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{draft.lastEdited}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${draft.progress}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 font-bold rounded-xl text-xs hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                                    <Plus size={14} /> Start New Draft
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Student Analytics & Performance */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Student Analytics</h3>
                                <p className="text-sm text-slate-500 font-medium">Engagement Overview</p>
                            </div>
                            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none">
                                <option>Last 7 Days</option>
                                <option>This Month</option>
                            </select>
                        </div>

                        {/* Mock Chart Area */}
                        <div className="h-64 w-full flex items-end justify-between gap-2 px-4">
                            {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((h, i) => (
                                <div key={i} className="w-full bg-indigo-50 rounded-t-lg relative group">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none transition-opacity">
                                        {h} Students
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 mt-4 px-2">
                            <span>Jan 1</span>
                            <span>Jan 15</span>
                            <span>Jan 30</span>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (4 cols) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Task Management Widget */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <CheckSquare size={20} className="text-indigo-600" /> My Tasks
                            </h3>
                            <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-1 rounded-md">3 PENDING</span>
                        </div>
                        <div className="space-y-4">
                            {upcomingTasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 ${task.priority === 'high' ? 'border-rose-400' : 'border-slate-300'}`}>
                                        <div className="w-2.5 h-2.5 bg-transparent group-hover:bg-indigo-600 rounded-sm transition-colors"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-700">{task.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{task.course}</span>
                                            <span className={`text-[10px] font-bold ${task.priority === 'high' ? 'text-rose-500' : 'text-amber-500'}`}>{task.due}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors">
                                + Add Reminder
                            </button>
                        </div>
                    </div>

                    {/* Feedback & Notifications */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium p-8">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <MessageCircle size={20} className="text-emerald-500" /> Recent Feedback
                        </h3>
                        <div className="space-y-6">
                            {recentFeedback.map((fb, i) => (
                                <div key={i} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-900">{fb.student}</span>
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, stars) => (
                                                <Star key={stars} size={10} fill={stars < fb.rating ? "currentColor" : "none"} className={stars < fb.rating ? "" : "text-slate-200"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed italic">"{fb.comment}"</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-bold text-slate-300">{fb.time}</span>
                                        <button className="text-[10px] font-bold text-indigo-600 hover:underline">Reply</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resources Widget */}
                    <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                        <h3 className="text-lg font-black mb-4 relative z-10 flex items-center gap-2">
                            <FolderOpen size={20} className="text-indigo-300" /> Resource Library
                        </h3>
                        <p className="text-indigo-200 text-xs mb-6 relative z-10">Manage your uploaded PDFs, slides, and datasets.</p>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5">
                                <div className="bg-rose-500/20 p-2 rounded-lg text-rose-300"><FileText size={16} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">React_Patterns_v2.pdf</p>
                                    <p className="text-[10px] text-indigo-300">2.4 MB • Uploaded Today</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5">
                                <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-300"><Video size={16} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">Intro_Lesson_Raw.mp4</p>
                                    <p className="text-[10px] text-indigo-300">145 MB • Uploaded Yesterday</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 bg-white text-indigo-900 font-bold rounded-xl text-xs hover:bg-indigo-50 transition-colors">
                            Access Library
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EducatorDashboard;
