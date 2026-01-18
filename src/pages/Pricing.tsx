import React from 'react';
import PageHero from '../components/PageHero';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import Button3D from '../components/Button3D';

const PricingPage = () => {
    const plans = [
        {
            name: "Starter",
            price: "Free",
            description: "Perfect for small teams and startups.",
            features: ["1 Active Job Posting", "Basic AI Screening", "10 Candidate Profiles", "Email Support"],
            bestValue: false,
            color: "blue"
        },
        {
            name: "Pro",
            price: "$499/mo",
            description: "For growing companies scaling fast.",
            features: ["Unlimited Job Postings", "Advanced AI Interviewer", "Unlimited Candidates", "Priority Support", "Custom Branding"],
            bestValue: true,
            color: "violet"
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "Full power for global organizations.",
            features: ["Dedicated Account Manager", "API Access", "SSO & Security", "Custom AI Models", "SLA Guarantee"],
            bestValue: false,
            color: "cyan"
        }
    ];

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            <PageHero
                title="Simple, Transparent Pricing"
                subtitle="Choose the plan that fits your hiring needs. No hidden fees."
                image="/images/full_page_world_map_hero.png" // Placeholder, will replace
                height="50vh"
            />

            <section className="py-20 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-8 rounded-card-xl bg-white shadow-premium hover:shadow-premium-lg transition-all duration-300 border ${plan.bestValue ? 'border-electric-indigo-500 ring-2 ring-electric-indigo-200' : 'border-gray-100'}`}
                            >
                                {plan.bestValue && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-electric-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-white" /> Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="text-4xl font-black text-gray-900 mb-4">{plan.price}</div>
                                <p className="text-gray-500 mb-8">{plan.description}</p>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-700">
                                            <div className={`p-1 rounded-full ${plan.bestValue ? 'bg-electric-indigo-100 text-electric-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                                <Check className="w-4 h-4" />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Button3D
                                    variant={plan.bestValue ? 'primary' : 'outline'}
                                    className="w-full"
                                >
                                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                                </Button3D>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PricingPage;
