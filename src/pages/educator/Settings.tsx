import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Save } from 'lucide-react';

const EducatorSettings: React.FC = () => {
    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portal Settings</h1>
                <p className="text-slate-500 mt-1 font-medium">Manage your professional profile and teaching preferences.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-10 space-y-10">
                    {/* Profile Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <User className="text-indigo-600" size={20} />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Public Profile</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Display Name</label>
                                <input type="text" defaultValue="Educator Premium" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-600 transition-all font-sans" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Professional Headline</label>
                                <input type="text" defaultValue="Full Stack Developer & AI Educator" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-600 transition-all font-sans" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Bio</label>
                                <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-600 transition-all font-sans resize-none">Passionate about teaching modern technologies and AI integration in day-to-day software development.</textarea>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Email/Notifications */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Bell className="text-indigo-600" size={20} />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Communication</h3>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="text-sm font-bold text-slate-700">Course Sale Notifications</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="text-sm font-bold text-slate-700">Student Comment Alerts</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white text-xs font-black rounded-2xl tracking-widest uppercase hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                            <Save size={18} /> Update Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducatorSettings;
