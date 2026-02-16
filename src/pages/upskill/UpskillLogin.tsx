import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Zap,
    Eye,
    EyeOff,
    ArrowRight,
    Linkedin,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

const API_BASE = 'http://localhost:3000/api/upskill';

const UpskillLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Login failed. Please check your credentials.');
                setIsLoading(false);
                return;
            }

            // Save user data to localStorage
            localStorage.setItem('upskill_user', JSON.stringify(data.user));
            localStorage.setItem('upskill_token', data.token);

            setSuccess(true);

            // Navigate to dashboard
            setTimeout(() => {
                navigate('/upskill/dashboard');
            }, 1000);

        } catch (err) {
            console.error('Login error:', err);
            setError('Could not connect to server. Please ensure the backend is running.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans p-4">

            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50" />
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-200/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-200/20 rounded-full blur-[80px]"
                />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }} />
            </div>

            {/* Logo */}
            <div className="relative z-10 mb-8">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <span>HireGo AI</span>
                </Link>
            </div>

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-8 md:p-10 relative z-10"
            >
                {/* Success State */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-white rounded-3xl flex flex-col items-center justify-center z-20 p-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                            >
                                <CheckCircle2 size={64} className="text-green-500 mb-4" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome Back!</h3>
                            <p className="text-gray-500 text-sm text-center">Redirecting to your dashboard...</p>
                            <div className="mt-4">
                                <Loader2 size={20} className="animate-spin text-indigo-500" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
                    <p className="text-gray-500 text-sm">Sign in to continue your learning journey.</p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-5 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
                        >
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block" htmlFor="login-email">Email Address</label>
                        <input
                            type="email"
                            id="login-email"
                            placeholder="you@example.com"
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm placeholder:text-gray-400 bg-gray-50/50 focus:bg-white"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700 block" htmlFor="login-password">Password</label>
                            <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="login-password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm placeholder:text-gray-400 pr-10 bg-gray-50/50 focus:bg-white"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 group transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-gray-400 font-medium tracking-wide">or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                            <Linkedin className="w-5 h-5 text-[#0A66C2]" fill="currentColor" />
                            LinkedIn
                        </button>
                    </div>

                    <p className="mt-8 text-sm text-gray-500">
                        Don't have an account?
                        <Link to="/register/upskill" className="ml-1 font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </motion.div>

            {/* Footer Links */}
            <div className="relative z-10 mt-8 flex gap-6 text-xs text-gray-400">
                <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Help</a>
            </div>
        </div>
    );
};

export default UpskillLogin;
