import { useState } from 'react';
import { Mail, Lock, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SocialButton from './SocialButton';
import ToggleSwitch from './ToggleSwitch';
import InputField from './InputField';
import './LoginCard.css';
import { supabase } from '../lib/supabase';

interface LoginCardProps {
    onClose?: () => void;
}

const LoginCard = ({ onClose }: LoginCardProps) => {
    const [userType, setUserType] = useState<'candidate' | 'employer'>('candidate');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login
        if (userType === 'candidate') {
            navigate('/candidate/dashboard');
        } else {
            navigate('/employer/dashboard');
        }
        if (onClose) onClose();
    };

    const handleDemoLogin = (type: 'candidate' | 'employer') => {
        if (type === 'candidate') {
            navigate('/candidate/dashboard');
        } else {
            navigate('/employer/dashboard');
        }
        if (onClose) onClose();
    };

    const handleSocialLogin = async (provider: 'google' | 'linkedin' | 'facebook') => {
        if (!supabase) {
            alert('Social login is not configured. Please contact the administrator.');
            return;
        }
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Error logging in with ' + provider);
        }
    };

    return (
        <div className="login-card">
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="close-btn"
                >
                    <X size={18} />
                </button>
            )}
            {/* Left Section - Form */}
            <div className="form-section">
                <div className="header">
                    <h1>Sign In</h1>
                    <p>Welcome back! Please login to continue.</p>
                </div>

                <div className="social-buttons">
                    <SocialButton icon="google" onClick={() => handleSocialLogin('google')} />
                    <SocialButton icon="facebook" onClick={() => handleSocialLogin('facebook')} />
                    <SocialButton icon="linkedin" onClick={() => handleSocialLogin('linkedin')} />
                </div>

                <div className="user-type-toggle-container">
                    <ToggleSwitch
                        selected={userType}
                        onChange={setUserType}
                    />
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <InputField
                        icon={<Mail size={18} />}
                        type="email"
                        placeholder="Email"
                    />
                    <InputField
                        icon={<Lock size={18} />}
                        type="password"
                        placeholder="Password"
                        rightElement={<a href="#" className="forgot-password">Forgot Password?</a>}
                    />

                    <button type="submit" className="sign-in-btn">
                        SIGN IN
                    </button>
                </form>

                <div className="demo-buttons">
                    <button
                        className="demo-btn"
                        onClick={() => handleDemoLogin('candidate')}
                    >
                        <Play size={12} fill="currentColor" /> Demo Candidate
                    </button>
                    <button
                        className="demo-btn"
                        onClick={() => handleDemoLogin('employer')}
                    >
                        <Play size={12} fill="currentColor" /> Demo Employer
                    </button>
                </div>
            </div>

            {/* Right Section - Overlay */}
            <div className="overlay-section">
                <div className="overlay-content">
                    <h2>Hello, Friend!</h2>
                    <p>Register to access all premium features of HireGo AI</p>
                    <button
                        className="sign-up-btn"
                        onClick={() => {
                            const registerPath = userType === 'candidate' ? '/register/candidate' : '/register/employer';
                            navigate(registerPath);
                            if (onClose) onClose();
                        }}
                    >
                        SIGN UP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginCard;
