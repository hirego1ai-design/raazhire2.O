import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, Cpu, Bot, Workflow, Play, Pause, Square,
    Settings, Activity, Zap, MessageSquare, Users,
    FileText, Mic, Target, Shield, UserCheck,
    Layers, AlertTriangle, RefreshCw, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

// Types
type AIModel = 'gpt4' | 'gemini' | 'claude' | 'deepseek' | 'kimi';
type AgentStatus = 'active' | 'paused' | 'stopped';

interface TaskModel {
    id: string;
    name: string;
    model: AIModel;
}

interface ProviderHealth {
    provider: string;
    displayName: string;
    enabled: boolean;
    keyFound: boolean;
    status: 'healthy' | 'unhealthy' | 'disabled' | 'missing_config' | 'unknown';
    latency: number | null;
    error: string | null;
}

const AIControl: React.FC = () => {
    // 1. AI Model Management
    const [defaultModel, setDefaultModel] = useState<AIModel>('gemini');
    const [enabledProviders, setEnabledProviders] = useState<string[]>(['gemini', 'gpt4']);
    const [healthResults, setHealthResults] = useState<ProviderHealth[]>([]);
    const [isCheckingHealth, setIsCheckingHealth] = useState(false);

    const [taskModels, setTaskModels] = useState<TaskModel[]>([
        { id: 'transcription', name: 'Voice → Text Transcription', model: 'gemini' },
        { id: 'rating', name: 'Candidate Rating Model', model: 'gpt4' },
        { id: 'skill_eval', name: 'Skill Evaluation Model', model: 'deepseek' },
        { id: 'resume_parse', name: 'Resume Parsing Model', model: 'gpt4' },
        { id: 'matching', name: 'Job Matching Model', model: 'deepseek' },
        { id: 'recommendation', name: 'Personalized Job Recommendation', model: 'deepseek' },
        { id: 'jd_writing', name: 'JD Writing Model', model: 'claude' },
        { id: 'screening', name: 'Screening Model', model: 'gpt4' },
        { id: 'shortlisting', name: 'Shortlisting Model', model: 'deepseek' },
        { id: 'reply_assist', name: 'Employer Reply Assistant', model: 'claude' },
        { id: 'admin_decision', name: 'Admin Decision Model', model: 'gpt4' },
        { id: 'backup', name: 'Backup Auto-Switch Model', model: 'gemini' },
    ]);

    // 2. AI Agents
    const [agents, setAgents] = useState({
        candidate: { enabled: true, status: 'active' as AgentStatus },
        employer: { enabled: true, status: 'active' as AgentStatus },
        admin: { enabled: true, status: 'active' as AgentStatus },
    });

    // Fetch configuration on mount
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/ai-config`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
            });
            const data = await response.json();
            if (data.success && data.config) {
                setDefaultModel(data.config.primaryProvider);
                setEnabledProviders(data.config.enabled_providers || ['gemini', 'gpt4']);
            }
        } catch (error) {
            console.error("Failed to fetch AI config", error);
        }
    }

    const checkHealth = async () => {
        setIsCheckingHealth(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/ai-health`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setHealthResults(data.health);
            }
        } catch (error) {
            console.error("Health check failed", error);
        } finally {
            setIsCheckingHealth(false);
        }
    };

    const saveConfig = async (newModel: AIModel, newEnabled?: string[]) => {
        const providers = newEnabled || enabledProviders;
        try {
            await fetch(`${API_BASE_URL}/api/admin/ai-config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
                },
                body: JSON.stringify({
                    primaryProvider: newModel,
                    fallbackProvider: 'gpt4',
                    enabled_providers: providers,
                    features: { videoAnalysis: true },
                    weights: {},
                    thresholds: {}
                })
            });
        } catch (error) {
            console.error("Failed to save AI config", error);
        }
    };

    const toggleProvider = (id: string) => {
        const next = enabledProviders.includes(id)
            ? enabledProviders.filter(p => p !== id)
            : [...enabledProviders, id];
        setEnabledProviders(next);
        saveConfig(defaultModel, next);
    };

    const models: { id: AIModel; name: string }[] = [
        { id: 'gpt4', name: 'GPT-4' },
        { id: 'gemini', name: 'Gemini 2.0' },
        { id: 'claude', name: 'Claude 3' },
        { id: 'deepseek', name: 'DeepSeek R1' },
    ];

    const handleDefaultModelChange = (model: AIModel) => {
        setDefaultModel(model);
        saveConfig(model);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end border-b border-white/10 pb-6"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                        AI Orchestration Center
                    </h1>
                    <p className="text-gray-400">Dynamic model switching, provider health, and fallback management.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={checkHealth}
                        disabled={isCheckingHealth}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isCheckingHealth ? 'animate-spin' : ''} />
                        {isCheckingHealth ? 'Diagnosing...' : 'System Health Check'}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <Shield size={16} />
                        <span>Root Admin Access</span>
                    </div>
                </div>
            </motion.div>

            {/* Health & Status Toggles */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {models.map(m => {
                    const health = healthResults.find(h => h.provider === m.id);
                    const isEnabled = enabledProviders.includes(m.id);

                    return (
                        <motion.div
                            key={m.id}
                            whileHover={{ y: -5 }}
                            className={`p-5 rounded-xl border transition-all ${isEnabled ? 'bg-white/5 border-white/20' : 'bg-black/20 border-white/5 opacity-60'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{m.name}</h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => toggleProvider(m.id)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${isEnabled ? 'bg-neon-cyan' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {health && isEnabled && (
                                <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">API Status</span>
                                        <span className={`flex items-center gap-1 font-bold ${health.status === 'healthy' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {health.status === 'healthy' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {health.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Latency</span>
                                        <span className="text-neon-cyan font-mono">{health.latency ? `${health.latency}ms` : 'N/A'}</span>
                                    </div>
                                    {health.error && (
                                        <div className="text-[10px] text-red-500 mt-2 bg-red-500/5 p-2 rounded break-words font-mono">
                                            {health.error}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Model Selection & Priority */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div className="lg:col-span-1 p-6 rounded-xl glass border border-white/10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Brain className="text-neon-cyan" size={24} />
                        Primary AI Engine
                    </h2>
                    <div className="space-y-2">
                        {models.map(m => (
                            <button
                                key={m.id}
                                onClick={() => handleDefaultModelChange(m.id)}
                                disabled={!enabledProviders.includes(m.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${defaultModel === m.id
                                        ? 'bg-neon-cyan/10 border-neon-cyan text-white'
                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                <span>{m.name}</span>
                                {defaultModel === m.id && <div className="w-2 h-2 rounded-full bg-neon-cyan" />}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="lg:col-span-2 p-6 rounded-xl glass border border-white/10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Cpu className="text-neon-purple" size={24} />
                        AI Agent Chain Monitor
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-black/40 border border-white/5">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neon-cyan/10 text-neon-cyan font-bold">1</div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-400 uppercase font-bold">Primary Attempt</div>
                                <div className="font-bold text-lg">{models.find(m => m.id === defaultModel)?.name || 'None'}</div>
                            </div>
                            <Zap size={20} className="text-neon-cyan" />
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-black/40 border border-white/5">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-gray-400 font-bold">2</div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-400 uppercase font-bold">Fallback Chain</div>
                                <div className="text-sm">
                                    {enabledProviders.filter(p => p !== defaultModel).map(p => models.find(m => m.id === p)?.name).join(' → ') || 'None'}
                                </div>
                            </div>
                            <Activity size={20} className="text-gray-600" />
                        </div>

                        <div className="p-3 bg-neon-purple/5 border border-neon-purple/20 rounded-lg text-xs text-neon-purple flex items-center gap-2">
                            <AlertTriangle size={14} />
                            <span>Retry logic configured: 1 automatic retry per provider before chain progression.</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AIControl;
