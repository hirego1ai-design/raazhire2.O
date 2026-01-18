import React from 'react';
import PageHero from '../components/PageHero';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            <PageHero
                title="Privacy Policy"
                subtitle="We are committed to protecting your personal data."
                image="/images/full_page_world_map_hero.png"
                height="40vh"
            />

            <section className="py-20 px-6">
                <div className="container mx-auto max-w-4xl bg-white p-10 rounded-xl shadow-sm">
                    <div className="prose prose-lg max-w-none text-gray-700">
                        <h3>1. Information We Collect</h3>
                        <p>We collect information you provide directly to us, such as when you create an account or post a job.</p>

                        <h3>2. How We Use Your Information</h3>
                        <p>We use your information to provide, maintain, and improve our services.</p>

                        <h3>3. Data Sharing</h3>
                        <p>We do not share your personal information with third parties except as described in this policy.</p>

                        <h3>4. Data Security</h3>
                        <p>We implement appropriate technical and organizational measures to protect your data.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPage;
