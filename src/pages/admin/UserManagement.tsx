import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Trash2, Ban, CheckCircle,
    User, Briefcase, MessageSquare, FileText, Activity, Edit,
    Lock, Eye, AlertTriangle, Mail, Phone, MapPin,
    Calendar, Download, ExternalLink, X, Wallet, CreditCard, History
} from 'lucide-react';

// --- Types ---
type UserRole = 'Candidate' | 'Employer' | 'Admin';
type UserStatus = 'Active' | 'Pending' | 'Blocked';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    joinDate: string;
    location?: string;
    phone?: string;
    // Candidate specific
    jobApplied?: number;
    skills?: string[];
    // Employer specific
    companyName?: string;
    jobsPosted?: number;
    walletBalance?: number;
    plan?: string;
}

// --- Mock Data ---
import { supabase } from '../../lib/supabase';

// ... existing imports

const UserManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'candidates' | 'employers' | 'support'>('candidates');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    React.useEffect(() => {
        const fetchUsers = async () => {
            if (!supabase) return;

            // Fetch all users
            const { data: usersData } = await supabase
                .from('users')
                .select('*');

            if (usersData) {
                const enrichedUsers: User[] = await Promise.all(usersData.map(async (u: any) => {
                    let extraData = {};

                    if (supabase) {
                        if (u.role === 'candidate') {
                            const { count } = await supabase
                                .from('applications')
                                .select('*', { count: 'exact', head: true })
                                .eq('candidate_id', u.id); // Assuming user.id maps to candidate_id or similar
                            extraData = { jobApplied: count || 0 };
                        } else if (u.role === 'employer') {
                            const { count } = await supabase
                                .from('jobs')
                                .select('*', { count: 'exact', head: true })
                                .eq('employer_id', u.id);
                            extraData = { jobsPosted: count || 0, companyName: u.company_name, walletBalance: u.wallet_balance || 0, plan: u.plan || 'Basic' };
                        }
                    }

                    return {
                        id: u.id,
                        name: u.name || 'Unknown',
                        email: u.email,
                        role: u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) as UserRole : 'Candidate',
                        status: u.status || 'Active', // Default to Active if not set
                        joinDate: new Date(u.created_at).toLocaleDateString(),
                        location: u.location || 'Unknown',
                        phone: u.phone,
                        ...extraData
                    };
                }));
                setUsers(enrichedUsers);
            }
        };

        fetchUsers();
    }, []);

    // --- Actions ---
    const handleStatusChange = async (id: string, newStatus: UserStatus) => {
        if (supabase) {
            await supabase.from('users').update({ status: newStatus }).eq('id', id);
        }
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            if (supabase) {
                await supabase.from('users').delete().eq('id', id);
            }
            setUsers(users.filter(u => u.id !== id));
            if (selectedUser?.id === id) setSelectedUser(null);
        }
    };

    // --- Filtered Lists ---
    const candidates = users.filter(u => u.role === 'Candidate' && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())));
    const employers = users.filter(u => u.role === 'Employer' && (u.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())));

    // --- Components ---
    const UserTable = ({ data, type }: { data: User[], type: 'Candidate' | 'Employer' }) => (
        <div className="rounded-xl glass border border-white/10 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                    <tr>
                        <th className="p-4 font-medium">Name / ID</th>
                        <th className="p-4 font-medium">Contact</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">{type === 'Candidate' ? 'Jobs Applied' : 'Jobs Posted'}</th>
                        {type === 'Employer' && <th className="p-4 font-medium">Wallet</th>}
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{user.name}</div>
                                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="text-sm text-gray-300">{user.email}</div>
                                <div className="text-xs text-gray-500">{user.phone || 'N/A'}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs border flex w-fit items-center gap-1 ${user.status === 'Active' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                    user.status === 'Blocked' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                        'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                    }`}>
                                    {user.status === 'Active' ? <CheckCircle size={10} /> : user.status === 'Blocked' ? <Ban size={10} /> : <AlertTriangle size={10} />}
                                    {user.status}
                                </span>
                            </td>
                            <td className="p-4 text-gray-300">
                                {type === 'Candidate' ? user.jobApplied : user.jobsPosted}
                            </td>
                            {type === 'Employer' && (
                                <td className="p-4">
                                    <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                        <Wallet size={14} /> {user.walletBalance}
                                    </span>
                                </td>
                            )}
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => setSelectedUser(user)}
                                    className="px-3 py-1.5 rounded-lg bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 text-sm font-medium transition-colors"
                                >
                                    Manage
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const UserDetailModal = ({ user, onClose }: { user: User, onClose: () => void }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
                {/* Modal Header */}
                <div className="sticky top-0 bg-[#0f111a]/95 backdrop-blur z-10 p-6 border-b border-white/10 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-2xl font-bold text-white">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {user.name}
                                <span className="text-sm font-normal text-gray-400 px-2 py-0.5 rounded border border-white/10 bg-white/5">
                                    {user.role}
                                </span>
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                                <span className="flex items-center gap-1"><MapPin size={14} /> {user.location}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Profile & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status Control */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Account Status</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleStatusChange(user.id, 'Active')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${user.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'hover:bg-white/5 text-gray-400'}`}
                                >
                                    <CheckCircle size={16} /> Active
                                </button>
                                <button
                                    onClick={() => handleStatusChange(user.id, 'Pending')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${user.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'hover:bg-white/5 text-gray-400'}`}
                                >
                                    <AlertTriangle size={16} /> Pending Review
                                </button>
                                <button
                                    onClick={() => handleStatusChange(user.id, 'Blocked')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${user.status === 'Blocked' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-gray-400'}`}
                                >
                                    <Ban size={16} /> Block Account
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-colors">
                                    <Lock size={16} /> Reset Password
                                </button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-colors">
                                    <Mail size={16} /> Verify Email
                                </button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-colors">
                                    <ExternalLink size={16} /> Open Dashboard As User
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-sm transition-colors mt-2"
                                >
                                    <Trash2 size={16} /> Delete User
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                <div className="text-2xl font-bold text-white">{user.role === 'Candidate' ? user.jobApplied : user.jobsPosted}</div>
                                <div className="text-xs text-gray-500">{user.role === 'Candidate' ? 'Applications' : 'Jobs Posted'}</div>
                            </div>
                            {user.role === 'Employer' ? (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                    <div className="text-2xl font-bold text-yellow-400">{user.walletBalance}</div>
                                    <div className="text-xs text-gray-500">Wallet Credits</div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                    <div className="text-2xl font-bold text-white">85%</div>
                                    <div className="text-xs text-gray-500">Profile Completion</div>
                                </div>
                            )}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                <div className="text-2xl font-bold text-white">{user.role === 'Employer' ? user.plan : '4.8'}</div>
                                <div className="text-xs text-gray-500">{user.role === 'Employer' ? 'Current Plan' : 'Avg Rating'}</div>
                            </div>
                        </div>

                        {/* Editable Profile Details */}
                        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <FileText size={18} className="text-neon-cyan" />
                                    Profile Details
                                </h3>
                                <button className="text-xs text-neon-cyan hover:underline flex items-center gap-1">
                                    <Edit size={12} /> Edit
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="text-gray-500 block mb-1">Full Name</label>
                                    <input type="text" value={user.name} readOnly className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-gray-300" />
                                </div>
                                <div>
                                    <label className="text-gray-500 block mb-1">Email Address</label>
                                    <input type="text" value={user.email} readOnly className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-gray-300" />
                                </div>
                                <div>
                                    <label className="text-gray-500 block mb-1">Phone Number</label>
                                    <input type="text" value={user.phone} readOnly className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-gray-300" />
                                </div>
                                <div>
                                    <label className="text-gray-500 block mb-1">Location</label>
                                    <input type="text" value={user.location} readOnly className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-gray-300" />
                                </div>
                            </div>
                        </div>

                        {/* Transaction History (For Employers) */}
                        {user.role === 'Employer' && (
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-4">
                                    <History size={18} className="text-yellow-400" />
                                    Recent Transactions
                                </h3>
                                <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex justify-between items-center p-3 rounded bg-black/20">
                                            <div>
                                                <p className="text-sm text-white font-medium">Purchased 500 Credits</p>
                                                <p className="text-xs text-gray-500">Nov 24, 2025</p>
                                            </div>
                                            <span className="text-green-400 font-bold text-sm">+500</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center p-3 rounded bg-black/20">
                                        <div>
                                            <p className="text-sm text-white font-medium">Job Post: Senior Dev</p>
                                            <p className="text-xs text-gray-500">Nov 23, 2025</p>
                                        </div>
                                        <span className="text-red-400 font-bold text-sm">-25</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Activity Log Preview (For Candidates) */}
                        {user.role === 'Candidate' && (
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-4">
                                    <Activity size={18} className="text-neon-purple" />
                                    Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-3 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-gray-300">Updated profile information</p>
                                                <p className="text-xs text-gray-500">Today, 10:30 AM</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="text-gray-400">Control, monitor, and manage all candidate and employer accounts.</p>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('candidates')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'candidates' ? 'text-neon-cyan' : 'text-gray-400 hover:text-white'}`}
                >
                    <User size={16} className="inline-block mr-2 mb-0.5" />
                    Candidates
                    {activeTab === 'candidates' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" />}
                </button>
                <button
                    onClick={() => setActiveTab('employers')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'employers' ? 'text-neon-purple' : 'text-gray-400 hover:text-white'}`}
                >
                    <Briefcase size={16} className="inline-block mr-2 mb-0.5" />
                    Employers
                    {activeTab === 'employers' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple" />}
                </button>
                <button
                    onClick={() => setActiveTab('support')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'support' ? 'text-neon-pink' : 'text-gray-400 hover:text-white'}`}
                >
                    <MessageSquare size={16} className="inline-block mr-2 mb-0.5" />
                    Support & Tickets
                    {activeTab === 'support' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-pink" />}
                </button>
            </div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
            >
                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-white/20 transition-colors"
                />
            </motion.div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'candidates' && (
                    <motion.div
                        key="candidates"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <UserTable data={candidates} type="Candidate" />
                    </motion.div>
                )}

                {activeTab === 'employers' && (
                    <motion.div
                        key="employers"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <UserTable data={employers} type="Employer" />
                    </motion.div>
                )}

                {activeTab === 'support' && (
                    <motion.div
                        key="support"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center py-20 text-gray-500"
                    >
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">Support Center</h3>
                        <p>No active support tickets found.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detailed View Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
