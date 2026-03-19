import React, { useState } from 'react';
import { Settings, ShieldAlert, BadgeDollarSign, Activity } from 'lucide-react';

const ReferralAdmin: React.FC = () => {
    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Referral & Payout Operations</h1>
            <p className="text-[var(--text-muted)] text-sm">
                Master terminal for the PPH and Subscription referral systems. Track live lock-ins, set global reward scales, and approve ledger outputs.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Rules Section */}
                <div className="saas-card p-6 border-l-4 border-l-indigo-500">
                    <h2 className="font-bold text-sm mb-4 flex items-center gap-2"><Settings size={16}/> Commission Configuration</h2>
                    <ul className="space-y-4 text-xs">
                        <li className="flex justify-between items-center p-3 bg-[var(--bg-page)] rounded-lg">
                            <span>Candidate (Any Role)</span>
                            <span className="font-bold text-emerald-600">$500 Fixed</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-[var(--bg-page)] rounded-lg">
                            <span>Company Onboard (PPH)</span>
                            <span className="font-bold text-emerald-600">$1000 Fixed</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-[var(--bg-page)] rounded-lg">
                            <span>Company (Enterprise Sub)</span>
                            <span className="font-bold text-emerald-600">10% Split</span>
                        </li>
                    </ul>
                    <button className="btn-saas-secondary w-full mt-4 text-xs">Edit Rules</button>
                </div>

                {/* Automation Watchdog */}
                <div className="lg:col-span-2 saas-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-sm flex items-center gap-2"><Activity size={16} className="text-amber-500"/> Live Lock-in ledgers</h2>
                        <button className="btn-saas-primary text-xs">Force Run Watchdog API</button>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center h-32 text-[var(--text-muted)] text-sm">
                        <BadgeDollarSign size={32} className="mb-2 opacity-50"/>
                        No pending lock-ins found breaching target dates.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReferralAdmin;
