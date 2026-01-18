import React from 'react';
import PageHero from '../components/PageHero';
import { motion } from 'framer-motion';

const BlogPage = () => {
    const posts = [
        {
            title: "The Future of AI in Recruitment",
            excerpt: "How autonomous agents are changing the way companies hire.",
            date: "Oct 12, 2025",
            image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80"
        },
        {
            title: "5 Tips for Remote Hiring",
            excerpt: "Best practices for finding top talent globally.",
            date: "Sep 28, 2025",
            image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80"
        },
        {
            title: "Upskilling for the AI Era",
            excerpt: "Why continuous learning is more important than ever.",
            date: "Sep 15, 2025",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
        }
    ];

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            <PageHero
                title="HireGo Blog"
                subtitle="Insights, news, and trends from the world of AI hiring."
                image="/images/full_page_world_map_hero.png"
                height="50vh"
            />

            <section className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {posts.map((post, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <div className="h-48 overflow-hidden">
                                    {/* Using a placeholder div if images fail, or the unsplash urls */}
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <div className="text-sm text-electric-indigo-600 font-semibold mb-2">{post.date}</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-electric-indigo-600 transition-colors">{post.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{post.excerpt}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
