import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Coins, Plus, Edit, Trash2, Save, X,
    Globe, Briefcase, History, Wallet, CheckCircle, AlertTriangle,
    DollarSign, TrendingUp, ShoppingCart
} from 'lucide-react';

// --- Types ---
interface CreditBundle {
    id: string;
    credits: number;
    priceINR: number;
    priceUSD: number;
    priceAED: number;
    priceEUR: number;
    priceAUD: number;
    isActive: boolean;
}

interface JobPostType {
    id: string;
    name: string;
    creditsRequired: number;
    description: string;
    isActive: boolean;
}

interface EmployerWallet {
    id: string;
    employerName: string;
    email: string;
    balance: number;
}

interface TransactionLog {
    id: string;
    employerName: string;
    type: 'ADD' | 'DEDUCT';
    credits: number;
    description: string;
    date: string;
}

// --- Mock Data ---
const INITIAL_BUNDLES: CreditBundle[] = [
    { id: '1', credits: 100, priceINR: 999, priceUSD: 12, priceAED: 45, priceEUR: 11, priceAUD: 18, isActive: true },
    { id: '2', credits: 500, priceINR: 3999, priceUSD: 45, priceAED: 165, priceEUR: 40, priceAUD: 75, isActive: true },
    { id: '3', credits: 1000, priceINR: 6999, priceUSD: 85, priceAED: 310, priceEUR: 75, priceAUD: 140, isActive: true },
];

const INITIAL_JOB_TYPES: JobPostType[] = [
    { id: '1', name: 'Basic', creditsRequired: 10, description: 'Standard job listing, visible for 30 days.', isActive: true },
    { id: '2', name: 'Standard', creditsRequired: 15, description: 'Includes email alerts to matching candidates.', isActive: true },
    { id: '3', name: 'Premium', creditsRequired: 25, description: 'Top of search results + Social Media boost.', isActive: true },
    { id: '4', name: 'Urgent Hiring', creditsRequired: 30, description: 'Highlighted as Urgent + SMS alerts.', isActive: true },
    { id: '5', name: 'Interview-Ready', creditsRequired: 40, description: 'Pre-screened candidates only.', isActive: true },
];

const INITIAL_WALLETS: EmployerWallet[] = [
    { id: 'e1', employerName: 'TechCorp Inc.', email: 'hr@techcorp.com', balance: 450 },
    { id: 'e2', employerName: 'Global Solutions', email: 'recruitment@globalsol.com', balance: 1200 },
];

const INITIAL_LOGS: TransactionLog[] = [
    { id: 't1', employerName: 'TechCorp Inc.', type: 'ADD', credits: 500, description: 'Purchased Credit Bundle', date: '2025-11-24 10:30 AM' },
    { id: 't2', employerName: 'TechCorp Inc.', type: 'DEDUCT', credits: 25, description: 'Premium Job Post', date: '2025-11-24 11:15 AM' },
    { id: 't3', employerName: 'Global Solutions', type: 'DEDUCT', credits: 40, description: 'Interview-Ready Post', date: '2025-11-25 09:00 AM' },
];

