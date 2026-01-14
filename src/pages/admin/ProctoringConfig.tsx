import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Eye, Monitor, Mic, AlertTriangle,
    Video, UserCheck, Lock, Save, Activity,
    Sliders, FileWarning, Brain
} from 'lucide-react';

const ProctoringConfig: React.FC = () => {
    // 1. AI Proctoring Sensitivity
    const [sensitivity, setSensitivity] = useState({
        gazeTracking: 75, // % sensitivity
        personDetection: true, // Ensure only 1 person
        objectDetection: true, // Detect phones/books
        audioEnvironment: 60, // Noise threshold
        tabSwitchLimit: 3, // Max allowed tab switches
    });

    // 2. Live Interview AI
    const [interviewAI, setInterviewAI] = useState({
        realTimeTranscription: true,
        sentimentAnalysis: true,
        autoFollowUpQuestions: true,
        behavioralCues: false, // Detect nervousness/confidence
    });

    // 3. Assessment Rules
    const [assessmentRules, setAssessmentRules] = useState({
        fullScreenMode: 'strict', // strict | lenient | off
        copyPasteBlock: true,
        browserLockdown: true,
        recordEntireScreen: false,
    });

    // Load configuration from API
    React.useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/proctoring-config`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
                });
                const data = await response.json();

                if (data.success && data.config && data.config.settings) {
                    // Map backend settings to frontend state
                    const s = data.config.settings;

                    if (s.sensitivity) setSensitivity(s.sensitivity);
                    if (s.interviewAI) setInterviewAI(s.interviewAI);
                    if (s.assessmentRules) setAssessmentRules(s.assessmentRules);

                    // Fallback for legacy schema
                    if (!s.sensitivity && s.faceDetection !== undefined) {
                        setSensitivity(prev => ({
                            ...prev,
                            personDetection: s.faceDetection,
                            tabSwitchLimit: s.maxTabSwitches
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to load proctoring config:", error);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        try {
            const configPayload = {
                enabled: true,
                settings: {
                    sensitivity,
                    interviewAI,
                    assessmentRules,
                    // Maintain legacy fields for compatibility
                    faceDetection: sensitivity.personDetection,
                    tabSwitchDetection: true,
                    fullscreenRequired: assessmentRules.fullScreenMode === 'strict',
                    maxTabSwitches: sensitivity.tabSwitchLimit
                },
                violationActions: {
                    tabSwitch: 'warning',
                    faceNotDetected: 'warning',
                    multipleFaces: 'terminate',
                    exitFullscreen: 'warning'
                }
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/proctoring-config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
                },
                body: JSON.stringify(configPayload)
            });

            if (response.ok) {
                alert('Proctoring & Security Rules Updated Successfully!');
                // Refetch to ensure state is synced
                // fetchConfig(); 
            } else {
                const errData = await response.json();
                throw new Error(errData.error || `Server Error: ${response.status}`);
            }
        } catch (error: any) {
            console.error("Error saving config:", error);
            alert(`Failed to save rules: ${error.message}`);
        }
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
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 to-neon-pink bg-clip-text text-transparent">
                        Proctoring & Security AI
                    </h1>
                    <p className="text-gray-400">Configure anti-cheating rules, live interview assistance, and assessment security.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="btn-3d btn-primary px-6 py-2 flex items-center gap-2"
                >
                    <Save size={18} />
                    Save Rules
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. AI Anti-Cheating Engine */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl glass border border-white/10"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Eye className="text-neon-cyan" size={24} />
                        AI Anti-Cheating Engine
                    </h2>

                    <div className="space-y-6">
                        {/* Gaze Tracking */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Gaze Tracking Sensitivity</span>
                                <span className="text-neon-cyan">{sensitivity.gazeTracking}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={sensitivity.gazeTracking}
                                onChange={(e) => setSensitivity({ ...sensitivity, gazeTracking: parseInt(e.target.value) })}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                            />
                            <p className="text-xs text-gray-500">Higher sensitivity detects smaller eye movements away from screen.</p>
                        </div>

                        {/* Audio Threshold */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Background Noise Threshold</span>
                                <span className="text-neon-cyan">{sensitivity.audioEnvironment}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={sensitivity.audioEnvironment}
                                onChange={(e) => setSensitivity({ ...sensitivity, audioEnvironment: parseInt(e.target.value) })}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                            />
                            <p className="text-xs text-gray-500">Triggers warning if background noise exceeds this level.</p>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3 pt-2">
                            <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="text-purple-400" size={20} />
                                    <div>
                                        <div className="font-medium">Multi-Person Detection</div>
                                        <div className="text-xs text-gray-500">Flag if more than one person is seen</div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={sensitivity.personDetection}
                                    onChange={(e) => setSensitivity({ ...sensitivity, personDetection: e.target.checked })}
                                    className="w-5 h-5 accent-neon-cyan"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Monitor className="text-yellow-400" size={20} />
                                    <div>
                                        <div className="font-medium">Object Detection</div>
                                        <div className="text-xs text-gray-500">Detect phones, books, or unauthorized devices</div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={sensitivity.objectDetection}
                                    onChange={(e) => setSensitivity({ ...sensitivity, objectDetection: e.target.checked })}
                                    className="w-5 h-5 accent-neon-cyan"
                                />
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Live Interview Assistant */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl glass border border-white/10"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Brain className="text-neon-purple" size={24} />
                        Live Interview AI Assistant
                    </h2>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-400 mb-4">
                            Configure how AI assists the interviewer during live video calls.
                        </p>

                        {[
                            { key: 'realTimeTranscription', label: 'Real-time Transcription', icon: FileWarning, desc: 'Live speech-to-text for both parties' },
                            { key: 'sentimentAnalysis', label: 'Live Sentiment Analysis', icon: Activity, desc: 'Analyze tone and confidence in real-time' },
                            { key: 'autoFollowUpQuestions', label: 'Auto-Generate Questions', icon: Brain, desc: 'Suggest follow-up questions based on answers' },
                            { key: 'behavioralCues', label: 'Behavioral Cues', icon: UserCheck, desc: 'Detect nervousness, hesitation, or excitement' }
                        ].map((item) => (
                            <label key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <item.icon className="text-neon-purple" size={20} />
                                    <div>
                                        <div className="font-medium">{item.label}</div>
                                        <div className="text-xs text-gray-500">{item.desc}</div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={interviewAI[item.key as keyof typeof interviewAI]}
                                    onChange={(e) => setInterviewAI({ ...interviewAI, [item.key]: e.target.checked })}
                                    className="w-5 h-5 accent-neon-purple"
                                />
                            </label>
                        ))}
                    </div>
                </motion.div>

                {/* 3. Assessment Security Rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 p-6 rounded-xl glass border border-white/10"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Lock className="text-red-400" size={24} />
                        Assessment Security Constraints
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Full Screen Enforcement</label>
                            <select
                                value={assessmentRules.fullScreenMode}
                                onChange={(e) => setAssessmentRules({ ...assessmentRules, fullScreenMode: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-400 focus:outline-none"
                            >
                                <option value="strict">Strict (Kick on exit)</option>
                                <option value="lenient">Lenient (Warning only)</option>
                                <option value="off">Off (Allow windowed)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Tab Switch Limit</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="0" max="10"
                                    value={sensitivity.tabSwitchLimit}
                                    onChange={(e) => setSensitivity({ ...sensitivity, tabSwitchLimit: parseInt(e.target.value) })}
                                    className="w-20 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-400 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500">Max allowed switches before auto-submit</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-1">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={assessmentRules.copyPasteBlock}
                                    onChange={(e) => setAssessmentRules({ ...assessmentRules, copyPasteBlock: e.target.checked })}
                                    className="w-5 h-5 accent-red-400"
                                />
                                <span className="text-sm">Block Copy/Paste</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={assessmentRules.browserLockdown}
                                    onChange={(e) => setAssessmentRules({ ...assessmentRules, browserLockdown: e.target.checked })}
                                    className="w-5 h-5 accent-red-400"
                                />
                                <span className="text-sm">Browser Lockdown Mode</span>
                            </label>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ProctoringConfig;
