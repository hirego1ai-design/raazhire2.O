import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Award,
    Download,
    Share2,
    CheckCircle,
    Trophy,
    Star,
    Calendar,
    FileCheck,
    ExternalLink,
    Linkedin,
    Twitter,
    Mail
} from 'lucide-react';

// ============================================
// SKILL BADGE
// ============================================
interface SkillBadgeProps {
    skill: string;
    level: string;
    delay: number;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, level, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="px-6 py-3 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-pill shadow-soft hover:shadow-soft-lg transition-all"
        >
            <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-900">{skill}</span>
                <span className="text-sm text-amber-700">• {level}</span>
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const Certificate: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const skills = [
        { skill: 'Data Analysis', level: 'Expert' },
        { skill: 'Python Programming', level: 'Advanced' },
        { skill: 'Statistical Methods', level: 'Proficient' },
        { skill: 'Data Visualization', level: 'Advanced' },
        { skill: 'SQL Databases', level: 'Proficient' }
    ];

    const handleDownload = () => {
        // Download logic here
        console.log('Downloading certificate...');
    };

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            {/* Header */}
            <section className="bg-gradient-premium pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-5xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-pill shadow-soft mb-6">
                            <Trophy className="w-6 h-6 text-amber-500" />
                            <span className="font-bold text-gray-900">Achievement Unlocked!</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                            Your Certificate
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Congratulations on completing the Data Science Fundamentals course!
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Certificate Preview */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-section-xl p-12 shadow-premium-lg border-4 border-amber-200 relative overflow-hidden"
                    >
                        {/* Decorative Corner Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-200/50 to-transparent rounded-br-[100px]" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/50 to-transparent rounded-bl-[100px]" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-200/50 to-transparent rounded-tr-[100px]" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-200/50 to-transparent rounded-tl-[100px]" />

                        {/* Certificate Content */}
                        <div className="relative z-10">
                            {/* Logo & Title */}
                            <div className="text-center mb-12">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-card-xl flex items-center justify-center mb-6 shadow-soft-lg">
                                    <Award className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-5xl font-extrabold text-gray-900 mb-2">
                                    Certificate of Completion
                                </h2>
                                <p className="text-lg text-gray-600">HireGo AI Upskill Platform</p>
                            </div>

                            {/* Recipient */}
                            <div className="text-center mb-12 p-8 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-section border-2 border-amber-200">
                                <p className="text-gray-600 text-lg mb-2">This is to certify that</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 mb-2">
                                    John Doe
                                </h3>
                                <p className="text-gray-600 text-lg">has successfully completed</p>
                            </div>

                            {/* Course Name */}
                            <div className="text-center mb-12">
                                <h4 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo-600 to-ai-cyan-600 mb-4">
                                    Data Science Fundamentals with Python
                                </h4>
                                <p className="text-gray-600 text-lg">
                                    A comprehensive 12-week course covering data analysis, visualization, and statistical methods
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-3 gap-6 mb-12">
                                <div className="text-center p-6 bg-white rounded-card-lg border-2 border-gray-100 shadow-soft">
                                    <Calendar className="w-8 h-8 mx-auto mb-3 text-electric-indigo-500" />
                                    <p className="text-sm text-gray-600 mb-1">Completed On</p>
                                    <p className="font-bold text-gray-900">January 15, 2026</p>
                                </div>
                                <div className="text-center p-6 bg-white rounded-card-lg border-2 border-gray-100 shadow-soft">
                                    <Trophy className="w-8 h-8 mx-auto mb-3 text-amber-500" />
                                    <p className="text-sm text-gray-600 mb-1">Final Score</p>
                                    <p className="font-bold text-gray-900">87 / 100</p>
                                </div>
                                <div className="text-center p-6 bg-white rounded-card-lg border-2 border-gray-100 shadow-soft">
                                    <FileCheck className="w-8 h-8 mx-auto mb-3 text-soft-emerald-500" />
                                    <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                                    <p className="font-bold text-gray-900 text-sm">HGA-2026-{id}</p>
                                </div>
                            </div>

