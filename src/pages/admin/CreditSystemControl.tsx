import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Coins, Plus, Edit, Trash2, Save, X,
    Globe, Briefcase, History, Wallet, CheckCircle, AlertTriangle,
    DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminButton3D from '../../components/AdminButton3D';

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
    date: string;
    employerName: string;
    type: 'ADD' | 'DEDUCT';
    credits: number;
    description: string;
}

const CreditSystemControl: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pricing' | 'jobtypes' | 'wallets' | 'logs'>('pricing');
    const [bundles, setBundles] = useState<CreditBundle[]>([]);
    const [jobTypes, setJobTypes] = useState<JobPostType[]>([]);
    const [wallets, setWallets] = useState<EmployerWallet[]>([]);
    const [logs, setLogs] = useState<TransactionLog[]>([]);
    const [editingBundle, setEditingBundle] = useState<CreditBundle | null>(null);
    const [editingJobType, setEditingJobType] = useState<JobPostType | null>(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) return;

            // Fetch Bundles
            const { data: bundlesData } = await supabase.from('credit_bundles').select('*');
            if (bundlesData) {
                setBundles(bundlesData.map((b: any) => ({
                    id: b.id,
                    credits: b.credits,
                    priceINR: b.price_inr,
                    priceUSD: b.price_usd,
                    priceAED: b.price_aed,
                    priceEUR: b.price_eur,
                    priceAUD: b.price_aud,
                    isActive: b.is_active
                })));
            }

            // Fetch Job Types
            const { data: jobTypesData } = await supabase.from('job_post_types').select('*');
            if (jobTypesData) {
                setJobTypes(jobTypesData.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    creditsRequired: t.credits_required,
                    description: t.description,
                    isActive: t.is_active
                })));
            }

            // Mock data for wallets and logs if not available
            setWallets([
                { id: '1', employerName: 'Tech Corp', email: 'admin@techcorp.com', balance: 500 },
                { id: '2', employerName: 'Startup Inc', email: 'hello@startup.com', balance: 120 }
            ]);

            setLogs([
                { id: '1', date: '2024-03-20', employerName: 'Tech Corp', type: 'ADD', credits: 100, description: 'Purchased Bundle' },
                { id: '2', date: '2024-03-19', employerName: 'Startup Inc', type: 'DEDUCT', credits: 50, description: 'Job Posting' }
            ]);
        };
        fetchData();
    }, []);

    const handleSaveBundle = async (bundle: CreditBundle) => {
        console.log('Saving bundle', bundle);
        setEditingBundle(null);
    };

    const handleSaveJobType = async (type: JobPostType) => {
        console.log('Saving job type', type);
        setEditingJobType(null);
    };

    const handleManualCreditAdjustment = (walletId: string, amount: number, type: 'ADD' | 'DEDUCT') => {
        console.log('Adjusting wallet', walletId, amount, type);
    };

    const BundleEditor = ({ bundle, onClose, onSave }: { bundle: CreditBundle, onClose: () => void, onSave: (b: CreditBundle) => void }) => {
        const [data, setData] = useState(bundle);
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#0f111a] border border-white/10 rounded-xl p-6 w-full max-w-lg">
                    <h3 className="text-xl font-bold mb-4 text-white">{bundle.id ? 'Edit Credit Bundle' : 'New Credit Bundle'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400">Credits Amount</label>
                            <input type="number" value={data.credits} onChange={e => setData({ ...data, credits: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400">Price (INR)</label>
                                <input type="number" value={data.priceINR} onChange={e => setData({ ...data, priceINR: parseFloat(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Price (USD)</label>
                                <input type="number" value={data.priceUSD} onChange={e => setData({ ...data, priceUSD: parseFloat(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={data.isActive} onChange={e => setData({ ...data, isActive: e.target.checked })} />
                            <label className="text-sm text-gray-300">Active Bundle</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={onClose} className="px-4 py-2 rounded hover:bg-white/10 text-white">Cancel</button>
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
                    <h3 className="text-xl font-bold mb-4 text-white">{type.id ? 'Edit Job Type' : 'New Job Type'}</h3>
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
                        <button onClick={onClose} className="px-4 py-2 rounded hover:bg-white/10 text-white">Cancel</button>
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
                            <AdminButton3D
                                onClick={() => setEditingBundle({ id: '', credits: 0, priceINR: 0, priceUSD: 0, priceAED: 0, priceEUR: 0, priceAUD: 0, isActive: true })}
                                variant="success"
                                size="md"
                                icon={<Plus size={18} />}
                            >
                                Add Credit Bundle
                            </AdminButton3D>
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
                            <AdminButton3D
                                onClick={() => setEditingJobType({ id: '', name: '', creditsRequired: 0, description: '', isActive: true })}
                                variant="info"
                                size="md"
                                icon={<Plus size={18} />}
                            >
                                Add Job Type
                            </AdminButton3D>
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
                                    {logs.map(log => (
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
