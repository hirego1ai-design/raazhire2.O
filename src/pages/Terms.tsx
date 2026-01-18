import React from 'react';
import PageHero from '../components/PageHero';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            <PageHero
                title="Terms of Service"
                subtitle="Please read these terms carefully before using our platform."
                image="/images/full_page_world_map_hero.png"
                height="40vh"
            />

            <section className="py-20 px-6">
                <div className="container mx-auto max-w-4xl bg-white p-10 rounded-xl shadow-sm">
                    <div className="prose prose-lg max-w-none text-gray-700">
                        <h3>1. Acceptance of Terms</h3>
                        <p>By accessing or using HireGo AI, you agree to be bound by these Terms of Service.</p>

                        <h3>2. Use of Services</h3>
                        <p>You agree to use our services only for lawful purposes and in accordance with these Terms.</p>

                        <h3>3. Account Security</h3>
                        <p>You are responsible for maintaining the confidentiality of your account credentials.</p>

                        <h3>4. Intellectual Property</h3>
                        <p>All content and technology on HireGo AI is the property of HireGo Inc.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsPage;
