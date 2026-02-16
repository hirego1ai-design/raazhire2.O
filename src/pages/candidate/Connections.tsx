import React from 'react';
import { UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react';

import { endpoints, getAuthHeaders } from '../../lib/api';

interface Connection {
    id: string;
    name: string;
    title: string;
    avatar_url: string;
    role: string;
}

const Connections: React.FC = () => {
    const [connections, setConnections] = React.useState<Connection[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchConnections = async () => {
            try {
                const response = await fetch(endpoints.connections, {
                    headers: getAuthHeaders()
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.connections)) {
                        setConnections(data.connections);
                    }
                }
            } catch (error) {
                console.error('Error fetching connections:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Connections</h1>
                <button className="btn-saas-primary text-sm flex items-center gap-2">
                    <UserPlus size={16} /> Find New
                </button>
            </div>
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading connections...</div>
            ) : connections.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No connections found yet.</p>
                    <p className="text-sm mt-2">Apply to jobs or schedule interviews to build your network.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections.map(conn => (
                        <div key={conn.id} className="saas-card p-6 flex items-center gap-4">
                            <img
                                src={conn.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.name)}&background=random`}
                                alt={conn.name}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
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
            )}
        </div>
    );
};

export default Connections;
