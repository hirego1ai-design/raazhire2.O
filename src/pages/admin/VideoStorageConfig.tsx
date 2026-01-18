import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Save, Youtube, ToggleLeft, ToggleRight,
    CheckCircle, AlertCircle, RefreshCw, Server,
    Settings, ExternalLink, PlayCircle, Database, Loader,
    Eye, EyeOff
} from 'lucide-react';
import { endpoints } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import AdminButton3D from '../../components/AdminButton3D';

const VideoStorageConfig: React.FC = () => {
    // State
    const [youtubeConfig, setYoutubeConfig] = useState({
        apiKey: '',
        clientId: '',
        clientSecret: '',
        accessToken: '',
        channelId: '',
        privacyStatus: 'private',
        autoUpload: true
    });

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [channelTitle, setChannelTitle] = useState('');
    const [showAccessToken, setShowAccessToken] = useState(false);

    // Load from backend on mount
    React.useEffect(() => {
        loadYouTubeConfig();
    }, []);

    const getAuthHeaders = async (): Promise<Record<string, string>> => {
        if (!supabase) return {};
        const { data: { session } } = await supabase.auth.getSession();
        return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
    };

    const loadYouTubeConfig = async () => {
        setIsLoading(true);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${endpoints.test.replace('/test', '')}/admin/youtube-config`, {
                headers: { ...headers }
            });
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setYoutubeConfig({
                        apiKey: data.api_key || '',
                        clientId: data.client_id || '',
                        clientSecret: data.client_secret || '',
                        accessToken: data.access_token || '',
                        channelId: data.channel_id || '',
                        privacyStatus: data.privacy_status || 'private',
                        autoUpload: data.auto_upload !== undefined ? data.auto_upload : true
                    });
                    if (data.access_token) {
                        setIsConnected(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading YouTube config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [logs] = useState<{ id: number; status: string; timestamp: string; details: string }[]>([]);


    const handleConnect = async () => {
        console.log('=== YouTube Connection Test ===');
        console.log('Access Token exists:', !!youtubeConfig.accessToken);
        console.log('Access Token length:', youtubeConfig.accessToken?.length || 0);

        if (!youtubeConfig.accessToken || youtubeConfig.accessToken.trim() === '') {
            alert('❌ No Access Token found.\n\nPlease ensure you have saved a valid Access Token in the configuration.');
            console.error('Access token is empty');
            return;
        }

        setIsConnecting(true);
        console.log('Starting YouTube API call...');

        try {
            const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
                headers: {
                    'Authorization': `Bearer ${youtubeConfig.accessToken}`
                }
            });

            console.log('YouTube API Response Status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('YouTube API Response:', data);

                if (data.items && data.items.length > 0) {
                    const channel = data.items[0];
                    setYoutubeConfig(prev => ({
                        ...prev,
                        channelId: channel.id
                    }));
                    setChannelTitle(channel.snippet.title);
                    setIsConnected(true);
                    alert(`✅ Successfully connected to channel: ${channel.snippet.title}`);
                    console.log('✅ Connection successful!');
                } else {
                    alert('❌ No YouTube channel found for this account.');
                    console.error('No channels found in response');
                }
            } else {
                const error = await response.json();
                console.error('YouTube API Error:', error);

                let errorMessage = 'Connection failed';
                if (error.error?.message) {
                    errorMessage = error.error.message;
                } else if (response.status === 401) {
                    errorMessage = 'Invalid or expired Access Token. Please generate a new token from OAuth Playground.';
                } else if (response.status === 403) {
                    errorMessage = 'Access denied. Make sure your token has "youtube.readonly" scope.';
                }

                alert(`❌ ${errorMessage}\n\nStatus Code: ${response.status}`);
                setIsConnected(false);
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert(`❌ Network error while connecting to YouTube.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck browser console for details.`);
            setIsConnected(false);
        } finally {
            setIsConnecting(false);
            console.log('=== Connection test completed ===');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${endpoints.test.replace('/test', '')}/admin/youtube-config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify({
                    api_key: youtubeConfig.apiKey,
                    client_id: youtubeConfig.clientId,
                    client_secret: youtubeConfig.clientSecret,
                    access_token: youtubeConfig.accessToken,
                    channel_id: youtubeConfig.channelId,
                    privacy_status: youtubeConfig.privacyStatus,
                    auto_upload: youtubeConfig.autoUpload
                })
            });

            if (response.ok) {
                alert('Video Storage Configuration Saved Successfully to secure backend!');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to save configuration');
            }
        } catch (error) {
            console.error('Error saving YouTube config:', error);
            alert(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 pb-20 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader className="animate-spin text-red-500 mx-auto mb-4" size={48} />
                    <p className="text-gray-400">Loading YouTube configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Youtube className="text-red-500" size={32} />
                        Video Storage Configuration
                    </h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <Database size={16} className="text-green-400" />
                        Manage YouTube API integration (encrypted storage)
                    </p>
                </div>
                <AdminButton3D
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="danger"
                    size="md"
                    icon={isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </AdminButton3D>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Settings */}
                <div className="lg:col-span-2 space-y-8">

                    {/* API Credentials */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Settings className="text-red-500" size={24} />
                            YouTube API Credentials
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">API Key</label>
                                <input
                                    type="password"
                                    value={youtubeConfig.apiKey}
                                    onChange={(e) => setYoutubeConfig({ ...youtubeConfig, apiKey: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-red-500 focus:outline-none"
                                    placeholder="Enter your YouTube Data API Key"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Client ID</label>
                                    <input
                                        type="password"
                                        value={youtubeConfig.clientId}
                                        onChange={(e) => setYoutubeConfig({ ...youtubeConfig, clientId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-red-500 focus:outline-none"
                                        placeholder="OAuth 2.0 Client ID"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Client Secret</label>
                                    <input
                                        type="password"
                                        value={youtubeConfig.clientSecret}
                                        onChange={(e) => setYoutubeConfig({ ...youtubeConfig, clientSecret: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-red-500 focus:outline-none"
                                        placeholder="OAuth 2.0 Client Secret"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Access Token</label>
                                <div className="relative">
                                    <input
                                        type={showAccessToken ? "text" : "password"}
                                        value={youtubeConfig.accessToken}
                                        onChange={(e) => setYoutubeConfig({ ...youtubeConfig, accessToken: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-red-500 focus:outline-none pr-10"
                                        placeholder="Paste your OAuth 2.0 Access Token here"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAccessToken(!showAccessToken)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showAccessToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 space-y-1">
                                    <p>Required for verification. Generate a token from <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-red-400 hover:underline">OAuth Playground</a>.</p>
                                    <p className="font-medium text-yellow-500">
                                        ⚠️ Important: You MUST select the following scope in Step 1:
                                        <br />
                                        <code className="text-red-400 bg-red-900/10 px-1 rounded">https://www.googleapis.com/auth/youtube</code>
                                    </p>
                                </div>
                            </div>



                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-400">Connection Status</div>
                                        <div className={`font-medium flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                                            {isConnected ? (
                                                <><CheckCircle size={14} /> Connected {channelTitle ? `as ${channelTitle}` : ''}</>
                                            ) : (
                                                <><AlertCircle size={14} /> Not Connected</>
                                            )}
                                        </div>
                                        {isConnected && youtubeConfig.channelId && (
                                            <div className="text-xs text-gray-500 mt-1">Channel ID: {youtubeConfig.channelId}</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isConnected
                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                            : 'bg-red-600 hover:bg-red-700 text-white'
                                            }`}
                                    >
                                        {isConnecting ? <RefreshCw className="animate-spin" size={18} /> : <ExternalLink size={18} />}
                                        {isConnected ? 'Re-Verify Connection' : isConnecting ? 'Connecting...' : 'Verify Token'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Upload Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Server className="text-red-500" size={24} />
                            Upload Settings
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                <div>
                                    <div className="font-medium text-white mb-1">Auto-Upload Recordings</div>
                                    <div className="text-sm text-gray-400">Automatically upload interview recordings when they finish.</div>
                                </div>
                                <button
                                    onClick={() => setYoutubeConfig({ ...youtubeConfig, autoUpload: !youtubeConfig.autoUpload })}
                                    className={`transition-colors ${youtubeConfig.autoUpload ? 'text-green-400' : 'text-gray-600'}`}
                                >
                                    {youtubeConfig.autoUpload ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Default Privacy Status</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['public', 'unlisted', 'private'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setYoutubeConfig({ ...youtubeConfig, privacyStatus: status })}
                                            className={`p-3 rounded-lg border capitalize text-sm font-medium transition-all ${youtubeConfig.privacyStatus === status
                                                ? 'bg-red-500/20 border-red-500 text-red-500'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    <span className="text-yellow-500 font-bold">Note:</span> 'Unlisted' is recommended for interview recordings. 'Private' requires sharing with specific email addresses.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Info & Logs */}
                <div className="space-y-8">
                    {/* Quota Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-red-900/20 to-black border border-red-500/20"
                    >
                        <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                            <PlayCircle size={20} />
                            API Quota Usage
                        </h2>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                Real-time quota usage is available in your <a href="https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas" target="_blank" rel="noreferrer" className="text-red-400 hover:underline">Google Cloud Console</a>.
                            </p>
                            <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-500">
                                Default Quota: 10,000 units/day<br />
                                Video Upload Cost: ~1,600 units
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Uploads */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                        <div className="space-y-3">
                            {logs.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No recent uploads recorded.</p>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="text-sm border-b border-white/5 pb-2 last:border-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs font-bold ${log.status === 'success' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {log.status.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-600">{log.timestamp.split(' ')[1]}</span>
                                        </div>
                                        <div className="text-gray-400 truncate">{log.details}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Security Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="text-green-400" size={20} />
                            <h3 className="font-bold text-green-400">Encrypted Storage</h3>
                        </div>
                        <p className="text-xs text-green-200/80">
                            All credentials are encrypted using AES-256-CBC and stored securely in the database.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VideoStorageConfig;
