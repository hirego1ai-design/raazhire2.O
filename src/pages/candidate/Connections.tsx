import React from 'react';
import { UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react';

const Connections: React.FC = () => {
    const connections = [
        { id: 1, name: "Sarah Chen", title: "AI Researcher at DeepMind", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1" },
        { id: 2, name: "Marcus Miller", title: "Engineering Manager @ TechCorp", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1" },
        { id: 3, name: "Lisa Wong", title: "Senior Recruiter @ Google", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Connections</h1>
                <button className="btn-saas-primary text-sm flex items-center gap-2">
                    <UserPlus size={16} /> Find New
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map(conn => (
                    <div key={conn.id} className="saas-card p-6 flex items-center gap-4">
                        <img src={conn.avatar} alt={conn.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold truncate">{conn.name}</h3>
                            <p className="text-xs text-[var(--text-muted)] truncate">{conn.title}</p>
                            <div className="flex gap-2 mt-3">
                                <button className="p-2 bg-[var(--bg-page)] rounded-lg text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors">
                                    <MessageCircle size={16} />
                                </button>
                                <button className="p-2 bg-[var(--bg-page)] rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-subtle)] transition-colors">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Connections;
