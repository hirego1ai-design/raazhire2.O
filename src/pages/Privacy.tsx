import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react';

const PrivacyPage = () => {
    const [dbContent, setDbContent] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetch('http://localhost:3000/api/pages/privacy')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.page && data.page.content) {
                    setDbContent(data.page.content);
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-outfit">
            {/* Header / Background Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-40 pb-32 px-6 overflow-hidden">
                {/* Abstract Background pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm text-indigo-300 font-medium text-sm mb-6">
                            <Shield size={16} />
                            <span>Data Protection</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-slate-300 font-medium">
                            Last Updated: January 2026
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Container */}
            <div className="container mx-auto max-w-4xl px-6 -mt-20 relative z-20 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12"
                >
                    {dbContent ? (
                        <div className="prose prose-lg prose-indigo max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: dbContent }} />
                    ) : (<>
                        {/* Intro */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                HireGo AI (“<span className="font-bold text-slate-900">HireGo AI</span>”, “<span className="font-bold text-slate-900">we</span>”, “<span className="font-bold text-slate-900">us</span>”, or “<span className="font-bold text-slate-900">our</span>”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, share, and protect information when you use our websites, platforms, mobile applications, and related services (collectively, the “<span className="font-bold text-slate-900">Services</span>”).
                            </p>
                            <p className="mt-4 text-slate-600">
                                By accessing or using the Services, you agree to this Privacy Policy. If you do not agree, please do not use the Services.
                            </p>
                        </div>

                        <div className="space-y-12 text-slate-700">
                            {/* 1. Who this policy applies to */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Who this policy applies to</h2>
                                <p className="mb-4 text-slate-600">This Privacy Policy applies to:</p>
                                <ul className="space-y-2 mb-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span>Candidates and learners using HireGo AI for upskilling, assessments, and job search.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span>Employers, recruiters, and organizations using HireGo AI for hiring and talent management.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span>Visitors who browse our websites or interact with us (e.g., via contact forms, newsletters, or support).</span>
                                    </li>
                                </ul>
                            </section>

                            {/* 2. Information we collect */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">2. Information we collect</h2>
                                <p className="mb-4 text-slate-600">We may collect the following categories of information:</p>

                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                        <h3 className="font-bold text-slate-800 mb-3">2.1 Information you provide to us</h3>
                                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                                            <li><strong className="text-slate-700">Account details:</strong> Name, email address, password, contact details, role (candidate/employer).</li>
                                            <li><strong className="text-slate-700">Profile and career data:</strong> Resume, skills, education, work history, portfolio links, preferences, and other details you choose to share.</li>
                                            <li><strong className="text-slate-700">Learning and upskilling data:</strong> Course enrollments, lesson progress, quiz responses, project submissions, scores, and certifications.</li>
                                            <li><strong className="text-slate-700">Job and employer data:</strong> Company details, job descriptions, hiring preferences, and related notes.</li>
                                            <li><strong className="text-slate-700">Communication data:</strong> Messages, support requests, feedback, survey responses, or other communication you send to us.</li>
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                        <h3 className="font-bold text-slate-800 mb-3">2.2 Information collected automatically</h3>
                                        <p className="text-sm text-slate-600 mb-2">When you use the Services, we may automatically collect:</p>
                                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                                            <li><strong className="text-slate-700">Usage data:</strong> Pages viewed, features used, clicks, time on page, and navigation paths.</li>
                                            <li><strong className="text-slate-700">Device and technical data:</strong> IP address, browser type, operating system, device identifiers, and general location.</li>
                                            <li><strong className="text-slate-700">Cookies and similar technologies:</strong> Information stored via cookies, pixels, or local storage to remember your preferences.</li>
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                        <h3 className="font-bold text-slate-800 mb-3">2.3 Information from third parties</h3>
                                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                                            <li>Employers or recruiters who upload candidate details through the platform.</li>
                                            <li>Integrated third-party tools (e.g., video, email, analytics, or ATS integrations), where permitted.</li>
                                            <li>Public sources or professional profiles, where allowed by applicable law.</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* 3. How we use your information */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How we use your information</h2>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-indigo-400">
                                    <li>Provide and operate the Services, including learning paths, AI assessments, auto job matching, and recruitment tools.</li>
                                    <li>Create and manage your account, authenticate your identity, and provide customer support.</li>
                                    <li>Personalize your experience, such as recommending skill paths, courses, or job opportunities that match your profile.</li>
                                    <li>Enable communication between candidates and employers, and send service-related notifications.</li>
                                    <li>Improve and develop our AI models, content, and features, including training, testing, and analytics.</li>
                                    <li>Monitor usage, prevent fraud, enhance security, and enforce our Terms of Service.</li>
                                    <li>Send you marketing or promotional communications (where permitted), which you can opt out of at any time.</li>
                                </ul>
                            </section>

                            {/* 4. How AI and automation use your data */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. How AI and automation use your data</h2>
                                <p className="mb-3 text-slate-600">HireGo AI uses artificial intelligence and automation to:</p>
                                <ul className="list-disc pl-5 mb-4 text-slate-600 marker:text-indigo-400">
                                    <li>Analyze your skills, quiz results, and project submissions.</li>
                                    <li>Generate scores, recommendations, and matches between candidates and job opportunities.</li>
                                    <li>Provide feedback on learning progress and performance.</li>
                                </ul>
                                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                                    <p className="font-bold text-indigo-900 mb-2">Important Note on AI:</p>
                                    <p className="text-slate-700 text-sm">
                                        We may use your data (including anonymized or aggregated data) to train and improve our AI models. AI outputs are meant to assist decision-making, not replace human judgment. Employers remain responsible for their hiring decisions.
                                    </p>
                                </div>
                            </section>

                            {/* 5. Legal bases */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Legal bases for processing</h2>
                                <p className="mb-3 text-slate-600">Where required by law (for example, under GDPR-like frameworks), we process personal data based on:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white border border-slate-200 p-4 rounded-lg">
                                        <h4 className="font-bold text-slate-800 mb-1">Performance of a contract</h4>
                                        <p className="text-sm text-slate-500">To provide the Services you request.</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-4 rounded-lg">
                                        <h4 className="font-bold text-slate-800 mb-1">Legitimate interests</h4>
                                        <p className="text-sm text-slate-500">To operate, secure, and improve the Services.</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-4 rounded-lg">
                                        <h4 className="font-bold text-slate-800 mb-1">Consent</h4>
                                        <p className="text-sm text-slate-500">For certain analytics, cookies, or marketing.</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-4 rounded-lg">
                                        <h4 className="font-bold text-slate-800 mb-1">Legal obligations</h4>
                                        <p className="text-sm text-slate-500">To comply with applicable laws and regulations.</p>
                                    </div>
                                </div>
                            </section>

                            {/* 6. How we share your information */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. How we share your information</h2>
                                <p className="mb-4 text-slate-600">We may share your information with:</p>
                                <ul className="space-y-4 text-slate-600">
                                    <li className="bg-slate-50 p-4 rounded-lg">
                                        <span className="font-bold text-slate-900 block mb-1">Employers and recruiters</span>
                                        <span className="text-sm">Candidate profiles, resumes, assessments, and interview responses may be shared with employers when you apply to jobs, are matched to roles, or participate in hiring processes via the platform.</span>
                                    </li>
                                    <li className="bg-slate-50 p-4 rounded-lg">
                                        <span className="font-bold text-slate-900 block mb-1">Service providers</span>
                                        <span className="text-sm">Third-party vendors that help us operate the Services (e.g., hosting, analytics, email delivery, video interview tools, payment gateways).</span>
                                    </li>
                                    <li className="bg-slate-50 p-4 rounded-lg">
                                        <span className="font-bold text-slate-900 block mb-1">Your organization</span>
                                        <span className="text-sm">If you use HireGo AI through your employer or institution, certain data may be visible to administrators or managers.</span>
                                    </li>
                                    <li className="bg-slate-50 p-4 rounded-lg">
                                        <span className="font-bold text-slate-900 block mb-1">Legal and compliance</span>
                                        <span className="text-sm">When required by law, regulation, legal process, or to protect the rights, property, or safety of HireGo AI, our users, or others.</span>
                                    </li>
                                </ul>
                                <p className="mt-4 text-slate-500 text-sm italic">We do not sell your personal information to third parties for their standalone marketing purposes.</p>
                            </section>

                            {/* 7. Cookies */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies and tracking technologies</h2>
                                <p className="text-slate-600 mb-2">We use cookies and similar technologies to:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600 mb-4">
                                    <li>Keep you signed in and remember your preferences.</li>
                                    <li>Analyze usage to improve performance and user experience.</li>
                                    <li>Support features such as personalization, security, or integrated services.</li>
                                </ul>
                                <p className="text-slate-600 text-sm">You can control cookies via your browser settings and, in some regions, via dedicated consent tools. Disabling certain cookies may impact some features of the Services.</p>
                            </section>

                            {/* 8. Data Retention */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Data retention</h2>
                                <p className="text-slate-600 mb-2">We retain your personal information for as long as:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600 mb-4">
                                    <li>You have an active account with HireGo AI.</li>
                                    <li>It is necessary to provide the Services and fulfill the purposes described in this policy.</li>
                                    <li>Required by law, contractual obligations, or to resolve disputes and enforce agreements.</li>
                                </ul>
                                <p className="text-slate-600 text-sm">We may retain aggregated or anonymized data that does not identify you for longer periods for analytics and product improvement.</p>
                            </section>

                            {/* 9. Data Security */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Data security</h2>
                                <div className="flex items-start gap-4 bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                                    <Lock className="text-emerald-600 w-6 h-6 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-emerald-900 font-medium mb-2">
                                            We implement reasonable technical and organizational measures designed to protect your information from unauthorized access, loss, misuse, or disclosure.
                                        </p>
                                        <p className="text-emerald-800 text-sm">
                                            However, no system is completely secure. You are responsible for keeping your account credentials confidential and for promptly notifying us of any suspected unauthorized access.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* 10. Your Rights */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Your rights and choices</h2>
                                <p className="mb-4 text-slate-600">Depending on your location and applicable law, you may have rights such as:</p>
                                <ul className="grid md:grid-cols-2 gap-y-3 gap-x-6 list-disc pl-5 text-slate-600 mb-6">
                                    <li><strong className="text-slate-800">Access:</strong> Request a copy of your data.</li>
                                    <li><strong className="text-slate-800">Correction:</strong> Update inaccurate data.</li>
                                    <li><strong className="text-slate-800">Deletion:</strong> Request deletion.</li>
                                    <li><strong className="text-slate-800">Restriction:</strong> Limit processing.</li>
                                    <li><strong className="text-slate-800">Portability:</strong> Structured data copy.</li>
                                    <li><strong className="text-slate-800">Consent withdrawal:</strong> Opt-out anytime.</li>
                                </ul>
                                <p className="text-slate-600 mb-4">
                                    To exercise these rights, you can contact us at the email address below. You can also update profile details in settings or unsubscribe from marketing emails via the link provided in them.
                                </p>
                            </section>

                            {/* 11. International Transfers */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">11. International data transfers</h2>
                                <p className="text-slate-600">
                                    Your information may be stored and processed in countries other than your own. These locations may have different data protection laws. Where required by law, we implement appropriate safeguards to protect your information when it is transferred across borders.
                                </p>
                            </section>

                            {/* 12. Children */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Children’s privacy</h2>
                                <p className="text-slate-600">
                                    The Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe that a minor has provided us with personal information, please contact us so that we can take appropriate action.
                                </p>
                            </section>

                            {/* 13. Links */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Links to other websites</h2>
                                <p className="text-slate-600">
                                    Our Services may contain links to third-party websites or services. We are not responsible for the privacy practices, content, or policies of those third parties. You should review their privacy policies before providing any personal information.
                                </p>
                            </section>

                            {/* 14. Changes */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Changes to this Privacy Policy</h2>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>We may update this Privacy Policy from time to time. When we do, we will change the “Last Updated” date at the top of this page.</li>
                                    <li>Where required by law, we will notify you of material changes. Your continued use of the Services after changes take effect means you accept the updated Privacy Policy.</li>
                                </ul>
                            </section>

                            {/* 15. Contact Us - Highlighted */}
                            <section id="contact" className="mt-12 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
                                {/* Decoration */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>

                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black mb-6">15. Contact Us</h2>
                                    <p className="text-indigo-200 text-lg mb-8 max-w-2xl">
                                        If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, you can contact us at:
                                    </p>

                                    <div className="flex flex-col md:flex-row gap-6">
                                        <a href="mailto:support@hiregoai.com" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 transition-colors p-5 rounded-2xl backdrop-blur-sm border border-white/10 group">
                                            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Mail className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Email Support</p>
                                                <p className="text-xl font-bold text-white">support@hiregoai.com</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </section>

                        </div></>)}
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPage;
