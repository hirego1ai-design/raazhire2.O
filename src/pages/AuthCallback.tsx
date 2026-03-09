import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Briefcase, User } from 'lucide-react';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'role_selection' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [sessionUser, setSessionUser] = useState<any>(null);

    useEffect(() => {
        const handleCallback = async () => {
            if (!supabase) {
                setErrorMessage('Supabase client not initialized.');
                setStatus('error');
                return;
            }

            try {
                // 1. Get Session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;
                if (!session?.user) {
                    // No session found, redirect to sign in
                    navigate('/signin');
                    return;
                }

                setSessionUser(session.user);

                // 2. Check if User Exists in Public Database
                const { data: existingUser, error: fetchError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (fetchError) throw fetchError;

                if (existingUser) {
                    // User exists -> Redirect based on role
                    redirectToDashboard(existingUser.role);
                } else {
                    // New User -> Show Role Selection
                    setStatus('role_selection');
                }

            } catch (err: any) {
                console.error('Auth Error:', err);
                setErrorMessage(err.message || 'Authentication failed.');
                setStatus('error');
            }
        };

        handleCallback();
    }, [navigate]);

    const redirectToDashboard = (role: string) => {
        switch (role) {
            case 'employer':
                navigate('/employer/dashboard');
                break;
            case 'admin':
                navigate('/admin/dashboard');
                break;
            case 'educator':
                navigate('/upskill/dashboard');
                break;
            default:
                navigate('/candidate/dashboard'); // Default to candidate
        }
    };

    const handleRoleSelect = async (role: 'candidate' | 'employer') => {
        if (!sessionUser) return;
        setStatus('loading');

        try {
            const user = sessionUser;
            const metadata = user.user_metadata || {};
            const fullName = metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User';

            // 1. Insert into public.users
            const { error: userError } = await supabase.from('users').insert({
                id: user.id,
                email: user.email,
                name: fullName,
                role: role,
                status: 'Active',
                avatar_url: metadata.avatar_url || null
            });
            if (userError) throw userError;

            // 2. Insert into user_profiles (Common)
            const { error: profileError } = await supabase.from('user_profiles').insert({
                user_id: user.id,
                bio: `New ${role} joined via Google.`,
                profile_completion: 20
            });
            if (profileError && profileError.code !== '23505') throw profileError; // Ignore if exists

            // 3. Insert Specific Role Profile
            if (role === 'candidate') {
                const { error: candError } = await supabase.from('candidates').insert({
                    user_id: user.id,
                    email: user.email,
                    name: fullName
                });
                if (candError && candError.code !== '23505') throw candError;
            } else {
                // Employer needs company name
                const { error: empError } = await supabase.from('employers').insert({
                    user_id: user.id,
                    company_name: `${fullName}'s Company`, // Default
                    contact_email: user.email
                });
                if (empError && empError.code !== '23505') throw empError;
            }

            // 4. Redirect
            redirectToDashboard(role);

        } catch (err: any) {
            console.error('Registration Error:', err);
            setErrorMessage('Failed to create account. Please try again.');
            setStatus('error');
        }
    };

    // --- RENDER ---

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <User size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Login Failed</h2>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                    <button onClick={() => navigate('/signin')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'role_selection') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                <div className="max-w-4xl w-full">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
                        <p className="text-lg text-gray-600">How do you want to use HireGo AI?</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Candidate Card */}
                        <div
                            onClick={() => handleRoleSelect('candidate')}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-500 group"
                        >
                            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                                <User size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">I'm a Candidate</h3>
                            <p className="text-gray-500 mb-6">Looking for jobs, skill assessments, and career growth.</p>
                            <span className="text-indigo-600 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
                                Join as Candidate &rarr;
                            </span>
                        </div>

                        {/* Employer Card */}
                        <div
                            onClick={() => handleRoleSelect('employer')}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 group"
                        >
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">I'm an Employer</h3>
                            <p className="text-gray-500 mb-6">Hiring talent, posting jobs, and managing interviews.</p>
                            <span className="text-purple-600 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
                                Join as Employer &rarr;
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Verifying Account...</h2>
                <p className="text-gray-500 mt-2">Please wait while we secure your session.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
