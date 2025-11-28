import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Building, Users, Globe, Upload, ArrowRight, ArrowLeft, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EmployerRegister: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Account Info
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        designation: '',

        // Step 2: Company Info
        companyName: '',
        companySize: '',
        industry: '',
        website: '',
        location: '',
        companyLogo: null as File | null,

        // Step 3: Verification
        gstNumber: '',
        companyRegistration: '',
        linkedinProfile: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, companyLogo: e.target.files[0] });
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
                    redirectTo: `${window.location.origin}/employer/dashboard`,
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
            if (!formData.companyName || !formData.industry) {
                alert('Please fill all required company information!');
                return;
            }
            setStep(3);
            return;
        }

        // Final submission
        try {
            // In a real app, this would save to Supabase
            console.log('Employer Registration Data:', formData);
            alert('Registration successful! Your account is pending verification. You will be notified via email.');
            navigate('/employer/dashboard');
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
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-purple to-pink-500 bg-clip-text text-transparent">
                        Join HireGo AI as an Employer
                    </h1>
                    <p className="text-gray-400">Find and hire the best talent with AI-powered recruitment</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between mb-8 max-w-2xl mx-auto">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-10 h-10 flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-neon-purple text-white border-neon-purple' : 'bg-transparent text-gray-500 border-gray-600'
                                }`} style={{ borderRadius: '0px' }}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-neon-purple' : 'bg-gray-600'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-[#0f1629] border-2 border-white/10 p-8" style={{ borderRadius: '0px' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Account Information */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>

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
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
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
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="john@company.com"
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
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
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
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
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
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Designation *</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="designation"
                                                value={formData.designation}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="HR Manager / Recruiter"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Company Information */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Company Name *</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="TechCorp Inc."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Company Size *</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <select
                                                name="companySize"
                                                value={formData.companySize}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                                style={{ borderRadius: '0px' }}
                                            >
                                                <option value="">Select Size</option>
                                                <option value="1-10">1-10 employees</option>
                                                <option value="11-50">11-50 employees</option>
                                                <option value="51-200">51-200 employees</option>
                                                <option value="201-500">201-500 employees</option>
                                                <option value="501-1000">501-1000 employees</option>
                                                <option value="1000+">1000+ employees</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Industry *</label>
                                        <select
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                            style={{ borderRadius: '0px' }}
                                        >
                                            <option value="">Select Industry</option>
                                            <option value="technology">Technology</option>
                                            <option value="finance">Finance</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="education">Education</option>
                                            <option value="retail">Retail</option>
                                            <option value="manufacturing">Manufacturing</option>
                                            <option value="consulting">Consulting</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Website</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="https://company.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Company Location *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                                style={{ borderRadius: '0px' }}
                                                placeholder="Mumbai, India"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Company Logo (Optional)</label>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors file:mr-4 file:py-1 file:px-4 file:border-0 file:bg-neon-purple file:text-white file:font-semibold"
                                                style={{ borderRadius: '0px' }}
                                            />
                                        </div>
                                        {formData.companyLogo && (
                                            <p className="text-sm text-green-400 mt-2">✓ {formData.companyLogo.name}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Verification */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Verification Details</h2>

                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 mb-6" style={{ borderRadius: '0px' }}>
                                    <p className="text-sm text-yellow-200">
                                        <strong>Note:</strong> Your account will be verified by our team within 24-48 hours. You'll receive an email once approved.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">GST Number (Optional)</label>
                                        <input
                                            type="text"
                                            name="gstNumber"
                                            value={formData.gstNumber}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                            style={{ borderRadius: '0px' }}
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Company Registration Number (Optional)</label>
                                        <input
                                            type="text"
                                            name="companyRegistration"
                                            value={formData.companyRegistration}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                            style={{ borderRadius: '0px' }}
                                            placeholder="CIN/Registration Number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">LinkedIn Company Profile (Optional)</label>
                                        <input
                                            type="url"
                                            name="linkedinProfile"
                                            value={formData.linkedinProfile}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-purple transition-colors"
                                            style={{ borderRadius: '0px' }}
                                            placeholder="https://linkedin.com/company/..."
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-neon-purple/10 border border-neon-purple/30 mt-6" style={{ borderRadius: '0px' }}>
                                    <p className="text-sm text-gray-300">
                                        By registering, you agree to our <Link to="/terms" className="text-neon-purple hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-neon-purple hover:underline">Privacy Policy</Link>.
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
                                className="ml-auto px-8 py-3 bg-gradient-to-r from-neon-purple to-pink-500 text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                                style={{ borderRadius: '0px' }}
                            >
                                {step === 3 ? 'Complete Registration' : 'Next'}
                                {step < 3 && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account? <Link to="/auth" className="text-neon-purple hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmployerRegister;
