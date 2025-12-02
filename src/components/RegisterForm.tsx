import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail, Lock, User, Phone, MapPin, Briefcase, GraduationCap,
    Code, Upload, ArrowRight, ArrowLeft, Building, Users, Globe,
    Calendar, Home, X, Plus, Video, Camera, Loader, CheckCircle
} from 'lucide-react';
import Webcam from 'react-webcam';
import { supabase } from '../lib/supabase';

type UserType = 'candidate' | 'employer';

interface RegisterFormProps {
    userType: UserType;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ userType }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer' | ''>(userType || '');

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

    // Suggested skills based on job profile
    const skillSuggestions: Record<string, string[]> = {
        'Frontend Developer': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue.js', 'Angular'],
        'Backend Developer': ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'REST API', 'GraphQL'],
        'Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'MongoDB', 'SQL', 'Docker', 'AWS'],
        'Data Scientist': ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'SQL', 'Statistics'],
        'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Jenkins'],
        'UI/UX Designer': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'Wireframing', 'User Research'],
        'Mobile Developer': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'],
    };

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
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('User creation failed');

            const userId = authData.user.id;

            // Save candidate profile data
            if (selectedRole === 'candidate') {
                const { error: profileError } = await supabase.from('candidates').insert({
                    user_id: userId,
                    email: formData.email,
                    name: formData.fullName,
                    phone: formData.phone,
                    date_of_birth: formData.dateOfBirth,
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
                <div className="flex justify-between mb-8 max-w-full mx-auto overflow-x-auto">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                        <div key={s} className="flex items-center flex-1 min-w-[40px]">
                            <button
                                type="button"
                                onClick={() => testingMode && setStep(s)}
                                disabled={!testingMode}
                                className={`w-10 h-10 flex items-center justify-center font-bold border-2 transition-all ${testingMode ? 'cursor-pointer hover:scale-110' : ''} ${step >= s ? theme.stepColor + ` border-${theme.primaryColor}` : 'bg-transparent text-gray-500 border-gray-600'
                                    }`} style={{ borderRadius: '0px' }}>
                                {s}
                            </button>
                            {s < totalSteps && (
                                <div className={`flex-1 h-0.5 mx-1 ${step > s ? `bg-${theme.primaryColor}` : 'bg-gray-600'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-[#0f1629] border-2 border-white/10 p-8" style={{ borderRadius: '0px' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Account Setup */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Account Setup</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Email {!testingMode && '*'}</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required={!testingMode}
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }} placeholder="john@example.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Password {!testingMode && '*'}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!testingMode}
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }} placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Confirm Password {!testingMode && '*'}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required={!testingMode}
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                                style={{ borderRadius: '0px' }} placeholder="••••••••" />
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
                                        className={`p-8 border-2 transition-all ${selectedRole === 'candidate' ? 'border-neon-cyan bg-neon-cyan/10' : 'border-white/10 hover:border-white/20'}`}
                                        style={{ borderRadius: '0px' }}>
                                        <User className="mx-auto mb-4 text-neon-cyan" size={48} />
                                        <h3 className="text-xl font-bold text-white mb-2">Candidate</h3>
                                        <p className="text-sm text-gray-400">Looking for job opportunities</p>
                                    </button>
                                    <button type="button" onClick={() => setSelectedRole('employer')}
                                        className={`p-8 border-2 transition-all ${selectedRole === 'employer' ? 'border-neon-purple bg-neon-purple/10' : 'border-white/10 hover:border-white/20'}`}
                                        style={{ borderRadius: '0px' }}>
                                        <Briefcase className="mx-auto mb-4 text-neon-purple" size={48} />
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
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }} placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Date of Birth *</label>
                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Phone *</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }} placeholder="+91 98765 43210" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Current Address *</label>
                                        <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} required rows={2}
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }} placeholder="123 Street, City, State - 123456" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Permanent Address</label>
                                        <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} rows={2}
                                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                            style={{ borderRadius: '0px' }} placeholder="Same as current address or different" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Education (Candidate Only) */}
                        {step === 4 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Education</h2>

                                {/* 10th */}
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4">10th Standard</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <input type="text" placeholder="Board" value={formData.education10th.board}
                                            onChange={(e) => handleEducationChange('education10th', 'board', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Percentage/CGPA" value={formData.education10th.percentage}
                                            onChange={(e) => handleEducationChange('education10th', 'percentage', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Year" value={formData.education10th.year}
                                            onChange={(e) => handleEducationChange('education10th', 'year', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                    </div>
                                </div>

                                {/* 12th */}
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4">12th Standard</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <input type="text" placeholder="Board" value={formData.education12th.board}
                                            onChange={(e) => handleEducationChange('education12th', 'board', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Percentage/CGPA" value={formData.education12th.percentage}
                                            onChange={(e) => handleEducationChange('education12th', 'percentage', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Year" value={formData.education12th.year}
                                            onChange={(e) => handleEducationChange('education12th', 'year', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                    </div>
                                </div>

                                {/* Graduation */}
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4">Graduation</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Degree" value={formData.graduation.degree}
                                            onChange={(e) => handleEducationChange('graduation', 'degree', e.target.value)}
                                            className="col-span-2 bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="College/University" value={formData.graduation.college}
                                            onChange={(e) => handleEducationChange('graduation', 'college', e.target.value)}
                                            className="col-span-2 bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Percentage/CGPA" value={formData.graduation.percentage}
                                            onChange={(e) => handleEducationChange('graduation', 'percentage', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Year" value={formData.graduation.year}
                                            onChange={(e) => handleEducationChange('graduation', 'year', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                    </div>
                                </div>

                                {/* Post-Graduation */}
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4">Post-Graduation (Optional)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Degree" value={formData.postGraduation.degree}
                                            onChange={(e) => handleEducationChange('postGraduation', 'degree', e.target.value)}
                                            className="col-span-2 bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="College/University" value={formData.postGraduation.college}
                                            onChange={(e) => handleEducationChange('postGraduation', 'college', e.target.value)}
                                            className="col-span-2 bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Percentage/CGPA" value={formData.postGraduation.percentage}
                                            onChange={(e) => handleEducationChange('postGraduation', 'percentage', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Year" value={formData.postGraduation.year}
                                            onChange={(e) => handleEducationChange('postGraduation', 'year', e.target.value)}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Experience (Candidate Only) */}
                        {step === 5 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Work Experience</h2>

                                {/* Add new experience */}
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4">Add Experience</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <input type="text" placeholder="Company Name" value={newExperience.company}
                                            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Duration (e.g., 2020-2022)" value={newExperience.duration}
                                            onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                        <input type="text" placeholder="Role" value={newExperience.role}
                                            onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                                            className="bg-white/5 border border-white/10 px-4 py-2.5 text-white" style={{ borderRadius: '0px' }} />
                                    </div>
                                    <button type="button" onClick={handleAddExperience}
                                        className="px-4 py-2 bg-neon-cyan text-black font-semibold hover:bg-neon-cyan/80 transition-all flex items-center gap-2"
                                        style={{ borderRadius: '0px' }}>
                                        <Plus size={18} /> Add Experience
                                    </button>
                                </div>

                                {/* Experience list */}
                                <div className="space-y-3">
                                    {formData.experiences.map((exp, index) => (
                                        <div key={index} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center">
                                            <div>
                                                <h4 className="text-white font-bold">{exp.role} at {exp.company}</h4>
                                                <p className="text-sm text-gray-400">{exp.duration}</p>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveExperience(index)}
                                                className="text-red-400 hover:text-red-300 transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.experiences.length === 0 && (
                                        <p className="text-center text-gray-400 py-8">No experience added yet. Add your work experience above.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 6: Skill Mapping (Candidate Only) */}
                        {step === 6 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Skills</h2>

                                {/* Job Profile Selection */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Select Your Job Profile *</label>
                                    <select name="jobProfile" value={formData.jobProfile} onChange={handleInputChange} required
                                        className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white"
                                        style={{ borderRadius: '0px' }}>
                                        <option value="">Choose a profile...</option>
                                        {Object.keys(skillSuggestions).map(profile => (
                                            <option key={profile} value={profile}>{profile}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Suggested Skills */}
                                {formData.jobProfile && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-3">Suggested Skills (Click to add)</h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {skillSuggestions[formData.jobProfile]?.map(skill => (
                                                !formData.skills.includes(skill) && (
                                                    <button key={skill} type="button" onClick={() => handleAddSkill(skill)}
                                                        className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all"
                                                        style={{ borderRadius: '0px' }}>
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
                                            className="flex-1 bg-white/5 border border-white/10 px-4 py-2.5 text-white"
                                            style={{ borderRadius: '0px' }} placeholder="e.g., React, Python..." />
                                        <button type="button" onClick={() => handleAddSkill()}
                                            className="px-6 py-2.5 bg-neon-cyan text-black font-semibold hover:bg-neon-cyan/80"
                                            style={{ borderRadius: '0px' }}>
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Selected Skills */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-3">Your Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills.map(skill => (
                                            <span key={skill}
                                                className="px-3 py-1 bg-neon-purple/20 border border-neon-purple text-neon-purple flex items-center gap-2"
                                                style={{ borderRadius: '0px' }}>
                                                {skill}
                                                <button type="button" onClick={() => handleRemoveSkill(skill)}
                                                    className="hover:text-red-400 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                        {formData.skills.length === 0 && (
                                            <p className="text-gray-400 py-4">No skills added yet</p>
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
                                    <div className="p-4 bg-white/5 border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-2">Account</h3>
                                        <p className="text-gray-300">Email: {formData.email}</p>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="p-4 bg-white/5 border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-2">Personal Details</h3>
                                        <p className="text-gray-300">Name: {formData.fullName}</p>
                                        <p className="text-gray-300">Date of Birth: {formData.dateOfBirth}</p>
                                        <p className="text-gray-300">Phone: {formData.phone}</p>
                                        <p className="text-gray-300">Address: {formData.currentAddress}</p>
                                    </div>

                                    {/* Education */}
                                    <div className="p-4 bg-white/5 border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-2">Education</h3>
                                        {formData.education10th.board && <p className="text-gray-300">10th: {formData.education10th.board} ({formData.education10th.percentage}%)</p>}
                                        {formData.education12th.board && <p className="text-gray-300">12th: {formData.education12th.board} ({formData.education12th.percentage}%)</p>}
                                        {formData.graduation.degree && <p className="text-gray-300">Graduation: {formData.graduation.degree} from {formData.graduation.college}</p>}
                                    </div>

                                    {/* Experience */}
                                    <div className="p-4 bg-white/5 border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-2">Experience ({formData.experiences.length})</h3>
                                        {formData.experiences.map((exp, i) => (
                                            <p key={i} className="text-gray-300">{exp.role} at {exp.company} ({exp.duration})</p>
                                        ))}
                                    </div>

                                    {/* Skills */}
                                    <div className="p-4 bg-white/5 border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-2">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skills.map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-sm">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 8: Video Resume (Candidate Only) */}
                        {step === 8 && isCandidate && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Video Resume (Optional)</h2>
                                <p className="text-gray-400 mb-6">Record or upload a video introducing yourself to employers. This will be automatically analyzed by our AI.</p>

                                {!videoUrl ? (
                                    <div className="space-y-4">
                                        {/* Live Recording */}
                                        <div className="p-4 bg-white/5 border border-white/10">
                                            <h3 className="text-lg font-bold text-white mb-4">Record Live</h3>
                                            {!isRecording ? (
                                                <div>
                                                    <Webcam ref={webcamRef} audio={true} className="w-full mb-4" style={{ borderRadius: '0px' }} />
                                                    <button type="button" onClick={handleStartRecording}
                                                        className="w-full px-6 py-3 bg-red-500 text-white font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                                        style={{ borderRadius: '0px' }}>
                                                        <Camera size={20} /> Start Recording
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Webcam ref={webcamRef} audio={true} className="w-full mb-4" style={{ borderRadius: '0px' }} />
                                                    <button type="button" onClick={handleStopRecording}
                                                        className="w-full px-6 py-3 bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-all"
                                                        style={{ borderRadius: '0px' }}>
                                                        Stop Recording
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Video */}
                                        <div className="p-4 bg-white/5 border border-white/10">
                                            <h3 className="text-lg font-bold text-white mb-4">Or Upload Video</h3>
                                            <input type="file" accept="video/*" onChange={handleFileUpload}
                                                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-neon-cyan file:text-black file:font-semibold"
                                                style={{ borderRadius: '0px' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Video Preview */}
                                        <video src={videoUrl} controls className="w-full mb-4" style={{ borderRadius: '0px' }} />

                                        {isAnalyzing && (
                                            <div className="p-4 bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center gap-3">
                                                <Loader className="animate-spin text-neon-cyan" size={20} />
                                                <span className="text-neon-cyan">Analyzing video in background...</span>
                                            </div>
                                        )}

                                        {!isAnalyzing && (
                                            <div className="p-4 bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                                                <CheckCircle className="text-green-400" size={20} />
                                                <span className="text-green-400">Video analyzed successfully!</span>
                                            </div>
                                        )}

                                        <button type="button" onClick={() => { setVideoUrl(''); setVideoBlob(null); }}
                                            className="mt-4 px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                            style={{ borderRadius: '0px' }}>
                                            Retake / Re-upload
                                        </button>
                                    </div>
                                )}

                                <p className="text-sm text-gray-400 text-center mt-4">
                                    You can skip this step and complete registration, then add your video resume later from your profile.
                                </p>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(step - 1)}
                                    className="px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                    style={{ borderRadius: '0px' }}>
                                    <ArrowLeft size={18} /> Previous
                                </button>
                            )}

                            <button type="submit"
                                className={`ml-auto px-8 py-3 bg-gradient-to-r ${theme.gradient} text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2`}
                                style={{ borderRadius: '0px' }}>
                                {step === totalSteps ? 'Complete Registration' : 'Next'}
                                {step < totalSteps && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account? <Link to="/auth" className={`text-${theme.primaryColor} hover:underline`}>Sign In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterForm;
