import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, DollarSign, CreditCard, Shield, Edit, Trash2, Plus,
    CheckCircle, Zap, Users, Calendar, BarChart, Settings,
    Briefcase, AlertTriangle, RefreshCw, Search, Filter, X,
    Save, Copy, FileText, Database, MessageSquare, Bot, Video
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// --- Types ---
type Currency = 'INR' | 'USD';
type PlanDuration = 'Monthly' | 'Quarterly' | 'Yearly';

interface PlanFeature {
    id: string;
    text: string;
    included: boolean;
}

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    priceINR: number;
    priceUSD: number;
    duration: PlanDuration;
    isActive: boolean;

    // A. Job Posting Control
    jobPosts: number;
    premiumVisibility: boolean;
    featuredJobTag: boolean;

    // B. Candidate Database Access
    dbProfileViews: number;
    dbDailyLimit: number;
    dbTotalLimit: number;
    resumeDownload: boolean;

    // C. Applications & Screening
    appsPerJob: number;
    autoScreening: boolean;
    skillEvaluation: boolean;
    resumeParsing: boolean;
    candidateRating: boolean;

    // D. Auto Shortlisting
    autoShortlisting: boolean;
    autoShortlistLimit: number;
    autoRanking: boolean;
    jobMatchScore: boolean;

    // E. Interview System
    autoSchedule: boolean;
    autoScheduleLimit: number;
    videoAssessment: boolean;
    voiceInterview: boolean;

    // F. Preview Controls
    candidatePreviews: number;
    lockPreviewAfterLimit: boolean;
    previewRefreshCount: number;

    // G. Communication
    whatsappAccess: boolean;
    emailAlerts: boolean;
    prioritySupport: boolean;
    chatSupport: boolean;

    // H. AI Features
    aiJobMatching: boolean;
    aiCandidateRating: boolean;
    aiJDWriting: boolean;
    aiTalentRecommendation: boolean;
    aiAutoScreening: boolean;
    aiAutoShortlist: boolean;
    aiChatbot: boolean;
}

interface SalarySlab {
    id: string;
    minSalary: number;
    maxSalary: number;
    pphFee: number;
    currency: 'INR' | 'USD';
}

interface PaymentOption {
    type: 'advance' | 'postPayment';
    discountMin: number;
    discountMax: number;
    allowCustomization: boolean;
    paymentTermDays: number;
}

interface CustomCorporatePlan {
    id: string;
    companyId: string;
    companyName: string;
    customPricePerHire: number;
    paymentCycle: 'weekly' | 'monthly' | 'quarterly';
    advancePercentage: number;
    postPaymentPercentage: number;
    replacementPeriodDays: number;
    bulkDiscountTiers: { hires: number; discount: number }[];
    specialTerms: string;
    agreementPdfUrl?: string;
    isActive: boolean;
}

interface AgreementTemplate {
    id: string;
    name: string;
    type: 'standard' | 'custom';
    content: string;
    isActive: boolean;
}

interface PayPerHireConfig {
    salarySlabs: SalarySlab[];
    paymentOptions: PaymentOption[];
    customPlans: CustomCorporatePlan[];
    agreementTemplates: AgreementTemplate[];
    defaultAdvanceDiscount: number;
    replacementPeriodDays: number;
}

interface EmployerData {
    id: string;
    name: string;
    email: string;
    currentPlan: string;
    jobPostsUsed: number;
    jobPostsLimit: number;
    previewsUsed: number;
    previewsLimit: number;
    aiAccessEnabled: boolean;
    pricingModel: 'subscription' | 'pph';
}

// --- Mock Data ---
const INITIAL_PPH_CONFIG: PayPerHireConfig = {
    salarySlabs: [],
    paymentOptions: [
        { type: 'advance', discountMin: 5, discountMax: 20, allowCustomization: true, paymentTermDays: 0 },
        { type: 'postPayment', discountMin: 0, discountMax: 0, allowCustomization: false, paymentTermDays: 30 },
    ],
    customPlans: [],
    agreementTemplates: [],
    defaultAdvanceDiscount: 10,
    replacementPeriodDays: 90,
};

