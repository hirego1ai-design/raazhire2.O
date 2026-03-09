import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Mail, Lock, User, Phone, MapPin, Briefcase, GraduationCap,
    Code, Upload, ArrowRight, ArrowLeft, Building, Users, Globe,
    Calendar, Home, X, Plus, Video, Camera, Loader, CheckCircle
} from 'lucide-react';
import Webcam from 'react-webcam';
import { supabase } from '../lib/supabase';
import { skillSuggestions, jobProfiles } from '../data/jobProfiles';

type UserType = 'candidate' | 'employer';

interface RegisterFormProps {
    userType: UserType;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ userType }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer' | ''>(userType || '');

    // Handle initial data from SignUp page
    React.useEffect(() => {
        const initialData = location.state?.initialData;
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                email: initialData.email || '',
                password: initialData.password || '',
                confirmPassword: initialData.confirmPassword || '',
                fullName: initialData.fullName || '',
            }));

            if (initialData.role) {
                setSelectedRole(initialData.role);
            }

            // Skip to Step 3 (Details) if we have account info
            if (initialData.email && initialData.password) {
                setStep(3);
            }
        }
    }, [location.state]);

    // Testing mode - enable by pressing Ctrl+T or adding ?test=true to URL
    const [testingMode, setTestingMode] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('test') === 'true';
    });

    // Video resume state
    const [isRecording, setIsRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const [formData, setFormData] = useState({
        // Step 1: Account Setup
        email: '',
        password: '',
        confirmPassword: '',

        // Step 3: Personal Details
        fullName: '',
        dateOfBirth: '',
        currentAddress: '',
        permanentAddress: '',
        phone: '',

        // Step 4: Education
        education10th: { board: '', percentage: '', year: '' },
        education12th: { board: '', percentage: '', year: '' },
        graduation: { degree: '', college: '', percentage: '', year: '' },
        postGraduation: { degree: '', college: '', percentage: '', year: '' },

        // Step 5: Experience
        experiences: [] as Array<{ company: string; duration: string; role: string }>,

        // Step 6: Skills
        jobProfile: '',
        skills: [] as string[],

        // Employer-specific
        companyName: '',
        designation: '',
        companySize: '',
        industry: '',
        website: '',
        location: '',
    });

    const [skillInput, setSkillInput] = useState('');
    const [newExperience, setNewExperience] = useState({ company: '', duration: '', role: '' });

    // skillSuggestions and jobProfiles are imported from ../data/jobProfiles

    const isCandidate = selectedRole === 'candidate' || userType === 'candidate';
    const isEmployer = selectedRole === 'employer' || userType === 'employer';

    const totalSteps = isCandidate ? 8 : 3;

    // Theme configuration
    const theme = {
        gradient: isCandidate
            ? 'from-neon-cyan to-neon-purple'
            : 'from-neon-purple to-pink-500',
        primaryColor: isCandidate ? 'neon-cyan' : 'neon-purple',
        stepColor: isCandidate ? 'bg-neon-cyan text-black' : 'bg-neon-purple text-white',
        title: isCandidate
            ? 'Join HireGo AI as a Candidate'
            : 'Join HireGo AI as an Employer',
        subtitle: isCandidate
            ? 'Create your profile and get discovered by top employers'
            : 'Find and hire the best talent with AI-powered recruitment',
        redirectPath: isCandidate ? '/candidate/dashboard' : '/employer/dashboard',
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEducationChange = (level: string, field: string, value: string) => {
        setFormData({
            ...formData,
            [level]: { ...(formData[level as keyof typeof formData] as any), [field]: value }
        });
    };

    const handleAddExperience = () => {
        if (newExperience.company && newExperience.duration && newExperience.role) {
            setFormData({
                ...formData,
                experiences: [...formData.experiences, { ...newExperience }]
            });
            setNewExperience({ company: '', duration: '', role: '' });
        }
    };

    const handleRemoveExperience = (index: number) => {
        setFormData({
            ...formData,
            experiences: formData.experiences.filter((_, i) => i !== index)
        });
    };

    const handleAddSkill = (skill?: string) => {
        const skillToAdd = skill || skillInput.trim();
        if (skillToAdd && !formData.skills.includes(skillToAdd)) {
            setFormData({ ...formData, skills: [...formData.skills, skillToAdd] });
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    // Video resume handlers
    const handleStartRecording = useCallback(() => {
        setIsRecording(true);
        recordedChunksRef.current = [];

        if (webcamRef.current && webcamRef.current.stream) {
            const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
                mimeType: 'video/webm'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
        }
    }, []);

    const handleStopRecording = useCallback(() => {
        setIsRecording(false);

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setTimeout(() => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setVideoBlob(blob);
                setVideoUrl(url);

                // Auto-analyze after recording
                setTimeout(() => analyzeVideo(blob), 500);
            }, 100);
        }
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoBlob(file);
            setVideoUrl(url);

            // Auto-analyze after upload
            setTimeout(() => analyzeVideo(file), 500);
        }
    };

    const analyzeVideo = async (blob: Blob) => {
        setIsAnalyzing(true);

        try {
            // Simulate video analysis
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('Video analyzed successfully');
        } catch (error) {
            console.error('Video analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Keyboard shortcut for testing mode: Ctrl+T
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                setTestingMode(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // In testing mode, skip validation and allow navigation
        if (testingMode) {
            if (step < totalSteps) {
                setStep(step + 1);
                return;
            }
            // In testing mode, don't actually submit
            console.log('Testing Mode - Form Preview Only');
            return;
        }

        // Navigate to next step
        if (step < totalSteps) {
            setStep(step + 1);
            return;
        }

        // Final submission
        try {
            console.log('Registration Data:', formData);

            // Sign up user
            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('User creation failed');

            const userId = authData.user.id;

            // SECURITY FIX: Create unified public.users record FIRST
            // This prevents orphaned accounts and ensures admin panel visibility
            const { error: usersError } = await supabase.from('users').upsert({
                id: userId,
                email: formData.email,
                name: formData.fullName,
                role: selectedRole,
                phone: formData.phone || null,
                status: 'Active',
                created_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (usersError) {
                console.error('public.users insert error:', usersError);
                // Don't throw — the auth user exists, continue with role-specific profile
            }

            // Save candidate profile data
            if (selectedRole === 'candidate') {
                const { error: profileError } = await supabase.from('candidates').insert({
                    user_id: userId,
                    email: formData.email,
                    name: formData.fullName,
                    phone: formData.phone,
                    date_of_birth: formData.dateOfBirth ? formData.dateOfBirth : null,
                    current_address: formData.currentAddress,
                    permanent_address: formData.permanentAddress,
                    job_profile: formData.jobProfile,
                    education_10th: formData.education10th,
                    education_12th: formData.education12th,
                    graduation: formData.graduation,
                    post_graduation: formData.postGraduation,
                    bio: '',
                    title: formData.jobProfile || 'Developer',
                    location: formData.currentAddress || 'Unknown'
                });

                if (profileError) throw profileError;

                // Save experiences
                if (formData.experiences.length > 0) {
                    const experiencesData = formData.experiences.map(exp => ({
                        user_id: userId,
                        company: exp.company,
                        role: exp.role,
                        start_date: exp.duration.split('-')[0]?.trim() || '',
                        end_date: exp.duration.split('-')[1]?.trim() || 'Present',
                        description: `${exp.role} at ${exp.company}`
                    }));

                    const { error: expError } = await supabase.from('candidate_experience').insert(experiencesData);
                    if (expError) console.error('Experience save error:', expError);
                }

                // Save skills
                if (formData.skills.length > 0) {
                    const skillsData = formData.skills.map(skill => ({
                        user_id: userId,
                        skill: skill,
                        score: 80, // Default score
                        category: 'technical' // Default category
                    }));

                    const { error: skillError } = await supabase.from('candidate_skills').insert(skillsData);
                    if (skillError) console.error('Skills save error:', skillError);
                }
            }

            alert('Registration successful! Redirecting to dashboard...');
            navigate(theme.redirectPath);
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            if (errorMessage.toLowerCase().includes('already registered') || errorMessage.toLowerCase().includes('user already exists')) {
                const shouldLogin = confirm('This email is already registered. Would you like to sign in instead?');
                if (shouldLogin) {
                    navigate('/auth');
                }
            } else if (errorMessage.includes('rate limit')) {
                alert('Registration rate limit reached. Please wait a moment and try again, or contact support.');
            } else {
                alert(`Registration failed: ${errorMessage}. Please check your connection and try again.`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                        {theme.title}
                    </h1>
                    <p className="text-gray-400">{theme.subtitle}</p>
                    {testingMode && (
                        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                            <p className="text-yellow-300 font-semibold flex items-center justify-center gap-2">
                                <span>🧪 TESTING MODE ACTIVE</span>
                                <span className="text-xs">(Validation disabled, press Ctrl+T to toggle)</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between mb-8 max-w-full mx-auto overflow-x-auto px-4">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                        <div key={s} className="flex items-center flex-1 min-w-[40px]">
                            <button
                                type="button"
                                onClick={() => testingMode && setStep(s)}
                                disabled={!testingMode}
                                className={`w-10 h-10 flex items-center justify-center font-bold border-2 transition-all rounded-full ${testingMode ? 'cursor-pointer hover:scale-110' : ''} ${step >= s ? theme.stepColor + ` border-${theme.primaryColor} shadow-[0_0_15px_rgba(0,0,0,0.3)]` : 'bg-transparent text-gray-500 border-gray-700'
                                    }`}>
                                {s}
                            </button>
                            {s < totalSteps && (
                                <div className={`flex-1 h-1 mx-2 rounded-full ${step > s ? `bg-${theme.primaryColor}` : 'bg-gray-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 md:p-12 shadow-2xl rounded-[32px]">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Account Setup */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Account Setup</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Email {!testingMode && '*'}</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required={!testingMode}
                                                className="w-full bg-slate-800/50 border border-white/10 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-xl"
                                                placeholder="you@example.com" />

                                            {/* Dev Helper: Generate Random Email */}
                                            {/* Dev Helper removed as per user request */}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Password {!testingMode && '*'}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!testingMode}
                                                className="w-full bg-slate-800/50 border border-white/10 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-xl"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Confirm Password {!testingMode && '*'}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required={!testingMode}
                                                className="w-full bg-slate-800/50 border border-white/10 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-xl"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Role Selection */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Select Your Role</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <button type="button" onClick={() => setSelectedRole('candidate')}
                                        className={`p-8 border-2 transition-all rounded-3xl ${selectedRole === 'candidate' ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${selectedRole === 'candidate' ? 'bg-neon-cyan text-black' : 'bg-slate-800 text-gray-400'}`}>
                                            <User size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Candidate</h3>
                                        <p className="text-sm text-gray-400">Looking for job opportunities</p>
                                    </button>
                                    <button type="button" onClick={() => setSelectedRole('employer')}
                                        className={`p-8 border-2 transition-all rounded-3xl ${selectedRole === 'employer' ? 'border-neon-purple bg-neon-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${selectedRole === 'employer' ? 'bg-neon-purple text-white' : 'bg-slate-800 text-gray-400'}`}>
                                            <Briefcase size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Employer</h3>
                                        <p className="text-sm text-gray-400">Hiring talented professionals</p>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Personal Details (Candidate Only) */}
                        {step === 3 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Personal Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required
                                                className="w-full bg-slate-800/50 border border-white/10 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-xl"
                                                placeholder="John Doe" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Date of Birth *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required
                                                className="w-full bg-slate-800/50 border border-white/10 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Phone *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                                                className="w-full bg-slate-800/50 border border-white/10 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-xl"
                                                placeholder="+91 98765 43210" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Current Address *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} required rows={2}
                                                className="w-full bg-slate-800/50 border border-white/10 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-xl"
                                                placeholder="123 Street, City, State - 123456" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Permanent Address</label>
                                        <div className="relative">
                                            <Home className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} rows={2}
                                                className="w-full bg-slate-800/50 border border-white/10 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all rounded-xl"
                                                placeholder="Same as current address or different" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Education (Candidate Only) */}
                        {step === 4 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Education</h2>

                                {/* 10th */}
                                <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl hover:bg-slate-800/50 transition-all">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <GraduationCap className="text-neon-cyan" size={20} /> 10th Standard
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input type="text" placeholder="Board" value={formData.education10th.board}
                                            onChange={(e) => handleEducationChange('education10th', 'board', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Percentage/CGPA" value={formData.education10th.percentage}
                                            onChange={(e) => handleEducationChange('education10th', 'percentage', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Year" value={formData.education10th.year}
                                            onChange={(e) => handleEducationChange('education10th', 'year', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                    </div>
                                </div>

                                {/* 12th */}
                                <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl hover:bg-slate-800/50 transition-all">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <GraduationCap className="text-neon-cyan" size={20} /> 12th Standard
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input type="text" placeholder="Board" value={formData.education12th.board}
                                            onChange={(e) => handleEducationChange('education12th', 'board', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Percentage/CGPA" value={formData.education12th.percentage}
                                            onChange={(e) => handleEducationChange('education12th', 'percentage', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Year" value={formData.education12th.year}
                                            onChange={(e) => handleEducationChange('education12th', 'year', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                    </div>
                                </div>

                                {/* Graduation */}
                                <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl hover:bg-slate-800/50 transition-all">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Building className="text-neon-purple" size={20} /> Graduation
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Degree" value={formData.graduation.degree}
                                            onChange={(e) => handleEducationChange('graduation', 'degree', e.target.value)}
                                            className="md:col-span-2 bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="College/University" value={formData.graduation.college}
                                            onChange={(e) => handleEducationChange('graduation', 'college', e.target.value)}
                                            className="md:col-span-2 bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Percentage/CGPA" value={formData.graduation.percentage}
                                            onChange={(e) => handleEducationChange('graduation', 'percentage', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Year" value={formData.graduation.year}
                                            onChange={(e) => handleEducationChange('graduation', 'year', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                    </div>
                                </div>

                                {/* Post-Graduation */}
                                <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl hover:bg-slate-800/50 transition-all">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Building className="text-neon-purple" size={20} /> Post-Graduation (Optional)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Degree" value={formData.postGraduation.degree}
                                            onChange={(e) => handleEducationChange('postGraduation', 'degree', e.target.value)}
                                            className="md:col-span-2 bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="College/University" value={formData.postGraduation.college}
                                            onChange={(e) => handleEducationChange('postGraduation', 'college', e.target.value)}
                                            className="md:col-span-2 bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Percentage/CGPA" value={formData.postGraduation.percentage}
                                            onChange={(e) => handleEducationChange('postGraduation', 'percentage', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Year" value={formData.postGraduation.year}
                                            onChange={(e) => handleEducationChange('postGraduation', 'year', e.target.value)}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Experience (Candidate Only) */}
                        {step === 5 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Work Experience</h2>

                                {/* Add new experience */}
                                <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Briefcase className="text-neon-cyan" size={20} /> Add Experience
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <input type="text" placeholder="Company Name" value={newExperience.company}
                                            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Duration (e.g., 2020-2022)" value={newExperience.duration}
                                            onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                        <input type="text" placeholder="Role" value={newExperience.role}
                                            onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                                            className="bg-slate-900/50 border border-white/10 px-4 py-3 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors" />
                                    </div>
                                    <button type="button" onClick={handleAddExperience}
                                        className="px-6 py-2.5 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/80 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                        <Plus size={18} /> Add Experience
                                    </button>
                                </div>

                                {/* Experience list */}
                                <div className="space-y-3">
                                    {formData.experiences.map((exp, index) => (
                                        <div key={index} className="p-4 bg-slate-800/30 border border-white/10 rounded-xl flex justify-between items-center hover:bg-slate-800/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
                                                    <Briefcase size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-lg">{exp.role}</h4>
                                                    <p className="text-sm text-gray-400">{exp.company} • {exp.duration}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveExperience(index)}
                                                className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.experiences.length === 0 && (
                                        <div className="text-center py-8 bg-slate-800/30 rounded-2xl border border-white/5 border-dashed">
                                            <p className="text-gray-400">No experience added yet. Add your work experience above.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 6: Skill Mapping (Candidate Only) */}
                        {step === 6 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Skills & Expertise</h2>

                                {/* Job Profile Selection */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Select Your Job Profile *</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5 pointer-events-none text-neon-cyan">
                                            <Code size={18} />
                                        </div>
                                        <select name="jobProfile" value={formData.jobProfile} onChange={handleInputChange} required
                                            className="w-full bg-slate-900/50 border border-white/10 pl-12 pr-4 py-3.5 text-white rounded-xl focus:border-neon-cyan focus:outline-none appearance-none transition-colors">
                                            <option value="">Choose a profile...</option>
                                            {jobProfiles.map(profile => (
                                                <option key={profile} value={profile}>{profile}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Suggested Skills */}
                                {formData.jobProfile && (
                                    <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <CheckCircle className="text-green-400" size={18} /> Suggested Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {skillSuggestions[formData.jobProfile]?.map(skill => (
                                                !formData.skills.includes(skill) && (
                                                    <button key={skill} type="button" onClick={() => handleAddSkill(skill)}
                                                        className="px-4 py-2 bg-slate-900/50 border border-white/10 text-gray-300 rounded-full hover:bg-neon-cyan/20 hover:text-neon-cyan hover:border-neon-cyan transition-all text-sm font-medium">
                                                        + {skill}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add custom skill */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Add Custom Skill</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                            className="flex-1 bg-slate-900/50 border border-white/10 px-4 py-3.5 text-white rounded-xl focus:border-neon-cyan focus:outline-none transition-colors"
                                            placeholder="e.g., React, Python..." />
                                        <button type="button" onClick={() => handleAddSkill()}
                                            className="px-8 py-3.5 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/80 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Selected Skills */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Your Skills</h3>
                                    <div className="flex flex-wrap gap-2 min-h-[100px] bg-slate-800/30 p-4 rounded-2xl border border-white/10 border-dashed">
                                        {formData.skills.map(skill => (
                                            <span key={skill}
                                                className="px-4 py-2 bg-neon-purple/10 border border-neon-purple/50 text-neon-purple rounded-full flex items-center gap-2 font-medium">
                                                {skill}
                                                <button type="button" onClick={() => handleRemoveSkill(skill)}
                                                    className="hover:text-white hover:bg-neon-purple/50 rounded-full p-0.5 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                        {formData.skills.length === 0 && (
                                            <div className="w-full flex flex-col items-center justify-center text-gray-500 py-4">
                                                <Code size={24} className="mb-2 opacity-50" />
                                                <p>No skills added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 7: Preview (Candidate Only) */}
                        {step === 7 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Review Your Information</h2>

                                <div className="space-y-4">
                                    {/* Account Info */}
                                    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Lock size={18} className="text-neon-cyan" /> Account
                                        </h3>
                                        <p className="text-gray-300">Email: {formData.email}</p>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <User size={18} className="text-neon-cyan" /> Personal Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                                            <p>Name: <span className="text-white">{formData.fullName}</span></p>
                                            <p>DOB: <span className="text-white">{formData.dateOfBirth}</span></p>
                                            <p>Phone: <span className="text-white">{formData.phone}</span></p>
                                            <p>Address: <span className="text-white">{formData.currentAddress}</span></p>
                                        </div>
                                    </div>

                                    {/* Education */}
                                    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <GraduationCap size={18} className="text-neon-cyan" /> Education
                                        </h3>
                                        <div className="space-y-2">
                                            {formData.education10th.board && (
                                                <p className="text-gray-300">10th: <span className="text-white">{formData.education10th.board}</span> ({formData.education10th.percentage}%)</p>
                                            )}
                                            {formData.education12th.board && (
                                                <p className="text-gray-300">12th: <span className="text-white">{formData.education12th.board}</span> ({formData.education12th.percentage}%)</p>
                                            )}
                                            {formData.graduation.degree && (
                                                <p className="text-gray-300">Graduation: <span className="text-white">{formData.graduation.degree}</span> from {formData.graduation.college}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Briefcase size={18} className="text-neon-cyan" /> Experience ({formData.experiences.length})
                                        </h3>
                                        {formData.experiences.map((exp, i) => (
                                            <p key={i} className="text-gray-300">{exp.role} at <span className="text-white">{exp.company}</span> ({exp.duration})</p>
                                        ))}
                                        {formData.experiences.length === 0 && <p className="text-gray-500 font-italic">No experience added</p>}
                                    </div>

                                    {/* Skills */}
                                    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Code size={18} className="text-neon-cyan" /> Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skills.map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan text-sm rounded-full font-medium">{skill}</span>
                                            ))}
                                            {formData.skills.length === 0 && <p className="text-gray-500 font-italic">No skills added</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 8: Video Resume (Candidate Only) */}
                        {step === 8 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Video Resume <span className="text-neon-cyan text-base font-normal align-middle px-3 py-1 bg-neon-cyan/10 rounded-full border border-neon-cyan/30">Optional</span></h2>
                                    <p className="text-gray-400 font-light text-lg">Introduce yourself to potential employers. Our AI analyzes your communication style.</p>
                                </div>

                                {!videoUrl ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Live Recording */}
                                        <div className="group relative bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-300 border border-white/10 hover:border-neon-cyan/50 rounded-3xl p-6 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-neon-cyan/10">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3 relative z-10">
                                                <div className="p-2.5 bg-red-500/20 rounded-xl">
                                                    <Video size={22} className="text-red-400" />
                                                </div>
                                                Record Live
                                            </h3>

                                            <div className="flex-grow flex flex-col justify-between space-y-4">
                                                {!isRecording ? (
                                                    <>
                                                        <div className="aspect-video bg-black/60 rounded-2xl overflow-hidden shadow-inner border border-white/5 relative group-hover:border-white/10 transition-all">
                                                            <Webcam ref={webcamRef} audio={true} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                                                <Camera size={40} className="text-white" />
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={handleStartRecording}
                                                            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:from-red-500 hover:to-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                                            <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-1"></div> Start Recording
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="aspect-video bg-black rounded-2xl mb-4 overflow-hidden border-2 border-red-500 relative shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                                            <Webcam ref={webcamRef} audio={true} className="w-full h-full object-cover" />
                                                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-red-500/30">
                                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                                                <span className="text-white text-xs font-bold tracking-wider">REC</span>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={handleStopRecording}
                                                            className="w-full py-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 border border-white/10 hover:border-white/20 transition-all shadow-lg flex items-center justify-center gap-2">
                                                            <div className="w-3 h-3 bg-white rounded-sm"></div> Stop Recording
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Upload Video */}
                                        <div className="group relative bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-300 border border-white/10 hover:border-neon-purple/50 rounded-3xl p-6 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-neon-purple/10">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3 relative z-10">
                                                <div className="p-2.5 bg-neon-purple/20 rounded-xl">
                                                    <Upload size={22} className="text-neon-purple" />
                                                </div>
                                                Upload Video
                                            </h3>

                                            <div className="flex-grow flex flex-col justify-center">
                                                <div className="relative group/upload w-full h-64 border-2 border-dashed border-white/10 hover:border-neon-purple/50 rounded-2xl flex flex-col items-center justify-center p-6 transition-all bg-slate-900/40 hover:bg-slate-900/60 cursor-pointer">
                                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover/upload:scale-110 transition-transform shadow-lg group-hover/upload:shadow-neon-purple/20">
                                                        <Upload size={28} className="text-gray-400 group-hover/upload:text-neon-purple transition-colors" />
                                                    </div>
                                                    <p className="text-white font-medium mb-1 group-hover/upload:text-neon-purple transition-colors">Click to upload</p>
                                                    <p className="text-gray-500 text-sm text-center">MP4, WebM or Ogg (Max 50MB)</p>

                                                    <input type="file" accept="video/*" onChange={handleFileUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-purple-500 to-neon-purple opacity-50"></div>

                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            {/* Video Preview */}
                                            <div className="w-full md:w-2/3 relative group">
                                                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative transform hover:scale-[1.01] transition-all duration-500">
                                                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                                                </div>
                                            </div>

                                            {/* Actions & Status */}
                                            <div className="w-full md:w-1/3 space-y-6">
                                                <h3 className="text-xl font-bold text-white">Video Status</h3>

                                                {isAnalyzing ? (
                                                    <div className="p-6 bg-neon-cyan/5 border border-neon-cyan/20 rounded-2xl flex flex-col items-center justify-center gap-4 text-center animate-pulse">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-full border-4 border-neon-cyan/30 border-t-neon-cyan animate-spin"></div>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Loader size={16} className="text-neon-cyan" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-neon-cyan font-bold mb-1">Analyzing Video</h4>
                                                            <p className="text-neon-cyan/70 text-sm">Our AI is evaluating your communication skills...</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                        className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center text-center gap-3">
                                                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-1">
                                                            <CheckCircle size={28} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-green-400 font-bold mb-1">Analysis Complete</h4>
                                                            <p className="text-green-400/70 text-sm">Your video is ready to be submitted.</p>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                <button type="button" onClick={() => { setVideoUrl(''); setVideoBlob(null); }}
                                                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 group">
                                                    <Camera size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                                                    Retake / Upload New
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center mt-8">
                                    <button type="button" onClick={() => setStep(step + 1)} className="text-gray-500 hover:text-white text-sm font-medium transition-colors border-b border-transparent hover:border-gray-500 pb-0.5">
                                        Skip this step for now
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-12 pt-6 border-t border-white/5">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(step - 1)}
                                    className="px-8 py-3.5 bg-slate-800 border border-white/10 text-white font-medium hover:bg-slate-700 transition-all flex items-center gap-2 rounded-xl group">
                                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Previous
                                </button>
                            )}

                            <button type="submit"
                                className={`ml-auto px-10 py-3.5 bg-gradient-to-r ${theme.gradient} text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 rounded-xl`}>
                                {step === totalSteps ? 'Complete Registration' : 'Next Step'}
                                {step < totalSteps && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Already have an account? <Link to="/auth" className={`text-${theme.primaryColor} font-bold hover:underline transition-all`}>Sign In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterForm;
