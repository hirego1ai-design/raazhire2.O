import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, CreditCard, Bell, Save } from 'lucide-react';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('company');

    const tabs = [
        { id: 'company', label: 'Company Profile', icon: Building },
        { id: 'team', label: 'Team Members', icon: Users },
        { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Manage your company preferences and account settings.</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full md:w-64 space-y-2"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1"
                >
                    <div className="p-6 rounded-xl glass border border-white/10">
                        {activeTab === 'company' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold mb-6">Company Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Company Name</label>
                                        <input
                                            type="text"
                                            defaultValue="TechCorp Inc."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Website</label>
                                        <input
                                            type="text"
                                            defaultValue="https://techcorp.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm text-gray-400">Description</label>
                                        <textarea
                                            rows={4}
                                            defaultValue="Leading provider of innovative software solutions..."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 focus:outline-none focus:border-neon-cyan transition-colors resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Industry</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors text-white">
                                            <option>Technology</option>
                                            <option>Healthcare</option>
                                            <option>Finance</option>
                                            <option>Education</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Company Size</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-neon-cyan transition-colors text-white">
                                            <option>1-10</option>
                                            <option>11-50</option>
                                            <option>51-200</option>
                                            <option>201-500</option>
                                            <option>500+</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-end">
                                    <button className="btn-3d btn-primary flex items-center gap-2">
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Team Members</h2>
                                    <button className="btn-3d btn-secondary flex items-center gap-2">
                                        <Users size={16} />
                                        Invite Member
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { name: 'Alex Morgan', email: 'alex@techcorp.com', role: 'Admin', avatar: 'AM' },
                                        { name: 'Sarah Connor', email: 'sarah@techcorp.com', role: 'Recruiter', avatar: 'SC' },
                                        { name: 'John Smith', email: 'john@techcorp.com', role: 'Interviewer', avatar: 'JS' },
                                    ].map((member, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-space-blue flex items-center justify-center font-bold text-sm">
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{member.name}</div>
                                                    <div className="text-xs text-gray-400">{member.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 text-gray-300">
                                                    {member.role}
                                                </span>
                                                <button className="btn-3d btn-danger text-xs px-3 py-1">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="text-center py-12 text-gray-400">
                                <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Billing and subscription management coming soon.</p>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="text-center py-12 text-gray-400">
                                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Notification preferences coming soon.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
