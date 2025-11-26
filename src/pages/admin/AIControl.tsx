import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, Cpu, Bot, Workflow, Play, Pause, Square,
    Settings, Activity, Zap, MessageSquare, Users,
    FileText, Mic, Target, Shield, UserCheck,
    Layers, AlertTriangle, RefreshCw, ChevronRight
} from 'lucide-react';

// Types
type AIModel = 'gpt4' | 'gemini' | 'claude' | 'deepseek' | 'kimi';
type AgentStatus = 'active' | 'paused' | 'stopped';

interface TaskModel {
    id: string;
    name: string;
    model: AIModel;
}

const AIControl: React.FC = () => {
    // 1. AI Model Management
    const [defaultModel, setDefaultModel] = useState<AIModel>('gpt4');
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

    // 3. Workflows
    const [workflows, setWorkflows] = useState({
        candidate: 'running',
        employer: 'running',
        admin: 'running'
    });

    const models: { id: AIModel; name: string }[] = [
        { id: 'gpt4', name: 'GPT-4' },
        { id: 'gemini', name: 'Gemini Pro' },
        { id: 'claude', name: 'Claude 3' },
        { id: 'deepseek', name: 'DeepSeek R1' },
        { id: 'kimi', name: 'Kimi AI' },
    ];

    const handleModelChange = (taskId: string, model: AIModel) => {
        setTaskModels(prev => prev.map(t => t.id === taskId ? { ...t, model } : t));
    };

    const toggleAgent = (agent: 'candidate' | 'employer' | 'admin') => {
        setAgents(prev => ({
            ...prev,
            [agent]: { ...prev[agent], enabled: !prev[agent].enabled }
        }));
    };

    const WorkflowChain = ({ steps, color }: { steps: string[], color: string }) => (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, i) => (
                <React.Fragment key={i}>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${color === 'cyan' ? 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan' :
                        color === 'purple' ? 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple' :
                            'bg-neon-pink/10 border-neon-pink/30 text-neon-pink'
                        }`}>
                        {step}
                    </div>
                    {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-600 shrink-0" />}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                        AI System Control Center
                    </h1>
                    <p className="text-gray-400">Master control for all AI agents, models, and automated workflows.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <Shield size={16} />
                    <span>Admin Access Only</span>
                </div>
            </motion.div>

            {/* 1. AI Model Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Global Default */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1 p-6 rounded-xl glass border border-white/10 h-full"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Brain className="text-neon-cyan" size={24} />
                        Global Default Model
                    </h2>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">
                            Select the primary AI model used for general tasks when no specific model is assigned.
                        </p>
                        <div className="space-y-2">
                            {models.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setDefaultModel(m.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${defaultModel === m.id
                                        ? 'bg-neon-cyan/10 border-neon-cyan text-white'
                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <span>{m.name}</span>
                                    {defaultModel === m.id && <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Task-Based Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-6 rounded-xl glass border border-white/10"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Cpu className="text-neon-purple" size={24} />
                        Task-Based Model Selection
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {taskModels.map((task) => (
                            <div key={task.id} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="text-sm font-medium text-gray-300 mb-2">{task.name}</div>
                                <select
                                    value={task.model}
                                    onChange={(e) => handleModelChange(task.id, e.target.value as AIModel)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-neon-cyan focus:outline-none focus:border-neon-cyan"
                                >
                                    {models.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* 2. AI Agents Control */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Bot className="text-neon-pink" size={28} />
                    AI Agent Swarm Control
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Candidate Agent */}
                    <div className={`p-6 rounded-xl glass border transition-all ${agents.candidate.enabled ? 'border-neon-cyan/30' : 'border-white/10 opacity-75'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                                    <UserCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Candidate Agent</h3>
                                    <span className="text-xs text-gray-400">Full Automation</span>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleAgent('candidate')}
                                className={`relative w-12 h-6 rounded-full transition-colors ${agents.candidate.enabled ? 'bg-neon-cyan' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${agents.candidate.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-400 mb-6">
                            <li className="flex items-center gap-2"><Target size={14} /> Job Matching & Personalization</li>
                            <li className="flex items-center gap-2"><Mic size={14} /> Auto-Screening & Shortlisting</li>
                            <li className="flex items-center gap-2"><MessageSquare size={14} /> Auto-Email Sending (Shortlisted)</li>
                            <li className="flex items-center gap-2"><FileText size={14} /> Interview Logistics & Mode Handling</li>
                        </ul>
                        <div className="flex items-center gap-2 text-xs font-mono text-neon-cyan bg-neon-cyan/5 p-2 rounded">
                            <Activity size={12} />
                            Status: {agents.candidate.enabled ? 'Active & Listening' : 'Offline'}
                        </div>
                    </div>

                    {/* Employer Agent */}
                    <div className={`p-6 rounded-xl glass border transition-all ${agents.employer.enabled ? 'border-neon-purple/30' : 'border-white/10 opacity-75'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-neon-purple/10 text-neon-purple">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Employer Agent</h3>
                                    <span className="text-xs text-gray-400">Recruitment Bot</span>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleAgent('employer')}
                                className={`relative w-12 h-6 rounded-full transition-colors ${agents.employer.enabled ? 'bg-neon-purple' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${agents.employer.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-400 mb-6">
                            <li className="flex items-center gap-2"><FileText size={14} /> JD Writing & Optimization</li>
                            <li className="flex items-center gap-2"><Shield size={14} /> Auto-Shortlist & Email Triggers</li>
                            <li className="flex items-center gap-2"><MessageSquare size={14} /> Interview Mode Management (Virtual/F2F)</li>
                            <li className="flex items-center gap-2"><Zap size={14} /> Auto-Share Location/Address</li>
                        </ul>
                        <div className="flex items-center gap-2 text-xs font-mono text-neon-purple bg-neon-purple/5 p-2 rounded">
                            <Activity size={12} />
                            Status: {agents.employer.enabled ? 'Processing Jobs' : 'Offline'}
                        </div>
                    </div>

                    {/* Admin Agent */}
                    <div className={`p-6 rounded-xl glass border transition-all ${agents.admin.enabled ? 'border-neon-pink/30' : 'border-white/10 opacity-75'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-neon-pink/10 text-neon-pink">
                                    <Settings size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Admin Agent</h3>
                                    <span className="text-xs text-gray-400">System Manager</span>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleAgent('admin')}
                                className={`relative w-12 h-6 rounded-full transition-colors ${agents.admin.enabled ? 'bg-neon-pink' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${agents.admin.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-400 mb-6">
                            <li className="flex items-center gap-2"><RefreshCw size={14} /> Auto Model Switching</li>
                            <li className="flex items-center gap-2"><AlertTriangle size={14} /> Error Detection & Fix</li>
                            <li className="flex items-center gap-2"><Layers size={14} /> Workflow Monitoring</li>
                            <li className="flex items-center gap-2"><Activity size={14} /> API Health Check</li>
                        </ul>
                        <div className="flex items-center gap-2 text-xs font-mono text-neon-pink bg-neon-pink/5 p-2 rounded">
                            <Activity size={12} />
                            Status: {agents.admin.enabled ? 'Monitoring System' : 'Offline'}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 3. Process Workflows */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-xl glass border border-white/10"
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Workflow className="text-white" size={28} />
                    Live Process Workflows
                </h2>

                <div className="space-y-6">
                    {/* Candidate Chain */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-neon-cyan uppercase tracking-wider">Candidate Workflow Chain</h3>
                            <div className="flex gap-2">
                                <button className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"><Play size={14} /></button>
                                <button className="p-1.5 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"><Pause size={14} /></button>
                                <button className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"><Square size={14} /></button>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <WorkflowChain
                                steps={['Voice Input', 'Transcription (Gemini)', 'Rating (GPT-4)', 'Skills Match', 'Job Fit', 'Recommendation']}
                                color="cyan"
                            />
                        </div>
                    </div>

                    {/* Employer Chain */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-neon-purple uppercase tracking-wider">Employer Workflow Chain</h3>
                            <div className="flex gap-2">
                                <button className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"><Play size={14} /></button>
                                <button className="p-1.5 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"><Pause size={14} /></button>
                                <button className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"><Square size={14} /></button>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <WorkflowChain
                                steps={['Job Posted', 'JD Writing (Claude)', 'Screening', 'Shortlisting', 'Communication', 'Interview Setup']}
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Admin Chain */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-neon-pink uppercase tracking-wider">Admin System Chain</h3>
                            <div className="flex gap-2">
                                <button className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"><Play size={14} /></button>
                                <button className="p-1.5 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"><Pause size={14} /></button>
                                <button className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"><Square size={14} /></button>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <WorkflowChain
                                steps={['System Monitor', 'Detect Failure', 'Auto Switch Model', 'Auto Fix', 'Generate Report']}
                                color="pink"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AIControl;
