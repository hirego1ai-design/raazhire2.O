import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Briefcase, UserCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
    const [userType, setUserType] = useState<'candidate' | 'employer'>('candidate');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Redirect to full registration flow
        navigate('/create-account');
    };

    const handleSocialLogin = (provider: 'google' | 'linkedin') => {
        console.log(`Sign up with ${provider}`);
        // Implement social sign up logic here
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-40 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Sign Up Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-lg"
            >
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-slate-400">Join us and start your journey</p>
                    </div>

                    {/* User Type Toggle */}
                    <div className="flex gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setUserType('candidate')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                userType === 'candidate'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <User size={18} />
                            Candidate
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('employer')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                userType === 'employer'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <Briefcase size={18} />
                            Employer
                        </button>
                    </div>

                    {/* Social Login */}
                    <div className="space-y-3 mb-6">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border border-gray-200"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('linkedin')}
                            className="w-full py-3 px-4 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            Continue with LinkedIn
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-800/40 text-slate-400">Or continue with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <div className="relative">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full py-3 pl-12 pr-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full py-3 pl-12 pr-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full py-3 pl-12 pr-12 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full py-3 pl-12 pr-12 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className="w-4 h-4 mt-1 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-2 focus:ring-purple-500"
                                required
                            />
                            <label htmlFor="terms" className="text-sm text-slate-300">
                                I agree to the{' '}
                                <a href="#" className="text-purple-400 hover:text-purple-300">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-purple-400 hover:text-purple-300">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                        >
                            Create Account
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/signin" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUp;
