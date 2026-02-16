export const skillSuggestions: Record<string, string[]> = {
    // ----------------------------------------------------
    // TRAVEL, AIRLINES & AVIATION
    // ----------------------------------------------------

    // Ticketing & GDS
    'Trainee Ticketing Agent': ['Geography', 'Communication', 'Basic Computer Skills', 'Travel Terminology', 'Amadeus (Basic)', 'Customer Service'],
    'Ticketing Executive (GDS)': ['Amadeus', 'Sabre', 'Galileo', 'Worldspan', 'IATA', 'Fare Construction', 'Itinerary Planning', 'Ticketing Issuance', 'Customer Service'],
    'Senior Ticketing Consultant': ['Complex Itineraries', 'Reissue & Refunds', 'Corporate Travel', 'GDS Expert', 'Team Leadership', 'Vendor Negotiation', 'Crisis Management'],
    'GDS Specialist': ['API Integration', 'Sabre', 'Amadeus', 'Travel Tech', 'System Troubleshooting', 'Booking Engines', 'NDC Standards'],

    // Travel Agency Operations
    'Junior Travel Consultant': ['Destination Knowledge', 'Package Creation', 'Customer Service', 'Booking Systems', 'Itinerary Planning', 'Sales'],
    'Senior Travel Consultant': ['Luxury Travel', 'Corporate Sales', 'Vendor Management', 'Crisis Management', 'Custom Itineraries', 'Team Mentoring'],
    'Travel Agency Manager': ['Operations Management', 'P&L Management', 'Staff Training', 'Business Development', 'Strategic Planning', 'Vendor Relations'],
    'Head of Travel Operations': ['Strategic Leadership', 'Global Operations', 'Policy Formulation', 'Revenue Management', 'Process Optimization'],

    // Airlines & Aviation
    'Ground Staff / Guest Service Agent': ['Check-in Procedures', 'Baggage Handling', 'Passenger Handling', 'Airport Safety', 'Customer Service', 'GDS (Altea/Radixx)'],
    'Cabin Crew / Flight Attendant': ['Safety Procedures', 'First Aid', 'Customer Service', 'Conflict Resolution', 'Hospitality', 'Foreign Languages'],
    'Airline Operations Manager': ['Flight Operations', 'Crew Scheduling', 'Ground Handling Management', 'Aviation Regulations', 'Safety Management Systems (SMS)'],
    'Airport Manager': ['Airport Operations', 'Security Management', 'Facility Management', 'Stakeholder Management', 'Emergency Response'],

    // ----------------------------------------------------
    // E-COMMERCE
    // ----------------------------------------------------

    'E-commerce Executive': ['Product Listing', 'Order Processing', 'Inventory Management', 'Basic SEO', 'Customer Support', 'CMS (Shopify/WooCommerce)'],
    'E-commerce Specialist': ['Shopify', 'WooCommerce', 'Magento', 'Marketplace Management (Amazon/eBay)', 'SEO', 'PPC', 'Conversion Rate Optimization (CRO)'],
    'E-commerce Manager': ['P&L Ownership', 'Digital Marketing Strategy', 'Supply Chain', 'Vendor Management', 'Customer Experience (CX)', 'Analytics'],
    'Head of E-commerce': ['Omnichannel Strategy', 'Digital Transformation', 'Revenue Growth', 'Brand Strategy', 'Global Expansion', 'Team Leadership'],

    'Online Merchandiser': ['Visual Merchandising', 'Inventory Analysis', 'Trend Forecasting', 'Sales Analysis', 'Promotion Planning', 'Product Categorization'],
    'Category Manager (E-commerce)': ['Assortment Planning', 'Pricing Strategy', 'Vendor Negotiation', 'Market Research', 'P&L Management', 'Inventory Control'],
    'Dropshipping Specialist': ['Product Research', 'Supplier Sourcing', 'Shopify', 'Facebook Ads', 'Order Fulfillment', 'Customer Service'],

    // ----------------------------------------------------
    // TECHNICAL SKILLS & ROLES (Software, Data, AI, Cloud)
    // ----------------------------------------------------

    // Frontend Development
    'Junior Frontend Developer': ['HTML5', 'CSS3', 'JavaScript', 'Basic React/Vue', 'Git', 'Responsive Design', 'Debugging', 'Figma Basics'],
    'Frontend Developer': ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Vue.js', 'Angular', 'Tailwind CSS', 'Redux', 'Webpack', 'Jest'],
    'Senior Frontend Developer': ['System Design', 'Performance Optimization', 'Advanced React Patterns', 'Micro-frontends', 'CI/CD', 'Mentoring', 'Architecture'],
    'Lead Frontend Engineer': ['Team Leadership', 'Technical Architecture', 'Code Review Strategy', 'Stakeholder Management', 'Roadmap Planning'],

    // Backend Development
    'Junior Backend Developer': ['Node.js Basics', 'Python Basics', 'SQL', 'Git', 'REST APIs', 'Basic Express/Django', 'Problem Solving'],
    'Backend Developer': ['Node.js', 'Python', 'Java', 'Go', 'SQL', 'NoSQL', 'Docker', 'REST API', 'GraphQL', 'Microservices'],
    'Senior Backend Developer': ['Distributed Systems', 'Database Optimization', 'Cloud Architecture (AWS/Azure)', 'Scalability', 'Security Best Practices', 'System Design'],
    'Head of Backend Engineering': ['Engineering Strategy', 'Infrastructure Planning', 'Team Scaling', 'Technology Radar', 'Budget Management'],

    // Full Stack Development
    'Junior Full Stack Developer': ['HTML/CSS', 'JavaScript', 'Basic Node.js', 'Basic Database', 'Git', 'React Basics'],
    'Full Stack Developer': ['MERN/MEAN Stack', 'TypeScript', 'Docker', 'AWS', 'CI/CD', 'GraphQL', 'Next.js', 'PostgreSQL'],
    'Senior Full Stack Developer': ['System Architecture', 'Cloud Native App Dev', 'DevOps', 'Performance Tuning', 'Database Design', 'Technical Leadership'],
    'Principal Full Stack Engineer': ['High-Level Architecture', 'Cross-Domain Expertise', 'Innovation', 'Standard Setting', 'Mentorship'],

    // Mobile Development
    'Junior Mobile Developer': ['Basic Swift/Kotlin', 'Basic React Native', 'UI Implementation', 'Git', 'Debugging'],
    'Mobile Developer': ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase', 'State Management', 'API Integration'],
    'Senior Mobile Developer': ['App Performance', 'Native Modules', 'CI/CD for Mobile', 'App Store Optimization', 'Security', 'Architecture Patterns (Clean/MVVM)'],
    'Head of Mobile Engineering': ['Mobile Strategy', 'Cross-Platform Strategy', 'Team Management', 'Release Management', 'UX Strategy'],

    // Data Science & AI
    'Junior Data Analyst': ['Excel', 'Basic SQL', 'Basic Python', 'Data Visualization', 'Cleaning Data'],
    'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Pandas', 'Scikit-learn', 'Data Visualization'],
    'Senior Data Scientist': ['Deep Learning', 'ML Ops', 'Big Data (Spark)', 'TensorFlow', 'Research', 'Model Deployment', 'Stakeholder Communication'],
    'Head of AI / Data Science': ['AI Strategy', 'Data Governance', 'Team Leadership', 'Innovation Roadmap', 'Ethics in AI', 'Budgeting'],

    // IT Support & Networking
    'IT Support Technician': ['Hardware Troubleshooting', 'Windows/MacOS', 'Office 365', 'Active Directory', 'Printer Config', 'Networking Basics'],
    'System Administrator': ['Windows Server', 'Linux Admin', 'Active Directory', 'Virtualization (VMware)', 'Backup Management', 'Security Patching'],
    'Network Engineer': ['CCNA', 'Routing & Switching', 'Firewalls', 'VPN', 'LAN/WAN', 'Wireshark', 'Network Security'],
    'Cybersecurity Analyst': ['SIEM', 'Firewalls', 'Incident Response', 'Vulnerability Assessment', 'Penetration Testing', 'Network Security', 'Compliance'],
    'IT Manager': ['IT Strategy', 'Budgeting', 'Team Management', 'Vendor Management', 'Infrastructure Planning', 'Disaster Recovery'],

    // ----------------------------------------------------
    // FINANCE & ACCOUNTING
    // ----------------------------------------------------

    'Junior Accountant': ['Data Entry', 'Basic Excel', 'Invoicing', 'Bookkeeping', 'Tally/QuickBooks Basics'],
    'Accountant': ['Financial Reporting', 'Taxation', 'Reconciliation', 'Auditing', 'GAAP', 'Compliance', 'Advanced Excel'],
    'Senior Accountant': ['Financial Analysis', 'Forecasting', 'Tax Planning', 'Internal Audit', 'Team Supervision', 'ERP Systems (SAP/Oracle)'],
    'Finance Manager': ['Budgeting', 'Financial Planning & Analysis (FP&A)', 'Risk Management', 'Cash Flow Management', 'Strategic Finance'],
    'Financial Controller': ['Internal Controls', 'Compliance', 'Financial Reporting Standards', 'Audit Management', 'System Implementation'],
    'Chief Financial Officer (CFO)': ['Capital Structure', 'Investor Relations', 'Mergers & Acquisitions', 'Corporate Strategy', 'Risk Management', 'Board Reporting'],
    'Investment Banker': ['Financial Modeling', 'Valuation', 'M&A', 'Due Diligence', 'Excel', 'Corporate Finance', 'Capital Markets'],

    // ----------------------------------------------------
    // MARKETING & SALES
    // ----------------------------------------------------

    'Marketing Intern/Junior': ['Social Media Basics', 'Content Writing', 'Canva', 'Research', 'Email Drafting'],
    'Digital Marketing Executive': ['SEO Basics', 'Social Media Management', 'Google Analytics', 'Content Calendar', 'Email Marketing'],
    'Digital Marketing Manager': ['Campaign Strategy', 'Budget Management', 'Team Leadership', 'Analytics', 'ROI Tracking', 'Vendor Management'],
    'Head of Marketing / CMO': ['Brand Vision', 'Go-to-Market Strategy', 'Growth Hacking', 'Executive Leadership', 'Market Positioning'],

    'Sales Executive': ['Prospecting', 'Cold Calling', 'CRM Entry', 'Lead Qualifying', 'Communication'],
    'Sales Manager': ['Team Leadership', 'Pipeline Management', 'Sales Strategy', 'Target Setting', 'Negotiation', 'Hiring'],
    'Head of Sales': ['Revenue Strategy', 'Territory Planning', 'Partnership Development', 'Sales Operations', 'Forecasting'],

    // ----------------------------------------------------
    // HR & MANAGEMENT
    // ----------------------------------------------------

    'HR Executive': ['Recruitment Coordination', 'Onboarding', 'Documentation', 'Employee Queries', 'HRIS Entry'],
    'HR Manager': ['Employee Relations', 'Performance Management', 'Policy Implementation', 'Compensation & Benefits', 'Conflict Resolution'],
    'Head of HR / CHRO': ['Talent Strategy', 'Organizational Development', 'Culture Building', 'Succession Planning', 'Executive Advising'],

    // ----------------------------------------------------
    // HEALTHCARE & MEDICAL (NEW)
    // ----------------------------------------------------

    'Nursing Staff': ['Patient Care', 'Vitals Monitoring', 'Record Keeping', 'Compassion', 'First Aid', 'Infection Control'],
    'Registered Nurse (Senior)': ['Critical Care', 'Team Supervision', 'Care Planning', 'Trauma Care', 'Patient Advocacy', 'Medical Technology'],
    'Nursing Superintendent': ['Hospital Administration', 'Staff Rostering', 'Quality Assurance', 'Protocol Implementation', 'Training'],

    'General Practitioner (Doctor)': ['Diagnosis', 'Patient Counseling', 'Primary Care', 'Medical Histories', 'Prescribing', 'Preventive Care'],
    'Medical Specialist (Consultant)': ['Specialized Diagnosis', 'Surgery', 'Advanced Treatments', 'Research', 'Teaching', 'Clinical Leadership'],
    'Medical Administrator': ['Hospital Operations', 'Healthcare Regulations', 'Patient Flow Management', 'Budgeting', 'Records Management'],

    'Pharmacist': ['Prescription Dispensing', 'Drug Interaction Knowledge', 'Inventory Management', 'Patient Counseling', 'Regulatory Compliance'],
    'Lab Technician': ['Sample Collection', 'Equipment Maintenance', 'Bio-safety', 'Data Recording', 'Test Analysis', 'Microbiology'],

    // ----------------------------------------------------
    // EDUCATION & TRAINING (NEW)
    // ----------------------------------------------------

    'Primary School Teacher': ['Child Psychology', 'Classroom Management', 'Lesson Planning', 'Patience', 'Creativity', 'Communication'],
    'High School Teacher': ['Subject Expertise', 'Curriculum Delivery', 'Student Assessment', 'Mentoring', 'Exam Preparation', 'Educational Tech'],
    'Academic Counselor': ['Career Guidance', 'Student Psychology', 'College Admissions', 'Interpersonal Skills', 'Conflict Resolution'],
    'Professor / Lecturer': ['Research', 'Public Speaking', 'Curriculum Design', 'Academic Writing', 'Mentoring', 'Subject Mastery'],
    'School Principal / Administrator': ['Educational Leadership', 'Staff Management', 'Budgeting', 'School Safety', 'Policy Implementation', 'Community Relations'],

    // ----------------------------------------------------
    // HOSPITALITY (HOTELS & RESTAURANTS) (NEW)
    // ----------------------------------------------------

    'Front Desk Executive': ['Check-in/Check-out', 'Reservation Systems', 'Customer Service', 'Problem Solving', 'Communication', 'Cash Handling'],
    'Hotel Manager': ['Operations Management', 'Guest Experience', 'Staff Leadership', 'Revenue Management', 'Facility Maintenance', 'Sales & Marketing'],

    'Commis Chef (Junior)': ['Food Preparation', 'Knife Skills', 'Hygiene Standards', 'Kitchen Safety', 'Following Recipes', 'Teamwork'],
    'Chef de Partie': ['Station Management', 'Cooking Techniques', 'Plating', 'Inventory Control', 'Training Juniors', 'Menu Input'],
    'Executive Chef': ['Menu Design', 'Kitchen Management', 'Cost Control', 'Vendor Relations', 'Culinary Creativity', 'Staff Hiring'],

    'Restaurant Manager': ['Shift Management', 'Customer Service', 'P&L Management', 'Staff Training', 'Inventory Management', 'Health & Safety'],
    'Event Planner': ['Budgeting', 'Vendor Coordination', 'Timeline Management', 'Creativity', 'Negotiation', 'Logistics'],

    // ----------------------------------------------------
    // REAL ESTATE & CONSTRUCTION (NEW)
    // ----------------------------------------------------

    'Real Estate Agent': ['Property Valuation', 'Sales & Negotiation', 'Local Market Knowledge', 'Networking', 'Documentation', 'Customer Service'],
    'Property Manager': ['Tenant Relations', 'Maintenance Coordination', 'Rent Collection', 'Budgeting', 'Lease Administration'],

    'Architect (Junior)': ['AutoCAD', 'Revit', 'Drafting', '3D Modeling', 'Building Codes', 'Design Research'],
    'Senior Architect': ['Project Management', 'Design Leadership', 'Client Relations', 'Urban Planning', 'Construction Administration', 'Sustainability'],

    'Site Engineer': ['Construction Safety', 'Blueprint Reading', 'Quality Control', 'Team Supervision', 'Material Management', 'Surveying'],
    'Construction Project Manager': ['Project Scheduling', 'Budget Management', 'Contract Negotiation', 'Risk Management', 'Stakeholder Communication', 'Permitting'],
    'Interior Designer': ['Space Planning', 'Color Theory', 'Material Selection', 'CAD/SketchUp', 'Client Consultation', 'Budgeting'],

    // ----------------------------------------------------
    // ENGINEERING (Non-IT)
    // ----------------------------------------------------

    'Junior Mechanical Engineer': ['CAD Basics', 'Drafting', 'Material Testing', 'Technical Support'],
    'Mechanical Engineer': ['SolidWorks', 'Thermodynamics', 'Project Management', 'Manufacturing', 'FEA'],
    'Senior Mechanical Engineer': ['Design Optimization', 'Product Lifecycle', 'Team Leadership', 'Compliance Standards', 'Innovation'],

    'Junior Civil Engineer': ['Site Supervision', 'Surveying', 'AutoCAD Basics', 'Estimation'],
    'Civil Engineer': ['Structural Design', 'Project Management', 'Construction Safety', 'Civil 3D'],
    'Senior Civil Engineer': ['Mega Project Management', 'Structural Analysis', 'Regulatory Compliance', 'Sustainability'],

    'Electrical Engineer': ['Circuit Design', 'PCB Design', 'MATLAB', 'Simulink', 'Power Systems', 'Control Systems', 'C/C++', 'PLC Programming'],

    // ----------------------------------------------------
    // LEGAL SERVICES (NEW)
    // ----------------------------------------------------

    'Paralegal': ['Legal Research', 'Document Drafting', 'Case Management', 'Administrative Support', 'Client Communication', 'E-filing'],
    'Associate Lawyer': ['Litigation', 'Contract Drafting', 'Legal Advice', 'Research', 'Negotiation', 'Court Representation'],
    'Senior Legal Counsel': ['Corporate Law', 'Risk Management', 'Strategic Legal Advice', 'Mergers & Acquisitions', 'Compliance Leadership', 'Team Management'],

    // ----------------------------------------------------
    // MEDIA & ENTERTAINMENT (NEW)
    // ----------------------------------------------------

    'Video Editor': ['Adobe Premiere', 'Final Cut Pro', 'Color Grading', 'Sound Design', 'Storytelling', 'Motion Graphics'],
    'Photographer': ['Lighting', 'Composition', 'Editing (Lightroom/Photoshop)', 'Equipment Maintenance', 'Visual Storytelling'],
    'Sound Engineer': ['Mixing', 'Mastering', 'Pro Tools', 'Logic Pro', 'Acoustics', 'Live Sound'],
    'Journalist / Reporter': ['Writing', 'Interviewing', 'Fact-checking', 'Research', 'Digital Media', 'Broadcast Skills'],

    // ----------------------------------------------------
    // CUSTOMER SUPPORT & BPO
    // ----------------------------------------------------

    'Customer Support Associate': ['Communication', 'Typing', 'Empathy', 'Basic Product Knowledge', 'Ticket Management'],
    'Team Leader (BPO/Support)': ['KPI Management', 'Coaching', 'Escalation Handling', 'Rostering', 'QA Feedback'],
    'Operations Manager (BPO)': ['SLA Management', 'Process Improvement', 'Client Relations', 'P&L Basics', 'Workforce Management'],

    // ----------------------------------------------------
    // GENERAL & OTHER
    // ----------------------------------------------------
    'Graphic Designer': ['Photoshop', 'Illustrator', 'Typography', 'Layout'],
    'Senior Graphic Designer': ['Art Direction', 'Brand Strategy', 'Team Mentoring', 'Project Management'],
    'Content Writer': ['SEO', 'Research', 'Editing', 'Blog Writing'],
    'Senior Content Strategist': ['Content Roadmap', 'Editorial Management', 'SEO Strategy', 'Brand Voice'],
};

export const jobProfiles = Object.keys(skillSuggestions).sort();
