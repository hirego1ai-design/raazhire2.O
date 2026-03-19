import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!supabase) {
            setError('Authentication service is not configured.');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign in with Supabase Auth
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim()
            });

            if (signInError) {
                setError(signInError.message || 'Invalid credentials');
                setLoading(false);
                return;
            }

            if (!data.user) {
                setError('Authentication failed. Please try again.');
                setLoading(false);
                return;
            }

            // 2. Verify admin role from users table
            const { data: userRecord, error: roleError } = await supabase
                .from('users')
                .select('id, role, name, email')
                .eq('id', data.user.id)
                .single();

            if (roleError || !userRecord) {
                setError('User record not found. Contact an administrator.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            if (userRecord.role !== 'admin') {
                setError('Access denied. Admin privileges required.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            // 3. Store admin user info (session is managed by Supabase)
            localStorage.setItem('admin_user', JSON.stringify({
                id: userRecord.id,
                name: userRecord.name || data.user.user_metadata?.full_name || 'Admin',
                email: userRecord.email,
                role: 'admin'
            }));

            navigate('/admin/dashboard');

        } catch (err: any) {
            console.error('Admin login error:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-outfit">
            <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 text-white">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Admin Portal</h2>
                    <p className="text-blue-100 text-sm">Secure Access Only</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3 text-red-400 text-sm">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-400 text-sm font-bold mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="admin@hirego.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm font-bold mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>


                </div>

                <div className="bg-slate-900/50 p-4 text-center border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                        Secured by Supabase Auth · Admin access only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
