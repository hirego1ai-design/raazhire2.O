import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCircle,
    Video,
    FileText,
    Briefcase,
    LogOut,
    Menu,
    Trophy
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        // TODO: Implement actual logout logic
        navigate('/');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/candidate/dashboard' },
        { icon: UserCircle, label: 'My Profile', path: '/candidate/profile' },
        { icon: Video, label: 'Video Resume', path: '/candidate/video-resume' },
        { icon: FileText, label: 'Assessments', path: '/candidate/assessments' },
        { icon: Briefcase, label: 'Jobs', path: '/candidate/jobs' },
        { icon: Trophy, label: 'My Progress', path: '/candidate/gamification' },
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
                            JobPortal AI
                        </span>
                        {!isSidebarOpen && <span className="hidden lg:block text-2xl">🚀</span>}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan border border-neon-cyan/30'
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center font-bold">
                            JD
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

export default DashboardLayout;
