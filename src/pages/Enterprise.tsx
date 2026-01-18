import React from 'react';
import PageHero from '../components/PageHero';
import { motion } from 'framer-motion';
import { Building2, Shield, Globe, BarChart3, Users } from 'lucide-react';
import Button3D from '../components/Button3D';

const EnterprisePage = () => {
    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            <PageHero
                title="Enterprise Solutions"
                subtitle="Scale your hiring with military-grade security and global compliance."
                image="/images/full_page_world_map_hero.png" // Placeholder
                height="60vh"
            />

            <section className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Designed for Global Scale</h2>
                            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                                HireGo Enterprise gives large organizations the control, visibility, and security they need to hire thousands of employees across borders.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "SSO (SAML, OIDC) & Advanced Permissions",
                                    "Custom AI Models trained on your data",
                                    "Dedicated Success Manager & 24/7 SLA",
                                    "Full Audit Logs & Compliance Reports"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium text-gray-800">
                                        <div className="w-2 h-2 rounded-full bg-electric-indigo-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-10">
                                <Button3D size="lg" variant="primary">Schedule Consultation</Button3D>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-electric-indigo-50 to-white p-8 rounded-card-xl border border-electric-indigo-100 shadow-premium-lg"
                        >
                            {/* Abstract Graphic Placeholder */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white rounded-xl shadow-sm flex flex-col items-center text-center">
                                    <Shield className="w-10 h-10 text-electric-indigo-600 mb-3" />
                                    <h4 className="font-bold">SOC2 Type II</h4>
                                </div>
                                <div className="p-6 bg-white rounded-xl shadow-sm flex flex-col items-center text-center">
                                    <Globe className="w-10 h-10 text-ai-cyan-600 mb-3" />
                                    <h4 className="font-bold">150+ Countries</h4>
                                </div>
                                <div className="p-6 bg-white rounded-xl shadow-sm flex flex-col items-center text-center">
                                    <Users className="w-10 h-10 text-soft-emerald-600 mb-3" />
                                    <h4 className="font-bold">Unlimited Users</h4>
                                </div>
                                <div className="p-6 bg-white rounded-xl shadow-sm flex flex-col items-center text-center">
                                    <BarChart3 className="w-10 h-10 text-orange-500 mb-3" />
                                    <h4 className="font-bold">Custom Analytics</h4>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EnterprisePage;
