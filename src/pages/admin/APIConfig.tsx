import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Key, RefreshCw, AlertTriangle, Eye, EyeOff, CheckCircle, XCircle, Loader, Database } from 'lucide-react';
import { endpoints } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import AdminButton3D from '../../components/AdminButton3D';

interface AIProvider {
    id: string;
    name: string;
    apiKey: string;
    status: 'connected' | 'disconnected' | 'error' | 'testing';
    latency: string;
}

const APIConfig: React.FC = () => {
    const [providers, setProviders] = useState<AIProvider[]>([
        { id: 'gemini', name: 'Google Gemini Pro', apiKey: '', status: 'disconnected', latency: '-' },
        { id: 'gpt4', name: 'OpenAI GPT-4', apiKey: '', status: 'disconnected', latency: '-' },
        { id: 'claude', name: 'Anthropic Claude 3', apiKey: '', status: 'disconnected', latency: '-' },
        { id: 'deepseek', name: 'DeepSeek R1', apiKey: '', status: 'disconnected', latency: '-' },
    ]);

    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load from backend on mount
    useEffect(() => {
        loadAPIKeys();
    }, []);

    const getAuthHeaders = async (): Promise<Record<string, string>> => {
        if (!supabase) return {};
        const { data: { session } } = await supabase.auth.getSession();
        return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
    };

    const loadAPIKeys = async () => {
        setIsLoading(true);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(endpoints.admin.apiKeys, {
                headers: { ...headers }
            });
            if (response.ok) {
                const data = await response.json();
                setProviders(prev => prev.map(p => {
                    const savedKey = data.find((d: any) => d.provider === p.id);
                    return {
                        ...p,
                        apiKey: savedKey?.api_key || '',
                        status: savedKey?.api_key ? 'connected' : 'disconnected'
                    };
                }));
            } else {
                console.error('Failed to load API keys:', await response.text());
            }
        } catch (error) {
            console.error('Error loading API keys:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleKeyVisibility = (id: string) => {
        setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleApiKeyChange = (id: string, value: string) => {
        // Trim whitespace when pasting API keys
        const trimmedValue = value.trim();
        setProviders(providers.map(p =>
            p.id === id ? { ...p, apiKey: trimmedValue, status: 'disconnected' } : p
        ));
    };

    const testConnection = async (id: string) => {
        const provider = providers.find(p => p.id === id);
        if (!provider || !provider.apiKey) {
            alert('Please enter an API Key first.');
            return;
        }

        setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'testing' } : p));

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(endpoints.admin.testApiKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify({
                    provider: id,
                    api_key: provider.apiKey.trim()
                })
            });

            const result = await response.json();

            if (result.success) {
                setProviders(prev => prev.map(p =>
                    p.id === id ? { ...p, status: 'connected', latency: result.latency } : p
                ));
                alert(`✅ Connected successfully! Latency: ${result.latency}`);
            } else {
                setProviders(prev => prev.map(p =>
                    p.id === id ? { ...p, status: 'error', latency: '-' } : p
                ));
                alert(`❌ Connection failed: ${result.error}`);
            }
        } catch (error: any) {
            setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'error', latency: '-' } : p));
            console.error('Test connection error:', error);
            alert(`❌ Connection error: ${error.message || 'Network error'}`);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const headers = await getAuthHeaders();

            // Get providers with keys
            const providersWithKeys = providers.filter(p => p.apiKey);

            if (providersWithKeys.length === 0) {
                alert('Please enter at least one API key before saving.');
                setIsSaving(false);
                return;
            }

            // Save each provider's key to backend
            const savePromises = providersWithKeys.map(async p => {
                const response = await fetch(endpoints.admin.apiKeys, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    body: JSON.stringify({
                        provider: p.id,
                        api_key: p.apiKey.trim()
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`Failed to save ${p.name}: ${error.error || 'Unknown error'}`);
                }

                return response.json();
            });

            await Promise.all(savePromises);
            alert('✅ API Credentials saved successfully to secure backend storage!');
            // Reload to confirm
            await loadAPIKeys();
        } catch (error: any) {
            console.error('Error saving API keys:', error);
            alert(`❌ Failed to save API keys: ${error.message || 'Please try again'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 pb-20 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader className="animate-spin text-neon-cyan mx-auto mb-4" size={48} />
                    <p className="text-gray-400">Loading API configuration...</p>
                </div>
            </div>
        );
    }

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
                    <p className="text-gray-400 flex items-center gap-2">
                        <Database size={16} className="text-green-400" />
                        Manage API keys securely stored in encrypted database
                    </p>
                </div>
                <AdminButton3D
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="success"
                    size="md"
                    icon={isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                >
                    {isSaving ? 'Saving...' : 'Save Credentials'}
                </AdminButton3D>
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
                                    {provider.status === 'testing' ? (
                                        <Loader className="animate-spin text-yellow-400" size={14} />
                                    ) : provider.status === 'connected' ? (
                                        <CheckCircle className="text-green-400" size={14} />
                                    ) : provider.status === 'error' ? (
                                        <XCircle className="text-red-400" size={14} />
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full bg-gray-600" />
                                    )}

                                    <span className={`text-xs capitalize ${provider.status === 'connected' ? 'text-green-400' :
                                        provider.status === 'error' ? 'text-red-400' :
                                            provider.status === 'testing' ? 'text-yellow-400' : 'text-gray-500'
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
                                <AdminButton3D
                                    onClick={() => testConnection(provider.id)}
                                    disabled={provider.status === 'testing' || !provider.apiKey}
                                    variant="info"
                                    size="sm"
                                    icon={<RefreshCw size={16} className={provider.status === 'testing' ? 'animate-spin' : ''} />}
                                >
                                    Test
                                </AdminButton3D>
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
                className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3"
            >
                <Database className="text-green-400 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-green-400 mb-1">🔒 Production-Level Security</h4>
                    <p className="text-sm text-green-200/80">
                        API keys are encrypted using AES-256-CBC and stored securely in the database.
                        Only authorized admin users can access this data. All keys are encrypted at rest and in transit.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default APIConfig;
