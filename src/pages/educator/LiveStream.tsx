import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Radio,
    Settings,
    MessageSquare,
    Users,
    Mic,
    Video as VideoIcon,
    Monitor,
    Share2,
    Heart,
    Send,
    MoreVertical
} from 'lucide-react';

const LiveStream: React.FC = () => {
    const [isLive, setIsLive] = useState(false);
    const [comment, setComment] = useState('');

    const mockComments = [
        { user: 'Alex Johnson', text: 'Hey Sarah! Excited for this React AI deep dive.', time: '2m ago' },
        { user: 'Maria Garcia', text: 'Will this be recorded? I might miss the last 10 mins.', time: '1m ago' },
        { user: 'Dev Guru', text: 'The particle effects look amazing!', time: 'Just now' },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Go Live
                        {isLive && <span className="px-3 py-1 bg-rose-500 text-white text-xs font-black rounded-full animate-pulse uppercase tracking-widest">Live</span>}
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Streaming to 45k+ registered students across the globe.</p>
                </div>

                <div className="flex gap-3">
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
                        <Settings size={20} />
                    </button>
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`px-8 py-3 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95 shadow-lg ${isLive
                                ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'
                                : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                            }`}
                    >
                        {isLive ? 'END SESSION' : 'START STREAMING'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
                {/* Video Area */}
                <div className="lg:col-span-8 bg-black rounded-[2.5rem] shadow-2xl relative overflow-hidden group border-4 border-white">
                    {isLive ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 border-4 border-rose-500/20">
                            {/* Placeholder for actual stream/webcam */}
                            <div className="text-center">
                                <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(244,63,94,0.3)]">
                                    <VideoIcon size={40} className="text-white" />
                                </div>
                                <h2 className="text-white text-2xl font-black">Streaming Active...</h2>
                                <p className="text-slate-400 font-medium">Your camera and microphone are live.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <div className="text-center">
                                <Radio size={64} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest">Connect your source to preview</p>
                            </div>
                        </div>
                    )}

                    {/* Stream Controls Overlay */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl p-3 rounded-3xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all">
                            <Mic size={20} />
                        </button>
                        <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all">
                            <VideoIcon size={20} />
                        </button>
                        <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all">
                            <Monitor size={20} />
                        </button>
                        <div className="h-8 w-px bg-white/10 mx-2"></div>
                        <button className="px-6 py-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-2xl tracking-widest uppercase">
                            GO LIVE
                        </button>
                    </div>

                    {/* Viewer Count Badge */}
                    <div className="absolute top-8 left-8 flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-xs font-bold">
                            <Users size={14} className="text-indigo-400" />
                            <span>12,482 Watching</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-xs font-bold">
                            <Heart size={14} className="text-rose-400 fill-rose-400" />
                            <span>85.4k</span>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-4 flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={18} className="text-indigo-600" />
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">Live Chat</h3>
                        </div>
                        <MoreVertical size={18} className="text-slate-400 cursor-pointer" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {mockComments.map((c, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="flex gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                    {c.user[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-black text-slate-900 leading-none">{c.user}</p>
                                        <span className="text-[10px] text-slate-400">{c.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{c.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200">
                            <input
                                type="text"
                                placeholder="Say something..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-sm px-4 py-2"
                            />
                            <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveStream;
