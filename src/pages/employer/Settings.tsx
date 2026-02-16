import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, CreditCard, Bell, Save, Wallet, CheckCircle, Plus } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('company');


    const [walletBalance, setWalletBalance] = useState(0);
    const [currentPlan, setCurrentPlan] = useState<any>(null);
    const [addAmount, setAddAmount] = useState('1000');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (activeTab === 'billing') {
            fetchBillingData();
        }
    }, [activeTab]);

    const fetchBillingData = async () => {
        try {
            const token = localStorage.getItem('sb-token');
            if (!token) return;

            // Fetch Wallet
            const walletRes = await fetch(`${API_BASE_URL}/api/wallet`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const walletData = await walletRes.json();
            if (walletData.success) {
                setWalletBalance(walletData.balance);
            }

            // Fetch Plan (simplified for now to just show user info or mock)
            // Ideally fetch from /api/employer/subscription
            setCurrentPlan({
                name: 'Starter Plan',
                price: 'Free',
                renewalDate: 'Lifetime',
                status: 'Active'
            });

        } catch (error) {
            console.error('Error fetching billing data:', error);
        }
    };

    const handleAddFunds = async () => {
        if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('sb-token');
            const response = await fetch(`${API_BASE_URL}/api/wallet/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: Number(addAmount), currency: 'INR' })
            });

            const data = await response.json();
            if (data.success) {
                if (data.is_mock) {
                    alert(data.message);
                    setWalletBalance(prev => prev + Number(addAmount));
                    setAddAmount('');
                } else {
                    // Handle real Razorpay flow here
                    alert(`Order created: ${data.order_id}. (Integration would open Razorpay modal here)`);
                }
            } else {
                alert('Failed to initiate transaction');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed');
        } finally {
            setLoading(false);
        }
    };

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
                            <div className="space-y-8">
                                {/* Wallet Section */}
                                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-6 rounded-xl border border-indigo-500/20">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                                                <Wallet className="text-indigo-400" size={20} /> Wallet Balance
                                            </h3>
                                            <p className="text-sm text-gray-400">Used for Pay-Per-Hire deposits and manual verification.</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-white">₹{walletBalance.toLocaleString()}</div>
                                            <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">+ Added Funds Available</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-end bg-white/5 p-4 rounded-lg">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Add Funds (INR)</label>
                                            <input
                                                type="number"
                                                value={addAmount}
                                                onChange={(e) => setAddAmount(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddFunds}
                                            disabled={loading}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading ? 'Processing...' : <><Plus size={16} /> Add Money</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Current Plan Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold">Current Subscription</h3>
                                        <button className="text-indigo-400 text-sm font-bold hover:underline">Change Plan</button>
                                    </div>

                                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between gap-6 items-center">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-xl font-bold">{currentPlan?.name || 'Starter'}</h4>
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20">Active</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">Renews on: {currentPlan?.renewalDate || 'Lifetime'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{currentPlan?.price || 'Free'}</div>
                                            <div className="text-xs text-gray-500">per month</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['Unlimited Job Posts', 'AI Candidate Screening', 'Basic Analytics', 'Email Support'].map((feat, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                <CheckCircle size={14} className="text-indigo-500" /> {feat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
