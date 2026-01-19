import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Shield, Globe, Zap, Users, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const AboutPage = () => {
    const [dbContent, setDbContent] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetch('http://localhost:3000/api/pages/about')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.page && data.page.content) {
                    setDbContent(data.page.content);
                }
            })
            .catch(err => console.error(err));
    }, []);

    if (dbContent) {
        return <div className="min-h-screen bg-white font-outfit text-slate-900 pt-20" dangerouslySetInnerHTML={{ __html: dbContent }} />;
    }

    return (
        <div className="min-h-screen bg-white font-outfit text-slate-900 overflow-x-hidden selection:bg-blue-600 selection:text-white">

            {/* HERO SECTION - COMPACT & CENTERED */}
            <section className="relative pt-28 pb-16 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Rebuilding Hiring with <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent filter drop-shadow-md">Autonomous AI</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto font-medium leading-relaxed">
                            We are building the intelligence layer for the global workforce. Faster, unbiased, and truly human-centric.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* MAIN CONTENT - VIBRANT BACKGROUND & DOTS */}
            <section className="py-20 relative bg-gradient-to-br from-cyan-100 via-blue-100 to-violet-100">
                {/* Colorful dot pattern overlay */}
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(37, 99, 235, 0.6) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(79, 70, 229, 0.5) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    backgroundPosition: '16px 16px'
                }} />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

                        {/* 1. Image Group - Colorful Border */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="relative aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden p-[4px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 shadow-2xl rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
                                <div className="bg-white rounded-[2.3rem] w-full h-full overflow-hidden relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop"
                                        alt="Team"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Floating 3D Badge */}
                                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-pulse">
                                    <div className="w-3 h-3 rounded-md bg-green-500" />
                                    <span className="font-bold text-slate-900 text-sm">System Active</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Content with CORLORFUL SQUARE BOXES */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-white/95 via-blue-50/95 to-indigo-50/95 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white/60"
                        >
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                                We reject hiring that is <span className="text-indigo-600">slow & biased</span>.
                            </h2>
                            <p className="text-lg text-slate-700 mb-8 leading-relaxed font-medium">
                                Our mission is to arm companies with AI agents that instantly connect job-ready talent to the right roles.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { text: "Autonomous Candidate Screening", color: "from-blue-400 to-indigo-600", shadow: "shadow-blue-500/30" },
                                    { text: "Unbiased AI Evaluation", color: "from-purple-400 to-fuchsia-600", shadow: "shadow-purple-500/30" },
                                    { text: "Instant Technical Assessments", color: "from-emerald-400 to-green-600", shadow: "shadow-green-500/30" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        {/* Colorful 3D SQUARE Icon */}
                                        <div className={`w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br ${item.color} ${item.shadow} shadow-lg flex items-center justify-center text-white border-2 border-white ring-2 ring-indigo-50 group-hover:scale-110 transition-transform duration-300`}>
                                            <CheckCircle2 className="w-5 h-5 drop-shadow-md" />
                                        </div>
                                        <span className="text-xl font-bold text-slate-800">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* VALUES SECTION - LITE BLUE GLASSY THEME with OVERLAY BOXES */}
            <section className="py-24 relative bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 overflow-hidden">
                {/* GLASSY OVERLAY BOXES (Decor) */}
                <div className="absolute top-20 -left-10 w-72 h-72 bg-blue-400/10 rounded-[3rem] backdrop-blur-3xl rotate-12 border border-white/40 shadow-2xl animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-20 -right-10 w-96 h-96 bg-purple-400/10 rounded-[4rem] backdrop-blur-3xl -rotate-12 border border-white/40 shadow-2xl animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute top-1/2 left-1/2 w-full h-full max-w-4xl max-h-4xl -translate-x-1/2 -translate-y-1/2 bg-white/30 blur-[100px] rounded-full pointer-events-none" />

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(67, 56, 202, 0.6) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 drop-shadow-sm">Why HireGo?</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                icon: Globe,
                                title: "Borderless Talent",
                                desc: "Access the top 1% of talent from anywhere in the world.",
                                gradient: "from-blue-500 to-cyan-400",
                                shadow: "shadow-blue-500/40"
                            },
                            {
                                icon: Target,
                                title: "Precision Matching",
                                desc: "Our AI agents analyze behavioral signals for perfect fit.",
                                gradient: "from-fuchsia-500 to-pink-500",
                                shadow: "shadow-fuchsia-500/40"
                            },
                            {
                                icon: Users,
                                title: "Human-Centric",
                                desc: "We remove the busywork; you build relationships.",
                                gradient: "from-orange-500 to-amber-500",
                                shadow: "shadow-orange-500/40"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8 }}
                                className="group bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/60 hover:shadow-2xl hover:bg-white/80 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                            >
                                {/* 3D Icon Container - CENTERED & SQUARE-ISH (Rounded) */}
                                <div className={`relative w-24 h-24 rounded-[1.5rem] bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-xl ${item.shadow} group-hover:rotate-6 transition-transform duration-300 border-4 border-white`}>
                                    <div className="absolute inset-0 bg-white/20 blur-sm rounded-[1.2rem] transform scale-90" />
                                    <item.icon className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-lg text-slate-700 leading-relaxed font-bold opacity-80">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
