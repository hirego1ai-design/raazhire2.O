import React from 'react';
import PageHero from '../components/PageHero';
import { motion } from 'framer-motion';

const CompanyPage = () => {
    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            <PageHero
                title="Our Company"
                subtitle="Building the future of autonomous work."
                image="/images/full_page_world_map_hero.png"
                height="55vh"
            />

            <section className="py-24 px-6">
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900 mb-8"
                    >
                        We are HireGo AI.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 leading-relaxed mb-6"
                    >
                        Founded in 2024, our mission is to eliminate the friction in global hiring. We believe talent is everywhere, but opportunity is not. By leveraging autonomous AI agents, we bridge that gap instantly.
                    </motion.p>
                </div>
            </section>
        </div>
    );
};

export default CompanyPage;
