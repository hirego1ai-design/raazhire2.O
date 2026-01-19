import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, CheckCircle, AlertCircle, Loader, Eye } from 'lucide-react';

const PageEditor = () => {
    const [selectedPage, setSelectedPage] = useState('terms');
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const pages = [
        { id: 'terms', name: 'Terms of Service' },
        { id: 'privacy', name: 'Privacy Policy' },
        { id: 'about', name: 'About Us' },
        { id: 'enterprise', name: 'Enterprise' },
        { id: 'careers', name: 'Careers' },
        { id: 'contact', name: 'Contact Us' },
    ];

    // High-Fidelity Default Content matching the actual pages
    const defaultContent: Record<string, string> = {
        terms: `
            <div class="mb-12 border-b border-slate-100 pb-8">
                <p class="text-lg text-slate-600 leading-relaxed font-medium">
                    Welcome to <span class="font-bold text-indigo-600">HireGo AI</span>. By accessing or using our Services, you agree to be bound by these Terms of Service.
                </p>
            </div>
            <div class="space-y-12 text-slate-700">
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">1. Eligibility</h2>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                        <li>Be at least 18 years old.</li>
                        <li>Have the legal authority to enter into a binding contract.</li>
                        <li>Use the Services only for lawful recruitment and job search purposes.</li>
                    </ul>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">2. User Accounts</h2>
                    <p class="text-slate-600">You are responsible for maintaining the confidentiality of your credentials. Notify us immediately of any unauthorized use.</p>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">3. Use of Services</h2>
                    <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-4">
                        <p class="font-bold text-emerald-800 mb-2">You agree to:</p>
                        <ul class="list-disc pl-5 text-emerald-700">
                            <li>Use Services for legitimate recruitment.</li>
                            <li>Comply with all applicable laws.</li>
                        </ul>
                    </div>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">4. Employer Responsibilities</h2>
                    <p class="text-slate-600">Post accurate jobs, do not demand illegal fees, and avoid discrimination.</p>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">5. Candidate Responsibilities</h2>
                    <p class="text-slate-600">Provide truthful information and do not upload harmful content.</p>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">6. AI Screening</h2>
                    <p class="text-slate-600">We use AI for screening and matching. AI outputs are decision-support tools only.</p>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">19. Contact Us</h2>
                    <p class="text-slate-600">For questions, contact <a href="mailto:support@hiregoai.com" class="text-indigo-600 font-bold">support@hiregoai.com</a>.</p>
                </section>
            </div>
        `,
        privacy: `
            <div class="mb-12 border-b border-slate-100 pb-8">
                <p class="text-lg text-slate-600 leading-relaxed font-medium">
                    This Privacy Policy describes how HireGo AI collects, uses, and discloses your information.
                </p>
            </div>
            <div class="space-y-12 text-slate-700">
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Personal Information:</strong> Name, email, phone, resume details.</li>
                        <li><strong>Usage Data:</strong> Device info, log data, cookies.</li>
                        <li><strong>Video Data:</strong> Interview recordings (with consent).</li>
                    </ul>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Data</h2>
                    <p class="text-slate-600">To provide AI matching, process applications, improve our models, and ensure security.</p>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">3. Data Sharing</h2>
                    <p class="text-slate-600">We share data with Employers (when you apply), Service Providers (hosting, analytics), and for Legal reasons.</p>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">4. AI & Automated Processing</h2>
                    <p class="text-slate-600">We use AI to analyze resumes and interviews. You can object to automated processing by contacting support.</p>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
                    <div class="bg-blue-50 p-4 rounded-lg text-blue-800">
                        We use industry-standard encryption and security measures.
                    </div>
                </section>
                <section>
                    <h2 class="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                    <p class="text-slate-600">Privacy Officer: <a href="mailto:privacy@hiregoai.com" class="text-indigo-600 font-bold">privacy@hiregoai.com</a></p>
                </section>
            </div>
        `,
        about: `
            <div class="text-center mb-16 pt-10">
                <h1 class="text-5xl font-black text-slate-900 mb-6">Rebuilding Hiring with <span class="text-indigo-600">Autonomous AI</span></h1>
                <p class="text-xl text-slate-600 max-w-2xl mx-auto">We are building the intelligence layer for the global workforce. Faster, unbiased, and truly human-centric.</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-12 items-center mb-20 px-6">
                <div>
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">We reject hiring that is slow & biased.</h2>
                    <p class="text-lg text-slate-600 mb-8">Our mission is to arm companies with AI agents that instantly connect job-ready talent to the right roles.</p>
                    <ul class="space-y-4">
                        <li class="flex items-center gap-3">
                            <span class="font-bold text-indigo-600">Autonomous Candidate Screening</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="font-bold text-purple-600">Unbiased AI Evaluation</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <span class="font-bold text-emerald-600">Instant Technical Assessments</span>
                        </li>
                    </ul>
                </div>
                 <div class="bg-indigo-50 rounded-3xl p-10 h-64 flex items-center justify-center text-indigo-300 font-bold text-2xl">
                    [Team/Office Image]
                </div>
            </div>

            <div class="bg-slate-50 py-16 px-6 rounded-3xl mb-12">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-black text-slate-900">Why HireGo?</h2>
                </div>
                <div class="grid md:grid-cols-3 gap-8 text-center">
                    <div class="bg-white p-8 rounded-2xl shadow-sm">
                        <h3 class="text-xl font-bold text-slate-900 mb-3">Borderless Talent</h3>
                        <p class="text-slate-600">Access the top 1% of talent from anywhere in the world.</p>
                    </div>
                    <div class="bg-white p-8 rounded-2xl shadow-sm">
                        <h3 class="text-xl font-bold text-slate-900 mb-3">Precision Matching</h3>
                        <p class="text-slate-600">Our AI agents analyze behavioral signals for perfect fit.</p>
                    </div>
                    <div class="bg-white p-8 rounded-2xl shadow-sm">
                        <h3 class="text-xl font-bold text-slate-900 mb-3">Human-Centric</h3>
                        <p class="text-slate-600">We remove the busywork; you build relationships.</p>
                    </div>
                </div>
            </div>
        `,
        enterprise: `
            <div class="pt-10 mb-20 text-center px-6">
                 <div class="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm mb-6">Enterprise Solution</div>
                <h1 class="text-5xl md:text-6xl font-black text-slate-900 mb-6">Enterprise-grade AI hiring at <span class="text-indigo-600">global scale</span></h1>
                <p class="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                    HireGo AI Enterprise helps large organizations automate screening, interviews, and shortlisting with security, compliance, and full control.
                </p>
                <div class="flex justify-center gap-4">
                    <button class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Schedule Demo</button>
                    <button class="bg-white border text-slate-900 px-8 py-3 rounded-xl font-bold">Contact Sales</button>
                </div>
            </div>

            <div class="grid md:grid-cols-4 gap-6 px-6 mb-24">
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 class="font-bold text-slate-900 mb-2">Standardize hiring</h3>
                    <p class="text-sm text-slate-600">Run a single AI engine across multiple units.</p>
                </div>
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 class="font-bold text-slate-900 mb-2">Cut time-to-hire</h3>
                    <p class="text-sm text-slate-600">Automate screening and scheduling.</p>
                </div>
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 class="font-bold text-slate-900 mb-2">Better experience</h3>
                    <p class="text-sm text-slate-600">Consistent, fair, and fast journeys.</p>
                </div>
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 class="font-bold text-slate-900 mb-2">Actionable insights</h3>
                    <p class="text-sm text-slate-600">Analytics on funnel determination.</p>
                </div>
            </div>

            <div class="bg-slate-900 text-white py-16 px-6 rounded-3xl mb-16 mx-4">
                <div class="text-center mb-10">
                    <h2 class="text-3xl font-black mb-4">Security First</h2>
                    <p class="text-slate-400">SOC 2 Type II–aligned controls, SSO, and audit logs.</p>
                </div>
                <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div>
                        <h4 class="font-bold text-xl mb-2">Enterprise Security</h4>
                        <p class="text-slate-400">SSO (SAML, OIDC), RBAC, IP controls.</p>
                    </div>
                    <div>
                        <h4 class="font-bold text-xl mb-2">Compliance Ready</h4>
                        <p class="text-slate-400">Audit trails for every hiring decision.</p>
                    </div>
                </div>
            </div>
        `,
        careers: `
            <div class="pt-10 text-center mb-16">
                <h1 class="text-4xl font-bold text-slate-900 mb-4">Join Our Team</h1>
                <p class="text-xl text-slate-600">Help us build the future of autonomous hiring.</p>
            </div>

            <div class="max-w-4xl mx-auto px-6 space-y-4">
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">Senior AI Engineer</h3>
                        <p class="text-slate-500">Engineering • Remote • Full-time</p>
                    </div>
                    <button class="text-indigo-600 font-bold border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50">Apply Now</button>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">Product Designer</h3>
                        <p class="text-slate-500">Design • New York • Full-time</p>
                    </div>
                    <button class="text-indigo-600 font-bold border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50">Apply Now</button>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">Customer Success Manager</h3>
                        <p class="text-slate-500">Sales • London • Full-time</p>
                    </div>
                    <button class="text-indigo-600 font-bold border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50">Apply Now</button>
                </div>
            </div>
        `,
        contact: `
            <div class="pt-10 text-center mb-16 px-6">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-6">
                    We'd love to hear from you
                </div>
                <h1 class="text-5xl md:text-7xl font-black text-slate-900 mb-6">Get in touch</h1>
                <p class="text-xl text-slate-600 max-w-2xl mx-auto">
                    Whether you're looking to hire, find a job, or invest in our vision.
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 mb-20">
                <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                    <h3 class="text-2xl font-bold text-slate-900 mb-3">Candidate Support</h3>
                    <p class="text-slate-600 mb-6">Need help with your profile or applications?</p>
                    <a href="mailto:candidates@hiregoai.com" class="text-blue-600 font-bold">Email Us</a>
                </div>
                <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                    <h3 class="text-2xl font-bold text-slate-900 mb-3">For Employers</h3>
                    <p class="text-slate-600 mb-6">Hiring at scale? Let's talk enterprise.</p>
                    <a href="mailto:sales@hiregoai.com" class="text-indigo-600 font-bold">Email Us</a>
                </div>
                <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                    <h3 class="text-2xl font-bold text-slate-900 mb-3">Investors</h3>
                    <p class="text-slate-600 mb-6">Interested in investing in autonomous recruiting?</p>
                    <a href="mailto:invest@hiregoai.com" class="text-emerald-600 font-bold">Email Us</a>
                </div>
            </div>

            <div class="bg-white py-16 text-center">
                <h2 class="text-3xl font-black text-slate-900 mb-10">Our Global Presence</h2>
                <div class="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">
                    <div class="p-4 bg-slate-50 rounded-xl">
                        <h3 class="font-bold text-lg">San Francisco</h3>
                        <p class="text-indigo-500 text-xs font-bold uppercase mb-2">Global HQ</p>
                        <p class="text-slate-500 text-sm">100 Innovation Way</p>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-xl">
                        <h3 class="font-bold text-lg">London</h3>
                        <p class="text-indigo-500 text-xs font-bold uppercase mb-2">EMEA</p>
                        <p class="text-slate-500 text-sm">12 Tech City Rd</p>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-xl">
                        <h3 class="font-bold text-lg">New Delhi</h3>
                        <p class="text-indigo-500 text-xs font-bold uppercase mb-2">APAC</p>
                        <p class="text-slate-500 text-sm">Cyber City</p>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-xl">
                        <h3 class="font-bold text-lg">Singapore</h3>
                        <p class="text-indigo-500 text-xs font-bold uppercase mb-2">SEA</p>
                        <p class="text-slate-500 text-sm">Marina Bay</p>
                    </div>
                </div>
            </div>
        `
    };

    useEffect(() => {
        fetchPage(selectedPage);
    }, [selectedPage]);

    const fetchPage = async (slug: string) => {
        setLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/pages/${slug}`, {
                // headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success && data.page && data.page.content) {
                setContent(data.page.content);
                setTitle(data.page.title || '');
            } else {
                // Use Default Content if no backend override exists
                setContent(defaultContent[slug] || '');
                setTitle(pages.find(p => p.id === slug)?.name || '');
            }
        } catch (error) {
            console.error('Failed to fetch page', error);
            // Fallback
            setContent(defaultContent[slug] || '');
            setTitle(pages.find(p => p.id === slug)?.name || '');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/pages/${selectedPage}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Page updated successfully!' });
            } else {
                throw new Error(data.error || 'Failed to update');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Content Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 h-fit">
                    <h3 className="text-slate-400 font-bold mb-4 text-sm uppercase tracking-wider">Pages</h3>
                    <div className="space-y-2">
                        {pages.map(page => (
                            <button
                                key={page.id}
                                onClick={() => setSelectedPage(page.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${selectedPage === page.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {page.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-slate-800 rounded-xl p-6 border border-slate-700 min-h-[600px] flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            <Loader className="animate-spin w-8 h-8" />
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <label className="block text-slate-400 text-sm font-bold mb-2">Page Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter page title"
                                />
                            </div>

                            <div className="flex-1 mb-6 bg-white rounded-lg text-slate-900 overflow-hidden flex flex-col">
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    className="h-full flex-1"
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['link', 'clean']
                                        ],
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center">
                                    {message && (
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                            {message.text}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <a
                                        href={`/${selectedPage}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                                    >
                                        <Eye className="w-5 h-5" />
                                        View Live
                                    </a>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                                    >
                                        {saving ? <Loader className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageEditor;
