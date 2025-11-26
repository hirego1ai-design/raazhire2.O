import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Key, RefreshCw, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface AIProvider {
    id: string;
    name: string;
    apiKey: string;
    status: 'connected' | 'disconnected' | 'error';
    latency: string;
}

const APIConfig: React.FC = () => {
    const [providers, setProviders] = useState<AIProvider[]>([
        { id: 'gemini', name: 'Google Gemini Pro', apiKey: '**********************', status: 'connected', latency: '120ms' },
        { id: 'gpt4', name: 'OpenAI GPT-4', apiKey: '**********************', status: 'connected', latency: '250ms' },
        { id: 'claude', name: 'Anthropic Claude 3', apiKey: '', status: 'disconnected', latency: '-' },
        { id: 'deepseek', name: 'DeepSeek R1', apiKey: '**********************', status: 'connected', latency: '180ms' },
        { id: 'kimi', name: 'Kimi AI', apiKey: '', status: 'disconnected', latency: '-' },
    ]);

    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

    const toggleKeyVisibility = (id: string) => {
        setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleApiKeyChange = (id: string, value: string) => {
        setProviders(providers.map(p =>
            p.id === id ? { ...p, apiKey: value } : p
        ));
    };

    const handleSave = () => {
        alert('API Credentials saved successfully!');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                        API Configuration
                    </h1>
                    <p className="text-gray-400">Manage API keys and connection status for AI providers.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="btn-3d btn-primary px-6 py-2 flex items-center gap-2"
                >
                    <Save size={18} />
                    Save Credentials
                </button>
            </motion.div>

            {/* API Keys List */}
            <div className="space-y-4">
                {providers.map((provider, index) => (
                    <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 rounded-xl glass border border-white/10 hover:border-neon-cyan/30 transition-all"
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Provider Info */}
                            <div className="min-w-[200px]">
                                <h3 className="font-bold text-lg">{provider.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${provider.status === 'connected' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' :
                                        provider.status === 'error' ? 'bg-red-400' : 'bg-gray-500'
                                        }`} />
                                    <span className={`text-xs capitalize ${provider.status === 'connected' ? 'text-green-400' :
                                        provider.status === 'error' ? 'text-red-400' : 'text-gray-500'
                                        }`}>
                                        {provider.status}
                                    </span>
                                </div>
                            </div>

                            {/* API Key Input */}
                            <div className="flex-1 w-full relative">
                                <div className="absolute left-3 top-3 text-gray-500">
                                    <Key size={18} />
                                </div>
                                <input
                                    type={showKeys[provider.id] ? "text" : "password"}
                                    value={provider.apiKey}
                                    onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                                    placeholder={`Enter ${provider.name} API Key`}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 focus:outline-none focus:border-neon-cyan transition-colors font-mono text-sm"
                                />
                                <button
                                    onClick={() => toggleKeyVisibility(provider.id)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showKeys[provider.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right hidden md:block min-w-[80px]">
                                    <div className="text-xs text-gray-500">Latency</div>
                                    <div className="font-mono text-neon-cyan">{provider.latency}</div>
                                </div>
                                <button
                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-neon-cyan transition-colors"
                                    title="Test Connection"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Security Note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3"
            >
                <AlertTriangle className="text-yellow-400 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-yellow-400 mb-1">Security Note</h4>
                    <p className="text-sm text-yellow-200/80">
                        API keys are encrypted at rest. To change which model is used for specific tasks (like Transcription or Job Writing), please visit the <a href="/admin/ai-control" className="underline hover:text-white">AI System Control</a> page.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default APIConfig;
