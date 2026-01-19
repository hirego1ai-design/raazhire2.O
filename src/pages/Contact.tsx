import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Globe, TrendingUp, Users, Building2, MessageSquare } from 'lucide-react';
import Footer from '../components/Footer';

const ContactPage = () => {
    const [dbContent, setDbContent] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetch('http://localhost:3000/api/pages/contact')
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

    const contactReasons = [
        {
            icon: Users,
            title: "Candidate Support",
            description: "Need help with your profile, assessments, or job applications?",
            email: "candidates@hiregoai.com",
            color: "blue"
        },
        {
            icon: Building2,
            title: "For Employers",
            description: "Hiring at scale? Let's talk about our enterprise AI solutions.",
            email: "sales@hiregoai.com",
            color: "indigo"
        },
        {
            icon: TrendingUp,
            title: "Investors & Partners",
            description: "Interested in investing in the future of autonomous recruiting?",
            email: "invest@hiregoai.com",
            color: "emerald"
        }
    ];

    const regions = [
        { city: "San Francisco", region: "Global HQ", address: "100 Innovation Way, CA 94105" },
        { city: "London", region: "EMEA", address: "12 Tech City Rd, London EC1V" },
        { city: "New Delhi", region: "APAC", address: "Cyber City, DLF Phase 2, Gurugram" },
        { city: "Singapore", region: "SEA", address: "Marina Bay Financial Centre" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-outfit">
            {/* Hero Section with Background Image */}
            <div className="relative pt-40 pb-32 px-6 overflow-hidden">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
                        alt="Contact Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-indigo-900/90 to-slate-900/95 backdrop-blur-sm"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm text-indigo-300 font-medium text-sm mb-6">
                            <MessageSquare size={16} />
                            <span>We'd love to hear from you</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                            Get in touch with <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">HireGo AI</span>
                        </h1>
                        <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto">
                            Whether you're looking to hire, find a job, or invest in our vision, our team is ready to assist you anywhere in the world.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Contact Cards Section */}
            <div className="container mx-auto max-w-6xl px-6 -mt-20 relative z-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {contactReasons.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-${item.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                {item.description}
                            </p>
                            <a href={`mailto:${item.email}`} className={`text-${item.color}-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all`}>
                                Email Us <Globe className="w-4 h-4" />
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Global Regions Section */}
            <div className="py-24 px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Our Global Presence</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Operating across multiple regions to serve the global workforce.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {regions.map((office, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center hover:bg-white hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{office.city}</h3>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">{office.region}</p>
                                <p className="text-slate-500 text-sm">{office.address}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Investment Callout */}
            <div className="py-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>
                        <div className="relative z-10">
                            <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-5xl font-black mb-6">Investment Opportunities</h2>
                            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                                Join us in reshaping the $600B recruitment industry with Autonomous AI.
                                We are actively expanding our partner network.
                            </p>
                            <a href="mailto:invest@hiregoai.com" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25">
                                Request Investor Deck
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ContactPage;
