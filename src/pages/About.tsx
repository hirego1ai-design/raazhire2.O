import React from 'react';
import PageHero from '../components/PageHero';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            <PageHero
                title="About Us"
                subtitle="Read our story and meet the team behind the AI revolution."
                image="/images/full_page_world_map_hero.png"
                height="50vh"
            />
            {/* Content placeholder */}
            <div className="container mx-auto py-20 px-6 text-center">
                <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">To create a world where hiring is instant, unbiased, and borderless.</p>
            </div>
        </div>
    );
};

export default AboutPage;
