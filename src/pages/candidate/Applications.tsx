import React from 'react';

const Applications: React.FC = () => {
    const apps = [
        { id: 1, job: "Senior Frontend Engineer", company: "Meta", status: "Reviewing", date: "Jan 15", isPPH: true },
        { id: 2, job: "Full Stack Developer", company: "Vercel", status: "Interview", date: "Jan 12", isPPH: false },
        { id: 3, job: "Product Designer", company: "Airbnb", status: "Applied", date: "Jan 10", isPPH: true },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Applications</h1>
            <div className="saas-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--bg-page)] border-b border-[var(--border-subtle)]">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Job / Company</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Model</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                        {apps.map(app => (
                            <tr key={app.id} className="hover:bg-[var(--bg-page)] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold">{app.job}</div>
                                    <div className="text-sm text-[var(--text-muted)]">{app.company}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'Interview' ? 'bg-green-100 text-green-700' :
                                            app.status === 'Reviewing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{app.date}</td>
                                <td className="px-6 py-4">
                                    {app.isPPH && (
                                        <span className="pph-badge" title="Employer pays per hire, free for candidates">PPH Role</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Applications;