                            {/* Signature Section */}
                            <div className="flex items-center justify-between pt-8 border-t-2 border-amber-200">
                                <div>
                                    <div className="w-48 h-0.5 bg-gray-900 mb-2" />
                                    <p className="text-sm text-gray-600">Dr. Sarah Chen</p>
                                    <p className="text-xs text-gray-500">Course Instructor</p>
                                </div>
                                <div className="w-20 h-20 bg-amber-100 rounded-card-lg border-2 border-amber-300 flex items-center justify-center">
                                    <Award className="w-10 h-10 text-amber-600" />
                                </div>
                                <div className="text-right">
                                    <div className="w-48 h-0.5 bg-gray-900 mb-2 ml-auto" />
                                    <p className="text-sm text-gray-600">HireGo AI Platform</p>
                                    <p className="text-xs text-gray-500">Authorized Signature</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDownload}
                            className="px-8 py-4 bg-gradient-indigo text-white rounded-pill font-bold text-lg shadow-glow-indigo flex items-center justify-center gap-2"
                        >
                            <Download className="w-6 h-6" />
                            Download Certificate (PDF)
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-pill font-bold text-lg hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-6 h-6" />
                            View Verification Link
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Skills Earned */}
            <section className="py-16 px-4 bg-cloud-grey">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                            Skills Earned
                        </h2>
                        <p className="text-xl text-gray-600">
                            Verified competencies from your course completion
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap gap-4 justify-center">
                        {skills.map((skill, index) => (
                            <SkillBadge key={index} {...skill} delay={index * 0.1} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Share Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-electric-indigo-500 to-ai-cyan-500 rounded-section-xl p-12 text-white text-center shadow-premium-lg relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
                        </div>
                        <div className="relative z-10">
                            <Trophy className="w-16 h-16 mx-auto mb-6" />
                            <h3 className="text-3xl font-extrabold mb-4">Share Your Achievement!</h3>
                            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                                Let your network know about your new  skills and boost your professional profile
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-white text-gray-900 rounded-pill font-semibold shadow-soft flex items-center gap-2"
                                >
                                    <Linkedin className="w-5 h-5 text-blue-600" />
                                    Share on LinkedIn
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-white text-gray-900 rounded-pill font-semibold shadow-soft flex items-center gap-2"
                                >
                                    <Twitter className="w-5 h-5 text-sky-500" />
                                    Share on Twitter
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-white text-gray-900 rounded-pill font-semibold shadow-soft flex items-center gap-2"
                                >
                                    <Mail className="w-5 h-5 text-gray-600" />
                                    Share via Email
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Next Steps */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">
                        What's Next?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            onClick={() => navigate('/upskill/courses')}
                            className="bg-white rounded-card-xl p-8 shadow-premium hover:shadow-premium-lg transition-all cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-gradient-indigo rounded-card-lg flex items-center justify-center mb-6 shadow-soft">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Continue Learning</h3>
                            <p className="text-gray-600 mb-4">Explore advanced courses to build on your skills</p>
                            <div className="flex items-center text-electric-indigo-600 font-semibold">
                                <span>Browse Courses</span>
                                <CheckCircle className="w-5 h-5 ml-2" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ y: -4 }}
                            onClick={() => navigate('/upskill/jobs')}
                            className="bg-white rounded-card-xl p-8 shadow-premium hover:shadow-premium-lg transition-all cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-gradient-cyan rounded-card-lg flex items-center justify-center mb-6 shadow-soft">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Apply to Jobs</h3>
                            <p className="text-gray-600 mb-4">Get matched with relevant job opportunities</p>
                            <div className="flex items-center text-ai-cyan-600 font-semibold">
                                <span>View Jobs</span>
                                <CheckCircle className="w-5 h-5 ml-2" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -4 }}
                            onClick={() => navigate('/upskill/dashboard')}
                            className="bg-white rounded-card-xl p-8 shadow-premium hover:shadow-premium-lg transition-all cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-gradient-emerald rounded-card-lg flex items-center justify-center mb-6 shadow-soft">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">View Dashboard</h3>
                            <p className="text-gray-600 mb-4">Check your complete skill profile and scores</p>
                            <div className="flex items-center text-soft-emerald-600 font-semibold">
                                <span>Go to Dashboard</span>
                                <CheckCircle className="w-5 h-5 ml-2" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Certificate;
