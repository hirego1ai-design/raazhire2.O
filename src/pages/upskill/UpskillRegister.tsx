import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    User, Mail, Lock, Briefcase, GraduationCap,
    Code, TrendingUp, ChevronRight, CheckCircle,
    ArrowLeft, Loader
} from 'lucide-react';

type UserRole = 'fresher' | 'professional' | null;

interface FormData {
    fullName: string;
    email: string;
    password: string;
    education: string;
    desiredSkill: string;
    targetIndustry: string;
    currentRole: string;
    experience: string;
    upgradeSkill: string;
}

const UpskillRegister: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        password: '',
        education: '',
        desiredSkill: '',
        targetIndustry: '',
        currentRole: '',
        experience: '',
        upgradeSkill: ''
    });

    const updateForm = (key: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleRegister = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!supabase) {
                throw new Error('Supabase is not initialized. Please check your configuration.');
            }
            // 1. Sign up with Supabase
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'candidate', // Default to candidate role for shared login
                        upskill_role: role,
                        // Store specific details in metadata
                        upskill_profile: role === 'fresher' ? {
                            education: formData.education,
                            desired_skill: formData.desiredSkill,
                            target_industry: formData.targetIndustry
                        } : {
                            current_role: formData.currentRole,
                            experience: formData.experience,
                            upgrade_skill: formData.upgradeSkill
                        }
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                // Success! Redirect to Upskill Dashboard
                // In a real app, you might want to create a specific record in your 'candidates' table here too
                navigate('/upskill/dashboard');
            }

        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const slideIn = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black font-outfit flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
                {/* Progress Bar */}
                <div className="h-1 bg-white/10 w-full">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                        initial={{ width: '33%' }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/upskill" className="inline-block mb-4">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                HireGo Upskill
                            </h1>
                        </Link>
                        <h2 className="text-xl text-white font-semibold">
                            {step === 1 ? 'Create your account' :
                                step === 2 ? 'Tell us about yourself' :
                                    'Customize your learning'}
                        </h2>
                        <p className="text-gray-400 text-sm mt-2">
                            {step === 1 ? 'Start your journey to career excellence' :
                                step === 2 ? 'Help us personalize your experience' :
                                    'Set your goals and get started'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={slideIn}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => updateForm('fullName', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder-gray-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateForm('email', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder-gray-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => updateForm('password', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder-gray-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.fullName || !formData.email || !formData.password}
                                    className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue <ChevronRight className="w-5 h-5" />
                                </button>

                                <p className="text-center text-sm text-gray-400 mt-4">
                                    Already have an account? <Link to="/signin" className="text-cyan-400 hover:underline">Sign In</Link>
                                </p>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={slideIn}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => { setRole('professional'); setStep(3); }}
                                        className="relative group p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 rounded-2xl transition-all text-left"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                                                <Briefcase className="w-8 h-8" />
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">
                                                <ChevronRight />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mt-4">Working Professional</h3>
                                        <p className="text-sm text-gray-400 mt-1">I want to clear skills gaps and advance my career.</p>
                                    </button>

                                    <button
                                        onClick={() => { setRole('fresher'); setStep(3); }}
                                        className="relative group p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 rounded-2xl transition-all text-left"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 group-hover:text-purple-300 transition-colors">
                                                <GraduationCap className="w-8 h-8" />
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
                                                <ChevronRight />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mt-4">Fresher / Student</h3>
                                        <p className="text-sm text-gray-400 mt-1">I want to learn new skills and get job ready.</p>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full mt-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Account
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && role === 'fresher' && (
                            <motion.div
                                key="step3-fresher"
                                variants={slideIn}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Highest Education</label>
                                    <input
                                        type="text"
                                        value={formData.education}
                                        onChange={(e) => updateForm('education', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-500"
                                        placeholder="e.g. B.Tech Computer Science"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Desired Skill to Learn</label>
                                    <input
                                        type="text"
                                        value={formData.desiredSkill}
                                        onChange={(e) => updateForm('desiredSkill', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-500"
                                        placeholder="e.g. Python, Digital Marketing"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Target Industry</label>
                                    <input
                                        type="text"
                                        value={formData.targetIndustry}
                                        onChange={(e) => updateForm('targetIndustry', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-500"
                                        placeholder="e.g. IT, Finance, Creative"
                                    />
                                </div>

                                <button
                                    onClick={handleRegister}
                                    disabled={loading || !formData.education || !formData.desiredSkill}
                                    className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    {loading ? 'Creating Account...' : 'Complete Registration'}
                                </button>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full mt-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Role
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && role === 'professional' && (
                            <motion.div
                                key="step3-pro"
                                variants={slideIn}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Current Role</label>
                                    <input
                                        type="text"
                                        value={formData.currentRole}
                                        onChange={(e) => updateForm('currentRole', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-500"
                                        placeholder="e.g. Senior Developer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Years of Experience</label>
                                    <input
                                        type="text"
                                        value={formData.experience}
                                        onChange={(e) => updateForm('experience', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-500"
                                        placeholder="e.g. 5 Years"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Skill to Upgrade</label>
                                    <input
                                        type="text"
                                        value={formData.upgradeSkill}
                                        onChange={(e) => updateForm('upgradeSkill', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-500"
                                        placeholder="e.g. AI Leadership, Cloud Architecture"
                                    />
                                </div>

                                <button
                                    onClick={handleRegister}
                                    disabled={loading || !formData.currentRole || !formData.upgradeSkill}
                                    className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    {loading ? 'Creating Account...' : 'Complete Registration'}
                                </button>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full mt-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Role
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default UpskillRegister;
