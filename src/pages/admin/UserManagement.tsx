import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Trash2, Ban, CheckCircle,
    User as UserIcon, Briefcase, MessageSquare, FileText, Activity, Edit,
    Lock, Eye, AlertTriangle, Mail, Phone, MapPin,
    Calendar, Download, ExternalLink, X, Wallet, CreditCard, History, Plus, RefreshCw,
    Grid, List, UserCheck, UserX, ShieldAlert, Award
} from 'lucide-react';
import AdminButton3D from '../../components/AdminButton3D';
import { supabase } from '../../lib/supabase';

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

const UserManagement: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'activity' | 'ledger' | 'security'>('overview');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            if (!supabase) return;

            // Fetch all users
            const { data: usersData, error } = await supabase
                .from('users')
                .select('*');

            if (error) throw error;

            if (usersData) {
                const enrichedUsers: User[] = await Promise.all(usersData.map(async (u: any) => {
                    let extraData = {};

                    if (supabase) {
                        if (u.role === 'candidate') {
                            const { count } = await supabase
                                .from('job_applications')
                                .select('*', { count: 'exact', head: true })
                                .eq('candidate_id', u.id);
                            extraData = { jobApplied: count || 0 };
                        } else if (u.role === 'employer') {
                            const { count } = await supabase
                                .from('employer_job_posts')
                                .select('*', { count: 'exact', head: true })
                                .eq('employer_id', u.id);
                            extraData = { 
                                jobsPosted: count || 0, 
                                companyName: u.company_name, 
                                walletBalance: u.wallet_balance || 0, 
                                plan: u.plan || 'Basic' 
                            };
                        }
                    }

                    return {
                        id: u.id,
                        name: u.name || 'Unknown User',
                        email: u.email,
                        role: u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) as UserRole : 'Candidate',
                        status: u.status || 'Active',
                        joinDate: new Date(u.created_at || Date.now()).toLocaleDateString(),
                        location: u.location || 'Not Specified',
                        phone: u.phone || 'No Phone Registered',
                        ...extraData
                    };
                }));
                setUsers(enrichedUsers);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    // --- Actions ---
    const handleStatusChange = async (id: string, newStatus: UserStatus) => {
        try {
            if (supabase) {
                const { error } = await supabase
                    .from('users')
                    .update({ status: newStatus })
                    .eq('id', id);
                if (error) throw error;
            }
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
            if (selectedUser?.id === id) {
                setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
            try {
                if (supabase) {
                    const { error } = await supabase
                        .from('users')
                        .delete()
                        .eq('id', id);
                    if (error) throw error;
                }
                setUsers(prev => prev.filter(u => u.id !== id));
                if (selectedUser?.id === id) setSelectedUser(null);
            } catch (err) {
                console.error('Error deleting user:', err);
            }
        }
    };

    // --- Derived Stats for Metrics Cards ---
    const totalUsersCount = users.length;
    const activeCandidatesCount = users.filter(u => u.role === 'Candidate' && u.status === 'Active').length;
    const activeEmployersCount = users.filter(u => u.role === 'Employer' && u.status === 'Active').length;
    const blockedCount = users.filter(u => u.status === 'Blocked').length;
    const pendingCount = users.filter(u => u.status === 'Pending').length;

    // --- Filtering Logic ---
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Custom tag styling based on user status
    const getStatusStyle = (status: UserStatus) => {
        switch (status) {
            case 'Active':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
            case 'Pending':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
            case 'Blocked':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-8 pb-20 font-outfit text-white min-h-screen">
            {/* Header section with gradient title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent tracking-tight">
                        User Operations Center
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Monitor, authorize, manage credits, and audit all platform accounts.
                    </p>
                </div>
                <div className="flex gap-3">
                    <AdminButton3D
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        icon={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />}
                    >
                        Refresh Data
                    </AdminButton3D>
                </div>
            </motion.div>

            {/* Metrics Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                        title: 'Total Registry', 
                        value: totalUsersCount, 
                        desc: 'Registered accounts', 
                        icon: <UserIcon className="text-neon-purple" size={24} />,
                        colorClass: 'from-neon-purple/20 to-transparent border-neon-purple/30',
                        glow: 'rgba(168,85,247,0.15)'
                    },
                    { 
                        title: 'Active Candidates', 
                        value: activeCandidatesCount, 
                        desc: 'Ready for hiring', 
                        icon: <UserCheck className="text-neon-cyan" size={24} />,
                        colorClass: 'from-neon-cyan/20 to-transparent border-neon-cyan/30',
                        glow: 'rgba(0,243,255,0.15)'
                    },
                    { 
                        title: 'Active Employers', 
                        value: activeEmployersCount, 
                        desc: 'Active job posters', 
                        icon: <Briefcase className="text-emerald-400" size={24} />,
                        colorClass: 'from-emerald-500/20 to-transparent border-emerald-500/30',
                        glow: 'rgba(16,185,129,0.15)'
                    },
                    { 
                        title: 'Risk & Reviews', 
                        value: `${blockedCount} Blocked / ${pendingCount} Pending`, 
                        desc: 'Require attention', 
                        icon: <ShieldAlert className="text-rose-400" size={24} />,
                        colorClass: 'from-rose-500/20 to-transparent border-rose-500/30',
                        glow: 'rgba(239,68,68,0.15)'
                    }
                ].map((card, idx) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className={`p-6 rounded-2xl bg-gradient-to-br ${card.colorClass} border backdrop-blur-md transition-all duration-300 relative overflow-hidden group`}
                        style={{ boxShadow: `0 10px 30px -10px ${card.glow}` }}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            {card.icon}
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                {card.icon}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{card.title}</span>
                        </div>
                        <div className="text-2xl font-black text-white mb-1">{card.value}</div>
                        <p className="text-xs text-gray-500">{card.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filter controls and layout toggle */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, ID, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 text-sm transition-all"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Role Filter dropdown */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                        <Filter size={14} className="text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="bg-transparent focus:outline-none text-white cursor-pointer"
                        >
                            <option value="All" className="bg-[#0f111a] text-white">All Roles</option>
                            <option value="Candidate" className="bg-[#0f111a] text-white">Candidates</option>
                            <option value="Employer" className="bg-[#0f111a] text-white">Employers</option>
                            <option value="Admin" className="bg-[#0f111a] text-white">Admins</option>
                        </select>
                    </div>

                    {/* Status Filter dropdown */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
                        <UserCheck size={14} className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-transparent focus:outline-none text-white cursor-pointer"
                        >
                            <option value="All" className="bg-[#0f111a] text-white">All Statuses</option>
                            <option value="Active" className="bg-[#0f111a] text-white">Active</option>
                            <option value="Pending" className="bg-[#0f111a] text-white">Pending</option>
                            <option value="Blocked" className="bg-[#0f111a] text-white">Blocked</option>
                        </select>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

                    {/* Grid/List View Toggles */}
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-gray-400 hover:text-white'}`}
                            title="List View"
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-gray-400 hover:text-white'}`}
                            title="Grid View"
                        >
                            <Grid size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="py-24 text-center">
                    <div className="w-12 h-12 border-2 border-white/20 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Loading accounts...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="py-20 text-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <UserX size={48} className="mx-auto mb-4 opacity-40 text-gray-500 animate-pulse" />
                    <h3 className="text-lg font-bold text-white mb-1">No Accounts Found</h3>
                    <p className="text-gray-500 text-xs">Try adjusting your filters or search terms.</p>
                </div>
            ) : viewMode === 'list' ? (
                /* --- Table List Layout --- */
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-xl"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                                    <th className="p-5 font-semibold">User Details</th>
                                    <th className="p-5 font-semibold">Contact / Location</th>
                                    <th className="p-5 font-semibold">Role</th>
                                    <th className="p-5 font-semibold">Status</th>
                                    <th className="p-5 font-semibold">Metrics</th>
                                    <th className="p-5 font-semibold text-right">Audit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center font-bold text-white shadow-md relative shrink-0">
                                                    {user.name.charAt(0).toUpperCase()}
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0f111a] bg-emerald-500" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white group-hover:text-neon-cyan transition-colors">{user.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-gray-300 font-medium">{user.email}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} /> {user.location}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${
                                                user.role === 'Admin' ? 'border-neon-pink/30 text-neon-pink bg-neon-pink/5' :
                                                user.role === 'Employer' ? 'border-neon-purple/30 text-neon-purple bg-neon-purple/5' :
                                                'border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex w-fit items-center gap-1.5 ${getStatusStyle(user.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    user.status === 'Active' ? 'bg-emerald-400 animate-pulse' :
                                                    user.status === 'Blocked' ? 'bg-rose-400' : 'bg-amber-400'
                                                }`} />
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            {user.role === 'Employer' ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                                                        <Wallet size={12} /> {user.walletBalance} cr
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">Posted: {user.jobsPosted}</span>
                                                </div>
                                            ) : user.role === 'Candidate' ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs text-gray-300 font-medium">{user.jobApplied} Applications</span>
                                                    <span className="text-[10px] text-gray-500">Member since {user.joinDate}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">—</span>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <AdminButton3D
                                                onClick={() => {
                                                    setActiveDetailTab('overview');
                                                    setSelectedUser(user);
                                                }}
                                                variant="info"
                                                size="sm"
                                                icon={<Eye size={12} />}
                                            >
                                                Manage
                                            </AdminButton3D>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            ) : (
                /* --- Grid Cards Layout --- */
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredUsers.map((user) => (
                        <motion.div
                            layout
                            key={user.id}
                            whileHover={{ y: -4 }}
                            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-lg relative overflow-hidden"
                        >
                            {/* Card Background Gradient decoration */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-neon-cyan/5 rounded-full blur-xl pointer-events-none" />

                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center font-bold text-white shadow">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white hover:text-neon-cyan transition-colors line-clamp-1">{user.name}</h3>
                                            <span className="text-[10px] text-gray-500 block">ID: {user.id.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                        user.role === 'Admin' ? 'border-neon-pink/30 text-neon-pink bg-neon-pink/5' :
                                        user.role === 'Employer' ? 'border-neon-purple/30 text-neon-purple bg-neon-purple/5' :
                                        'border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-gray-400 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Mail size={12} className="text-gray-500 shrink-0" />
                                        <span className="line-clamp-1">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={12} className="text-gray-500 shrink-0" />
                                        <span>{user.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-gray-500 shrink-0" />
                                        <span>Registered: {user.joinDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getStatusStyle(user.status)}`}>
                                    <span className={`w-1 h-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : user.status === 'Blocked' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                                    {user.status}
                                </span>
                                
                                <button
                                    onClick={() => {
                                        setActiveDetailTab('overview');
                                        setSelectedUser(user);
                                    }}
                                    className="flex items-center gap-1.5 text-xs text-neon-cyan hover:text-white font-bold transition-colors"
                                >
                                    <Eye size={12} /> Manage User
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* --- Premium Right Side Detail Drawer --- */}
            <AnimatePresence>
                {selectedUser && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                            onClick={() => setSelectedUser(null)}
                        />

                        {/* Drawer body */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 h-full w-full max-w-[500px] z-50 bg-[#0c0d14]/95 border-l border-white/10 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-lg font-black text-white shadow-lg">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            {selectedUser.name}
                                        </h2>
                                        <span className="text-xs text-neon-cyan font-bold uppercase tracking-wider">{selectedUser.role} Profile</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Internal Navigation Tabs inside drawer */}
                            <div className="px-6 border-b border-white/5 flex gap-4 text-xs font-semibold bg-white/5 py-1">
                                {[
                                    { id: 'overview', label: 'Info', icon: FileText },
                                    { id: 'activity', label: 'Activity', icon: Activity },
                                    ...(selectedUser.role === 'Employer' ? [{ id: 'ledger', label: 'Ledger', icon: Wallet }] : []),
                                    { id: 'security', label: 'Actions', icon: Lock }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveDetailTab(tab.id as any)}
                                        className={`py-3 flex items-center gap-1.5 border-b-2 relative transition-colors ${
                                            activeDetailTab === tab.id ? 'border-neon-cyan text-neon-cyan' : 'border-transparent text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <tab.icon size={12} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Drawer Body - Scrollable content */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar text-sm">
                                {activeDetailTab === 'overview' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Status banner */}
                                        <div className={`p-4 rounded-xl border flex items-center justify-between ${getStatusStyle(selectedUser.status)}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs tracking-wider uppercase">Account Status</span>
                                            </div>
                                            <span className="font-bold text-xs uppercase">{selectedUser.status}</span>
                                        </div>

                                        {/* Profile fields */}
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Account Data</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase block mb-1">User Identifier</span>
                                                    <span className="font-mono text-gray-300 break-all select-all text-xs">{selectedUser.id}</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase block mb-1">Email Registered</span>
                                                    <span className="text-gray-300 font-medium">{selectedUser.email}</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase block mb-1">Phone Number</span>
                                                    <span className="text-gray-300 font-medium">{selectedUser.phone}</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase block mb-1">Location Details</span>
                                                    <span className="text-gray-300 font-medium flex items-center gap-1"><MapPin size={12} className="text-gray-500" /> {selectedUser.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Metrics Summary */}
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">Activity Summary</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedUser.role === 'Candidate' ? (
                                                    <>
                                                        <div className="bg-black/20 p-3 rounded-lg text-center">
                                                            <div className="text-xl font-black text-white">{selectedUser.jobApplied}</div>
                                                            <div className="text-[10px] text-gray-500">Jobs Applied</div>
                                                        </div>
                                                        <div className="bg-black/20 p-3 rounded-lg text-center">
                                                            <div className="text-xl font-black text-neon-cyan">85%</div>
                                                            <div className="text-[10px] text-gray-500">Profile Match</div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="bg-black/20 p-3 rounded-lg text-center">
                                                            <div className="text-xl font-black text-white">{selectedUser.jobsPosted}</div>
                                                            <div className="text-[10px] text-gray-500">Jobs Posted</div>
                                                        </div>
                                                        <div className="bg-black/20 p-3 rounded-lg text-center">
                                                            <div className="text-xl font-black text-amber-400">{selectedUser.walletBalance}</div>
                                                            <div className="text-[10px] text-gray-500">Wallet Credits</div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeDetailTab === 'activity' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Activity Timeline</h3>
                                        <div className="relative border-l border-white/10 ml-2.5 pl-5 space-y-6 text-xs">
                                            <div className="relative">
                                                <span className="absolute -left-[26px] top-0.5 w-3 h-3 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f3ff]" />
                                                <p className="font-bold text-white">Created Account Profile</p>
                                                <p className="text-gray-500 mt-0.5">Verified via Supabase Auth</p>
                                                <span className="text-[10px] text-gray-500 block mt-1">{selectedUser.joinDate}</span>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute -left-[26px] top-0.5 w-3 h-3 rounded-full bg-neon-purple shadow-[0_0_8px_#a855f7]" />
                                                <p className="font-bold text-white">Modified Personal Details</p>
                                                <p className="text-gray-500 mt-0.5">Updated contact numbers and address location</p>
                                                <span className="text-[10px] text-gray-500 block mt-1">Recent Activity</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeDetailTab === 'ledger' && selectedUser.role === 'Employer' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Recent Transactions</h3>
                                        <div className="space-y-3">
                                            {[
                                                { desc: 'Purchased Enterprise Credit Package', val: '+1000 cr', time: 'Nov 24, 2025', isAdd: true },
                                                { desc: 'Promoted Feature Job Listing (Senior Staff)', val: '-50 cr', time: 'Nov 22, 2025', isAdd: false },
                                                { desc: 'AI Match screening evaluation', val: '-10 cr', time: 'Nov 20, 2025', isAdd: false }
                                            ].map((ledger, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                                                    <div>
                                                        <p className="font-bold text-white">{ledger.desc}</p>
                                                        <span className="text-[10px] text-gray-500">{ledger.time}</span>
                                                    </div>
                                                    <span className={`font-black ${ledger.isAdd ? 'text-emerald-400' : 'text-rose-400'}`}>{ledger.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeDetailTab === 'security' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Status Operations */}
                                        <div className="space-y-3">
                                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Account State Actions</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(selectedUser.id, 'Active')}
                                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                                        selectedUser.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                                    }`}
                                                >
                                                    Active
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(selectedUser.id, 'Pending')}
                                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                                        selectedUser.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                                    }`}
                                                >
                                                    Pending
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(selectedUser.id, 'Blocked')}
                                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                                        selectedUser.status === 'Blocked' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                                    }`}
                                                >
                                                    Block
                                                </button>
                                            </div>
                                        </div>

                                        {/* Account Administration */}
                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Auditing Utilities</h4>
                                            <div className="space-y-2">
                                                <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all">
                                                    <span className="flex items-center gap-2"><Lock size={14} /> Send Password Reset Link</span>
                                                    <ExternalLink size={12} className="opacity-50" />
                                                </button>
                                                <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all">
                                                    <span className="flex items-center gap-2"><Mail size={14} /> Send Email Verification</span>
                                                    <ExternalLink size={12} className="opacity-50" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Dangerous operations */}
                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <h4 className="font-bold text-xs text-rose-500/80 uppercase tracking-wider">Danger Zone</h4>
                                            <button
                                                onClick={() => handleDelete(selectedUser.id)}
                                                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                                            >
                                                <Trash2 size={14} /> Delete User Permanent Record
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
