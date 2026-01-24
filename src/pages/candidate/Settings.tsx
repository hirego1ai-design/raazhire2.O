import React from 'react';
import { Bell, Shield, User, Globe, CreditCard } from 'lucide-react';

const Settings: React.FC = () => {
    const sections = [
        { icon: User, label: "Account Settings", desc: "Manage your personal information and login credentials." },
        { icon: Bell, label: "Notifications", desc: "Choose what alerts you want to receive." },
        { icon: Shield, label: "Privacy & Security", desc: "Control who sees your profile and how your data is used." },
        { icon: Globe, label: "Preferences", desc: "Change language, timezone, and appearance settings." },
        { icon: CreditCard, label: "Billing", desc: "Manage your premium membership and payment methods." },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <div className="space-y-4">
                {sections.map((section, idx) => (
                    <div key={idx} className="saas-card p-6 flex items-center gap-6 cursor-pointer hover:border-[var(--primary)] transition-all">
                        <div className="w-12 h-12 bg-[var(--primary-light)] text-[var(--primary)] rounded-xl flex items-center justify-center">
                            <section.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">{section.label}</h3>
                            <p className="text-sm text-[var(--text-muted)]">{section.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Settings;
