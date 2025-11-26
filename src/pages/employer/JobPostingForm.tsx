import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase, MapPin, DollarSign, CheckCircle,
    ChevronRight, ChevronLeft, Calendar, Globe, User, Sparkles, Plus,
    CreditCard, Star, Award
} from "lucide-react";
import SearchableMultiSelect from "../../components/SearchableMultiSelect";

// HireGoAI – Premium Multi-Step Job Posting Wizard
// Features: Step-by-step navigation, high-contrast inputs, professional UI, Plan Selection.

export default function JobPostingForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<string>("free");

    const [form, setForm] = useState({
        // Step 1: Basics
        jobTitle: "",
        jobCategory: [] as string[],
        company: "",
        country: "",
        state: "",
        city: "",
        address: "",
        pincode: "",
        remoteType: "hybrid",
        jobType: "full_time",

        // Step 2: Role Details
        salaryMin: "",
        salaryMax: "",
        currency: "INR",
        experience: "",
        openings: 1,
        jobDescription: "",

        // Step 3: Requirements
        skills: [] as string[],
        education: "",
        workingHours: "",
        shiftType: "",

        // Step 4: Interview & Settings
        timezone: "Asia/Kolkata",
        autoSchedule: true,
        enableVirtualInterview: true,
        interviewSlots: [{ day: "Monday", start: "10:00", end: "12:00" }],
        services: {
            freePosting: true,
            payPerHire: false,
            subscription: false,
        },
        recruiterName: "",
        recruiterEmail: "",
    });

    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

    // Predefined Lists
    const jobCategories = [
        "Software Development", "Data Science", "Product Management", "Design",
        "Marketing", "Sales", "Human Resources", "Finance", "Customer Support",
        "DevOps", "Cybersecurity", "Blockchain", "AI/ML"
    ];

    const allSkills = [
        "React", "Node.js", "TypeScript", "Python", "Java", "C++", "AWS", "Docker",
        "Kubernetes", "Figma", "Adobe XD", "SEO", "Google Analytics", "CRM",
        "Agile", "Scrum", "Communication", "Leadership", "SQL", "MongoDB",
        "GraphQL", "Next.js", "Vue.js", "Angular", "Rust", "Go", "Terraform"
    ];

    // Skill Database for Auto-Suggestions
    const skillDatabase: Record<string, string[]> = {
        "developer": ["React", "Node.js", "TypeScript", "JavaScript", "MongoDB", "AWS", "Docker"],
        "designer": ["Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX", "Prototyping"],
        "manager": ["Leadership", "Agile", "Scrum", "Communication", "Project Management", "JIRA"],
        "marketing": ["SEO", "Content Marketing", "Google Analytics", "Social Media", "Copywriting"],
        "sales": ["CRM", "Negotiation", "Lead Generation", "Cold Calling", "Communication"],
        "hr": ["Recruiting", "Employee Relations", "Onboarding", "HRIS", "Compliance"],
        "data": ["Python", "SQL", "Machine Learning", "Tableau", "Data Analysis", "Pandas"],
    };

    // Update Suggested Skills when Job Title changes
    useEffect(() => {
        if (!form.jobTitle) {
            setSuggestedSkills([]);
            return;
        }
        const lowerTitle = form.jobTitle.toLowerCase();
        let matches: string[] = [];

        Object.keys(skillDatabase).forEach(key => {
            if (lowerTitle.includes(key)) {
                matches = [...matches, ...skillDatabase[key]];
            }
        });

        if (matches.length === 0 && lowerTitle.length > 3) {
            matches = ["Communication", "Teamwork", "Problem Solving"];
        }

        setSuggestedSkills([...new Set(matches)]);
    }, [form.jobTitle]);

    // Navigation Handlers
    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    // Form Update Handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === "checkbox") {
            if (name.startsWith("services.")) {
                const key = name.split(".")[1];
                // @ts-ignore
                setForm((s) => ({ ...s, services: { ...s.services, [key]: checked } }));
            } else if (name === "autoSchedule" || name === "enableVirtualInterview") {
                setForm((s) => ({ ...s, [name]: checked }));
            }
        } else {
            setForm((s) => ({ ...s, [name]: value }));
        }
    };

    const handleMultiSelectChange = (field: string, value: string[]) => {
        setForm(s => ({ ...s, [field]: value }));
    };

    const addSkill = (skill: string) => {
        setForm(prev => {
            const currentSkills = prev.skills;
            if (!currentSkills.includes(skill)) {
                return { ...prev, skills: [...currentSkills, skill] };
            }
            return prev;
        });
    };

    const handleAiGenerate = () => {
        const aiText = `Role Summary:\nWe are looking for a talented ${form.jobTitle || "Professional"} to join our team at ${form.company || "our company"}. You will be responsible for driving innovation and delivering high-quality results.\n\nKey Responsibilities:\n- Collaborate with cross-functional teams to define, design, and ship new features.\n- Ensure the performance, quality, and responsiveness of applications.\n- Identify and correct bottlenecks and fix bugs.\n\nRequirements:\n- Proven experience in the relevant field.\n- Strong problem-solving skills and attention to detail.\n- Excellent communication and teamwork abilities.`;
        setForm(s => ({ ...s, jobDescription: aiText }));
    };

    // Steps Configuration
    const steps = [
        { id: 1, title: "Job Basics", icon: Briefcase },
        { id: 2, title: "Role & Pay", icon: DollarSign },
        { id: 3, title: "Requirements", icon: CheckCircle },
        { id: 4, title: "Interview", icon: Calendar },
        { id: 5, title: "Select Plan", icon: CreditCard },
    ];

    // Plans Data
    const plans = [
        { id: "free", price: "₹0", name: "FREE PLAN", duration: "24 Hours", features: ["25 Applicants", "10 Database Access", "Auto-screening", "Auto-shortlisting"] },
        { id: "1day", price: "₹499", name: "1 Day Plan", duration: "24 Hours", features: ["20 Applicants", "10 Database Access", "Auto-screening"] },
        { id: "3day", price: "₹999", name: "3 Days Plan", duration: "3 Days", features: ["Auto-screening", "Auto-shortlisting", "Interview Scheduling"] },
        { id: "7day", price: "₹1599", name: "7 Days Plan", duration: "7 Days", features: ["All Features Included (A-Z)"] },
        { id: "15day", price: "₹2499", name: "15 Days Plan", duration: "15 Days", features: ["All Features + Extended Duration"] },
    ];

    // Render Step Content
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Senior Product Designer" icon={<Briefcase size={16} />} />
                            <SearchableMultiSelect
                                label="Job Category"
                                placeholder="Search categories..."
                                options={jobCategories}
                                selected={form.jobCategory}
                                onChange={(val) => handleMultiSelectChange('jobCategory', val)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Company Name" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Acme Corp" icon={<Globe size={16} />} />
                            <InputGroup label="Country" name="country" value={form.country} onChange={handleChange} placeholder="e.g. India" icon={<Globe size={16} />} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="State / Province" name="state" value={form.state} onChange={handleChange} placeholder="e.g. Karnataka" icon={<MapPin size={16} />} />
                            <InputGroup label="City" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Bangalore" icon={<MapPin size={16} />} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Local Address / Area" name="address" value={form.address} onChange={handleChange} placeholder="e.g. HSR Layout, Sector 4" icon={<MapPin size={16} />} />
                            <InputGroup label="Zip / Postal Code" name="pincode" value={form.pincode} onChange={handleChange} placeholder="e.g. 560102" icon={<MapPin size={16} />} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectGroup label="Work Mode" name="remoteType" value={form.remoteType} onChange={handleChange} options={[
                                { value: "remote", label: "Remote" },
                                { value: "hybrid", label: "Hybrid" },
                                { value: "onsite", label: "Onsite" }
                            ]} />
                            <SelectGroup label="Job Type" name="jobType" value={form.jobType} onChange={handleChange} options={[
                                { value: "full_time", label: "Full-time" },
                                { value: "part_time", label: "Part-time" },
                                { value: "contract", label: "Contract" },
                                { value: "internship", label: "Internship" }
                            ]} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputGroup label="Min Salary" name="salaryMin" value={form.salaryMin} onChange={handleChange} placeholder="0" />
                            <InputGroup label="Max Salary" name="salaryMax" value={form.salaryMax} onChange={handleChange} placeholder="0" />
                            <SelectGroup label="Currency" name="currency" value={form.currency} onChange={handleChange} options={[
                                { value: "INR", label: "INR (₹)" },
                                { value: "USD", label: "USD ($)" },
                                { value: "EUR", label: "EUR (€)" }
                            ]} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectGroup label="Experience Required" name="experience" value={form.experience} onChange={handleChange} options={[
                                { value: "fresher", label: "Fresher" },
                                { value: "1-3", label: "1–3 Years" },
                                { value: "3-5", label: "3–5 Years" },
                                { value: "5-10", label: "5–10 Years" },
                                { value: "10+", label: "10+ Years" }
                            ]} />
                            <InputGroup label="Openings" type="number" name="openings" value={form.openings} onChange={handleChange} />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="block text-sm font-semibold text-[var(--text-primary)]">Job Description</label>
                                <button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-md transition-all transform hover:scale-105"
                                >
                                    <Sparkles size={16} /> AI Generate JD
                                </button>
                            </div>
                            <div className="bg-[var(--input-bg)] rounded-xl overflow-hidden text-[var(--text-primary)] border border-[var(--input-border)] shadow-inner">
                                <textarea
                                    name="jobDescription"
                                    value={form.jobDescription}
                                    onChange={handleChange}
                                    className="w-full h-96 p-6 bg-transparent text-lg text-[var(--text-primary)] focus:outline-none resize-none font-sans placeholder-gray-500 leading-relaxed"
                                    placeholder="Job description will appear here..."
                                />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <SearchableMultiSelect
                                label="Required Skills"
                                placeholder="Search skills..."
                                options={allSkills}
                                selected={form.skills}
                                onChange={(val) => handleMultiSelectChange('skills', val)}
                            />

                            {/* Auto-Suggested Skills */}
                            {suggestedSkills.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                                        <Sparkles size={12} className="text-yellow-500" /> Suggested for {form.jobTitle}:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedSkills.map((skill) => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => addSkill(skill)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                <Plus size={10} /> {skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectGroup label="Education" name="education" value={form.education} onChange={handleChange} options={[
                                { value: "10th", label: "High School" },
                                { value: "ug", label: "Undergraduate" },
                                { value: "graduate", label: "Graduate" },
                                { value: "pg", label: "Post-Graduate" }
                            ]} />
                            <InputGroup label="Working Hours" name="workingHours" value={form.workingHours} onChange={handleChange} placeholder="e.g. 9 AM - 6 PM" />
                        </div>
                        <SelectGroup label="Shift Type" name="shiftType" value={form.shiftType} onChange={handleChange} options={[
                            { value: "day", label: "Day Shift" },
                            { value: "night", label: "Night Shift" },
                            { value: "flex", label: "Flexible" }
                        ]} />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-inner">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                                <Globe size={18} /> Interview Settings
                            </h3>
                            <div className="space-y-4">
                                <Toggle label="Automatic Interview Scheduling" checked={form.autoSchedule} onChange={() => setForm(s => ({ ...s, autoSchedule: !s.autoSchedule }))} />
                                <Toggle label="Enable Virtual Interviews" checked={form.enableVirtualInterview} onChange={() => setForm(s => ({ ...s, enableVirtualInterview: !s.enableVirtualInterview }))} />
                            </div>
                        </div>

                        <SelectGroup label="Timezone" name="timezone" value={form.timezone} onChange={handleChange} options={[
                            { value: "Asia/Kolkata", label: "India (IST)" },
                            { value: "America/New_York", label: "New York (EST)" },
                            { value: "Europe/London", label: "London (GMT)" },
                            { value: "Asia/Dubai", label: "Dubai (GST)" },
                            { value: "Australia/Sydney", label: "Sydney (AEST)" },
                            { value: "America/Los_Angeles", label: "Los Angeles (PST)" }
                        ]} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Recruiter Name" name="recruiterName" value={form.recruiterName} onChange={handleChange} icon={<User size={16} />} />
                            <InputGroup label="Recruiter Email" name="recruiterEmail" value={form.recruiterEmail} onChange={handleChange} />
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Select a Plan</h2>
                            <p className="text-gray-400">Choose the best plan to boost your hiring process.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedPlan === plan.id ? 'border-green-500 bg-green-500/10 shadow-xl scale-105' : 'border-gray-700 bg-[#0f172a] hover:border-gray-500 hover:shadow-md'}`}
                                >
                                    {selectedPlan === plan.id && (
                                        <div className="absolute -top-3 -right-3 bg-green-500 text-white p-1 rounded-full shadow-md">
                                            <CheckCircle size={20} />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                                            <p className="text-sm text-gray-400">{plan.duration}</p>
                                        </div>
                                        <span className="text-xl font-bold text-green-400">{plan.price}</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-500" /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Custom & Pay Per Hire Cards */}
                            <div
                                onClick={() => setSelectedPlan("custom")}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-center items-center text-center ${selectedPlan === "custom" ? 'border-blue-500 bg-blue-500/10 shadow-xl scale-105' : 'border-gray-700 bg-[#0f172a] hover:border-gray-500 hover:shadow-md'}`}
                            >
                                <Star className="text-blue-500 mb-3" size={32} />
                                <h3 className="font-bold text-lg text-white">Custom Plan</h3>
                                <p className="text-sm text-gray-400 mt-2">Our sales team will contact you for a personalized plan.</p>
                            </div>

                            <div
                                onClick={() => setSelectedPlan("pay-per-hire")}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-center items-center text-center ${selectedPlan === "pay-per-hire" ? 'border-purple-500 bg-purple-500/10 shadow-xl scale-105' : 'border-gray-700 bg-[#0f172a] hover:border-gray-500 hover:shadow-md'}`}
                            >
                                <Award className="text-purple-500 mb-3" size={32} />
                                <h3 className="font-bold text-lg text-white">Pay-Per-Hire</h3>
                                <p className="text-sm text-gray-400 mt-2">We handle hiring end-to-end and charge per successful placement.</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] p-4 md:p-8 flex justify-center items-start font-sans pt-4">
            <div className="w-full max-w-7xl">
                {/* Stepper - Compact & Centered */}
                <div className="flex justify-center items-center mb-10 relative max-w-4xl mx-auto px-4">
                    {/* Background Line */}
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-800 -z-10 rounded-full"></div>

                    {/* Active Progress Line */}
                    <div
                        className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out -z-10 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    <div className="flex justify-between w-full">
                        {steps.map((step) => {
                            const isActive = currentStep >= step.id;
                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center gap-3 cursor-pointer relative group"
                                    onClick={() => setCurrentStep(step.id)}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-[0_0_20px_rgba(124,58,237,0.6)] scale-110'
                                        : 'bg-[#1e293b] border-gray-700 text-gray-500 group-hover:border-gray-500 group-hover:text-gray-300'
                                        }`}>
                                        <step.icon size={20} className={isActive ? 'drop-shadow-md' : ''} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-gray-600'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Card - Expanded & Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[#1e293b]/80 backdrop-blur-xl border border-gray-700 rounded-3xl shadow-2xl p-6 md:p-10 min-h-[700px] w-full relative overflow-hidden"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Navigation - Centered & Lower */}
                    <div className="flex flex-col items-center mt-12 pt-8 border-t border-gray-700">
                        <div className="flex gap-6 w-full justify-center">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-800 text-gray-400'}`}
                            >
                                <ChevronLeft size={20} /> Back
                            </button>

                            {currentStep < 5 ? (
                                <button
                                    onClick={nextStep}
                                    className="btn-3d btn-primary flex items-center gap-2 px-10 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all bg-white text-black font-bold tracking-wide"
                                >
                                    Next Step <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => alert(`Job Posted with ${selectedPlan} plan!`)}
                                    className="btn-3d flex items-center gap-2 px-10 py-3 rounded-full shadow-lg hover:shadow-xl bg-green-600 hover:bg-green-700 text-white font-bold tracking-wide border-none transform hover:-translate-y-1 transition-all"
                                >
                                    Proceed to Pay <CheckCircle size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// --- Reusable Components for Consistency & Visibility ---

const InputGroup = ({ label, icon, small, ...props }: any) => (
    <div className="space-y-2">
        <label className={`block font-bold text-gray-300 ${small ? 'text-xs' : 'text-sm'}`}>{label}</label>
        <div className="relative group">
            {icon && <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors ${small ? 'scale-90' : ''}`}>{icon}</div>}
            <input
                {...props}
                className={`w-full rounded-xl bg-[#0f172a] border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent transition-all outline-none shadow-inner group-hover:shadow-md ${icon ? 'pl-11' : 'pl-4'} ${small ? 'h-10 text-sm' : 'h-12'}`}
            />
        </div>
    </div>
);

const SelectGroup = ({ label, options, ...props }: any) => (
    <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-300">{label}</label>
        <div className="relative group">
            <select
                {...props}
                className="w-full h-12 rounded-xl bg-[#0f172a] border border-gray-700 text-white focus:ring-2 focus:ring-white focus:border-transparent transition-all outline-none shadow-inner group-hover:shadow-md appearance-none pl-4 pr-10 cursor-pointer"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-white py-2">
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-white">
                <ChevronRight size={16} className="rotate-90" />
            </div>
        </div>
    </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-gray-700 h-16 shadow-inner hover:shadow-md transition-shadow">
        <span className="font-bold text-gray-300">{label}</span>
        <button
            onClick={onChange}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);
