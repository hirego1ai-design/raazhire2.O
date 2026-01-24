import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCircle,
    Briefcase,
    LogOut,
    Menu,
    Search,
    Bell,
    MessageSquare,
    Sun,
    Moon,
    Users,
    Settings as SettingsIcon,
    FileText,
    ChevronLeft,
    ChevronRight,
    Search as SearchIcon,
    Video,
    Brain,
    TrendingUp
} from 'lucide-react';
import '../styles/saas-theme.css';

const DashboardLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        localStorage.removeItem('sb-token');
        navigate('/signin');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/candidate/dashboard' },
        { icon: Briefcase, label: 'Jobs', path: '/candidate/jobs' },
        { icon: Video, label: 'Video Resume', path: '/candidate/video-resume' },
        { icon: Brain, label: 'Assessments', path: '/candidate/assessments' },
        { icon: TrendingUp, label: 'Growth', path: '/candidate/gamification' },
        { icon: FileText, label: 'Applications', path: '/candidate/applications' },
        { icon: MessageSquare, label: 'Messages', path: '/candidate/messages' },
        { icon: UserCircle, label: 'Profile', path: '/candidate/profile' },
        { icon: SettingsIcon, label: 'Settings', path: '/candidate/settings' },
    ];

    return (
        <div className={`min-h-screen saas-layout ${isDarkMode ? 'dark' : ''}`}>
            {/* Top Navigation */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] z-50 flex items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="p-2 hover:bg-[var(--primary-light)] rounded-lg transition-colors lg:hidden">
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/candidate/dashboard')}>
                        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold">H</div>
                        <span className="text-xl font-bold tracking-tight hidden sm:block">HireGo AI</span>
                    </div>
                </div>

                {/* Global Search */}
                <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search jobs, people, or companies..."
                            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[var(--primary)] transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    <button className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-surface)]"></span>
                    </button>
                    <button onClick={() => navigate('/candidate/messages')} className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                        <MessageSquare size={20} />
                    </button>
                    <div className="h-6 w-[1px] bg-[var(--border-subtle)] mx-1"></div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div
                        className="w-8 h-8 rounded-full bg-[var(--primary-light)] border border-[var(--primary)] flex items-center justify-center cursor-pointer overflow-hidden"
                        onClick={() => navigate('/candidate/profile')}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Left Sidebar */}
                <aside
                    className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-all duration-300 z-40
                    ${isSidebarOpen ? 'w-64' : 'w-20 -translate-x-full lg:translate-x-0'}`}
                >
                    <div className="flex flex-col h-full py-4">
                        <nav className="flex-1 px-3 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                                        ${isActive
                                            ? 'bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-main)]'}`
                                    }
                                >
                                    <item.icon size={20} className="shrink-0" />
                                    <span className={`font-medium text-sm transition-opacity duration-200 ${!isSidebarOpen && 'lg:opacity-0 pointer-events-none'}`}>
                                        {item.label}
                                    </span>
                                </NavLink>
                            ))}
                        </nav>

                        <div className="px-3 pt-4 border-t border-[var(--border-subtle)]">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-3 py-3 text-[var(--text-muted)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            >
                                <LogOut size={20} />
                                <span className={`font-medium text-sm ${!isSidebarOpen && 'lg:hidden'}`}>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Toggle Button (Desktop) */}
                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-8 w-6 h-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full hidden lg:flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] shadow-sm"
                    >
                        {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;

