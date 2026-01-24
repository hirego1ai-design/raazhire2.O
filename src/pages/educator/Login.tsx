import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Radio, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EducatorLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase!.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            if (data.session) {
                localStorage.setItem('sb-token', data.session.access_token);
                // In a real app, verify user role is 'educator' here
                navigate('/educator/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-outfit relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full max-w-lg border border-slate-100 relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-200">
                        <Radio size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Educator Portal</h1>
                    <p className="text-slate-500 mt-2 font-medium">Log in to manage your courses and go live.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pl-12 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all placeholder:font-medium"
                                placeholder="educator@hirego.ai"
                                required
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</label>
                            <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</a>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pl-12 pr-12 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all placeholder:font-medium"
                                placeholder="••••••••"
                                required
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm mt-4"
                    >
                        {loading ? 'Logging in...' : 'Access Portal'} <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                        Not an educator yet? <a href="/signup" className="text-indigo-600 font-bold hover:underline">Apply to Teach</a>
                    </p>
                </div>

                {/* Developer Bypass */}
                <div className="mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/educator/dashboard')}
                        className="w-full py-2 px-4 bg-slate-900 text-white text-[10px] font-black tracking-[0.2em] rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 opacity-10 hover:opacity-100"
                    >
                        <span className="opacity-50">⚡</span> DEVELOPER BYPASS <span className="opacity-50">⚡</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EducatorLogin;
