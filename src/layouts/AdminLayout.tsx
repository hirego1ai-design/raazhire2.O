import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    Users,
    Database,
    Shield,
    LogOut,
    Menu,
    Mail,
    Bot,
    Eye,
    CreditCard,
    Briefcase,
    Coins,
    Video,
    Youtube,
    BookOpen,
    GraduationCap
} from 'lucide-react';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const navigate = useNavigate();

    // Force dark background for admin pages
    React.useEffect(() => {
        document.body.style.background = '#0a0a0f';
        document.body.style.color = '#ffffff';

        return () => {
            // Reset to default when leaving admin
            document.body.style.background = '';
            document.body.style.color = '';
        };
    }, []);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        navigate('/');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: Bot, label: 'AI System Control', path: '/admin/ai-control' },
        { icon: Eye, label: 'Proctoring & Security', path: '/admin/proctoring' },
        { icon: Video, label: 'Interview Management', path: '/admin/interviews' },
        { icon: CreditCard, label: 'Payment Gateway', path: '/admin/payment-config' },
        { icon: Briefcase, label: 'Job & Pricing', path: '/admin/job-pricing' },
        { icon: Coins, label: 'Credit System', path: '/admin/credit-system' },
        { icon: BookOpen, label: 'Upskill Courses', path: '/admin/upskill-courses' },
        { icon: GraduationCap, label: 'Upskill Learners', path: '/admin/upskill-learners' },
        { icon: Settings, label: 'API Configuration', path: '/admin/api-config' },
        { icon: Mail, label: 'Email Configuration', path: '/admin/email-config' },
        { icon: Youtube, label: 'Video Storage', path: '/admin/video-storage' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: Database, label: 'System Logs', path: '/admin/logs' },
    ];

    return (
        <div className="min-h-screen bg-space-dark flex text-white font-outfit">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-space-blue border-r border-white/10 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center justify-center border-b border-white/10">
                        <span className={`text-xl font-bold text-gradient ${!isSidebarOpen && 'lg:hidden'}`}>
                            Super Admin
                        </span>
                        {!isSidebarOpen && <Shield className="text-neon-pink" size={24} />}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 text-neon-pink border border-neon-pink/30'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon size={24} />
                                <span className={`${!isSidebarOpen && 'lg:hidden'}`}>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-3 text-gray-400 hover:text-neon-pink transition-colors"
                        >
                            <LogOut size={24} />
                            <span className={`${!isSidebarOpen && 'lg:hidden'}`}>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-30">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-300 lg:hidden"
                    >
                        <Menu size={24} />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:block p-2 rounded-lg hover:bg-white/10 text-gray-300"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center font-bold">
                            SA
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
