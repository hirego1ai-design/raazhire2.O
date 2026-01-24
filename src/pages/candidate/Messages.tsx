import React, { useState } from 'react';
import { Send, Search, MoreVertical, Paperclip } from 'lucide-react';

const Messages: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState(1);

    const chats = [
        { id: 1, name: "Sarah Chen", lastMsg: "The interview is set for 10 AM.", time: "10:30 AM", unread: 2, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1" },
        { id: 2, name: "Marcus Miller", lastMsg: "Thanks for the feedback!", time: "Yesterday", unread: 0, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1" },
        { id: 3, name: "Lisa Wong", lastMsg: "Great profile, Marcus.", time: "Jan 19", unread: 0, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1" },
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
            {/* Chat List */}
            <div className="w-80 flex flex-col saas-card overflow-hidden">
                <div className="p-4 border-b border-[var(--border-subtle)]">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="text" placeholder="Search messages..." className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--primary)] text-sm" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-l-4 ${selectedChat === chat.id ? 'bg-[var(--primary-light)] border-[var(--primary)]' : 'border-transparent hover:bg-[var(--bg-page)]'}`}
                        >
                            <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                                    <span className="text-[10px] text-[var(--text-muted)]">{chat.time}</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)] truncate">{chat.lastMsg}</p>
                            </div>
                            {chat.unread > 0 && <span className="w-5 h-5 bg-[var(--primary)] text-white text-[10px] rounded-full flex items-center justify-center">{chat.unread}</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat View */}
            <div className="flex-1 flex flex-col saas-card overflow-hidden">
                <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={chats.find(c => c.id === selectedChat)?.avatar} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        <div>
                            <h3 className="font-bold text-sm">{chats.find(c => c.id === selectedChat)?.name}</h3>
                            <span className="text-[10px] text-green-500 font-bold">Online</span>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-[var(--bg-page)] rounded-lg text-[var(--text-muted)]"><MoreVertical size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="flex flex-col items-start gap-1">
                        <div className="bg-[var(--bg-page)] p-3 rounded-2xl rounded-tl-none text-sm max-w-md">Hey! We saw your profile and we're impressed. Can we hop on a call?</div>
                        <span className="text-[10px] text-[var(--text-muted)] ml-1">10:45 AM</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="bg-[var(--primary)] text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-md">Sure! I'm free tomorrow morning at 10 AM.</div>
                        <span className="text-[10px] text-[var(--text-muted)] mr-1">10:52 AM</span>
                    </div>
                </div>

                <div className="p-4 border-t border-[var(--border-subtle)] flex gap-2 items-center">
                    <button className="p-2 text-[var(--text-muted)] hober:text-[var(--primary)]"><Paperclip size={20} /></button>
                    <input type="text" placeholder="Type a message..." className="flex-1 bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl py-2 px-4 text-sm focus:outline-none" />
                    <button className="p-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-opacity"><Send size={18} /></button>
                </div>
            </div>
        </div>
    );
};

export default Messages;
