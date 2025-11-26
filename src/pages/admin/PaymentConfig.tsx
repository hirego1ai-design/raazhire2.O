import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, DollarSign, Save, Shield, Activity,
    CheckCircle, AlertTriangle, RefreshCw, Globe, Lock
} from 'lucide-react';

type PaymentProvider = 'razorpay' | 'stripe';

interface GatewayConfig {
    id: PaymentProvider;
    name: string;
    enabled: boolean;
    mode: 'test' | 'live';
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
}

const PaymentConfig: React.FC = () => {
    const [activeGateway, setActiveGateway] = useState<PaymentProvider>('stripe');
    const [gateways, setGateways] = useState<Record<PaymentProvider, GatewayConfig>>({
        stripe: {
            id: 'stripe',
            name: 'Stripe',
            enabled: true,
            mode: 'test',
            publicKey: 'pk_test_...',
            secretKey: 'sk_test_...',
            webhookSecret: 'whsec_...'
        },
        razorpay: {
            id: 'razorpay',
            name: 'Razorpay',
            enabled: false,
            mode: 'test',
            publicKey: 'rzp_test_...',
            secretKey: '****************',
            webhookSecret: '****************'
        }
    });

    const handleGatewayUpdate = (provider: PaymentProvider, field: keyof GatewayConfig, value: any) => {
        setGateways(prev => ({
            ...prev,
            [provider]: { ...prev[provider], [field]: value }
        }));
    };

    const handleSave = () => {
        alert('Payment Gateway Configuration Saved!');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                        Payment Gateway Integration
                    </h1>
                    <p className="text-gray-400">Configure Stripe and Razorpay for processing payments.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="btn-3d btn-primary px-6 py-2 flex items-center gap-2"
                >
                    <Save size={18} />
                    Save Configuration
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gateway Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1 space-y-4"
                >
                    <div className="p-6 rounded-xl glass border border-white/10">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <CreditCard className="text-neon-cyan" size={24} />
                            Active Gateway
                        </h2>
                        <div className="space-y-3">
                            {Object.values(gateways).map((gateway) => (
                                <button
                                    key={gateway.id}
                                    onClick={() => setActiveGateway(gateway.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${activeGateway === gateway.id
                                            ? 'bg-neon-cyan/10 border-neon-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${activeGateway === gateway.id ? 'bg-neon-cyan text-black' : 'bg-white/10'}`}>
                                            {gateway.id === 'stripe' ? <DollarSign size={20} /> : <Globe size={20} />}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">{gateway.name}</div>
                                            <div className="text-xs opacity-70">{gateway.mode.toUpperCase()} Mode</div>
                                        </div>
                                    </div>
                                    {activeGateway === gateway.id && <CheckCircle size={20} className="text-neon-cyan" />}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-yellow-400 shrink-0" size={20} />
                                <p className="text-xs text-yellow-200/80">
                                    Only one gateway can be active at a time for processing primary transactions.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Configuration Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <div className="p-6 rounded-xl glass border border-white/10 h-full">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <SettingsIcon provider={activeGateway} />
                                {gateways[activeGateway].name} Settings
                            </h2>
                            <div className="flex items-center gap-3 bg-white/5 p-1 rounded-lg border border-white/10">
                                <button
                                    onClick={() => handleGatewayUpdate(activeGateway, 'mode', 'test')}
                                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${gateways[activeGateway].mode === 'test'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Test Mode
                                </button>
                                <button
                                    onClick={() => handleGatewayUpdate(activeGateway, 'mode', 'live')}
                                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${gateways[activeGateway].mode === 'live'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Live Mode
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* API Keys */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Public / Publishable Key</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={gateways[activeGateway].publicKey}
                                            onChange={(e) => handleGatewayUpdate(activeGateway, 'publicKey', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Secret Key</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="password"
                                            value={gateways[activeGateway].secretKey}
                                            onChange={(e) => handleGatewayUpdate(activeGateway, 'secretKey', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Webhook Secret</label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="password"
                                            value={gateways[activeGateway].webhookSecret}
                                            onChange={(e) => handleGatewayUpdate(activeGateway, 'webhookSecret', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-neon-cyan font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status & Connection Test */}
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <span className="text-sm text-green-400">System Connected</span>
                                </div>
                                <button className="flex items-center gap-2 text-sm text-neon-cyan hover:underline">
                                    <RefreshCw size={14} />
                                    Test Connection
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const SettingsIcon = ({ provider }: { provider: PaymentProvider }) => {
    if (provider === 'stripe') return <DollarSign className="text-neon-purple" size={24} />;
    return <Globe className="text-blue-400" size={24} />;
};

export default PaymentConfig;
