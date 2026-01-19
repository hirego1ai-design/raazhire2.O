import React from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ShieldAlert, Scale, FileText } from 'lucide-react';

const TermsPage = () => {
    const [dbContent, setDbContent] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetch('http://localhost:3000/api/pages/terms')
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
                            <FileText size={16} />
                            <span>Legal Documentation</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            Terms of Service
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
                                Welcome to <span className="font-bold text-indigo-600">HireGo AI</span> (“<span className="font-bold text-slate-900">HireGo AI</span>”, “<span className="font-bold text-slate-900">we</span>”, “<span className="font-bold text-slate-900">us</span>”, or “<span className="font-bold text-slate-900">our</span>”). By accessing or using our website, web platform, mobile application, or any related services (collectively, the “<span className="font-bold text-slate-900">Services</span>”), you agree to be bound by these Terms of Service (the “<span className="font-bold text-slate-900">Terms</span>”). If you do not agree with these Terms, please do not use the Services.
                            </p>
                        </div>

                        <div className="space-y-12 text-slate-700">
                            {/* 1. Eligibility */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Eligibility</h2>
                                <p className="mb-4 text-slate-600">To use the Services, you must:</p>
                                <ul className="space-y-2 mb-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span>Be at least 18 years old.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span>Have the legal authority to enter into a binding contract.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span>Use the Services only for lawful and genuine recruitment, hiring, or job search purposes.</span>
                                    </li>
                                </ul>
                                <p className="text-slate-600">By using the Services, you represent and warrant that you meet these requirements.</p>
                            </section>

                            {/* 2. User Accounts */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. User Accounts and Security</h2>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-indigo-400">
                                    <li>You may be required to create an account to access certain features of the Services.</li>
                                    <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
                                    <li>You agree to notify us immediately if you suspect any unauthorized use of your account or any other breach of security.</li>
                                    <li>HireGo AI is not liable for any loss or damage arising from your failure to protect your account credentials.</li>
                                </ul>
                            </section>

                            {/* 3. Use of Services */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Use of Services</h2>

                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-4">
                                    <p className="font-bold text-emerald-800 mb-2">You agree that you will:</p>
                                    <ul className="list-disc pl-5 text-emerald-700 space-y-1">
                                        <li>Use the Services only for legitimate recruitment, hiring, upskilling, and job search activities.</li>
                                        <li>Comply with all applicable laws, rules, and regulations.</li>
                                    </ul>
                                </div>

                                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                                    <p className="font-bold text-red-800 mb-2">You agree that you will NOT:</p>
                                    <ul className="list-disc pl-5 text-red-700 space-y-1">
                                        <li>Misuse, disrupt, or interfere with the operation of the Services.</li>
                                        <li>Upload viruses, malware, harmful code, or attempt to hack, probe, or test the vulnerability of the platform.</li>
                                        <li>Provide false, misleading, or fraudulent information.</li>
                                        <li>Post fake jobs, fake candidate profiles, or misleading opportunities.</li>
                                    </ul>
                                </div>
                                <p className="mt-4 text-slate-500 text-sm italic">We may investigate and take appropriate legal action for any misuse of the Services.</p>
                            </section>

                            {/* 4. Employer Responsibilities */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Employer Responsibilities</h2>
                                <p className="mb-3 text-slate-600">Employers and recruiters using HireGo AI agree to:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-indigo-400">
                                    <li>Post accurate and genuine job openings only.</li>
                                    <li>Not demand illegal fees, deposits, or any unlawful payments from candidates.</li>
                                    <li>Respect candidate privacy and confidentiality, and handle candidate data in compliance with applicable data protection and employment laws.</li>
                                    <li>Avoid discrimination based on race, religion, gender, caste, ethnicity, age, disability, or any protected status under applicable law.</li>
                                </ul>
                                <p className="mt-3 text-slate-600">HireGo AI reserves the right to suspend or terminate any employer account for misuse, suspected fraud, non-compliance with laws, or violation of these Terms.</p>
                            </section>

                            {/* 5. Candidate Responsibilities */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Candidate Responsibilities</h2>
                                <p className="mb-3 text-slate-600">Candidates using HireGo AI agree to:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-indigo-400">
                                    <li>Provide truthful and accurate information in their profiles, resumes, and assessments.</li>
                                    <li>Not impersonate any other person or misrepresent their identity, skills, or experience.</li>
                                    <li>Not upload harmful, offensive, discriminatory, or inappropriate content.</li>
                                </ul>
                                <p className="mt-3 text-slate-600">HireGo AI may suspend or remove profiles that contain false information or violate these Terms.</p>
                            </section>

                            {/* 6. AI Screening */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. AI Screening, Matching, and Automated Decisions</h2>
                                <p className="mb-3 text-slate-600">HireGo AI uses artificial intelligence and automated systems for:</p>
                                <ul className="list-disc pl-5 mb-4 text-slate-600 marker:text-indigo-400">
                                    <li>Screening, shortlisting, and scoring candidates.</li>
                                    <li>Matching candidates to jobs and opportunities.</li>
                                    <li>Automating parts of the interview and hiring process.</li>
                                </ul>
                                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                                    <p className="font-bold text-indigo-900 mb-2">You understand and agree that:</p>
                                    <ul className="space-y-2 text-indigo-800 text-sm">
                                        <li>• AI outputs, scores, and recommendations are automatically generated and may not always be perfect or error-free.</li>
                                        <li>• These outputs are intended as decision-support tools only and should not be the sole basis for hiring or career decisions.</li>
                                        <li>• Final hiring decisions are always made by employers, not by HireGo AI.</li>
                                        <li>• HireGo AI does not guarantee job offers, job placement, or hiring outcomes.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 7. Interviews */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Interviews and Recordings</h2>
                                <p className="mb-3 text-slate-600">HireGo AI may provide tools for virtual, live, or automated interviews, which may include audio or video recording where enabled.</p>
                                <p className="mb-2 font-semibold text-slate-800">By participating in interviews through the Services, you agree that:</p>
                                <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-600 marker:text-indigo-400">
                                    <li>Interviews may be recorded if recording is enabled by the employer or platform administrator, subject to applicable law.</li>
                                    <li>Interview recordings may be used for evaluation, quality checks, training, and improving our AI models, in accordance with our Privacy Policy.</li>
                                    <li>You will not download, misuse, publish, or distribute interview recordings without appropriate authorization.</li>
                                </ul>
                                <p className="text-slate-600 italic">Employers are responsible for ensuring that any recording and use of candidate interviews comply with applicable consent and privacy laws in their jurisdiction.</p>
                            </section>

                            {/* 8. Paid Services */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Paid Services and Billing</h2>
                                <p className="text-slate-600 mb-2">Some features of HireGo AI may be offered as paid services, including but not limited to:</p>
                                <ul className="list-disc pl-5 mb-4 text-slate-600">
                                    <li>Pay-per-hire recruitment fees.</li>
                                    <li>Subscription plans or enterprise packages.</li>
                                    <li>Optional upskilling, assessments, or premium learning programs.</li>
                                </ul>
                                <p className="font-semibold text-slate-800 mb-2">Unless stated otherwise in an applicable Refund Policy:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>All payments are final and non-refundable.</li>
                                    <li>Prices, plans, and features may change from time to time, with notice provided for active subscriptions where required.</li>
                                    <li>You authorize us or our payment processors to charge your chosen payment method for applicable fees.</li>
                                </ul>
                            </section>

                            {/* 9. Prohibited Activities */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Prohibited Activities</h2>
                                <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                                    <p className="font-bold text-red-900 mb-3">You agree not to:</p>
                                    <ul className="grid md:grid-cols-2 gap-x-4 gap-y-2 text-red-800 text-sm">
                                        <li>• Spread viruses, worms, malware, spam, or harmful scripts.</li>
                                        <li>• Scrape, crawl, or harvest data from the platform without permission.</li>
                                        <li>• Reverse engineer or attempt to extract source code.</li>
                                        <li>• Manipulate or abuse the hiring or scoring process.</li>
                                        <li>• Harass, threaten, scam, defraud, or discriminate against other users.</li>
                                        <li>• Use automated bots or scripts without authorization.</li>
                                    </ul>
                                </div>
                                <p className="mt-3 text-slate-600">We may suspend or terminate your access to the Services for engaging in any prohibited activities.</p>
                            </section>

                            {/* 10. IP */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Intellectual Property – Platform</h2>
                                <p className="text-slate-600 mb-4">All content and materials on the Services, including but not limited to software, code, algorithms, AI models, designs, logos, branding, text, graphics, and visuals (collectively, “HireGo AI Content”), are owned by or licensed to HireGo AI and are protected by intellectual property laws.</p>
                                <p className="font-semibold text-slate-800 mb-2">Except as explicitly permitted by these Terms or by written permission from us, you may not:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>Copy, modify, reproduce, distribute, sell, lease, or create derivative works based on HireGo AI Content.</li>
                                    <li>Use any trademarks, logos, or branding of HireGo AI without our prior written consent.</li>
                                </ul>
                            </section>

                            {/* 11. User Content */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">11. User Content and License</h2>
                                <p className="text-slate-600 mb-4">“User Content” means any content you submit, upload, or provide through the Services, including profiles, resumes, job postings, messages, interview responses, and other data.</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-4">
                                    <li>You retain ownership of your User Content.</li>
                                    <li>By submitting User Content, you grant HireGo AI a worldwide, non-exclusive, royalty-free, transferable license to use, store, reproduce, display, and process such content as necessary to operate, improve, and provide the Services, including AI training and analytics, in accordance with our Privacy Policy.</li>
                                    <li>You represent and warrant that you have the right to submit your User Content and that it does not infringe the rights of any third party.</li>
                                </ul>
                                <p className="text-slate-600">We may remove or restrict access to User Content that we believe violates these Terms or applicable law.</p>
                            </section>

                            {/* 12. Third Party */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Third-Party Services and Integrations</h2>
                                <p className="text-slate-600 mb-4">The Services may integrate or link with third-party tools or services (for example, email providers, video platforms, analytics tools, or HR systems).</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>These third-party services are provided by independent providers, not by HireGo AI.</li>
                                    <li>We are not responsible for their content, performance, terms, or privacy practices.</li>
                                    <li>Your use of any third-party service is at your own risk and may be subject to additional terms imposed by those providers.</li>
                                </ul>
                            </section>

                            {/* 13. Data and Privacy */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Data and Privacy</h2>
                                <p className="text-slate-600 mb-3">Your use of the Services is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>By using the Services, you consent to our data practices as described in the Privacy Policy.</li>
                                    <li>Employers are responsible for ensuring their use of candidate data complies with applicable data protection and employment laws.</li>
                                </ul>
                            </section>

                            {/* 14. Disclaimer */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Disclaimer of Warranties</h2>
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <p className="font-bold text-slate-800 mb-2">To the maximum extent permitted by law, the Services are provided on an “as is” and “as available” basis, without any warranties of any kind, whether express or implied.</p>
                                    <p className="text-slate-700 mb-2">HireGo AI does not guarantee:</p>
                                    <ul className="list-disc pl-5 space-y-1 text-slate-600 mb-4">
                                        <li>Employment, job offers, or job placement.</li>
                                        <li>Specific hiring results or performance of candidates.</li>
                                        <li>The accuracy, completeness, or reliability of user-provided data (including job posts and profiles).</li>
                                        <li>That the Services will be secure, error-free, or uninterrupted at all times.</li>
                                    </ul>
                                    <p className="text-slate-700 italic">Your use of the Services is at your own risk.</p>
                                </div>
                            </section>

                            {/* 15. Limitation of Liability */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Limitation of Liability</h2>
                                <p className="mb-2 font-semibold text-slate-800">To the maximum extent permitted by law:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-4">
                                    <li>HireGo AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, loss of business, or reputational harm, arising from or related to your use of the Services.</li>
                                    <li>HireGo AI is not responsible for any acts, omissions, or decisions of employers, candidates, or third-party service providers.</li>
                                    <li>HireGo AI is not liable for issues caused by third-party tools, internet failures, or downtime.</li>
                                </ul>
                                <p className="text-slate-600 text-sm">In any case where liability cannot be excluded, our total aggregate liability to you for any claims arising out of or related to the Services shall not exceed the amount you paid to HireGo AI for the Services in the three (3) months preceding the event giving rise to the claim.</p>
                            </section>

                            {/* 16. Suspension */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">16. Account Suspension and Termination</h2>
                                <p className="text-slate-600 mb-3">We may, at our sole discretion, suspend or terminate your access to the Services (in whole or in part) if we believe that you:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600 mb-4">
                                    <li>Have violated these Terms or any applicable law.</li>
                                    <li>Have provided false, misleading, or harmful information.</li>
                                    <li>Are misusing or abusing the platform or its users.</li>
                                    <li>Pose a security or legal risk.</li>
                                </ul>
                                <p className="text-slate-600">You may close your account at any time by following the instructions in your account settings or by contacting support. Certain provisions of these Terms that by their nature should survive termination will continue to apply even after your account is closed.</p>
                            </section>

                            {/* 17. Changes */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">17. Changes to the Services and Terms</h2>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>We may update, modify, or discontinue parts of the Services from time to time.</li>
                                    <li>We may also update these Terms periodically. When we do, we will change the “Last Updated” date at the top of this page.</li>
                                    <li>Where required by law, we will notify you of material changes. Your continued use of the Services after changes take effect constitutes your acceptance of the revised Terms.</li>
                                </ul>
                            </section>

                            {/* 18. Governing Law */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">18. Governing Law and Dispute Resolution</h2>
                                <div className="bg-slate-100 p-5 rounded-xl border-l-4 border-indigo-500">
                                    <p className="text-slate-700 mb-3">These Terms are governed by and construed in accordance with the laws of <span className="font-bold bg-white px-2 py-0.5 rounded shadow-sm">[Your Country/State]</span>, without regard to its conflict of laws principles.</p>
                                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                        <li>Any disputes arising out of or relating to these Terms or the Services shall be subject to the exclusive jurisdiction of the courts located in <span className="font-bold bg-white px-2 py-0.5 rounded shadow-sm">[City, Country]</span>.</li>
                                        <li>You agree to submit to the personal jurisdiction of such courts.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 19. Contact Us - Highlighted */}
                            <section id="contact" className="mt-12 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
                                {/* Decoration */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>

                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black mb-6">19. Contact Us</h2>
                                    <p className="text-indigo-200 text-lg mb-8 max-w-2xl">
                                        If you have any questions about these Terms or the Services, please do not hesitate to reach out to our legal and support team.
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

export default TermsPage;