const CreditSystemControl: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pricing' | 'jobtypes' | 'wallets' | 'logs'>('pricing');
    const [bundles, setBundles] = useState<CreditBundle[]>(INITIAL_BUNDLES);
    const [jobTypes, setJobTypes] = useState<JobPostType[]>(INITIAL_JOB_TYPES);
    const [wallets, setWallets] = useState<EmployerWallet[]>(INITIAL_WALLETS);
    const [editingBundle, setEditingBundle] = useState<CreditBundle | null>(null);
    const [editingJobType, setEditingJobType] = useState<JobPostType | null>(null);

    // --- Actions ---
    const handleSaveBundle = (bundle: CreditBundle) => {
        if (bundles.find(b => b.id === bundle.id)) {
            setBundles(bundles.map(b => b.id === bundle.id ? bundle : b));
        } else {
            setBundles([...bundles, { ...bundle, id: Date.now().toString() }]);
        }
        setEditingBundle(null);
    };

    const handleSaveJobType = (type: JobPostType) => {
        if (jobTypes.find(t => t.id === type.id)) {
            setJobTypes(jobTypes.map(t => t.id === type.id ? type : t));
        } else {
            setJobTypes([...jobTypes, { ...type, id: Date.now().toString() }]);
        }
        setEditingJobType(null);
    };

    const handleManualCreditAdjustment = (walletId: string, amount: number, type: 'ADD' | 'DEDUCT') => {
        setWallets(wallets.map(w => {
            if (w.id === walletId) {
                return { ...w, balance: type === 'ADD' ? w.balance + amount : w.balance - amount };
            }
            return w;
        }));
        alert(`Successfully ${type === 'ADD' ? 'added' : 'deducted'} ${amount} credits.`);
    };

    // --- Modals ---
    const BundleEditor = ({ bundle, onClose, onSave }: { bundle: CreditBundle, onClose: () => void, onSave: (b: CreditBundle) => void }) => {
        const [data, setData] = useState(bundle);
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#0f111a] border border-white/10 rounded-xl p-6 w-full max-w-lg">
                    <h3 className="text-xl font-bold mb-4">{bundle.id ? 'Edit Bundle' : 'New Credit Bundle'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400">Credits</label>
                            <input type="number" value={data.credits} onChange={e => setData({ ...data, credits: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-gray-500">INR (₹)</label><input type="number" value={data.priceINR} onChange={e => setData({ ...data, priceINR: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" /></div>
                            <div><label className="text-xs text-gray-500">USD ($)</label><input type="number" value={data.priceUSD} onChange={e => setData({ ...data, priceUSD: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" /></div>
                            <div><label className="text-xs text-gray-500">AED</label><input type="number" value={data.priceAED} onChange={e => setData({ ...data, priceAED: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" /></div>
                            <div><label className="text-xs text-gray-500">EUR (€)</label><input type="number" value={data.priceEUR} onChange={e => setData({ ...data, priceEUR: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" /></div>
                            <div><label className="text-xs text-gray-500">AUD ($)</label><input type="number" value={data.priceAUD} onChange={e => setData({ ...data, priceAUD: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" /></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={data.isActive} onChange={e => setData({ ...data, isActive: e.target.checked })} />
                            <label className="text-sm text-gray-300">Active Bundle</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={onClose} className="px-4 py-2 rounded hover:bg-white/10">Cancel</button>
                        <button onClick={() => onSave(data)} className="px-4 py-2 bg-neon-cyan text-black rounded font-bold">Save</button>
                    </div>
                </div>
            </div>
        );
    };

    const JobTypeEditor = ({ type, onClose, onSave }: { type: JobPostType, onClose: () => void, onSave: (t: JobPostType) => void }) => {
        const [data, setData] = useState(type);
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#0f111a] border border-white/10 rounded-xl p-6 w-full max-w-lg">
                    <h3 className="text-xl font-bold mb-4">{type.id ? 'Edit Job Type' : 'New Job Type'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400">Type Name</label>
                            <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Credits Required</label>
                            <input type="number" value={data.creditsRequired} onChange={e => setData({ ...data, creditsRequired: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Description</label>
                            <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white h-20" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={data.isActive} onChange={e => setData({ ...data, isActive: e.target.checked })} />
                            <label className="text-sm text-gray-300">Active Type</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={onClose} className="px-4 py-2 rounded hover:bg-white/10">Cancel</button>
                        <button onClick={() => onSave(data)} className="px-4 py-2 bg-neon-cyan text-black rounded font-bold">Save</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                        Credit System Control
                    </h1>
                    <p className="text-gray-400">Manage global credit pricing, job post costs, and employer wallets.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                    <Globe size={16} className="text-neon-cyan" />
                    <span className="text-gray-300">Global Pricing:</span>
                    <span className="text-green-400 font-bold">ACTIVE</span>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1 overflow-x-auto">
                <button onClick={() => setActiveTab('pricing')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'pricing' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>
                    <DollarSign size={16} className="inline-block mr-2 mb-0.5" /> Credit Pricing
                    {activeTab === 'pricing' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />}
                </button>
                <button onClick={() => setActiveTab('jobtypes')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'jobtypes' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                    <Briefcase size={16} className="inline-block mr-2 mb-0.5" /> Job Post Types
                    {activeTab === 'jobtypes' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
                </button>
                <button onClick={() => setActiveTab('wallets')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'wallets' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}>
                    <Wallet size={16} className="inline-block mr-2 mb-0.5" /> Employer Wallets
                    {activeTab === 'wallets' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
                </button>
                <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'logs' ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}>
                    <History size={16} className="inline-block mr-2 mb-0.5" /> Transaction Logs
                    {activeTab === 'logs' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />}
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {/* 1. Credit Pricing */}
                {activeTab === 'pricing' && (
                    <motion.div key="pricing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={() => setEditingBundle({ id: '', credits: 0, priceINR: 0, priceUSD: 0, priceAED: 0, priceEUR: 0, priceAUD: 0, isActive: true })} className="btn-3d btn-primary px-4 py-2 flex items-center gap-2 text-sm">
                                <Plus size={16} /> Add Credit Bundle
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bundles.map(bundle => (
                                <div key={bundle.id} className={`p-6 rounded-xl glass border transition-all ${bundle.isActive ? 'border-white/10' : 'border-red-500/30 opacity-75'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <Coins className="text-yellow-400" size={24} />
                                            <h3 className="text-2xl font-bold">{bundle.credits} Credits</h3>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${bundle.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {bundle.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-6">
                                        <div className="flex justify-between text-gray-400"><span>INR</span><span className="text-white font-bold">₹{bundle.priceINR}</span></div>
                                        <div className="flex justify-between text-gray-400"><span>USD</span><span className="text-white font-bold">${bundle.priceUSD}</span></div>
                                        <div className="flex justify-between text-gray-400"><span>AED</span><span className="text-white font-bold">{bundle.priceAED}</span></div>
                                        <div className="flex justify-between text-gray-400"><span>EUR</span><span className="text-white font-bold">€{bundle.priceEUR}</span></div>
                                        <div className="flex justify-between text-gray-400"><span>AUD</span><span className="text-white font-bold">${bundle.priceAUD}</span></div>
                                    </div>
                                    <button onClick={() => setEditingBundle(bundle)} className="w-full py-2 rounded bg-white/5 hover:bg-white/10 text-sm transition-colors flex items-center justify-center gap-2">
                                        <Edit size={14} /> Edit Bundle
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 2. Job Post Types */}
                {activeTab === 'jobtypes' && (
                    <motion.div key="jobtypes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={() => setEditingJobType({ id: '', name: '', creditsRequired: 0, description: '', isActive: true })} className="btn-3d btn-primary px-4 py-2 flex items-center gap-2 text-sm">
                                <Plus size={16} /> Add Job Type
                            </button>
                        </div>
                        <div className="rounded-xl glass border border-white/10 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="p-4">Job Type</th>
                                        <th className="p-4">Credits Required</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {jobTypes.map(type => (
                                        <tr key={type.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold">{type.name}</td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                                    <Coins size={14} /> {type.creditsRequired}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-400">{type.description}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${type.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {type.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => setEditingJobType(type)} className="text-neon-cyan hover:underline text-sm">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* 3. Employer Wallets */}
                {activeTab === 'wallets' && (
                    <motion.div key="wallets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="rounded-xl glass border border-white/10 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="p-4">Employer</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Wallet Balance</th>
                                        <th className="p-4 text-right">Manual Adjustment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {wallets.map(wallet => (
                                        <tr key={wallet.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold">{wallet.employerName}</td>
                                            <td className="p-4 text-sm text-gray-400">{wallet.email}</td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                                                    <Wallet size={18} /> {wallet.balance}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleManualCreditAdjustment(wallet.id, 10, 'ADD')}
                                                        className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30"
                                                    >
                                                        + Add
                                                    </button>
                                                    <button
                                                        onClick={() => handleManualCreditAdjustment(wallet.id, 10, 'DEDUCT')}
                                                        className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30"
                                                    >
                                                        - Deduct
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* 4. Transaction Logs */}
                {activeTab === 'logs' && (
                    <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="rounded-xl glass border border-white/10 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Employer</th>
                                        <th className="p-4">Action</th>
                                        <th className="p-4">Credits</th>
                                        <th className="p-4">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {INITIAL_LOGS.map(log => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-sm text-gray-400">{log.date}</td>
                                            <td className="p-4 font-bold">{log.employerName}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'ADD' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-white">{log.credits}</td>
                                            <td className="p-4 text-sm text-gray-300">{log.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {editingBundle && <BundleEditor bundle={editingBundle} onClose={() => setEditingBundle(null)} onSave={handleSaveBundle} />}
                {editingJobType && <JobTypeEditor type={editingJobType} onClose={() => setEditingJobType(null)} onSave={handleSaveJobType} />}
            </AnimatePresence>
        </div>
    );
};

export default CreditSystemControl;
