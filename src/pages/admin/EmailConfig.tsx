import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Save, Mail, ToggleLeft, ToggleRight,
    CheckCircle, AlertCircle, RefreshCw, Send,
    Server, Shield, Activity, Settings, AlertTriangle, Loader
} from 'lucide-react';
import AdminButton3D from '../../components/AdminButton3D';

// Types
type EmailProvider = 'sendgrid' | 'mailgun' | 'ses';

interface EmailLog {
    id: number;
    provider: EmailProvider;
    status: 'success' | 'failed';
    timestamp: string;
    details: string;
}

const EmailConfig: React.FC = () => {
    // State
    const [activeProvider, setActiveProvider] = useState<EmailProvider>('sendgrid');
    const [autoSwitch, setAutoSwitch] = useState(true);

    // Provider Settings
    const [sendgridConfig, setSendgridConfig] = useState({
        apiKey: '**********************',
        senderEmail: 'noreply@hirego.ai',
        verified: true
    });

    const [mailgunConfig, setMailgunConfig] = useState({
        apiKey: '**********************',
        domain: 'mg.hirego.ai',
        region: 'US',
        dkimSpf: true
    });

    const [sesConfig, setSesConfig] = useState({
        accessKeyId: '**********************',
        secretAccessKey: '**********************',
        region: 'us-east-1',
        verified: true
    });

    // Email Categories
    const [categories, setCategories] = useState({
        transactional: true,
        otp: true,
        employer: true,
        candidate: true,
        marketing: false
    });

    // Sender Identity
    const [identity, setIdentity] = useState({
        fromName: 'HireGo AI Team',
        senderEmail: 'noreply@hirego.ai',
        replyTo: 'support@hirego.ai'
    });

    // Test Email
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    // Logs
    const [logs] = useState<EmailLog[]>([
        { id: 1, provider: 'sendgrid', status: 'success', timestamp: '2025-11-25 10:30:00', details: 'Welcome email sent to candidate #123' },
        { id: 2, provider: 'sendgrid', status: 'success', timestamp: '2025-11-25 10:28:15', details: 'OTP verification sent' },
        { id: 3, provider: 'mailgun', status: 'failed', timestamp: '2025-11-25 09:15:00', details: 'Bounce: Invalid recipient' },
        { id: 4, provider: 'sendgrid', status: 'success', timestamp: '2025-11-25 09:10:00', details: 'Interview scheduled notification' },
        { id: 5, provider: 'ses', status: 'success', timestamp: '2025-11-24 23:45:00', details: 'Weekly digest' },
    ]);

    const handleProviderSwitch = (provider: EmailProvider) => {
        setActiveProvider(provider);
    };

    const handleSendTest = () => {
        if (!testEmail) return;
        setSendingTest(true);
        setTimeout(() => {
            setSendingTest(false);
            alert(`Test email sent to ${testEmail} via ${activeProvider.toUpperCase()}`);
        }, 1500);
    };

    const handleSave = () => {
        alert('Email Configuration Saved Successfully!');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                        Email API Configuration
                    </h1>
                    <p className="text-gray-400">Manage email delivery services, API keys, and sender identity.</p>
                </div>
                <AdminButton3D
                    onClick={handleSave}
                    variant="primary"
                    size="md"
                    icon={<Save size={18} />}
                >
                    Save Changes
                </AdminButton3D>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Provider Selection & Settings */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Provider Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Server className="text-neon-pink" size={24} />
                            Email Provider Selection
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'sendgrid', name: 'SendGrid', icon: Activity },
                                { id: 'mailgun', name: 'Mailgun', icon: Mail },
                                { id: 'ses', name: 'Amazon SES', icon: Shield }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProviderSwitch(p.id as EmailProvider)}
                                    className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 ${activeProvider === p.id
                                        ? 'bg-neon-pink/10 border-neon-pink shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <p.icon size={32} className={activeProvider === p.id ? 'text-neon-pink' : 'text-gray-400'} />
                                    <span className={`font-bold ${activeProvider === p.id ? 'text-white' : 'text-gray-400'}`}>
                                        {p.name}
                                    </span>
                                    {activeProvider === p.id && (
                                        <div className="absolute top-3 right-3 text-neon-pink">
                                            <CheckCircle size={18} />
                                        </div>
                                    )}
                                    <div className={`text-xs px-2 py-1 rounded-full ${activeProvider === p.id ? 'bg-neon-pink/20 text-neon-pink' : 'bg-white/5 text-gray-500'
                                        }`}>
                                        {activeProvider === p.id ? 'Active' : 'Inactive'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Active Provider Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Settings className="text-neon-purple" size={24} />
                            {activeProvider === 'sendgrid' ? 'SendGrid' : activeProvider === 'mailgun' ? 'Mailgun' : 'Amazon SES'} Settings
                        </h2>

                        <div className="space-y-4">
                            {activeProvider === 'sendgrid' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">API Key</label>
                                        <input
                                            type="password"
                                            value={sendgridConfig.apiKey}
                                            onChange={(e) => setSendgridConfig({ ...sendgridConfig, apiKey: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-pink focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                        <div>
                                            <div className="text-sm text-gray-400">Domain Verification</div>
                                            <div className="font-medium text-green-400 flex items-center gap-2">
                                                <CheckCircle size={14} /> Verified
                                            </div>
                                        </div>
                                        <button className="text-sm text-neon-pink hover:underline">Re-verify</button>
                                    </div>
                                </>
                            )}

                            {activeProvider === 'mailgun' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">API Key</label>
                                        <input
                                            type="password"
                                            value={mailgunConfig.apiKey}
                                            onChange={(e) => setMailgunConfig({ ...mailgunConfig, apiKey: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-pink focus:outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Domain Name</label>
                                            <input
                                                type="text"
                                                value={mailgunConfig.domain}
                                                onChange={(e) => setMailgunConfig({ ...mailgunConfig, domain: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-pink focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Region</label>
                                            <select
                                                value={mailgunConfig.region}
                                                onChange={(e) => setMailgunConfig({ ...mailgunConfig, region: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-pink focus:outline-none text-white"
                                            >
                                                <option value="US">US (United States)</option>
                                                <option value="EU">EU (Europe)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                        <div>
                                            <div className="text-sm text-gray-400">DKIM / SPF Status</div>
                                            <div className="font-medium text-green-400 flex items-center gap-2">
                                                <CheckCircle size={14} /> Active
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeProvider === 'ses' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Access Key ID</label>
                                            <input
                                                type="text"
                                                value={sesConfig.accessKeyId}
                                                onChange={(e) => setSesConfig({ ...sesConfig, accessKeyId: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-pink focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Secret Access Key</label>
                                            <input
                                                type="password"
                                                value={sesConfig.secretAccessKey}
                                                onChange={(e) => setSesConfig({ ...sesConfig, secretAccessKey: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-pink focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Region</label>
                                        <select
                                            value={sesConfig.region}
                                            onChange={(e) => setSesConfig({ ...sesConfig, region: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-pink focus:outline-none text-white"
                                        >
                                            <option value="us-east-1">US East (N. Virginia)</option>
                                            <option value="us-west-2">US West (Oregon)</option>
                                            <option value="eu-west-1">EU (Ireland)</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                        <div>
                                            <div className="text-sm text-gray-400">SES Verification</div>
                                            <div className="font-medium text-green-400 flex items-center gap-2">
                                                <CheckCircle size={14} /> Verified Identity
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Sender Identity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Shield className="text-neon-cyan" size={24} />
                            Sender Identity
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">From Name</label>
                                <input
                                    type="text"
                                    value={identity.fromName}
                                    onChange={(e) => setIdentity({ ...identity, fromName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-cyan focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Sender Email</label>
                                <input
                                    type="email"
                                    value={identity.senderEmail}
                                    onChange={(e) => setIdentity({ ...identity, senderEmail: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-cyan focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Reply-To Email</label>
                                <input
                                    type="email"
                                    value={identity.replyTo}
                                    onChange={(e) => setIdentity({ ...identity, replyTo: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-cyan focus:outline-none"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Categories, Test, Logs */}
                <div className="space-y-8">

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6">Email Categories</h2>
                        <div className="space-y-4">
                            {Object.entries(categories).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <span className="capitalize text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()} Emails</span>
                                    <button
                                        onClick={() => setCategories({ ...categories, [key]: !value })}
                                        className={`transition-colors ${value ? 'text-neon-green' : 'text-gray-600'}`}
                                    >
                                        {value ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Test Email */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Send className="text-neon-pink" size={20} />
                            Test Configuration
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Enter test email address"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-neon-pink focus:outline-none"
                            />
                            <AdminButton3D
                                onClick={handleSendTest}
                                disabled={sendingTest || !testEmail}
                                variant="info"
                                size="md"
                                icon={sendingTest ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                                className="w-full"
                            >
                                {sendingTest ? 'Sending...' : 'Send Test Email'}
                            </AdminButton3D>
                        </div>
                    </motion.div>

                    {/* Auto Switch */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                                <RefreshCw size={20} />
                                Auto-Switch Mode
                            </h2>
                            <button
                                onClick={() => setAutoSwitch(!autoSwitch)}
                                className={`transition-colors ${autoSwitch ? 'text-yellow-400' : 'text-gray-600'}`}
                            >
                                {autoSwitch ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            </button>
                        </div>
                        <p className="text-sm text-yellow-200/70 mb-4">
                            Automatically switch to fallback providers if the primary service fails.
                        </p>
                        <div className="text-xs font-mono bg-black/30 p-2 rounded text-yellow-500">
                            Priority: SendGrid → Mailgun → SES
                        </div>
                    </motion.div>

                    {/* Logs Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="text-sm border-b border-white/5 pb-2 last:border-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`uppercase text-xs font-bold ${log.provider === 'sendgrid' ? 'text-blue-400' :
                                            log.provider === 'mailgun' ? 'text-red-400' : 'text-orange-400'
                                            }`}>
                                            {log.provider}
                                        </span>
                                        <span className={`text-xs ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 truncate">{log.details}</div>
                                    <div className="text-xs text-gray-600 mt-1">{log.timestamp}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default EmailConfig;
