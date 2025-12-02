import { useState } from 'react';
import { Mail, Lock, X } from 'lucide-react';
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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!supabase) {
            alert('Supabase client is not initialized.');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Login Successful
            if (userType === 'candidate') {
                navigate('/candidate/dashboard');
            } else {
                navigate('/employer/dashboard');
            }
            if (onClose) onClose();

        } catch (error: any) {
            console.error('Login error:', error);
            alert(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <InputField
                        icon={<Lock size={18} />}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        rightElement={<a href="#" className="forgot-password">Forgot Password?</a>}
                        required
                    />

                    <button type="submit" className="sign-in-btn" disabled={isLoading}>
                        {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                    </button>
                </form>


            </div>

            {/* Right Section - Overlay */}
            <div className="overlay-section">
                <div className="overlay-content">
                    <h2>Hello, Friend!</h2>
                    <p>Register to access all premium features of HireGo AI</p>
                    <button
                        className="sign-up-btn"
                        onClick={() => {
                            const registerPath = '/create-account';
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
