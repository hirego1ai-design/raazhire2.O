import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import {
    Briefcase, MapPin, DollarSign, CheckCircle,
    ChevronRight, ChevronLeft, Calendar, Globe, User, Sparkles, Plus,
    CreditCard, Star, Award, X, Loader, GraduationCap
} from "lucide-react";
import SearchableMultiSelect from "../../components/SearchableMultiSelect";
import RichTextEditor from '../../components/RichTextEditor';
import { endpoints, API_BASE_URL } from '../../lib/api';

// HireGoAI – Premium Multi-Step Job Posting Wizard
// Features: Step-by-step navigation, high-contrast inputs, professional UI, Plan Selection.

// Rich Text Editor is now using the secure built-in RichTextEditor component

export default function JobPostingForm() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<string>("pay-per-hire");
    const [draftId, setDraftId] = useState<string | null>(null);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [form, setForm] = useState({
        // Step 1: Basics
        jobTitle: "",
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
        educationLevel: [] as string[],
        fieldOfStudy: [] as string[],
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
    const [aiGeneratedSkills, setAiGeneratedSkills] = useState<string[]>([]);
    const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);
    const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
    const [isLoadingSkills, setIsLoadingSkills] = useState(false);
    const [showAddJobTitle, setShowAddJobTitle] = useState(false);
    const [jobTitleDictionary, setJobTitleDictionary] = useState<string[]>([]);

    // Load job titles from database on mount
    useEffect(() => {
        loadJobTitles();
        loadDraftFromLocalStorage();
    }, []);

    // Auto-save draft every 30 seconds when form has content
    useEffect(() => {
        const hasContent = form.jobTitle || form.company || form.skills.length > 0;
        if (hasContent) {
            const autoSaveInterval = setInterval(() => {
                saveDraft(true);
            }, 30000); // 30 seconds
            return () => clearInterval(autoSaveInterval);
        }
    }, [form]);

    const loadDraftFromLocalStorage = () => {
        try {
            const savedDraft = localStorage.getItem('jobPostingDraft');
            if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                const shouldLoad = window.confirm(
                    '📋 A saved draft was found! Do you want to continue from where you left off?'
                );

                if (shouldLoad) {
                    setForm(draft.formData);
                    setCurrentStep(draft.currentStep || 1);
                    setSelectedPlan(draft.selectedPlan || 'pay-per-hire');
                    setDraftId(draft.id);
                    setLastSaved(new Date(draft.savedAt));
                } else {
                    // User chose to start fresh
                    localStorage.removeItem('jobPostingDraft');
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    };

    const saveDraft = async (autoSave = false) => {
        setIsSavingDraft(true);
        try {
            const draftData = {
                id: draftId || `draft_${Date.now()}`,
                formData: form,
                currentStep,
                selectedPlan,
                savedAt: new Date().toISOString(),
                status: 'draft'
            };

            // Save to localStorage
            localStorage.setItem('jobPostingDraft', JSON.stringify(draftData));
            setDraftId(draftData.id);
            setLastSaved(new Date());

            if (!autoSave) {
                alert('✅ Draft saved successfully!');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            if (!autoSave) {
                alert('❌ Failed to save draft');
            }
        } finally {
            setIsSavingDraft(false);
        }
    };

    const clearDraft = () => {
        localStorage.removeItem('jobPostingDraft');
        setDraftId(null);
        setLastSaved(null);
    };

    const loadJobTitles = async () => {
        try {
            // Try to fetch from backend
            const response = await fetch(`${API_BASE_URL}/api/ai/job-titles`);
            if (response.ok) {
                const data = await response.json();
                setJobTitleDictionary(data.titles || getDefaultJobTitles());
            } else {
                setJobTitleDictionary(getDefaultJobTitles());
            }
        } catch (error) {
            console.error('Error loading job titles:', error);
            setJobTitleDictionary(getDefaultJobTitles());
        }
    };

    const getDefaultJobTitles = () => [
        // Technology & Software
        "Software Engineer", "Senior Software Engineer", "Lead Software Engineer", "Principal Software Engineer",
        "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "Mobile App Developer", "iOS Developer", "Android Developer", "React Native Developer", "Flutter Developer",
        "DevOps Engineer", "Site Reliability Engineer", "Cloud Engineer", "Infrastructure Engineer",
        "Data Scientist", "Data Analyst", "Data Engineer", "Machine Learning Engineer", "AI Engineer",
        "QA Engineer", "Test Engineer", "Automation Engineer", "Quality Assurance Lead",
        "Solution Architect", "Software Architect", "Technical Architect", "Enterprise Architect",
        "Security Engineer", "Cybersecurity Analyst", "Information Security Specialist",
        "Database Administrator", "Database Developer", "SQL Developer",
        "UI/UX Designer", "Product Designer", "Graphic Designer", "Visual Designer", "Interaction Designer",
        "Technical Lead", "Engineering Manager", "Director of Engineering", "VP Engineering", "CTO",

        // Product & Management
        "Product Manager", "Senior Product Manager", "Product Owner", "Product Lead", "Chief Product Officer",
        "Project Manager", "Program Manager", "Scrum Master", "Agile Coach",
        "Business Analyst", "Business Intelligence Analyst", "Systems Analyst",
        "Technical Project Manager", "IT Project Manager",

        // Sales & Marketing
        "Marketing Manager", "Digital Marketing Manager", "Content Marketing Manager",
        "Social Media Manager", "Brand Manager", "Marketing Specialist",
        "SEO Specialist", "SEM Specialist", "Growth Hacker", "Performance Marketer",
        "Sales Manager", "Sales Executive", "Business Development Manager", "Account Manager",
        "Sales Representative", "Inside Sales Representative", "Field Sales Representative",
        "Customer Success Manager", "Account Executive", "Sales Engineer",

        // Finance & Accounting
        "Accountant", "Senior Accountant", "Staff Accountant", "Cost Accountant",
        "Financial Analyst", "Investment Analyst", "Budget Analyst",
        "Finance Manager", "Controller", "CFO", "Finance Director",
        "Auditor", "Internal Auditor", "External Auditor",
        "Tax Consultant", "Tax Specialist", "Payroll Specialist",

        // Human Resources
        "HR Manager", "HR Business Partner", "HR Generalist", "HR Specialist",
        "Recruiter", "Technical Recruiter", "Talent Acquisition Specialist",
        "Training Manager", "Learning & Development Manager",
        "Compensation & Benefits Manager", "Employee Relations Manager",

        // Operations
        "Operations Manager", "Operations Analyst", "Operations Coordinator",
        "Supply Chain Manager", "Logistics Manager", "Warehouse Manager",
        "Procurement Manager", "Purchasing Manager",
        "Administrative Assistant", "Office Manager", "Executive Assistant",

        // Customer Service
        "Customer Service Representative", "Customer Support Specialist",
        "Technical Support Engineer", "Help Desk Technician",
        "Customer Experience Manager", "Support Team Lead",

        // Design & Creative
        "Creative Director", "Art Director", "Design Lead",
        "Motion Graphics Designer", "Video Editor", "Animator",
        "Content Writer", "Copywriter", "Technical Writer", "Content Strategist",
        "Photographer", "Videographer", "Multimedia Specialist",

        // Healthcare & Medical
        "Software Developer - Healthcare", "Healthcare Data Analyst",
        "Medical Billing Specialist", "Healthcare Administrator",

        // Education & Training
        "Corporate Trainer", "Training Specialist", "Instructional Designer",
        "Educational Content Developer",

        // Legal & Compliance
        "Legal Counsel", "Corporate Lawyer", "Compliance Officer",
        "Legal Assistant", "Paralegal",

        // Consulting
        "Management Consultant", "Business Consultant", "IT Consultant",
        "Strategy Consultant", "Financial Consultant",

        // Research & Development
        "Research Scientist", "R&D Engineer", "Research Analyst",
        "Innovation Manager", "Product Development Engineer",

        // Specialized Tech Roles
        "Blockchain Developer", "Smart Contract Developer", "Web3 Developer",
        "Game Developer", "Unity Developer", "Unreal Engine Developer",
        "Embedded Systems Engineer", "Firmware Engineer", "Hardware Engineer",
        "Network Engineer", "Network Administrator", "Systems Administrator",
        "Salesforce Developer", "Salesforce Administrator", "Salesforce Consultant",
        "SAP Consultant", "Oracle Developer", "ERP Specialist",
    ];

    const allSkills = [
        "React", "Node.js", "TypeScript", "Python", "Java", "C++", "AWS", "Docker",
        "Kubernetes", "Figma", "Adobe XD", "SEO", "Google Analytics", "CRM",
        "Agile", "Scrum", "Communication", "Leadership", "SQL", "MongoDB",
        "GraphQL", "Next.js", "Vue.js", "Angular", "Rust", "Go", "Terraform",
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
        "Git", "CI/CD", "Jenkins", "Azure", "GCP", "Linux", "Bash", "Shell Scripting",
        // Design Skills
        "UI Design", "UX Design", "Prototyping", "Wireframing", "User Research", "Design Systems",
        "Illustrator", "Photoshop", "Sketch", "InVision", "Adobe Creative Suite",
        // Marketing Skills
        "Digital Marketing", "Content Marketing", "Social Media Marketing", "Email Marketing",
        "Marketing Analytics", "Brand Strategy", "Copywriting", "Campaign Management",
        // Sales Skills
        "Sales Strategy", "Negotiation", "Lead Generation", "Account Management", "B2B Sales",
        "Customer Relations", "Pipeline Management", "Cold Calling", "Sales Forecasting",
        // Data Skills
        "Data Analysis", "Data Visualization", "Tableau", "Power BI", "Excel", "R", "Statistics",
        "Big Data", "ETL", "Data Warehousing", "Spark", "Hadoop",
        // Product Management
        "Product Strategy", "Roadmapping", "User Stories", "Stakeholder Management", "Market Research",
        "A/B Testing", "Product Analytics", "Feature Prioritization", "Competitive Analysis",
        // HR Skills
        "Recruiting", "Talent Acquisition", "Employee Relations", "HRIS", "Performance Management",
        "Onboarding", "Compliance", "Compensation & Benefits", "Organizational Development"
    ];

    const educationLevels = [
        "High School", "Diploma",
        "Undergraduate (B.Tech)", "Undergraduate (B.E.)", "Undergraduate (B.A.)", "Undergraduate (B.Sc.)", "Undergraduate (B.Com)", "Undergraduate (BBA)",
        "Postgraduate (M.Tech)", "Postgraduate (M.E.)", "Postgraduate (M.A.)", "Postgraduate (M.Sc.)", "Postgraduate (MBA)", "Postgraduate (MCA)",
        "Doctorate (Ph.D.)", "Any Graduate", "Any Postgraduate"
    ];

    const fieldsOfStudy = [
        "Computer Science", "Information Technology", "Electronics", "Electrical Engineering", "Mechanical Engineering",
        "Civil Engineering", "Chemical Engineering", "Biotechnology",
        "Marketing", "Finance", "Human Resources", "Operations Management", "Business Administration",
        "Economics", "Mathematics", "Statistics", "Physics", "Chemistry", "Biology",
        "English", "History", "Political Science", "Psychology", "Sociology",
        "Graphic Design", "Fine Arts", "Mass Communication", "Journalism",
        "Any Field", "Science Background", "Commerce Background", "Arts Background"
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

    // Update Suggested Skills when Job Title changes - AI-powered
    useEffect(() => {
        if (!form.jobTitle) {
            setSuggestedSkills([]);
            setAiGeneratedSkills([]);
            return;
        }

        // First check local database
        const lowerTitle = form.jobTitle.toLowerCase();
        let matches: string[] = [];

        Object.keys(skillDatabase).forEach(key => {
            if (lowerTitle.includes(key)) {
                matches = [...matches, ...skillDatabase[key]];
            }
        });

        setSuggestedSkills([...new Set(matches)]);

        // Then fetch AI-generated skills
        if (form.jobTitle.length > 3) {
            fetchAiSkills(form.jobTitle);
        }
    }, [form.jobTitle]);

    const fetchAiSkills = async (jobTitle: string) => {
        setIsLoadingSkills(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/skills/suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle })
            });

            if (response.ok) {
                const data = await response.json();
                setAiGeneratedSkills(data.skills || []);
            }
        } catch (error) {
            console.error('Error fetching AI skills:', error);
        } finally {
            setIsLoadingSkills(false);
        }
    };

    // Job Title Autocomplete
    useEffect(() => {
        if (form.jobTitle.length >= 2) {
            const filtered = jobTitleDictionary.filter(title =>
                title.toLowerCase().includes(form.jobTitle.toLowerCase())
            );
            setJobTitleSuggestions(filtered.slice(0, 10)); // Show top 10 matches

            // Check if exact match exists
            const exactMatch = jobTitleDictionary.some(title =>
                title.toLowerCase() === form.jobTitle.toLowerCase()
            );
            setShowAddJobTitle(!exactMatch && filtered.length === 0 && form.jobTitle.length > 3);
            setShowJobTitleDropdown(filtered.length > 0);
        } else {
            setJobTitleSuggestions([]);
            setShowJobTitleDropdown(false);
            setShowAddJobTitle(false);
        }
    }, [form.jobTitle, jobTitleDictionary]);

    const handleAddNewJobTitle = async () => {
        if (!form.jobTitle) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/job-titles/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: form.jobTitle })
            });

            if (response.ok) {
                setJobTitleDictionary(prev => [...prev, form.jobTitle]);
                setShowAddJobTitle(false);
                alert(`✅ "${form.jobTitle}" has been added successfully!`);
                // Auto-fetch skills for new job title
                fetchAiSkills(form.jobTitle);
            } else {
                // Even if server fails, add it locally
                setJobTitleDictionary(prev => [...prev, form.jobTitle]);
                setShowAddJobTitle(false);
                alert(`✅ "${form.jobTitle}" has been added!`);
                fetchAiSkills(form.jobTitle);
            }
        } catch (error) {
            console.error('Error adding job title:', error);
            // Add locally even if network fails
            setJobTitleDictionary(prev => [...prev, form.jobTitle]);
            setShowAddJobTitle(false);
            alert(`✅ "${form.jobTitle}" has been added!`);
            fetchAiSkills(form.jobTitle);
        }
    };

    // Navigation Handlers
    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
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

    const selectJobTitle = (title: string) => {
        setForm(s => ({ ...s, jobTitle: title }));
        setShowJobTitleDropdown(false);
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

    const removeSkill = (skill: string) => {
        setForm(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, skill: string) => {
        e.dataTransfer.setData('skill', skill);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const skill = e.dataTransfer.getData('skill');
        if (skill) {
            addSkill(skill);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleAiGenerate = async () => {
        setIsLoadingSkills(true);
        try {
            // Try to generate with AI
            const response = await fetch(`${API_BASE_URL}/api/ai/job-description/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle: form.jobTitle,
                    company: form.company,
                    skills: form.skills,
                    experience: form.experience
                })
            });

            if (response.ok) {
                const data = await response.json();
                setForm(s => ({ ...s, jobDescription: data.description }));
            } else {
                // Fallback to template
                generateFallbackDescription();
            }
        } catch (error) {
            console.error('AI JD generation error:', error);
            generateFallbackDescription();
        } finally {
            setIsLoadingSkills(false);
        }
    };

    const generateFallbackDescription = () => {
        const aiText = `<h2><strong>Role Summary</strong></h2><p>We are looking for a talented <strong>${form.jobTitle || "Professional"}</strong> to join our team at <strong>${form.company || "our company"}</strong>. You will be responsible for driving innovation and delivering high-quality results.</p><br/><h3><strong>Key Responsibilities:</strong></h3><ul><li>Collaborate with cross-functional teams to define, design, and ship new features</li><li>Ensure the performance, quality, and responsiveness of applications</li><li>Identify and correct bottlenecks and fix bugs</li><li>Participate in code reviews and contribute to team knowledge sharing</li></ul><br/><h3><strong>Requirements:</strong></h3><ul><li>Proven experience in the relevant field</li><li>Strong problem-solving skills and attention to detail</li><li>Excellent communication and teamwork abilities</li>${form.skills.length > 0 ? `<li>Proficiency in: <strong>${form.skills.slice(0, 5).join(', ')}</strong></li>` : ''}</ul><br/><h3><strong>What We Offer:</strong></h3><ul><li>Competitive salary and benefits package</li><li>Flexible working hours and remote options</li><li>Professional development opportunities</li><li>Collaborative and innovative work environment</li></ul>`;
        setForm(s => ({ ...s, jobDescription: aiText }));
    };

    // Steps Configuration
    const steps = [
        { id: 1, title: "Job Basics", icon: Briefcase },
        { id: 2, title: "Role & Pay", icon: DollarSign },
        { id: 3, title: "Requirements", icon: CheckCircle },
        { id: 4, title: "Interview", icon: Calendar },
        { id: 5, title: "Preview", icon: CheckCircle },
        { id: 6, title: "Select Plan", icon: CreditCard },
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
                        <div className="grid grid-cols-1 gap-6">
                            {/* Job Title with Autocomplete */}
                            <div className="relative">
                                <InputGroup
                                    label="Job Title"
                                    name="jobTitle"
                                    value={form.jobTitle}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Product Designer"
                                    icon={<Briefcase size={16} />}
                                    onFocus={() => form.jobTitle.length >= 2 && setShowJobTitleDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowJobTitleDropdown(false), 200)}
                                />
                                {/* Autocomplete Dropdown */}
                                {showJobTitleDropdown && jobTitleSuggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                        {jobTitleSuggestions.map((title, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => selectJobTitle(title)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-600/10 text-[var(--text-main)] border-b border-[var(--border-subtle)] last:border-b-0 transition-colors font-bold text-xs"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Briefcase size={14} className="text-indigo-600" />
                                                    <span>{title}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {/* Add New Job Title Button */}
                                {showAddJobTitle && (
                                    <div className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-indigo-600/30 rounded-xl shadow-2xl p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">New Title detected. Add "{form.jobTitle}"?</span>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleAddNewJobTitle();
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                                            >
                                                <Plus size={14} /> Add Title
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                { value: "internship", label: "Internship" },
                                { value: "freelance", label: "Freelancer" }
                            ]} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputGroup label="Min Salary" name="salaryMin" type="number" min="1" value={form.salaryMin} onChange={handleChange} placeholder="1" />
                            <InputGroup label="Max Salary" name="salaryMax" type="number" min="1" value={form.salaryMax} onChange={handleChange} placeholder="1" />
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
                            <InputGroup label="Openings" type="number" min="1" name="openings" value={form.openings} onChange={handleChange} />
                        </div>

                        <div className="flex justify-between items-end">
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Job Description</label>
                            <button
                                type="button"
                                onClick={handleAiGenerate}
                                disabled={isLoadingSkills}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {isLoadingSkills ? (
                                    <Loader className="animate-spin" size={14} />
                                ) : (
                                    <Sparkles size={14} />
                                )}
                                {isLoadingSkills ? 'Generating...' : 'AI Generate JD'}
                            </button>
                        </div>

                        {/* Rich Text Editor - SaaS Style */}
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[22px] blur opacity-50" />
                            <div className="relative bg-[var(--bg-surface)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-sm focus-within:border-indigo-600/50 transition-all">
                                <div className="p-1">
                                    <div className="rich-text-editor-wrapper bg-[var(--bg-page)]/50 rounded-xl">
                                        <RichTextEditor
                                            value={form.jobDescription}
                                            onChange={(content) => setForm(s => ({ ...s, jobDescription: content }))}
                                            placeholder="Start typing or click 'AI Generate JD' to create a professional job description..."
                                            className="job-description-editor"
                                            style={{ height: '400px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        {/* Selected Skills - Drop Zone */}
                        <div className="space-y-3 p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl min-h-[140px]">
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={14} className="text-indigo-600" />
                                Required Skills
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {form.skills.length === 0 ? (
                                    <p className="text-[var(--text-muted)] text-xs py-4 font-medium italic">Drop skills here or select from suggestions below...</p>
                                ) : (
                                    form.skills.map((skill) => (
                                        <div
                                            key={skill}
                                            className="px-4 py-2 rounded-xl bg-[var(--bg-page)] border border-indigo-600/20 text-[var(--text-main)] text-xs font-bold flex items-center gap-3 group hover:border-indigo-600/40 transition-all"
                                        >
                                            <span>{skill}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* AI-Suggested Skills */}
                        {isLoadingSkills && (
                            <div className="flex items-center justify-center gap-3 py-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 border-dashed">
                                <Loader className="animate-spin text-indigo-600" size={18} />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Generating intelligence for {form.jobTitle}...</span>
                            </div>
                        )}

                        {aiGeneratedSkills.length > 0 && (
                            <div className="space-y-4 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={12} className="animate-pulse" /> AI-Augmented Skills
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {aiGeneratedSkills.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => addSkill(skill)}
                                            className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <Plus size={12} /> {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Database-Suggested Skills */}
                        {suggestedSkills.length > 0 && (
                            <div className="space-y-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                <p className="text-sm font-medium text-blue-400 flex items-center gap-2">
                                    <Sparkles size={14} /> Common Skills:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedSkills.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, skill)}
                                            onClick={() => addSkill(skill)}
                                            className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all cursor-move hover:scale-105 flex items-center gap-1"
                                        >
                                            <Plus size={12} /> {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Available Skills */}
                        <div className="space-y-3">
                            <SearchableMultiSelect
                                label="Search All Skills (Type to filter by category or skill)"
                                placeholder="Search from comprehensive skill library..."
                                options={allSkills}
                                selected={form.skills}
                                onChange={(val) => handleMultiSelectChange('skills', val)}
                            />
                        </div>

                        {/* Education Requirements */}
                        <div className="space-y-6 p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl">
                            <h3 className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest flex items-center gap-3">
                                <GraduationCap size={16} className="text-indigo-600" /> Education Framework
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SearchableMultiSelect
                                    label="Education Level"
                                    placeholder="Select qualifications..."
                                    options={educationLevels}
                                    selected={form.educationLevel}
                                    onChange={(val) => handleMultiSelectChange('educationLevel', val)}
                                />

                                <SearchableMultiSelect
                                    label="Specialization"
                                    placeholder="Select major fields..."
                                    options={fieldsOfStudy}
                                    selected={form.fieldOfStudy}
                                    onChange={(val) => handleMultiSelectChange('fieldOfStudy', val)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Working Hours" name="workingHours" value={form.workingHours} onChange={handleChange} placeholder="e.g. 9 AM - 6 PM" />
                            <SelectGroup label="Shift Type" name="shiftType" value={form.shiftType} onChange={handleChange} options={[
                                { value: "", label: "Select Shift Type" },
                                { value: "day", label: "Day Shift" },
                                { value: "night", label: "Night Shift" },
                                { value: "flex", label: "Flexible" }
                            ]} />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-600/10">
                            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Globe size={16} /> Automation Settings
                            </h3>
                            <div className="space-y-4">
                                <Toggle label="Predictive Interview Scheduling" checked={form.autoSchedule} onChange={() => setForm(s => ({ ...s, autoSchedule: !s.autoSchedule }))} />
                                <Toggle label="Virtual Assessment Hub" checked={form.enableVirtualInterview} onChange={() => setForm(s => ({ ...s, enableVirtualInterview: !s.enableVirtualInterview }))} />
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
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-2">Final Review</h2>
                            <p className="text-[var(--text-muted)] font-medium">Verify all intelligence before deployment.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Job Basics */}
                            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-600/30 transition-all">
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <Briefcase size={14} /> Core Metadata
                                </h3>
                                <div className="space-y-4 text-xs">
                                    <div className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-2"><span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">Role</span> <span className="text-[var(--text-main)] font-black">{form.jobTitle || 'N/A'}</span></div>
                                    <div className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-2"><span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">Company</span> <span className="text-[var(--text-main)] font-black">{form.company || 'N/A'}</span></div>
                                    <div className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-2"><span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">Region</span> <span className="text-[var(--text-main)] font-black">{form.city}, {form.country}</span></div>
                                    <div className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-2"><span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">Work mode</span> <span className="text-[var(--text-main)] font-black capitalize">{form.remoteType}</span></div>
                                </div>
                            </div>

                            {/* Salary & Experience */}
                            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-600/30 transition-all">
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <DollarSign size={14} /> Compensation Map
                                </h3>
                                <div className="space-y-4 text-xs">
                                    <div className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-2"><span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">Budget Range</span> <span className="text-emerald-500 font-black">{form.currency} {form.salaryMin} - {form.salaryMax}</span></div>
                                    <div className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-2"><span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">Seniority</span> <span className="text-[var(--text-main)] font-black capitalize">{form.experience}</span></div>
                                    <div className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-2"><span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">Headcount</span> <span className="text-[var(--text-main)] font-black">{form.openings}</span></div>
                                    <div className="flex justify-between border-b border-[var(--border-subtle)]/50 pb-2"><span className="text-[var(--text-muted)] uppercase tracking-wider font-bold">Shift</span> <span className="text-[var(--text-main)] font-black capitalize">{form.shiftType}</span></div>
                                </div>
                            </div>

                            {/* Job Description Preview */}
                            <div className="md:col-span-2 p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6">Briefing Document</h3>
                                <div
                                    className="prose prose-invert max-w-none text-sm text-[var(--text-muted)] bg-[var(--bg-page)]/50 p-6 rounded-xl border border-[var(--border-subtle)]/50 max-h-[300px] overflow-y-auto"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.jobDescription || '<p class="text-gray-500">No job description provided</p>') }}
                                />
                            </div>

                            {/* Interview Settings */}
                            <div className="md:col-span-2 p-6 rounded-2xl bg-indigo-600/5 border border-indigo-600/10">
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <Calendar size={14} /> Automation Summary
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] font-black uppercase tracking-widest">
                                    <div><p className="text-[var(--text-muted)] mb-1">Predictive</p><p className={form.autoSchedule ? "text-emerald-500" : "text-red-500"}>{form.autoSchedule ? 'Active' : 'Offline'}</p></div>
                                    <div><p className="text-[var(--text-muted)] mb-1">Virtual Hub</p><p className={form.enableVirtualInterview ? "text-emerald-500" : "text-red-500"}>{form.enableVirtualInterview ? 'Active' : 'Offline'}</p></div>
                                    <div><p className="text-[var(--text-muted)] mb-1">Timezone</p><p className="text-[var(--text-main)]">{form.timezone.split('/')[1] || form.timezone}</p></div>
                                    <div><p className="text-[var(--text-muted)] mb-1">Recruiter</p><p className="text-[var(--text-main)]">{form.recruiterName || 'AI'}</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Actions for Review Step */}
                        <div className="flex justify-between items-center gap-8 mt-12 pt-8 border-t border-[var(--border-subtle)]">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-600/30 transition-all"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--text-main)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-amber-500 transition-all"
                                >
                                    Modify Draft
                                </button>

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-3 px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transform hover:-translate-y-0.5 transition-all group"
                                >
                                    Verify & Select Plan <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-10">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-3">Deployment Tier</h2>
                            <p className="text-[var(--text-muted)] font-medium">Select a transmission plan for your job posting.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Pay Per Hire - First and Recommended */}
                            <div
                                onClick={() => setSelectedPlan("pay-per-hire")}
                                className={`relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 group ${selectedPlan === "pay-per-hire"
                                    ? 'bg-indigo-600/10 border-indigo-600 shadow-2xl shadow-indigo-600/10 -translate-y-2'
                                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-indigo-600/50 hover:-translate-y-1'}`}
                            >
                                {/* Recommended Badge */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg z-20">
                                    ⭐ Recommended System
                                </div>

                                {selectedPlan === "pay-per-hire" && (
                                    <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg z-20">
                                        <CheckCircle size={24} />
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform`}>
                                        <Award size={32} />
                                    </div>
                                    <h3 className="font-black text-xl text-[var(--text-main)] uppercase tracking-widest mb-2">Pay-Per-Hire</h3>
                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-tighter mb-4">Enterprise Scaling</p>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed mb-8">Full-spectrum recruitment management with zero upfront overhead.</p>

                                    <div className="space-y-3 w-full border-t border-[var(--border-subtle)] pt-6 text-left">
                                        {["Pay on success only", "Full recruitment lifecycle", "Bulk hiring efficiency", "Zero upfront cost"].map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-main)]">
                                                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                                <span className="uppercase tracking-wider">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Regular Plans */}
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 group ${selectedPlan === plan.id
                                        ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl shadow-emerald-500/10 -translate-y-2'
                                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-emerald-500/50 hover:-translate-y-1'}`}
                                >
                                    {selectedPlan === plan.id && (
                                        <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg z-20">
                                            <CheckCircle size={24} />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-black text-lg text-[var(--text-main)] uppercase tracking-widest">{plan.name}</h3>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{plan.duration}</p>
                                        </div>
                                        <span className="text-2xl font-black text-emerald-500">{plan.price}</span>
                                    </div>
                                    <div className="space-y-3 border-t border-[var(--border-subtle)] pt-6">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-main)]">
                                                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                                <span className="uppercase tracking-wider">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Custom Plan */}
                            <div
                                onClick={() => setSelectedPlan("custom")}
                                className={`relative p-8 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-500 flex flex-col justify-center items-center text-center ${selectedPlan === "custom"
                                    ? 'bg-amber-500/10 border-amber-500 shadow-2xl shadow-amber-500/10 -translate-y-2'
                                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-amber-500/50 hover:-translate-y-1'}`}
                            >
                                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 animate-pulse">
                                    <Star size={32} />
                                </div>
                                <h3 className="font-black text-lg text-[var(--text-main)] uppercase tracking-widest mb-2">Custom</h3>
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-relaxed">Personalized architecture for complex hiring needs.</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-12 max-w-5xl mx-auto py-8">
            {/* Stepper */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--border-subtle)] -translate-y-1/2" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 transition-all duration-500 -translate-y-1/2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                <div className="relative flex justify-between">
                    {steps.map((step) => {
                        const isActive = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;

                        return (
                            <div
                                key={step.id}
                                className="flex flex-col items-center gap-3 cursor-pointer group"
                                onClick={() => isActive && setCurrentStep(step.id)}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10 ${isCurrent
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-110'
                                    : isActive
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                                    }`}>
                                    {isActive && !isCurrent ? <CheckCircle size={20} /> : <step.icon size={20} />}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${isCurrent ? 'text-indigo-600' : 'text-[var(--text-muted)]'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="saas-card p-10 min-h-[600px] w-full relative"
            >
                {/* Draft Indicator & Save Button */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                    {lastSaved && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                            <CheckCircle size={12} />
                            <span>Saved {lastSaved.toLocaleTimeString()}</span>
                        </div>
                    )}
                    <button
                        onClick={() => saveDraft(false)}
                        disabled={isSavingDraft}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-600 text-[var(--text-main)] font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isSavingDraft ? (
                            <Loader size={14} className="animate-spin text-indigo-600" />
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                        )}
                        {isSavingDraft ? 'Saving...' : 'Save Draft'}
                    </button>
                </div>
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

                {/* Footer Navigation */}
                {currentStep !== 5 && (
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-[var(--border-subtle)]">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'}`}
                        >
                            <ChevronLeft size={18} /> Back
                        </button>

                        <div className="flex items-center gap-4">
                            {currentStep < 6 ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-3 px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transform hover:-translate-y-0.5 transition-all group"
                                >
                                    {currentStep === 5 ? 'Continue to Plans' : 'Next Step'}
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="flex flex-col items-end gap-3">
                                    {!selectedPlan && (
                                        <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest animate-pulse">⚠️ Select a plan to continue</p>
                                    )}
                                    <button
                                        onClick={async () => {
                                            if (selectedPlan) {
                                                try {
                                                    const response = await fetch(endpoints.jobs, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
                                                        },
                                                        body: JSON.stringify({
                                                            title: form.jobTitle,
                                                            description: form.jobDescription,
                                                            requirements: JSON.stringify(form.skills),
                                                            skills: form.skills,
                                                            location: `${form.city}, ${form.country}`,
                                                            work_mode: form.remoteType === 'onsite' ? 'On-site' : form.remoteType.charAt(0).toUpperCase() + form.remoteType.slice(1),
                                                            type: form.jobType.replace('_', '-').charAt(0).toUpperCase() + form.jobType.replace('_', '-').slice(1),
                                                            salary_min: form.salaryMin,
                                                            salary_max: form.salaryMax,
                                                            job_type: selectedPlan
                                                        })
                                                    });

                                                    if (response.ok) {
                                                        clearDraft();
                                                        setShowSuccessModal(true);
                                                    } else {
                                                        const errData = await response.json();
                                                        alert(`Error: ${errData.error || 'Failed to post job'}`);
                                                    }
                                                } catch (error) {
                                                    console.error('Job submission error:', error);
                                                    alert('Network error. Failed to post job.');
                                                }
                                            }
                                        }}
                                        disabled={!selectedPlan}
                                        className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all ${selectedPlan
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 transform hover:-translate-y-0.5'
                                            : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed'
                                            }`}
                                    >
                                        {selectedPlan ? 'Post Job & Proceed' : 'Select Plan'}
                                        <CheckCircle size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="saas-card max-w-xl w-full p-12 text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

                            <div className="space-y-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                    className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12"
                                >
                                    <CheckCircle size={48} className="text-emerald-500 -rotate-12" />
                                </motion.div>

                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-[0.2em]">
                                        Job Posted
                                    </h2>
                                    <p className="text-[var(--text-muted)] font-medium leading-relaxed max-w-sm mx-auto">
                                        Your job posting has been successfully received and is now under review.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)]">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-emerald-500 font-bold text-sm">Under Review</p>
                                    </div>
                                    <div className="text-left border-l border-[var(--border-subtle)] pl-4">
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Plan</p>
                                        <p className="text-[var(--text-main)] font-bold text-sm capitalize">{selectedPlan.replace('-', ' ')}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={() => navigate('/employer/dashboard')}
                                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                                    >
                                        Go to Dashboard
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full py-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-600 text-[var(--text-main)] font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                                    >
                                        Post Another Job
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Reusable Components for Consistency & Visibility ---

const InputGroup = ({ label, icon, small, ...props }: any) => (
    <div className="space-y-2">
        <label className={`block font-black text-[var(--text-muted)] uppercase tracking-widest ${small ? 'text-[9px]' : 'text-[10px]'}`}>{label}</label>
        <div className="relative group">
            {icon && <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors ${small ? 'scale-90' : ''}`}>{icon}</div>}
            <input
                {...props}
                className={`w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-bold ${icon ? 'pl-11' : 'pl-4'} ${small ? 'h-10 text-xs' : 'h-12 text-sm'}`}
            />
        </div>
    </div>
);

const SelectGroup = ({ label, options, ...props }: any) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</label>
        <div className="relative group">
            <select
                {...props}
                className="w-full h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-main)] focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none appearance-none pl-4 pr-10 cursor-pointer font-bold text-sm"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value} className="bg-[var(--bg-surface)] text-[var(--text-main)] font-medium">
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-indigo-600">
                <ChevronRight size={16} className="rotate-90" />
            </div>
        </div>
    </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] h-16 transition-all hover:border-indigo-600/30 group">
        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
        <button
            onClick={onChange}
            className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${checked ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-[var(--bg-page)]'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);
