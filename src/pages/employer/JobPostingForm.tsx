import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Briefcase, MapPin, DollarSign, CheckCircle,
    ChevronRight, ChevronLeft, Calendar, Globe, User, Sparkles, Plus,
    CreditCard, Star, Award, X, Loader, GraduationCap
} from "lucide-react";
import SearchableMultiSelect from "../../components/SearchableMultiSelect";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/quill-custom.css';

// HireGoAI – Premium Multi-Step Job Posting Wizard
// Features: Step-by-step navigation, high-contrast inputs, professional UI, Plan Selection.

// Rich Text Editor Configuration
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link'],
        ['clean']
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'link'
];

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
            const response = await fetch('http://localhost:3000/api/ai/job-titles');
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
            const response = await fetch('http://localhost:3000/api/ai/skills/suggest', {
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
            const response = await fetch('http://localhost:3000/api/ai/job-titles/add', {
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
            const response = await fetch('http://localhost:3000/api/ai/job-description/generate', {
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
                                    <div className="absolute z-50 w-full mt-1 bg-[#1a1f3a] border border-neon-cyan/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {jobTitleSuggestions.map((title, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => selectJobTitle(title)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-neon-cyan/10 text-white border-b border-white/5 last:border-b-0 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={14} className="text-neon-cyan" />
                                                    <span>{title}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {/* Add New Job Title Button */}
                                {showAddJobTitle && (
                                    <div className="absolute z-50 w-full mt-1 bg-[#1a1f3a] border border-neon-purple/30 rounded-lg shadow-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-300">Job title not found. Add "{form.jobTitle}"?</span>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleAddNewJobTitle();
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg transition-colors font-semibold"
                                            >
                                                <Plus size={16} /> Add
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

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="block text-sm font-semibold text-white">Job Description</label>
                                <button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={isLoadingSkills}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingSkills ? (
                                        <>
                                            <Loader className="animate-spin" size={16} /> Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} /> AI Generate JD
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Rich Text Editor with 3D Effect */}
                            <div className="relative group">
                                {/* 3D Shadow layers */}
                                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 rounded-2xl translate-x-1 translate-y-1"></div>
                                
                                {/* Main Editor Container */}
                                <div className="relative bg-gradient-to-br from-[#1a1f3a] via-[#0f172a] to-[#1e293b] rounded-2xl overflow-hidden border-2 border-neon-cyan/30 shadow-[0_8px_30px_rgb(0,243,255,0.12),0_0_0_1px_rgb(188,19,254,0.1)] hover:shadow-[0_12px_40px_rgb(0,243,255,0.2),0_0_0_1px_rgb(188,19,254,0.15)] transition-all duration-300">
                                    {/* Neon glow effect on top */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-60"></div>
                                    
                                    {/* Editor wrapper with neon inner background */}
                                    <div className="p-2 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5">
                                        <div className="rich-text-editor-wrapper bg-[#0a0e1f]/80 rounded-xl backdrop-blur-sm">
                                            <ReactQuill
                                                theme="snow"
                                                value={form.jobDescription}
                                                onChange={(content) => setForm(s => ({ ...s, jobDescription: content }))}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="Start typing or click 'AI Generate JD' to create a professional job description..."
                                                className="job-description-editor"
                                                style={{ height: '500px' }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Bottom neon glow */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-60"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        {/* Selected Skills - Drop Zone */}
                        <div 
                            className="space-y-3 p-4 bg-[#0f172a] border-2 border-dashed border-gray-700 rounded-xl min-h-[120px] max-h-[180px] overflow-y-auto"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <label className="block text-sm font-bold text-gray-300 flex items-center gap-2 sticky top-0 bg-[#0f172a] pb-2">
                                <Sparkles size={16} className="text-neon-cyan" />
                                Required Skills (Drag & Drop or Click)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {form.skills.length === 0 ? (
                                    <p className="text-gray-500 text-sm py-2">Drag skills here or click on suggested skills below</p>
                                ) : (
                                    form.skills.map((skill) => (
                                        <div
                                            key={skill}
                                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/50 text-white text-sm font-medium flex items-center gap-2 group hover:scale-105 transition-transform"
                                        >
                                            <span>{skill}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="opacity-70 hover:opacity-100 hover:text-red-400 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* AI-Suggested Skills */}
                        {isLoadingSkills && (
                            <div className="flex items-center justify-center gap-2 py-4">
                                <Loader className="animate-spin text-neon-cyan" size={20} />
                                <span className="text-gray-400">AI is generating skills for {form.jobTitle}...</span>
                            </div>
                        )}

                        {aiGeneratedSkills.length > 0 && (
                            <div className="space-y-3 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                                <p className="text-sm font-medium text-green-400 flex items-center gap-2">
                                    <Sparkles size={14} className="animate-pulse" /> AI-Powered Suggestions for {form.jobTitle}:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {aiGeneratedSkills.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, skill)}
                                            onClick={() => addSkill(skill)}
                                            className="px-3 py-2 text-sm font-medium rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 hover:border-green-500/50 transition-all cursor-move hover:scale-105 flex items-center gap-1"
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
                        <div className="space-y-4 p-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <GraduationCap size={18} className="text-neon-cyan" /> Education Requirements
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SearchableMultiSelect
                                    label="Education Level (Select multiple)"
                                    placeholder="e.g., B.Tech, MBA, Ph.D..."
                                    options={educationLevels}
                                    selected={form.educationLevel}
                                    onChange={(val) => handleMultiSelectChange('educationLevel', val)}
                                />
                                
                                <SearchableMultiSelect
                                    label="Field of Study (Select multiple)"
                                    placeholder="e.g., Computer Science, Marketing..."
                                    options={fieldsOfStudy}
                                    selected={form.fieldOfStudy}
                                    onChange={(val) => handleMultiSelectChange('fieldOfStudy', val)}
                                />
                            </div>
                            
                            <p className="text-xs text-gray-400 italic">
                                💡 Tip: Select multiple education levels and fields to broaden your candidate pool
                            </p>
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
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">Review Your Job Posting</h2>
                            <p className="text-gray-400">Please review all details before selecting a plan</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Job Basics */}
                            <div className="p-6 rounded-xl glass border border-neon-cyan/30">
                                <h3 className="text-lg font-bold text-neon-cyan mb-4 flex items-center gap-2">
                                    <Briefcase size={18} /> Job Basics
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-400">Title:</span> <span className="text-white font-medium">{form.jobTitle || 'Not specified'}</span></div>
                                    <div><span className="text-gray-400">Company:</span> <span className="text-white font-medium">{form.company || 'Not specified'}</span></div>
                                    <div><span className="text-gray-400">Location:</span> <span className="text-white font-medium">{form.city}, {form.state}, {form.country}</span></div>
                                    <div><span className="text-gray-400">Work Mode:</span> <span className="text-white font-medium capitalize">{form.remoteType}</span></div>
                                    <div><span className="text-gray-400">Job Type:</span> <span className="text-white font-medium capitalize">{form.jobType.replace('_', ' ')}</span></div>
                                </div>
                            </div>

                            {/* Salary & Experience */}
                            <div className="p-6 rounded-xl glass border border-neon-purple/30">
                                <h3 className="text-lg font-bold text-neon-purple mb-4 flex items-center gap-2">
                                    <DollarSign size={18} /> Compensation & Experience
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-400">Salary Range:</span> <span className="text-white font-medium">{form.currency} {form.salaryMin} - {form.salaryMax}</span></div>
                                    <div><span className="text-gray-400">Experience:</span> <span className="text-white font-medium">{form.experience || 'Not specified'}</span></div>
                                    <div><span className="text-gray-400">Openings:</span> <span className="text-white font-medium">{form.openings}</span></div>
                                    <div><span className="text-gray-400">Working Hours:</span> <span className="text-white font-medium">{form.workingHours || 'Not specified'}</span></div>
                                    <div><span className="text-gray-400">Shift:</span> <span className="text-white font-medium capitalize">{form.shiftType || 'Not specified'}</span></div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="p-6 rounded-xl glass border border-green-500/30">
                                <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                                    <Sparkles size={18} /> Required Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {form.skills.length > 0 ? (
                                        form.skills.map(skill => (
                                            <span key={skill} className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg text-sm">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No skills specified</p>
                                    )}
                                </div>
                            </div>

                            {/* Education */}
                            <div className="p-6 rounded-xl glass border border-blue-500/30">
                                <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                                    <GraduationCap size={18} /> Education Requirements
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-400">Level:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {form.educationLevel.length > 0 ? (
                                                form.educationLevel.map(edu => (
                                                    <span key={edu} className="px-2 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded text-xs">
                                                        {edu}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">Not specified</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Field of Study:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {form.fieldOfStudy.length > 0 ? (
                                                form.fieldOfStudy.map(field => (
                                                    <span key={field} className="px-2 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded text-xs">
                                                        {field}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">Not specified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Job Description Preview */}
                            <div className="md:col-span-2 p-6 rounded-xl glass border border-white/20">
                                <h3 className="text-lg font-bold text-white mb-4">Job Description</h3>
                                <div 
                                    className="prose prose-invert max-w-none text-sm bg-black/20 p-4 rounded-lg max-h-[300px] overflow-y-auto"
                                    dangerouslySetInnerHTML={{ __html: form.jobDescription || '<p class="text-gray-500">No job description provided</p>' }}
                                />
                            </div>

                            {/* Interview Settings */}
                            <div className="md:col-span-2 p-6 rounded-xl glass border border-yellow-500/30">
                                <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                                    <Calendar size={18} /> Interview Settings
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div><span className="text-gray-400">Auto Schedule:</span> <span className="text-white font-medium">{form.autoSchedule ? 'Yes' : 'No'}</span></div>
                                    <div><span className="text-gray-400">Virtual Interviews:</span> <span className="text-white font-medium">{form.enableVirtualInterview ? 'Yes' : 'No'}</span></div>
                                    <div><span className="text-gray-400">Timezone:</span> <span className="text-white font-medium">{form.timezone}</span></div>
                                    <div><span className="text-gray-400">Recruiter:</span> <span className="text-white font-medium">{form.recruiterName || 'Not specified'}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center gap-8 mt-10">
                            {/* Left Side - Back Button */}
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 shadow-[0_8px_20px_rgba(75,85,99,0.4)] hover:shadow-[0_12px_30px_rgba(75,85,99,0.6)] transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <ChevronLeft size={20} /> Back
                            </button>

                            {/* Center - Edit Button */}
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 shadow-[0_8px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_12px_30px_rgba(249,115,22,0.6)] transform hover:-translate-y-1 transition-all duration-300"
                            >
                                Edit Details
                            </button>

                            {/* Right Side - Continue Button */}
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-[0_8px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_12px_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-1 transition-all duration-300"
                            >
                                Continue to Plans <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Select a Plan</h2>
                            <p className="text-gray-400">Choose the best plan to boost your hiring process.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Pay Per Hire - First and Recommended */}
                            <div
                                onClick={() => setSelectedPlan("pay-per-hire")}
                                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedPlan === "pay-per-hire" ? 'border-purple-500 bg-purple-500/10 shadow-xl scale-105' : 'border-purple-700 bg-[#0f172a] hover:border-purple-500 hover:shadow-md'}`}
                            >
                                {/* Recommended Badge */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                                    ⭐ RECOMMENDED
                                </div>
                                
                                {selectedPlan === "pay-per-hire" && (
                                    <div className="absolute -top-3 -right-3 bg-purple-500 text-white p-1 rounded-full shadow-md">
                                        <CheckCircle size={20} />
                                    </div>
                                )}
                                
                                <div className="flex flex-col justify-center items-center text-center mt-4">
                                    <Award className="text-purple-500 mb-3" size={32} />
                                    <h3 className="font-bold text-lg text-white">Pay-Per-Hire</h3>
                                    <p className="text-sm text-purple-400 font-semibold mt-2">For Large Scale & Flexible Hiring</p>
                                    <p className="text-sm text-gray-400 mt-2">We handle hiring end-to-end and charge per successful placement.</p>
                                    
                                    <div className="mt-4 space-y-2 text-left w-full">
                                        <div className="flex items-start gap-2 text-xs text-gray-300">
                                            <CheckCircle size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                            <span>Pay only for successful hires</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-gray-300">
                                            <CheckCircle size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                            <span>Complete recruitment management</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-gray-300">
                                            <CheckCircle size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                            <span>Ideal for bulk & ongoing hiring</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-gray-300">
                                            <CheckCircle size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                            <span>Zero upfront cost</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Regular Plans */}
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

                            {/* Custom Plan */}
                            <div
                                onClick={() => setSelectedPlan("custom")}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-center items-center text-center ${selectedPlan === "custom" ? 'border-blue-500 bg-blue-500/10 shadow-xl scale-105' : 'border-gray-700 bg-[#0f172a] hover:border-gray-500 hover:shadow-md'}`}
                            >
                                <Star className="text-blue-500 mb-3" size={32} />
                                <h3 className="font-bold text-lg text-white">Custom Plan</h3>
                                <p className="text-sm text-gray-400 mt-2">Our sales team will contact you for a personalized plan.</p>
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
                    {/* Draft Indicator & Save Button */}
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                        {lastSaved && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400">
                                <CheckCircle size={14} />
                                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                            </div>
                        )}
                        <button
                            onClick={() => saveDraft(false)}
                            disabled={isSavingDraft}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSavingDraft ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    💾 Save as Draft
                                </>
                            )}
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

                    {/* Footer Navigation - Only show for steps other than Review (step 5) */}
                    {currentStep !== 5 && (
                        <div className="flex flex-col items-center mt-12 pt-8 border-t border-gray-700">
                            <div className="flex gap-6 w-full justify-center">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-800 text-gray-400'}`}
                                >
                                    <ChevronLeft size={20} /> Back
                                </button>

                                {currentStep < 6 ? (
                                    <button
                                        onClick={nextStep}
                                        className="btn-3d btn-primary flex items-center gap-2 px-10 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all bg-white text-black font-bold tracking-wide"
                                    >
                                        {currentStep === 5 ? 'Continue to Plans' : 'Next Step'} <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        {!selectedPlan && (
                                            <p className="text-yellow-400 text-sm font-semibold animate-pulse">⚠️ Please select a plan to continue</p>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (selectedPlan) {
                                                    clearDraft();
                                                    setShowSuccessModal(true);
                                                }
                                            }}
                                            disabled={!selectedPlan}
                                            className={`btn-3d flex items-center gap-2 px-10 py-3 rounded-full shadow-lg font-bold tracking-wide border-none transition-all ${
                                                selectedPlan 
                                                    ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl transform hover:-translate-y-1 cursor-pointer' 
                                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                            }`}
                                        >
                                            {selectedPlan ? 'Post Job & Proceed to Pay' : 'Select a Plan First'} <CheckCircle size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowSuccessModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-[#1a1f3a] via-[#0f172a] to-[#1e293b] rounded-3xl p-8 md:p-12 max-w-2xl w-full relative overflow-hidden border-2 border-neon-cyan/30 shadow-[0_20px_60px_rgba(0,243,255,0.3)]"
                        >
                            {/* Animated Background Effects */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-pink-500 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-neon-purple to-neon-cyan animate-pulse"></div>
                            
                            {/* Decorative circles */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-purple/20 rounded-full blur-3xl"></div>

                            {/* Content */}
                            <div className="relative z-10 text-center space-y-6">
                                {/* Success Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                                >
                                    <CheckCircle size={48} className="text-white" strokeWidth={3} />
                                </motion.div>

                                {/* Greeting */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent mb-2">
                                        🎉 Congratulations!
                                    </h2>
                                    <p className="text-xl text-gray-300 font-semibold">
                                        Your job posting is on its way!
                                    </p>
                                </motion.div>

                                {/* Success Message */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3"
                                >
                                    <p className="text-white text-lg leading-relaxed">
                                        Thank you! Your job post has been <span className="text-neon-cyan font-bold">received</span> and is <span className="text-neon-purple font-bold">under review</span>.
                                    </p>
                                    <p className="text-gray-300">
                                        This usually takes only a <span className="text-green-400 font-semibold">few minutes</span>. You'll be notified as soon as it is <span className="text-green-400 font-semibold">live</span>.
                                    </p>
                                </motion.div>

                                {/* Plan Info */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center justify-center gap-2 text-sm text-gray-400"
                                >
                                    <Award size={16} className="text-neon-purple" />
                                    <span>Selected Plan: <span className="text-white font-semibold capitalize">{selectedPlan.replace('-', ' ')}</span></span>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col sm:flex-row gap-4 pt-4"
                                >
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            navigate('/employer/dashboard');
                                        }}
                                        className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 hover:from-neon-cyan/80 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                                    >
                                        View Dashboard
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            window.location.reload();
                                        }}
                                        className="flex-1 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 hover:border-white/40 transition-all"
                                    >
                                        Post Another Job
                                    </button>
                                </motion.div>
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
