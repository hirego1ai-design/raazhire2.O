import React, { useState, useEffect, useRef } from 'react';
import { endpoints } from '../lib/api';
import { Send, Search, MoreVertical, Paperclip, Phone, Video, Info } from 'lucide-react';

interface User {
    id: string;
    name: string;
    avatar_url?: string;
}

interface Message {
    id: number;
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
}

interface Conversation {
    id: number;
    partner: User;
    last_message: Message;
    updated_at: string;
}

const Messages: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem('sb-token');
                if (!token) return;

                // Decode token roughly or fetch profile to get ID (Assuming we store it or can decipher)
                // For MVP, assume backend handles auth correctly and we just need conversations.
                // We need currentUserId to distinguish "Me" vs "Them" in UI.
                // Usually stored in local storage or context.
                // I'll fetch profile or parse token if possible, but let's just use "sender_id" logic relative to partner.

                // Fetch user profile to get ID
                const profileResp = await fetch(endpoints.profile, { headers: { 'Authorization': `Bearer ${token}` } });
                const profile = await profileResp.json();
                if (profile.success) {
                    setCurrentUserId(profile.user.id);
                }

                const response = await fetch(endpoints.messages.conversations, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setConversations(data.conversations);
                    if (data.conversations.length > 0) {
                        // Optionally select first
                    }
                }
            } catch (error) {
                console.error("Error loading conversations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    // Load Messages when conversation selected
    useEffect(() => {
        if (!selectedConversation) return;

        const loadMessages = async () => {
            setMessagesLoading(true);
            try {
                const token = localStorage.getItem('sb-token');
                const response = await fetch(`${endpoints.messages.conversations}/${selectedConversation.id}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                    scrollToBottom();
                }
            } catch (error) {
                console.error("Error loading messages", error);
            } finally {
                setMessagesLoading(false);
            }
        };

        loadMessages();

        // Polling for new messages (Simple MVP)
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);

    }, [selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const tempId = Date.now();
        const optimisticMsg: Message = {
            id: tempId,
            content: newMessage,
            sender_id: currentUserId || 'me',
            created_at: new Date().toISOString(),
            is_read: false
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        scrollToBottom();

        try {
            const token = localStorage.getItem('sb-token');
            const response = await fetch(endpoints.messages.send, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversation_id: selectedConversation.id,
                    content: optimisticMsg.content
                })
            });
            const data = await response.json();
            if (data.success) {
                setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
                // Update conversation list last message
                setConversations(prev => prev.map(c =>
                    c.id === selectedConversation.id
                        ? { ...c, last_message: data.message, updated_at: new Date().toISOString() }
                        : c
                ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
            }
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading chats...</div>;

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-[var(--border-subtle)] bg-gray-50 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[var(--border-subtle)]">
                    <h2 className="text-xl font-black text-gray-800">Messages</h2>
                    <div className="mt-3 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 text-sm">No conversations yet</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${selectedConversation?.id === conv.id ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <img
                                        src={conv.partner?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner?.name || 'User')}`}
                                        alt={conv.partner?.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 truncate">{conv.partner?.name || 'Unknown User'}</h3>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                {new Date(conv.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-0.5">
                                            {conv.last_message?.sender_id === currentUserId ? 'You: ' : ''}
                                            {conv.last_message?.content || 'Started a conversation'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden" onClick={() => setSelectedConversation(null)}>
                                    Back
                                </button>
                                <img
                                    src={selectedConversation.partner?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.partner?.name || 'User')}`}
                                    alt={selectedConversation.partner?.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedConversation.partner?.name}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-xs text-gray-500">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 text-gray-400">
                                <Phone size={20} className="hover:text-indigo-600 cursor-pointer" />
                                <Video size={20} className="hover:text-indigo-600 cursor-pointer" />
                                <Info size={20} className="hover:text-indigo-600 cursor-pointer" />
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === currentUserId;
                                return (
                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-[var(--border-subtle)]">
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-600 rounded-xl px-4 py-3 text-sm transition-all outline-none border"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Send size={32} className="opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">Your Messages</h3>
                        <p className="max-w-xs mt-2 text-sm">Select a conversation from the left to start chatting with candidates or employers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
