import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState<'candidate' | 'employer'>('candidate');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate based on user type
        if (userType === 'candidate') {
            navigate('/candidate/dashboard');
        } else {
            navigate('/employer/dashboard');
        }
    };

    const handleSocialLogin = (provider: 'google' | 'linkedin') => {
        console.log(`Login with ${provider}`);
        // Implement social login logic here
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 100
            }
        }
    };

    return (
        <div className="auth-container">
            {/* Animated Background */}
            <div className="auth-background">
                <div className="floating-orb orb-1"></div>
                <div className="floating-orb orb-2"></div>
                <div className="floating-orb orb-3"></div>
                <div className="grid-overlay"></div>
            </div>

            <div className="auth-content">
                {/* Left Panel - Branding */}
                <motion.div
                    className="auth-branding"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="branding-content">
                        <motion.div
                            className="logo-section"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Sparkles className="logo-icon" size={48} />
                            <h1 className="brand-name">HireGo AI</h1>
                        </motion.div>

                        <div className="branding-text">
                            <h2 className="branding-title">
                                Hire Top Talent in
                                <span className="highlight"> 10 Days</span>
                            </h2>
                            <p className="branding-subtitle">
                                AI-powered recruitment platform that revolutionizes hiring with intelligent screening, video assessments, and automated workflows.
                            </p>
                        </div>

                        <div className="feature-pills">
                            <div className="feature-pill">
                                <span className="pill-icon">⚡</span>
                                <span>AI Screening</span>
                            </div>
                            <div className="feature-pill">
                                <span className="pill-icon">🎯</span>
                                <span>Smart Matching</span>
                            </div>
                            <div className="feature-pill">
                                <span className="pill-icon">📊</span>
                                <span>Analytics</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Panel - Form */}
                <motion.div
                    className="auth-form-panel"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        className="auth-form-container"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Tab Switcher */}
                        <motion.div className="auth-tabs" variants={itemVariants}>
                            <button
                                className={`auth-tab ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Sign In
                            </button>
                            <button
                                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Sign Up
                            </button>
                            <motion.div
                                className="tab-indicator"
                                layout
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                style={{ left: isLogin ? '0%' : '50%' }}
                            />
                        </motion.div>

                        {/* User Type Toggle */}
                        <motion.div className="user-type-selector" variants={itemVariants}>
                            <button
                                className={`user-type-btn ${userType === 'candidate' ? 'active' : ''}`}
                                onClick={() => setUserType('candidate')}
                            >
                                <User size={18} />
                                <span>Candidate</span>
                            </button>
                            <button
                                className={`user-type-btn ${userType === 'employer' ? 'active' : ''}`}
                                onClick={() => setUserType('employer')}
                            >
                                <Briefcase size={18} />
                                <span>Employer</span>
                            </button>
                        </motion.div>

                        {/* Social Login */}
                        <motion.div className="social-login" variants={itemVariants}>
                            <button
                                className="social-btn google"
                                onClick={() => handleSocialLogin('google')}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            <button
                                className="social-btn linkedin"
                                onClick={() => handleSocialLogin('linkedin')}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="#0A66C2">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                <span>Continue with LinkedIn</span>
                            </button>
                        </motion.div>

                        <motion.div className="divider" variants={itemVariants}>
                            <span>or continue with email</span>
                        </motion.div>

                        {/* Form */}
                        <motion.form className="auth-form" onSubmit={handleSubmit} variants={itemVariants}>
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        className="form-group"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="input-wrapper">
                                            <User className="input-icon" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                className="auth-input"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div className="form-group" variants={itemVariants}>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="auth-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div className="form-group" variants={itemVariants}>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        className="auth-input"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        className="form-group"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="input-wrapper">
                                            <Lock className="input-icon" size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Confirm Password"
                                                className="auth-input"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isLogin && (
                                <motion.div className="form-footer" variants={itemVariants}>
                                    <label className="remember-me">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="forgot-link">Forgot Password?</a>
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                className="submit-btn"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                variants={itemVariants}
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <motion.span
                                    className="btn-shimmer"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: 'linear'
                                    }}
                                />
                            </motion.button>
                        </motion.form>

                        {/* Demo Buttons */}
                        <motion.div className="demo-section" variants={itemVariants}>
                            <p className="demo-text">Quick Demo Access</p>
                            <div className="demo-buttons">
                                <button
                                    className="demo-quick-btn"
                                    onClick={() => navigate('/candidate/dashboard')}
                                >
                                    <span className="demo-indicator">🎯</span>
                                    Demo Candidate
                                </button>
                                <button
                                    className="demo-quick-btn"
                                    onClick={() => navigate('/employer/dashboard')}
                                >
                                    <span className="demo-indicator">💼</span>
                                    Demo Employer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Auth;
