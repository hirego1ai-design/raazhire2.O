import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Briefcase, GraduationCap, Code, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CandidateRegister: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',

        // Step 2: Professional Info
        currentRole: '',
        experience: '',
        education: '',
        skills: [] as string[],
        resume: null as File | null,

        // Step 3: Preferences
        jobType: 'full-time',
        expectedSalary: '',
        noticePeriod: '',
    });

    const [skillInput, setSkillInput] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resume: e.target.files[0] });
        }
    };

    const handleSocialRegister = async (provider: 'google' | 'linkedin') => {
        if (!supabase) {
            alert('Social registration is not configured. Please contact the administrator.');
            return;
        }
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/candidate/dashboard`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error registering:', error);
            alert('Error registering with ' + provider);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (step === 1) {
            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            if (formData.password.length < 6) {
                alert('Password must be at least 6 characters!');
                return;
            }
            setStep(2);
            return;
        }

        if (step === 2) {
            if (formData.skills.length === 0) {
                alert('Please add at least one skill!');
                return;
            }
            setStep(3);
            return;
        }

        // Final submission
        try {
            // In a real app, this would save to Supabase
            console.log('Registration Data:', formData);
            alert('Registration successful! Redirecting to dashboard...');
            navigate('/candidate/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                        Join HireGo AI as a Candidate
                    </h1>
                    <p className="text-gray-400">Create your profile and get discovered by top employers</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between mb-8 max-w-2xl mx-auto">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-10 h-10 flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-neon-cyan text-black border-neon-cyan' : 'bg-transparent text-gray-500 border-gray-600'
                                }`} style={{ borderRadius: '0px' }}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-neon-cyan' : 'bg-gray-600'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-[#0f1629] border-2 border-white/10 p-8" style={{ borderRadius: '0px' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>

                                {/* Social Registration */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => handleSocialRegister('google')}
                                        className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                        style={{ borderRadius: '0px' }}
                                    >
                                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                        <span className="text-white">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSocialRegister('linkedin')}
                                        className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                        style={{ borderRadius: '0px' }}
                                    >
                                        <img src="https://www.linkedin.com/favicon.ico" alt="LinkedIn" className="w-5 h-5" />
                                        <span className="text-white">LinkedIn</span>
                                    </button>
                                </div>

                                <div className="relative text-center my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative inline-block bg-[#0f1629] px-4 text-gray-400 text-sm">OR</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Password *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Confirm Password *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Location *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="Mumbai, India"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Professional Information */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Professional Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Current Role *</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="currentRole"
                                                value={formData.currentRole}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="Frontend Developer"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Experience *</label>
                                        <select
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }}
                                        >
                                            <option value="">Select Experience</option>
                                            <option value="0-1">0-1 years</option>
                                            <option value="1-3">1-3 years</option>
                                            <option value="3-5">3-5 years</option>
                                            <option value="5-10">5-10 years</option>
                                            <option value="10+">10+ years</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Education *</label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="education"
                                                value={formData.education}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="B.Tech in Computer Science"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Skills * (Add at least 3)</label>
                                        <div className="flex gap-2 mb-3">
                                            <div className="relative flex-1">
                                                <Code className="absolute left-3 top-3 text-gray-500" size={18} />
                                                <input
                                                    type="text"
                                                    value={skillInput}
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                                    className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                    style={{ borderRadius: '0px' }}
                                                    placeholder="e.g., React, Node.js, Python"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddSkill}
                                                className="px-6 py-2.5 bg-neon-cyan text-black font-semibold hover:bg-neon-cyan/80 transition-all"
                                                style={{ borderRadius: '0px' }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1 bg-neon-purple/20 border border-neon-purple text-neon-purple text-sm flex items-center gap-2"
                                                    style={{ borderRadius: '0px' }}
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="hover:text-red-400"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Upload Resume (Optional)</label>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors file:mr-4 file:py-1 file:px-4 file:border-0 file:bg-neon-cyan file:text-black file:font-semibold"
                                                style={{ borderRadius: '0px' }}
                                            />
                                        </div>
                                        {formData.resume && (
                                            <p className="text-sm text-green-400 mt-2">✓ {formData.resume.name}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Preferences */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Job Preferences</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Job Type *</label>
                                        <select
                                            name="jobType"
                                            value={formData.jobType}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }}
                                        >
                                            <option value="full-time">Full-Time</option>
                                            <option value="part-time">Part-Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="freelance">Freelance</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Expected Salary (Annual) *</label>
                                        <input
                                            type="text"
                                            name="expectedSalary"
                                            value={formData.expectedSalary}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }}
                                            placeholder="e.g., ₹10-15 LPA"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Notice Period *</label>
                                        <select
                                            name="noticePeriod"
                                            value={formData.noticePeriod}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }}
                                        >
                                            <option value="">Select Notice Period</option>
                                            <option value="immediate">Immediate</option>
                                            <option value="15-days">15 Days</option>
                                            <option value="1-month">1 Month</option>
                                            <option value="2-months">2 Months</option>
                                            <option value="3-months">3 Months</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-neon-cyan/10 border border-neon-cyan/30 mt-6" style={{ borderRadius: '0px' }}>
                                    <p className="text-sm text-gray-300">
                                        By registering, you agree to our <Link to="/terms" className="text-neon-cyan hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-neon-cyan hover:underline">Privacy Policy</Link>.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                    style={{ borderRadius: '0px' }}
                                >
                                    <ArrowLeft size={18} />
                                    Previous
                                </button>
                            )}

                            <button
                                type="submit"
                                className="ml-auto px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                                style={{ borderRadius: '0px' }}
                            >
                                {step === 3 ? 'Complete Registration' : 'Next'}
                                {step < 3 && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account? <Link to="/auth" className="text-neon-cyan hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CandidateRegister;
