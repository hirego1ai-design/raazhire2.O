import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Radio,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search
} from 'lucide-react';

const EducatorLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/educator/dashboard' },
        { icon: BookOpen, label: 'Course Management', path: '/educator/courses' },
        { icon: Radio, label: 'Go Live', path: '/educator/live' },
        { icon: MessageSquare, label: 'Comment Replies', path: '/educator/comments' },
        { icon: Settings, label: 'Settings', path: '/educator/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('sb-token');
        navigate('/educator-login'); // Redirect to educator login
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-outfit">
            {/* Sidebar - Sticky */}
            <aside
                className={`sticky top-0 h-screen z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50 flex-shrink-0">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
                            <span className="font-bold text-lg text-slate-800">HireGo</span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group whitespace-nowrap ${location.pathname === item.path
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon size={20} className={`flex-shrink-0 ${location.pathname === item.path ? 'text-white' : 'group-hover:text-indigo-600'}`} />
                            {isSidebarOpen && <span className="font-semibold text-sm opacity-100 transition-opacity duration-200">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-50 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all whitespace-nowrap"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {isSidebarOpen && <span className="font-semibold text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 min-w-[300px] hidden md:flex">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search courses, students..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">Educator Portal</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Premium Educator</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
                                EP
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 flex-1 overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default EducatorLayout;
