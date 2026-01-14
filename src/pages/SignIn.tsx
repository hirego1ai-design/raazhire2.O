import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SignIn = () => {
    const [userType, setUserType] = useState<'candidate' | 'employer'>('candidate');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!supabase) throw new Error('Supabase client not initialized');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) throw error;
            if (data.session) {
                localStorage.setItem('sb-token', data.session.access_token);
                if (userType === 'candidate') {
                    navigate('/candidate/dashboard');
                } else {
                    navigate('/employer/dashboard');
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center p-4 bg-gray-50/80 font-sans relative overflow-hidden">
            {/* Background "Running" Elements matching Logo Colors */}
            <div className="absolute top-1/4 left-[-5%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl opacity-50" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                // Matched max-w-4xl and min-h-[550px] exactly with SignUp
                className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-gray-100"
            >
                {/* LEFT SIDE - FORM (White) */}
                <div className="w-full md:w-1/2 p-8 lg:p-12 relative flex flex-col justify-center bg-white order-2 md:order-1">

                    {/* Logo - Adjusted Size */}
                    <div className="text-center mb-6">
                        <img src="/hirego-logo.png" alt="HireGo AI" className="h-10 mx-auto object-contain" />
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>

                    {/* Role Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-50 p-1 rounded-lg inline-flex border border-gray-100">
                            <button
                                type="button"
                                onClick={() => setUserType('candidate')}
                                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${userType === 'candidate' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Candidate
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType('employer')}
                                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${userType === 'employer' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Employer
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-xs mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 size-3.5" />
                                <span className="text-gray-500 font-medium">Remember me</span>
                            </label>
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-blue-600/30 transform transition active:scale-[0.98] text-sm tracking-wide mt-4"
                        >
                            SIGN IN
                        </button>
                    </form>

                    {/* Social Login */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400 mb-3 font-medium">Or sign in with</p>
                        <div className="flex justify-center gap-3">
                            <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                            </button>
                            <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                                <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - CONTENT (Blue/Purple Gradient) */}
                <div className="w-full md:w-1/2 p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white flex flex-col justify-center items-center text-center relative overflow-hidden order-1 md:order-2">
                    {/* Decorative Elements matching logo colors */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/20 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">New Here?</h2>
                        <p className="text-blue-100/90 mb-8 text-sm leading-relaxed max-w-[200px] mx-auto">
                            Sign up and discover a great amount of new opportunities. Join our community today!
                        </p>

                        <div className="space-y-3">
                            <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold">NEED AN ACCOUNT?</p>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-10 py-3 rounded-lg bg-white text-blue-600 text-sm font-bold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                SIGN UP
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignIn;