const DEFAULT_PLAN: SubscriptionPlan = {
    id: '',
    name: 'New Plan',
    description: 'Plan description...',
    priceINR: 0,
    priceUSD: 0,
    duration: 'Monthly',
    isActive: true,
    jobPosts: 0,
    premiumVisibility: false,
    featuredJobTag: false,
    dbProfileViews: 0,
    dbDailyLimit: 0,
    dbTotalLimit: 0,
    resumeDownload: false,
    appsPerJob: 0,
    autoScreening: false,
    skillEvaluation: false,
    resumeParsing: false,
    candidateRating: false,
    autoShortlisting: false,
    autoShortlistLimit: 0,
    autoRanking: false,
    jobMatchScore: false,
    autoSchedule: false,
    autoScheduleLimit: 0,
    videoAssessment: false,
    voiceInterview: false,
    candidatePreviews: 0,
    lockPreviewAfterLimit: true,
    previewRefreshCount: 0,
    whatsappAccess: false,
    emailAlerts: true,
    prioritySupport: false,
    chatSupport: false,
    aiJobMatching: false,
    aiCandidateRating: false,
    aiJDWriting: false,
    aiTalentRecommendation: false,
    aiAutoScreening: false,
    aiAutoShortlist: false,
    aiChatbot: false,
};

