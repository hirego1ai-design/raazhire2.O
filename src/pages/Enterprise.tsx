import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Users, TrendingUp, Lock, CheckCircle, Server, FileText, Zap, Layout, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const EnterprisePage = () => {
    const [dbContent, setDbContent] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetch('http://localhost:3000/api/pages/enterprise')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.page && data.page.content) {
                    setDbContent(data.page.content);
                }
            })
            .catch(err => console.error(err));
    }, []);

    if (dbContent) {
        return <div className="min-h-screen bg-slate-50 font-outfit pt-20" dangerouslySetInnerHTML={{ __html: dbContent }} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-outfit">

            {/* 1. HERO SECTION */}
            <div className="relative pt-40 pb-32 px-6 overflow-hidden bg-slate-900">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-bold mb-6">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                                Enterprise Solution
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                                Enterprise-grade AI hiring at <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">global scale</span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
                                HireGo AI Enterprise helps large organizations automate screening, interviews, and shortlisting with security, compliance, and full control across every business unit.
                            </p>

                            <ul className="space-y-3 mb-10">
                                {[
                                    "SSO, advanced roles, and granular access control",
                                    "Custom AI models trained on your hiring data",
                                    "Full audit logs for every decision and workflow",
                                    "24/7 enterprise support with guaranteed SLAs"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-wrap gap-4">
                                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30 hover:-translate-y-1 border border-indigo-500/50">
                                    Schedule Enterprise Demo
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all backdrop-blur-sm border border-white/10 hover:-translate-y-1">
                                    Talk to Sales
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* 2. WHY HIREGO FOR ENTERPRISE */}
            <section className="py-24 px-6 bg-white">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Why enterprises choose HireGo AI</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Layout,
                                title: "Standardize hiring across teams",
                                desc: "Run a single AI-powered hiring engine across multiple locations, brands, and business units while keeping local flexibility.",
                                color: "blue"
                            },
                            {
                                icon: Zap,
                                title: "Cut time-to-hire, not quality",
                                desc: "Automate screening, skill assessments, and interview scheduling so recruiters focus only on the best-fit candidates.",
                                color: "indigo"
                            },
                            {
                                icon: Users,
                                title: "Better candidate experience at scale",
                                desc: "Consistent, fair, and fast hiring journeys with AI-guided communication and smart follow-ups.",
                                color: "purple"
                            },
                            {
                                icon: TrendingUp,
                                title: "Actionable insights for CHROs",
                                desc: "Analytics on funnel conversion, sourcing performance, and diversity metrics across every region and role.",
                                color: "emerald"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SECURITY & COMPLIANCE */}
            <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-900/20 skew-x-12 transform translate-x-20"></div>
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold mb-6">
                                <Shield size={14} /> Security First
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6">Enterprise security and compliance you can trust</h2>
                            <p className="text-xl text-slate-400 mb-10">
                                HireGo AI is designed for organizations that need strict security, auditability, and regulatory compliance.
                            </p>

                            <div className="space-y-8">
                                {[
                                    { title: "Enterprise security", desc: "SSO (SAML, OIDC), role-based access control, IP and device controls." },
                                    { title: "Compliance ready", desc: "SOC 2 Type II–aligned controls, audit trails for every hiring decision, and exportable compliance reports." },
                                    { title: "Data protection", desc: "Encryption in transit and at rest, segregated environments for enterprise customers, and configurable data retention." },
                                    { title: "Governance & oversight", desc: "Full audit logs of recruiter and hiring manager actions, plus AI decision logs where applicable." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1">
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-white mb-2">{item.title}</h4>
                                            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Badges Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "SOC 2 Type II Ready", icon: Shield, color: "blue" },
                                { label: "150+ Countries Supported", icon: Globe, color: "indigo" },
                                { label: "Unlimited Users", icon: Users, color: "purple" },
                                { label: "Custom Analytics & Reporting", icon: TrendingUp, color: "pink" }
                            ].map((badge, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center justify-center min-h-[200px]"
                                >
                                    <badge.icon className={`w-12 h-12 text-${badge.color}-400 mb-4`} />
                                    <h5 className="font-bold text-lg text-white">{badge.label}</h5>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. GLOBAL HIRING & USE CASES */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Built for global hiring teams</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Support high-volume, multi-region hiring without losing control, fairness, or brand consistency.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "High-volume frontline hiring",
                                desc: "Automate screening and interviews for thousands of frontline roles while keeping local compliance and language needs",
                                color: "bg-gradient-to-br from-blue-500 to-indigo-600"
                            },
                            {
                                title: "Tech and professional roles",
                                desc: "Combine skills-based assessments with AI interviews to identify top performers faster.",
                                color: "bg-gradient-to-br from-indigo-500 to-purple-600"
                            },
                            {
                                title: "Campus and early talent",
                                desc: "Run campaigns, virtual drives, and AI interviews for university and early-talent hiring.",
                                color: "bg-gradient-to-br from-purple-500 to-pink-600"
                            },
                            {
                                title: "BPO, retail, and operations",
                                desc: "Handle recurring bulk hiring with reusable job templates, pipelines, and automations.",
                                color: "bg-gradient-to-br from-emerald-500 to-teal-600"
                            }
                        ].map((card, i) => (
                            <div key={i} className="group relative overflow-hidden rounded-3xl shadow-xl h-64 flex flex-col justify-end p-8 text-white">
                                <div className={`absolute inset-0 ${card.color} transition-transform duration-500 group-hover:scale-105`}></div>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                                    <p className="text-white/90 font-medium leading-relaxed">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. IMPLEMENTATION & SUPPORT */}
            <section className="py-24 px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Smooth implementation and dedicated support</h2>
                        <p className="text-slate-600 text-lg">Enterprises care about rollout and ongoing support.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { title: "Guided onboarding", icon: Server, desc: "Implementation specialists help integrate HireGo AI with your ATS, HRIS, and collaboration tools." },
                            { title: "Custom AI configuration", icon: Zap, desc: "Define role profiles, evaluation rubrics, and custom models aligned with your competency frameworks." },
                            { title: "Training for your teams", icon: FileText, desc: "Live and on-demand training for recruiters, hiring managers, and HR leadership." },
                            { title: "Dedicated success team", icon: Headphones, desc: "Dedicated Customer Success Manager, 24/7 support, and SLAs tailored for enterprise accounts." }
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:bg-white hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-indigo-600">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-3">{item.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. FINAL CTA */}
            <div className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                        {/* Gradients */}
                        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                                Ready to make autonomous hiring your new standard?
                            </h2>
                            <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
                                Talk to our enterprise team to see how HireGo AI can fit into your global hiring stack.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-white text-indigo-900 px-10 py-5 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:scale-105">
                                    Book a Strategy Call
                                </button>
                                <button className="bg-indigo-700/50 text-white border border-indigo-500/50 px-10 py-5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all backdrop-blur-sm">
                                    Download Enterprise Overview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EnterprisePage;
