import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    Calendar,
    Settings as SettingsIcon,
    LogOut,
    Menu,
    Briefcase,
    TrendingUp,
    Bell,
    Search as SearchIcon,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Building2
} from 'lucide-react';
import '../styles/saas-theme.css';

const EmployerLayout: React.FC = () => {
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
        { icon: LayoutDashboard, label: 'Dashboard', path: '/employer/dashboard' },
        { icon: Briefcase, label: 'My Jobs', path: '/employer/jobs' },
        { icon: PlusCircle, label: 'Post a Job', path: '/employer/post-job' },
        { icon: Users, label: 'Candidates', path: '/employer/candidates' },
        { icon: Calendar, label: 'Interviews', path: '/employer/interviews' },
        { icon: MessageSquare, label: 'Social Feed', path: '/employer/overview' },
        { icon: Users, label: 'Referrals', path: '/employer/referrals' },
        { icon: SettingsIcon, label: 'Settings', path: '/employer/settings' },
    ];

    return (
        <div className={`min-h-screen saas-layout ${isDarkMode ? 'dark' : ''}`}>
            {/* Top Navigation */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] z-50 flex items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="p-2 hover:bg-[var(--primary-light)] rounded-lg transition-colors lg:hidden">
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/employer/dashboard')}>
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                            <Building2 size={18} />
                        </div>
                        <span className="text-xl font-bold tracking-tight hidden sm:block">HireGo <span className="text-indigo-600">Pro</span></span>
                    </div>
                </div>

                {/* Global Search */}
                <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Find talent, filter applications..."
                            className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-indigo-600 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    <button className="p-2 text-[var(--text-muted)] hover:text-indigo-600 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-surface)]"></span>
                    </button>
                    <button onClick={() => navigate('/employer/messages')} className="p-2 text-[var(--text-muted)] hover:text-indigo-600 transition-colors">
                        <MessageSquare size={20} />
                    </button>
                    <div className="h-6 w-[1px] bg-[var(--border-subtle)] mx-1"></div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-[var(--text-muted)] hover:text-indigo-600 transition-colors"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div
                        className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-[var(--bg-page)] cursor-pointer transition-all border border-transparent hover:border-[var(--border-subtle)]"
                        onClick={() => navigate('/employer/settings')}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black uppercase text-[var(--text-main)] leading-none mb-1">Stripe Inc.</p>
                            <p className="text-[10px] font-bold text-indigo-600 leading-none">Enterprise</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                            S
                        </div>
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
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-indigo-600'}`
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
                                className="flex items-center gap-3 w-full px-3 py-3 text-[var(--text-muted)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                            >
                                <LogOut size={20} />
                                <span className={`font-medium text-sm ${!isSidebarOpen && 'lg:hidden'}`}>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Toggle Button (Desktop) */}
                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-8 w-6 h-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full hidden lg:flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-600 shadow-sm"
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

export default EmployerLayout;