const JobPricingControl: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'plans' | 'pph' | 'employers'>('plans');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [employers, setEmployers] = useState<EmployerData[]>([]);
    const [selectedEmployer, setSelectedEmployer] = useState<EmployerData | null>(null);
    const [pphConfig, setPphConfig] = useState<PayPerHireConfig>(INITIAL_PPH_CONFIG);
    const [editingSlab, setEditingSlab] = useState<SalarySlab | null>(null);
    const [editingCustomPlan, setEditingCustomPlan] = useState<CustomCorporatePlan | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) return;

            // Fetch Plans
            const { data: plansData } = await supabase.from('subscription_plans').select('*');
            if (plansData) {
                setPlans(plansData.map((p: any) => ({
                    ...DEFAULT_PLAN,
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    priceINR: p.price_inr,
                    priceUSD: p.price_usd,
                    duration: p.duration,
                    isActive: p.is_active,
                    jobPosts: p.job_posts_limit,
                    // Map other fields as needed, assuming defaults for now or extended schema
                })));
            }

            // Fetch Employers
            const { data: employersData } = await supabase
                .from('users')
                .select('id, company_name, email, subscription_plan_id, job_posts_count, job_posts_limit') // Adjust fields
                .eq('role', 'employer');

            if (employersData) {
                setEmployers(employersData.map((e: any) => ({
                    id: e.id,
                    name: e.company_name || 'Unknown',
                    email: e.email,
                    currentPlan: e.subscription_plan_id || 'Free',
                    jobPostsUsed: e.job_posts_count || 0,
                    jobPostsLimit: e.job_posts_limit || 0,
                    previewsUsed: 0, // Placeholder
                    previewsLimit: 0, // Placeholder
                    aiAccessEnabled: false, // Placeholder
                    pricingModel: 'subscription' // Placeholder
                })));
            }

            // Fetch PPH Config (Salary Slabs)
            const { data: slabsData } = await supabase.from('salary_slabs').select('*');
            if (slabsData) {
                setPphConfig(prev => ({
                    ...prev,
                    salarySlabs: slabsData.map((s: any) => ({
                        id: s.id,
                        minSalary: s.min_salary,
                        maxSalary: s.max_salary,
                        pphFee: s.pph_fee,
                        currency: s.currency
                    }))
                }));
            }
        };

        fetchData();
    }, []);

    // --- Actions ---
    const togglePlanStatus = (id: string) => {
        setPlans(plans.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    const handleDeletePlan = (id: string) => {
        if (window.confirm('Delete this plan?')) {
            setPlans(plans.filter(p => p.id !== id));
        }
    };

    const handleDuplicatePlan = (plan: SubscriptionPlan) => {
        const newPlan = { ...plan, id: Date.now().toString(), name: `${plan.name} (Copy)` };
        setPlans([...plans, newPlan]);
    };

    const handleSavePlan = async (plan: SubscriptionPlan) => {
        if (!supabase) return;

        const planData = {
            name: plan.name,
            description: plan.description,
            price_inr: plan.priceINR,
            price_usd: plan.priceUSD,
            duration: plan.duration,
            is_active: plan.isActive,
            job_posts_limit: plan.jobPosts,
            // Add other fields mapping
        };

        if (plan.id && !plan.id.startsWith('new')) {
            await supabase.from('subscription_plans').update(planData).eq('id', plan.id);
        } else {
            await supabase.from('subscription_plans').insert(planData);
        }

        // Refresh or update local state
        setEditingPlan(null);
    };

    // --- Edit Salary Slab Modal ---
    const EditSlabModal = ({ slab, onClose, onSave }: { slab: SalarySlab, onClose: () => void, onSave: (s: SalarySlab) => void }) => {
        const [formData, setFormData] = useState<SalarySlab>(slab);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Edit Salary Slab</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Min Salary (₹)</label>
                                <input
                                    type="number"
                                    value={formData.minSalary}
                                    onChange={(e) => setFormData({ ...formData, minSalary: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Max Salary (₹)</label>
                                <input
                                    type="number"
                                    value={formData.maxSalary}
                                    onChange={(e) => setFormData({ ...formData, maxSalary: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Pay-Per-Hire Fee (₹)</label>
                            <input
                                type="number"
                                value={formData.pphFee}
                                onChange={(e) => setFormData({ ...formData, pphFee: parseInt(e.target.value) })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-xl font-bold"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 flex justify-end gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="btn-3d btn-primary px-8 py-2 flex items-center gap-2"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    // --- Edit Custom Plan Modal ---
    const EditCustomPlanModal = ({ plan, onClose, onSave }: { plan: CustomCorporatePlan, onClose: () => void, onSave: (p: CustomCorporatePlan) => void }) => {
        const [formData, setFormData] = useState<CustomCorporatePlan>(plan);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0f111a] z-10">
                        <h2 className="text-2xl font-bold text-white">
                            {plan.id ? 'Edit Custom Corporate Plan' : 'Create Custom Corporate Plan'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    placeholder="Enter company name"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Company ID</label>
                                <input
                                    type="text"
                                    value={formData.companyId}
                                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    placeholder="E-2025-XXX"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Custom Price Per Hire (₹)</label>
                                <input
                                    type="number"
                                    value={formData.customPricePerHire}
                                    onChange={(e) => setFormData({ ...formData, customPricePerHire: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Payment Cycle</label>
                                <select
                                    value={formData.paymentCycle}
                                    onChange={(e) => setFormData({ ...formData, paymentCycle: e.target.value as any })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Advance Payment (%)</label>
                                <input
                                    type="number"
                                    value={formData.advancePercentage}
                                    onChange={(e) => setFormData({ ...formData, advancePercentage: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Post Payment (%)</label>
                                <input
                                    type="number"
                                    value={formData.postPaymentPercentage}
                                    onChange={(e) => setFormData({ ...formData, postPaymentPercentage: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Replacement Period (Days)</label>
                                <input
                                    type="number"
                                    value={formData.replacementPeriodDays}
                                    onChange={(e) => setFormData({ ...formData, replacementPeriodDays: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Special Terms & Conditions</label>
                            <textarea
                                value={formData.specialTerms}
                                onChange={(e) => setFormData({ ...formData, specialTerms: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white h-24 resize-none"
                                placeholder="Enter any special terms, bulk discounts, or custom conditions..."
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                            <div>
                                <div className="font-medium text-white">Active Status</div>
                                <div className="text-xs text-gray-400 mt-1">Enable or disable this custom plan</div>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-neon-cyan' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 flex justify-end gap-4 sticky bottom-0 bg-[#0f111a]">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="btn-3d btn-primary px-8 py-2 flex items-center gap-2"
                        >
                            <Save size={18} /> Save Custom Plan
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    // --- Manage Limits Modal ---
    const PlanEditor = ({ plan, onClose, onSave }: { plan: SubscriptionPlan, onClose: () => void, onSave: (p: SubscriptionPlan) => void }) => {
        const [formData, setFormData] = useState<SubscriptionPlan>(plan);

        const handleChange = (field: keyof SubscriptionPlan, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
            <div className="flex items-center gap-2 text-neon-cyan border-b border-white/10 pb-2 mb-4 mt-6">
                <Icon size={18} />
                <h3 className="font-bold uppercase text-sm tracking-wider">{title}</h3>
            </div>
        );

        const Toggle = ({ label, field }: { label: string, field: keyof SubscriptionPlan }) => (
            <div className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10">
                <span className="text-sm text-gray-300">{label}</span>
                <button
                    onClick={() => handleChange(field, !formData[field])}
                    className={`relative w-10 h-5 rounded-full transition-colors ${formData[field] ? 'bg-neon-cyan' : 'bg-gray-600'}`}
                >
                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${formData[field] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>
        );

        const NumberInput = ({ label, field }: { label: string, field: keyof SubscriptionPlan }) => (
            <div>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                <input
                    type="number"
                    value={formData[field] as number}
                    onChange={(e) => handleChange(field, parseInt(e.target.value))}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm"
                />
            </div>
        );

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f111a]">
                        <h2 className="text-2xl font-bold text-white">
                            {plan.id ? 'Edit Subscription Plan' : 'Create New Plan'}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Basic Info & Pricing */}
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Plan Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded px-4 py-2 text-white font-bold text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1">Duration</label>
                                        <select
                                            value={formData.duration}
                                            onChange={(e) => handleChange('duration', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white"
                                        >
                                            <option value="1 Day">1 Day</option>
                                            <option value="2 Days">2 Days</option>
                                            <option value="1 Week">1 Week</option>
                                            <option value="15 Days">15 Days</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Yearly">Yearly</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <Toggle label="Active Status" field="isActive" />
                                    </div>
                                </div>

                                <SectionHeader icon={Globe} title="Regional Pricing" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded bg-white/5 border border-white/10">
                                        <label className="text-xs text-gray-400 block mb-1">India (INR ₹)</label>
                                        <input
                                            type="number"
                                            value={formData.priceINR}
                                            onChange={(e) => handleChange('priceINR', parseInt(e.target.value))}
                                            className="w-full bg-transparent border-b border-white/20 py-1 text-xl font-bold text-white focus:outline-none focus:border-neon-cyan"
                                        />
                                    </div>
                                    <div className="p-4 rounded bg-white/5 border border-white/10">
                                        <label className="text-xs text-gray-400 block mb-1">Global (USD $)</label>
                                        <input
                                            type="number"
                                            value={formData.priceUSD}
                                            onChange={(e) => handleChange('priceUSD', parseInt(e.target.value))}
                                            className="w-full bg-transparent border-b border-white/20 py-1 text-xl font-bold text-white focus:outline-none focus:border-neon-cyan"
                                        />
                                    </div>
                                </div>

                                <SectionHeader icon={Briefcase} title="Job Posting Control" />
                                <div className="grid grid-cols-2 gap-4">
                                    <NumberInput label="Job Posts Allowed" field="jobPosts" />
                                    <Toggle label="Premium Visibility" field="premiumVisibility" />
                                    <Toggle label="Featured Job Tag" field="featuredJobTag" />
                                </div>

                                <SectionHeader icon={Database} title="Candidate Database" />
                                <div className="grid grid-cols-2 gap-4">
                                    <NumberInput label="Profile Views" field="dbProfileViews" />
                                    <NumberInput label="Daily Limit" field="dbDailyLimit" />
                                    <NumberInput label="Total Limit" field="dbTotalLimit" />
                                    <Toggle label="Resume Download" field="resumeDownload" />
                                </div>
                            </div>

                            {/* Right Column: Advanced Features */}
                            <div className="space-y-6">
                                <SectionHeader icon={Bot} title="AI Feature Controls" />
                                <div className="grid grid-cols-2 gap-3">
                                    <Toggle label="AI Job Matching" field="aiJobMatching" />
                                    <Toggle label="AI Candidate Rating" field="aiCandidateRating" />
                                    <Toggle label="AI JD Writing" field="aiJDWriting" />
                                    <Toggle label="AI Talent Rec." field="aiTalentRecommendation" />
                                    <Toggle label="AI Auto Screening" field="aiAutoScreening" />
                                    <Toggle label="AI Auto Shortlist" field="aiAutoShortlist" />
                                    <Toggle label="AI Chatbot" field="aiChatbot" />
                                </div>

                                <SectionHeader icon={FileText} title="Applications & Screening" />
                                <div className="grid grid-cols-2 gap-4">
                                    <NumberInput label="Apps Per Job" field="appsPerJob" />
                                    <Toggle label="Auto Screening" field="autoScreening" />
                                    <Toggle label="Skill Evaluation" field="skillEvaluation" />
                                    <Toggle label="Resume Parsing" field="resumeParsing" />
                                </div>

                                <SectionHeader icon={Video} title="Interview System" />
                                <div className="grid grid-cols-2 gap-4">
                                    <NumberInput label="Auto Schedule Limit" field="autoScheduleLimit" />
                                    <Toggle label="Auto Scheduling" field="autoSchedule" />
                                    <Toggle label="Video Assessment" field="videoAssessment" />
                                    <Toggle label="Voice Interview" field="voiceInterview" />
                                </div>

                                <SectionHeader icon={MessageSquare} title="Communication" />
                                <div className="grid grid-cols-2 gap-3">
                                    <Toggle label="WhatsApp Access" field="whatsappAccess" />
                                    <Toggle label="Email Alerts" field="emailAlerts" />
                                    <Toggle label="Priority Support" field="prioritySupport" />
                                    <Toggle label="Chat Support" field="chatSupport" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-[#0f111a] flex justify-end gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="btn-3d btn-primary px-8 py-2 flex items-center gap-2"
                        >
                            <Save size={18} /> Save Plan
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    // --- Manage Limits Modal ---
    const ManageLimitsModal = ({ employer, onClose, onSave }: { employer: EmployerData, onClose: () => void, onSave: (e: EmployerData) => void }) => {
        const [formData, setFormData] = useState<EmployerData>(employer);

        const handleChange = (field: keyof EmployerData, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Manage Employer Limits</h2>
                            <p className="text-sm text-gray-400 mt-1">{formData.name} ({formData.id})</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Current Plan Display & Model Switch */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-sm text-gray-400 mb-1">Current Subscription Plan</div>
                                <div className="text-xl font-bold text-neon-purple">{formData.currentPlan}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-sm text-gray-400 mb-1">Pricing Model</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        onClick={() => handleChange('pricingModel', 'subscription')}
                                        className={`px-3 py-1 rounded text-xs transition-colors ${formData.pricingModel === 'subscription' ? 'bg-neon-cyan text-black font-bold' : 'bg-white/10 text-gray-400'}`}
                                    >
                                        Subscription
                                    </button>
                                    <button
                                        onClick={() => handleChange('pricingModel', 'pph')}
                                        className={`px-3 py-1 rounded text-xs transition-colors ${formData.pricingModel === 'pph' ? 'bg-green-400 text-black font-bold' : 'bg-white/10 text-gray-400'}`}
                                    >
                                        Pay-Per-Hire
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Job Posts Limit */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Job Posts Limit</label>
                                <input
                                    type="number"
                                    value={formData.jobPostsLimit}
                                    onChange={(e) => handleChange('jobPostsLimit', parseInt(e.target.value))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                                <div className="text-xs text-gray-500 mt-1">Currently used: {formData.jobPostsUsed}</div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Candidate Previews Limit</label>
                                <input
                                    type="number"
                                    value={formData.previewsLimit}
                                    onChange={(e) => handleChange('previewsLimit', parseInt(e.target.value))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                                <div className="text-xs text-gray-500 mt-1">Currently used: {formData.previewsUsed}</div>
                            </div>
                        </div>

                        {/* AI Access Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                            <div>
                                <div className="font-medium text-white">AI Features Access</div>
                                <div className="text-xs text-gray-400 mt-1">Enable or disable AI-powered features for this employer</div>
                            </div>
                            <button
                                onClick={() => handleChange('aiAccessEnabled', !formData.aiAccessEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${formData.aiAccessEnabled ? 'bg-neon-cyan' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.aiAccessEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Warning */}
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                            <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-xs text-yellow-200/80">
                                Changes to limits will take effect immediately. Ensure the employer is notified of any modifications.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 flex justify-end gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="btn-3d btn-primary px-8 py-2 flex items-center gap-2"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Job Management & Pricing
                    </h1>
                    <p className="text-gray-400">Manage subscription plans, pay-per-hire models, and global pricing logic.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                    <Globe size={16} className="text-neon-cyan" />
                    <span className="text-gray-300">Auto-Geo Pricing:</span>
                    <span className="text-green-400 font-bold">ACTIVE</span>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('plans')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'plans' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                >
                    <CreditCard size={16} className="inline-block mr-2 mb-0.5" />
                    Subscription Plans
                    {activeTab === 'plans' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
                </button>
                <button
                    onClick={() => setActiveTab('pph')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'pph' ? 'text-neon-cyan' : 'text-gray-400 hover:text-white'}`}
                >
                    <Briefcase size={16} className="inline-block mr-2 mb-0.5" />
                    Pay-Per-Hire (PPH)
                    {activeTab === 'pph' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" />}
                </button>
                <button
                    onClick={() => setActiveTab('employers')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'employers' ? 'text-neon-purple' : 'text-gray-400 hover:text-white'}`}
                >
                    <Users size={16} className="inline-block mr-2 mb-0.5" />
                    Employer Limits
                    {activeTab === 'employers' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple" />}
                </button>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {/* 1. Subscription Plans Builder */}
                {activeTab === 'plans' && (
                    <motion.div
                        key="plans"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-end">
                            <button
                                onClick={() => setEditingPlan(DEFAULT_PLAN)}
                                className="btn-3d btn-primary px-4 py-2 flex items-center gap-2 text-sm"
                            >
                                <Plus size={16} /> Create New Plan
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div key={plan.id} className={`p-6 rounded-xl glass border transition-all ${plan.isActive ? 'border-white/10' : 'border-red-500/30 opacity-75'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">{plan.name}</h3>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{plan.description}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="flex items-center gap-4 mb-6 p-3 bg-white/5 rounded-lg">
                                        <div className="flex-1 text-center border-r border-white/10">
                                            <div className="text-xs text-gray-400">India (INR)</div>
                                            <div className="text-lg font-bold text-white">₹{plan.priceINR}</div>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <div className="text-xs text-gray-400">Global (USD)</div>
                                            <div className="text-lg font-bold text-white">${plan.priceUSD}</div>
                                        </div>
                                    </div>

                                    {/* Key Limits Preview */}
                                    <div className="space-y-2 text-sm text-gray-300 mb-6">
                                        <div className="flex justify-between"><span>Job Posts</span><span className="font-bold text-white">{plan.jobPosts}</span></div>
                                        <div className="flex justify-between"><span>AI Features</span><span className="font-bold text-neon-cyan">{Object.keys(plan).filter(k => k.startsWith('ai') && (plan as any)[k]).length} Active</span></div>
                                        <div className="flex justify-between"><span>Duration</span><span className="font-bold text-white">{plan.duration}</span></div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => setEditingPlan(plan)}
                                            className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDuplicatePlan(plan)}
                                            className="p-2 rounded bg-white/5 hover:bg-white/10 text-blue-400 transition-colors"
                                            title="Duplicate"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            onClick={() => togglePlanStatus(plan.id)}
                                            className="p-2 rounded bg-white/5 hover:bg-white/10 text-yellow-400 transition-colors"
                                            title={plan.isActive ? "Deactivate" : "Activate"}
                                        >
                                            <Zap size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.id)}
                                            className="p-2 rounded bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 2. Pay-Per-Hire Config */}
                {activeTab === 'pph' && (
                    <motion.div
                        key="pph"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Layer 1: Salary-Based Pricing Slabs */}
                        <div className="p-6 rounded-xl glass border border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <DollarSign className="text-green-400" size={24} />
                                        Layer 1: Ready-Made Market Plan
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">Salary-based pricing shown automatically on HireGo AI website</p>
                                </div>
                                <button className="btn-3d btn-primary px-4 py-2 text-sm flex items-center gap-2">
                                    <Plus size={16} /> Add Slab
                                </button>
                            </div>

                            <div className="rounded-xl border border-white/10 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Salary Range (Monthly)</th>
                                            <th className="p-4">Pay-Per-Hire Fee</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {pphConfig.salarySlabs.map((slab) => (
                                            <tr key={slab.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-mono text-white">
                                                        ₹{slab.minSalary.toLocaleString()} – ₹{slab.maxSalary.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-green-400 text-lg">
                                                        ₹{slab.pphFee.toLocaleString()} per hire
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => setEditingSlab(slab)}
                                                        className="text-neon-cyan hover:underline text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-yellow-500/10">
                                            <td className="p-4 font-bold text-white">₹1,20,000+</td>
                                            <td className="p-4 font-bold text-yellow-400">Custom Pricing Only</td>
                                            <td className="p-4 text-right text-xs text-gray-500">Contact admin</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                                <CheckCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                                <div className="text-xs text-blue-200/80">
                                    <p className="font-bold mb-1">Automatic Calculation</p>
                                    <p>Pricing is automatically calculated based on salary entered by employer. Employers cannot change this pricing.</p>
                                </div>
                            </div>
                        </div>

                        {/* Layer 2: Payment Options */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Advance Payment */}
                            <div className="p-6 rounded-xl glass border border-green-500/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-lg bg-green-500/20">
                                        <CreditCard className="text-green-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Option A: Advance Payment</h3>
                                        <p className="text-xs text-gray-400">Employer pays before hiring</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <label className="text-sm text-gray-400 block mb-2">Discount Range (%)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={pphConfig.paymentOptions[0].discountMin}
                                                    onChange={(e) => {
                                                        const updated = [...pphConfig.paymentOptions];
                                                        updated[0].discountMin = parseInt(e.target.value);
                                                        setPphConfig({ ...pphConfig, paymentOptions: updated });
                                                    }}
                                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-center"
                                                />
                                                <div className="text-xs text-gray-500 mt-1 text-center">Min</div>
                                            </div>
                                            <span className="text-gray-500">to</span>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={pphConfig.paymentOptions[0].discountMax}
                                                    onChange={(e) => {
                                                        const updated = [...pphConfig.paymentOptions];
                                                        updated[0].discountMax = parseInt(e.target.value);
                                                        setPphConfig({ ...pphConfig, paymentOptions: updated });
                                                    }}
                                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-center"
                                                />
                                                <div className="text-xs text-gray-500 mt-1 text-center">Max</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle size={16} />
                                            <span>Price becomes cheaper</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle size={16} />
                                            <span>Customization allowed</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle size={16} />
                                            <span>Immediate processing</span>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                                        <div className="text-xs text-gray-400 mb-1">Example:</div>
                                        <div className="text-sm text-white">
                                            ₹8,000 hire → 10% discount = <span className="font-bold text-green-400">₹7,200 advance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Post Payment */}
                            <div className="p-6 rounded-xl glass border border-orange-500/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-lg bg-orange-500/20">
                                        <Calendar className="text-orange-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Option B: Pay After 30 Days</h3>
                                        <p className="text-xs text-gray-400">Employer pays after joining confirmation</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-white/5">
                                        <label className="text-sm text-gray-400 block mb-2">Payment Term (Days)</label>
                                        <input
                                            type="number"
                                            value={pphConfig.paymentOptions[1].paymentTermDays}
                                            onChange={(e) => {
                                                const updated = [...pphConfig.paymentOptions];
                                                updated[1].paymentTermDays = parseInt(e.target.value);
                                                setPphConfig({ ...pphConfig, paymentOptions: updated });
                                            }}
                                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-center text-2xl font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-orange-400">
                                            <X size={16} />
                                            <span>No discount</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-orange-400">
                                            <X size={16} />
                                            <span>No customization</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle size={16} />
                                            <span>Standard agreement required</span>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded bg-orange-500/10 border border-orange-500/20">
                                        <div className="text-xs text-gray-400 mb-1">Example:</div>
                                        <div className="text-sm text-white">
                                            ₹8,000 hire → <span className="font-bold text-orange-400">Full ₹8,000</span> after 30 days
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layer 3: Custom Corporate Plans */}
                        <div className="p-6 rounded-xl glass border border-purple-500/30">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Briefcase className="text-purple-400" size={24} />
                                        Layer 3: Custom Corporate Plans
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">For large companies with special requirements</p>
                                </div>
                                <button
                                    onClick={() => setEditingCustomPlan({
                                        id: Date.now().toString(),
                                        companyId: '',
                                        companyName: '',
                                        customPricePerHire: 0,
                                        paymentCycle: 'monthly',
                                        advancePercentage: 0,
                                        postPaymentPercentage: 100,
                                        replacementPeriodDays: 90,
                                        bulkDiscountTiers: [],
                                        specialTerms: '',
                                        isActive: true
                                    })}
                                    className="btn-3d btn-primary px-4 py-2 text-sm flex items-center gap-2"
                                >
                                    <Plus size={16} /> Create Custom Plan
                                </button>
                            </div>

                            {pphConfig.customPlans.length > 0 ? (
                                <div className="space-y-4">
                                    {pphConfig.customPlans.map((plan) => (
                                        <div key={plan.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-white text-lg">{plan.companyName}</h4>
                                                    <p className="text-sm text-gray-400">ID: {plan.companyId}</p>
                                                    <div className="mt-2 flex gap-4 text-sm">
                                                        <span className="text-gray-300">₹{plan.customPricePerHire.toLocaleString()}/hire</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-300 capitalize">{plan.paymentCycle}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-300">{plan.replacementPeriodDays} days replacement</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingCustomPlan(plan)}
                                                        className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm text-neon-cyan"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button className="px-3 py-1.5 rounded bg-white/5 hover:bg-red-500/20 text-sm text-red-400">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No custom corporate plans created yet.</p>
                                    <p className="text-sm mt-1">Create plans for large companies with special requirements.</p>
                                </div>
                            )}
                        </div>

                        {/* Global Settings */}
                        <div className="p-6 rounded-xl glass border border-white/10">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Settings className="text-gray-400" size={20} />
                                Global PPH Settings
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Default Advance Discount (%)</label>
                                    <input
                                        type="number"
                                        value={pphConfig.defaultAdvanceDiscount}
                                        onChange={(e) => setPphConfig({ ...pphConfig, defaultAdvanceDiscount: parseInt(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Replacement Period (Days)</label>
                                    <input
                                        type="number"
                                        value={pphConfig.replacementPeriodDays}
                                        onChange={(e) => setPphConfig({ ...pphConfig, replacementPeriodDays: parseInt(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button className="btn-3d btn-primary px-8 py-3 flex items-center gap-2">
                                <Save size={20} /> Save All PPH Configuration
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 3. Employer Limits & Management */}
                {activeTab === 'employers' && (
                    <motion.div
                        key="employers"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="p-4 rounded-xl glass border border-white/10 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search employer by name, email, or ID..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-neon-cyan transition-colors"
                                />
                            </div>
                            <button className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
                                <Filter size={20} /> Filter
                            </button>
                        </div>

                        <div className="rounded-xl glass border border-white/10 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="p-4">Employer</th>
                                        <th className="p-4">Model</th>
                                        <th className="p-4">Current Plan</th>
                                        <th className="p-4">Job Posts</th>
                                        <th className="p-4">Previews</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {employers.map((employer) => (
                                        <tr key={employer.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold">{employer.name}</div>
                                                <div className="text-xs text-gray-500">ID: {employer.id}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs border ${employer.pricingModel === 'pph'
                                                    ? 'bg-green-400/10 text-green-400 border-green-400/20'
                                                    : 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
                                                    }`}>
                                                    {employer.pricingModel === 'pph' ? 'Pay-Per-Hire' : 'Subscription'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded bg-neon-purple/10 text-neon-purple text-xs border border-neon-purple/20">
                                                    {employer.currentPlan}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-400"
                                                            style={{ width: `${(employer.jobPostsUsed / employer.jobPostsLimit) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs">{employer.jobPostsUsed}/{employer.jobPostsLimit}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-yellow-400"
                                                            style={{ width: `${(employer.previewsUsed / employer.previewsLimit) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs">{employer.previewsUsed}/{employer.previewsLimit}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setSelectedEmployer(employer)}
                                                    className="text-neon-cyan hover:underline text-sm"
                                                >
                                                    Manage Limits
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Plan Editor Modal */}
            <AnimatePresence>
                {editingPlan && (
                    <PlanEditor
                        plan={editingPlan}
                        onClose={() => setEditingPlan(null)}
                        onSave={handleSavePlan}
                    />
                )}
            </AnimatePresence>

            {/* Manage Limits Modal */}
            <AnimatePresence>
                {selectedEmployer && (
                    <ManageLimitsModal
                        employer={selectedEmployer}
                        onClose={() => setSelectedEmployer(null)}
                        onSave={async (updatedEmployer) => {
                            if (supabase) {
                                await supabase.from('users').update({
                                    job_posts_limit: updatedEmployer.jobPostsLimit,
                                    // Add other limit fields here
                                }).eq('id', updatedEmployer.id);
                            }
                            setEmployers(employers.map(e => e.id === updatedEmployer.id ? updatedEmployer : e));
                            setSelectedEmployer(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Edit Salary Slab Modal */}
            <AnimatePresence>
                {editingSlab && (
                    <EditSlabModal
                        slab={editingSlab}
                        onClose={() => setEditingSlab(null)}
                        onSave={async (updatedSlab) => {
                            if (supabase) {
                                const slabData = {
                                    min_salary: updatedSlab.minSalary,
                                    max_salary: updatedSlab.maxSalary,
                                    pph_fee: updatedSlab.pphFee,
                                    currency: updatedSlab.currency
                                };
                                if (updatedSlab.id && !updatedSlab.id.startsWith('slab')) { // Assuming 'slab' prefix for mock/new
                                    await supabase.from('salary_slabs').update(slabData).eq('id', updatedSlab.id);
                                } else {
                                    await supabase.from('salary_slabs').insert(slabData);
                                }
                            }
                            const updatedSlabs = pphConfig.salarySlabs.map(s => s.id === updatedSlab.id ? updatedSlab : s);
                            setPphConfig({ ...pphConfig, salarySlabs: updatedSlabs });
                            setEditingSlab(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Edit Custom Plan Modal */}
            <AnimatePresence>
                {editingCustomPlan && (
                    <EditCustomPlanModal
                        plan={editingCustomPlan}
                        onClose={() => setEditingCustomPlan(null)}
                        onSave={async (updatedPlan) => {
                            if (supabase) {
                                const planData = {
                                    company_name: updatedPlan.companyName,
                                    custom_price_per_hire: updatedPlan.customPricePerHire,
                                    // Add other fields
                                };
                                // Logic to update/insert custom plan
                            }
                            const existingIndex = pphConfig.customPlans.findIndex(p => p.id === updatedPlan.id);
                            let updatedPlans;
                            if (existingIndex >= 0) {
                                updatedPlans = pphConfig.customPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
                            } else {
                                updatedPlans = [...pphConfig.customPlans, updatedPlan];
                            }
                            setPphConfig({ ...pphConfig, customPlans: updatedPlans });
                            setEditingCustomPlan(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobPricingControl;
