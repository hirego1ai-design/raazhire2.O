// Mock Data for Candidate and Employer Dashboards
// This file contains realistic sample data for testing and development

export interface MockCandidate {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    current_address: string;
    permanent_address: string;
    job_profile: string;
    title: string;
    location: string;
    bio: string;
    profile_photo?: string;
    video_resume_url?: string;
    experience_years: number;

    // Education
    education_10th: {
        school: string;
        board: string;
        year: string;
        percentage: string;
    };
    education_12th: {
        school: string;
        board: string;
        year: string;
        percentage: string;
    };
    graduation: {
        college: string;
        degree: string;
        specialization: string;
        year: string;
        percentage: string;
    };
    post_graduation?: {
        college: string;
        degree: string;
        specialization: string;
        year: string;
        percentage: string;
    };

    // Skills
    skills: Array<{
        skill: string;
        score: number;
        category: string;
    }>;

    // Experience
    experiences: Array<{
        company: string;
        role: string;
        start_date: string;
        end_date: string;
        description: string;
    }>;

    // Gamification
    points: number;
    rank: number;
    badges: string[];
    portfolio?: Array<{
        id: string;
        title: string;
        description: string;
        link: string;
        technologies: string[];
        image_url?: string;
    }>;
    video_stats?: {
        views: number;
        avg_watch_time: string;
    };
}

export interface MockJobPost {
    id: string;
    employer_id: string;
    title: string;
    company: string;
    location: string;
    country: string;
    state: string;
    city: string;
    remote_type: 'remote' | 'hybrid' | 'onsite';
    job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
    salary_min: number;
    salary_max: number;
    currency: string;
    experience: string;
    openings: number;
    description: string;
    skills: string[];
    education_level: string[];
    field_of_study: string[];
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'closed';
    plan: string;
    created_at: string;
    applicant_count: number;
}

export interface MockEmployer {
    id: string;
    name: string;
    email: string;
    company: string;
    company_size: string;
    industry: string;
    website: string;
    logo?: string;
}

export interface MockApplication {
    id: string;
    candidate_id: string;
    job_id: string;
    status: 'applied' | 'screened' | 'shortlisted' | 'interview_scheduled' | 'hired' | 'rejected';
    score: number;
    applied_at: string;
}

// Mock Candidates Data
export const mockCandidates: MockCandidate[] = [
    {
        id: 'cand_001',
        user_id: 'user_001',
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91 9876543210',
        date_of_birth: '1998-05-15',
        current_address: 'HSR Layout, Bangalore, Karnataka 560102',
        permanent_address: 'MG Road, Pune, Maharashtra 411001',
        job_profile: 'Full Stack Developer',
        title: 'Full Stack Developer',
        location: 'Bangalore, India',
        bio: 'Passionate full-stack developer with 3+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.',
        profile_photo: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=4f46e5&color=fff&size=200',
        video_resume_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        experience_years: 3,
        education_10th: {
            school: 'Delhi Public School',
            board: 'CBSE',
            year: '2014',
            percentage: '92%'
        },
        education_12th: {
            school: 'Delhi Public School',
            board: 'CBSE',
            year: '2016',
            percentage: '88%'
        },
        graduation: {
            college: 'VIT University',
            degree: 'B.Tech',
            specialization: 'Computer Science',
            year: '2020',
            percentage: '8.5 CGPA'
        },
        skills: [
            { skill: 'React', score: 90, category: 'technical' },
            { skill: 'Node.js', score: 85, category: 'technical' },
            { skill: 'TypeScript', score: 80, category: 'technical' },
            { skill: 'MongoDB', score: 75, category: 'technical' },
            { skill: 'AWS', score: 70, category: 'technical' }
        ],
        experiences: [
            {
                company: 'Tech Solutions Pvt Ltd',
                role: 'Senior Full Stack Developer',
                start_date: '2022-01',
                end_date: 'Present',
                description: 'Leading development of enterprise web applications using React and Node.js'
            },
            {
                company: 'StartUp India',
                role: 'Full Stack Developer',
                start_date: '2020-07',
                end_date: '2021-12',
                description: 'Developed and maintained multiple client projects using MERN stack'
            }
        ],
        points: 2450,
        rank: 12,
        badges: ['Early Adopter', 'Profile Complete', 'Video Star'],
        portfolio: [
            {
                id: 'port_001',
                title: 'E-commerce Platform',
                description: 'A full-featured e-commerce platform with cart, checkout, and payment integration.',
                link: 'https://github.com/priya/ecommerce',
                technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                image_url: 'https://via.placeholder.com/300'
            }
        ],
        video_stats: {
            views: 120,
            avg_watch_time: '1:45'
        }
    },
    {
        id: 'cand_002',
        user_id: 'user_002',
        name: 'Rahul Verma',
        email: 'rahul.verma@email.com',
        phone: '+91 9876543211',
        date_of_birth: '1995-08-22',
        current_address: 'Koramangala, Bangalore, Karnataka 560034',
        permanent_address: 'Salt Lake, Kolkata, West Bengal 700091',
        job_profile: 'Data Scientist',
        title: 'Senior Data Scientist',
        location: 'Bangalore, India',
        bio: 'Data scientist with 5+ years of experience in machine learning, deep learning, and big data analytics. Published researcher in AI/ML.',
        profile_photo: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=10b981&color=fff&size=200',
        video_resume_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        experience_years: 5,
        education_10th: {
            school: 'Kendriya Vidyalaya',
            board: 'CBSE',
            year: '2011',
            percentage: '95%'
        },
        education_12th: {
            school: 'Kendriya Vidyalaya',
            board: 'CBSE',
            year: '2013',
            percentage: '93%'
        },
        graduation: {
            college: 'IIT Kharagpur',
            degree: 'B.Tech',
            specialization: 'Computer Science',
            year: '2017',
            percentage: '9.2 CGPA'
        },
        post_graduation: {
            college: 'IIT Bombay',
            degree: 'M.Tech',
            specialization: 'Artificial Intelligence',
            year: '2019',
            percentage: '9.5 CGPA'
        },
        skills: [
            { skill: 'Python', score: 95, category: 'technical' },
            { skill: 'Machine Learning', score: 92, category: 'technical' },
            { skill: 'TensorFlow', score: 88, category: 'technical' },
            { skill: 'Deep Learning', score: 90, category: 'technical' },
            { skill: 'Data Analysis', score: 93, category: 'technical' }
        ],
        experiences: [
            {
                company: 'AI Research Labs',
                role: 'Senior Data Scientist',
                start_date: '2021-03',
                end_date: 'Present',
                description: 'Leading ML research projects and deploying production models'
            },
            {
                company: 'Analytics Corp',
                role: 'Data Scientist',
                start_date: '2019-08',
                end_date: '2021-02',
                description: 'Developed predictive models for business intelligence'
            }
        ],
        points: 3200,
        rank: 5,
        badges: ['Top Performer', 'AI Expert', 'Video Star', 'Profile Complete']
    },
    {
        id: 'cand_003',
        user_id: 'user_003',
        name: 'Ananya Desai',
        email: 'ananya.desai@email.com',
        phone: '+91 9876543212',
        date_of_birth: '1999-03-10',
        current_address: 'Whitefield, Bangalore, Karnataka 560066',
        permanent_address: 'Satellite, Ahmedabad, Gujarat 380015',
        job_profile: 'UI/UX Designer',
        title: 'Senior UI/UX Designer',
        location: 'Bangalore, India',
        bio: 'Creative UI/UX designer with a passion for creating intuitive and beautiful user experiences. 4+ years of experience in product design.',
        profile_photo: 'https://ui-avatars.com/api/?name=Ananya+Desai&background=ec4899&color=fff&size=200',
        video_resume_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        experience_years: 4,
        education_10th: {
            school: 'St. Xavier\'s School',
            board: 'CBSE',
            year: '2015',
            percentage: '90%'
        },
        education_12th: {
            school: 'St. Xavier\'s School',
            board: 'CBSE',
            year: '2017',
            percentage: '87%'
        },
        graduation: {
            college: 'National Institute of Design',
            degree: 'B.Des',
            specialization: 'Interaction Design',
            year: '2021',
            percentage: '8.8 CGPA'
        },
        skills: [
            { skill: 'Figma', score: 95, category: 'technical' },
            { skill: 'Adobe XD', score: 90, category: 'technical' },
            { skill: 'UI Design', score: 92, category: 'technical' },
            { skill: 'UX Research', score: 88, category: 'technical' },
            { skill: 'Prototyping', score: 85, category: 'technical' }
        ],
        experiences: [
            {
                company: 'Design Studio',
                role: 'Senior UI/UX Designer',
                start_date: '2022-06',
                end_date: 'Present',
                description: 'Leading design for multiple product teams and mentoring junior designers'
            },
            {
                company: 'Creative Agency',
                role: 'UI/UX Designer',
                start_date: '2021-01',
                end_date: '2022-05',
                description: 'Designed user interfaces for web and mobile applications'
            }
        ],
        points: 2800,
        rank: 8,
        badges: ['Design Pro', 'Profile Complete', 'Video Star'],
        portfolio: [
            {
                id: 'port_002',
                title: 'Finance App Redesign',
                description: 'Complete redesign of a mobile banking application focusing on user experience.',
                link: 'https://behance.net/ananya/finance-app',
                technologies: ['Figma', 'Prototyping', 'User Research'],
                image_url: 'https://via.placeholder.com/300'
            }
        ],
        video_stats: {
            views: 250,
            avg_watch_time: '2:10'
        }
    },
    {
        id: 'cand_004',
        user_id: 'user_004',
        name: 'Arjun Patel',
        email: 'arjun.patel@email.com',
        phone: '+91 9876543213',
        date_of_birth: '2000-11-30',
        current_address: 'Indiranagar, Bangalore, Karnataka 560038',
        permanent_address: 'Vastrapur, Ahmedabad, Gujarat 380054',
        job_profile: 'DevOps Engineer',
        title: 'DevOps Engineer',
        location: 'Bangalore, India',
        bio: 'DevOps engineer specializing in cloud infrastructure, CI/CD pipelines, and automation. Experienced with AWS, Docker, and Kubernetes.',
        profile_photo: 'https://ui-avatars.com/api/?name=Arjun+Patel&background=f59e0b&color=fff&size=200',
        video_resume_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        experience_years: 2,
        education_10th: {
            school: 'Ryan International School',
            board: 'CBSE',
            year: '2016',
            percentage: '89%'
        },
        education_12th: {
            school: 'Ryan International School',
            board: 'CBSE',
            year: '2018',
            percentage: '85%'
        },
        graduation: {
            college: 'BITS Pilani',
            degree: 'B.E.',
            specialization: 'Computer Science',
            year: '2022',
            percentage: '8.2 CGPA'
        },
        skills: [
            { skill: 'AWS', score: 85, category: 'technical' },
            { skill: 'Docker', score: 88, category: 'technical' },
            { skill: 'Kubernetes', score: 82, category: 'technical' },
            { skill: 'CI/CD', score: 90, category: 'technical' },
            { skill: 'Linux', score: 87, category: 'technical' }
        ],
        experiences: [
            {
                company: 'Cloud Systems Inc',
                role: 'DevOps Engineer',
                start_date: '2022-07',
                end_date: 'Present',
                description: 'Managing cloud infrastructure and implementing automation solutions'
            }
        ],
        points: 1900,
        rank: 23,
        badges: ['Early Adopter', 'Profile Complete']
    },
    {
        id: 'cand_005',
        user_id: 'user_005',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@email.com',
        phone: '+91 9876543214',
        date_of_birth: '1997-07-18',
        current_address: 'Banjara Hills, Hyderabad, Telangana 500034',
        permanent_address: 'Jubilee Hills, Hyderabad, Telangana 500033',
        job_profile: 'Digital Marketing Manager',
        title: 'Digital Marketing Manager',
        location: 'Hyderabad, India',
        bio: 'Results-driven digital marketing professional with 4+ years of experience in SEO, SEM, and social media marketing. MBA in Marketing.',
        profile_photo: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=06b6d4&color=fff&size=200',
        video_resume_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        experience_years: 4,
        education_10th: {
            school: 'Narayana High School',
            board: 'CBSE',
            year: '2013',
            percentage: '94%'
        },
        education_12th: {
            school: 'Narayana Junior College',
            board: 'State Board',
            year: '2015',
            percentage: '91%'
        },
        graduation: {
            college: 'Osmania University',
            degree: 'B.Com',
            specialization: 'Commerce',
            year: '2018',
            percentage: '8.0 CGPA'
        },
        post_graduation: {
            college: 'IIM Bangalore',
            degree: 'MBA',
            specialization: 'Marketing',
            year: '2020',
            percentage: '8.7 CGPA'
        },
        skills: [
            { skill: 'SEO', score: 90, category: 'technical' },
            { skill: 'Google Analytics', score: 88, category: 'technical' },
            { skill: 'Social Media Marketing', score: 92, category: 'technical' },
            { skill: 'Content Marketing', score: 85, category: 'technical' },
            { skill: 'Digital Marketing', score: 93, category: 'technical' }
        ],
        experiences: [
            {
                company: 'Marketing Solutions Ltd',
                role: 'Digital Marketing Manager',
                start_date: '2021-09',
                end_date: 'Present',
                description: 'Leading digital marketing campaigns and managing marketing team'
            },
            {
                company: 'Growth Agency',
                role: 'Digital Marketing Specialist',
                start_date: '2020-06',
                end_date: '2021-08',
                description: 'Executed SEO and SEM campaigns for multiple clients'
            }
        ],
        points: 2650,
        rank: 10,
        badges: ['Marketing Expert', 'Profile Complete', 'Video Star']
    },
    {
        id: 'cand_006',
        user_id: 'user_006',
        name: 'Vikram Malhotra',
        email: 'vikram.m@email.com',
        phone: '+91 9876543215',
        date_of_birth: '2001-06-12',
        current_address: 'Powai, Mumbai, Maharashtra 400076',
        permanent_address: 'Civil Lines, Nagpur, Maharashtra 440001',
        job_profile: 'Marketing Associate',
        title: 'Marketing Associate',
        location: 'Mumbai, India',
        bio: 'Enthusiastic marketing graduate with strong communication skills and a passion for brand management. Eager to start a career in digital marketing.',
        profile_photo: 'https://ui-avatars.com/api/?name=Vikram+Malhotra&background=8b5cf6&color=fff&size=200',
        video_resume_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        experience_years: 0,
        education_10th: {
            school: 'Bombay Scottish School',
            board: 'ICSE',
            year: '2017',
            percentage: '88%'
        },
        education_12th: {
            school: 'St. Xaviers College',
            board: 'HSC',
            year: '2019',
            percentage: '85%'
        },
        graduation: {
            college: 'Jai Hind College',
            degree: 'BMM',
            specialization: 'Marketing',
            year: '2022',
            percentage: '8.2 CGPA'
        },
        skills: [
            { skill: 'Social Media', score: 85, category: 'technical' },
            { skill: 'Content Writing', score: 80, category: 'technical' },
            { skill: 'Communication', score: 90, category: 'soft' },
            { skill: 'Canva', score: 75, category: 'technical' }
        ],
        experiences: [],
        points: 1200,
        rank: 45,
        badges: ['Newcomer', 'Profile Complete']
    },
    {
        id: 'cand_007',
        user_id: 'user_007',
        name: 'Sarah Williams',
        email: 'sarah.w@email.com',
        phone: '+91 9876543216',
        date_of_birth: '1994-02-28',
        current_address: 'DLF Cyber City, Gurgaon, Haryana 122002',
        permanent_address: 'Sector 17, Chandigarh, 160017',
        job_profile: 'Sales Manager',
        title: 'Regional Sales Manager',
        location: 'Gurgaon, India',
        bio: 'Dynamic sales professional with 6 years of experience in B2B sales and account management. Proven track record of exceeding targets.',
        profile_photo: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=ef4444&color=fff&size=200',
        video_resume_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        experience_years: 6,
        education_10th: {
            school: 'Carmel Convent',
            board: 'CBSE',
            year: '2010',
            percentage: '90%'
        },
        education_12th: {
            school: 'Carmel Convent',
            board: 'CBSE',
            year: '2012',
            percentage: '88%'
        },
        graduation: {
            college: 'Delhi University',
            degree: 'B.Com',
            specialization: 'Commerce',
            year: '2015',
            percentage: '78%'
        },
        post_graduation: {
            college: 'MDI Gurgaon',
            degree: 'MBA',
            specialization: 'Sales & Marketing',
            year: '2017',
            percentage: '8.5 CGPA'
        },
        skills: [
            { skill: 'B2B Sales', score: 95, category: 'technical' },
            { skill: 'Negotiation', score: 92, category: 'soft' },
            { skill: 'CRM', score: 88, category: 'technical' },
            { skill: 'Team Leadership', score: 85, category: 'soft' }
        ],
        experiences: [
            {
                company: 'Global Tech Sales',
                role: 'Regional Sales Manager',
                start_date: '2020-04',
                end_date: 'Present',
                description: 'Managing sales operations for North India region'
            },
            {
                company: 'SalesForce Solutions',
                role: 'Sales Executive',
                start_date: '2017-06',
                end_date: '2020-03',
                description: 'Responsible for acquiring new corporate clients'
            }
        ],
        points: 3100,
        rank: 7,
        badges: ['Top Seller', 'Leader', 'Video Star']
    },
    {
        id: 'cand_008',
        user_id: 'user_008',
        name: 'David Chen',
        email: 'david.c@email.com',
        phone: '+91 9876543217',
        date_of_birth: '1992-09-15',
        current_address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
        permanent_address: 'Marine Drive, Mumbai, Maharashtra 400020',
        job_profile: 'Finance Manager',
        title: 'Finance Manager',
        location: 'Mumbai, India',
        bio: 'Chartered Accountant with 8 years of experience in corporate finance, auditing, and financial planning. Expert in financial modeling.',
        profile_photo: 'https://ui-avatars.com/api/?name=David+Chen&background=3b82f6&color=fff&size=200',
        video_resume_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        experience_years: 8,
        education_10th: {
            school: 'Cathedral and John Connon',
            board: 'ICSE',
            year: '2008',
            percentage: '94%'
        },
        education_12th: {
            school: 'HR College',
            board: 'HSC',
            year: '2010',
            percentage: '92%'
        },
        graduation: {
            college: 'HR College',
            degree: 'B.Com',
            specialization: 'Accounting',
            year: '2013',
            percentage: '85%'
        },
        post_graduation: {
            college: 'ICAI',
            degree: 'CA',
            specialization: 'Finance',
            year: '2016',
            percentage: 'Pass'
        },
        skills: [
            { skill: 'Financial Modeling', score: 95, category: 'technical' },
            { skill: 'Auditing', score: 90, category: 'technical' },
            { skill: 'Taxation', score: 88, category: 'technical' },
            { skill: 'Excel', score: 98, category: 'technical' }
        ],
        experiences: [
            {
                company: 'FinCorp Advisors',
                role: 'Finance Manager',
                start_date: '2019-05',
                end_date: 'Present',
                description: 'Overseeing financial planning and analysis for key accounts'
            },
            {
                company: 'Big 4 Audit',
                role: 'Senior Auditor',
                start_date: '2016-08',
                end_date: '2019-04',
                description: 'Led statutory audits for manufacturing clients'
            }
        ],
        points: 3500,
        rank: 3,
        badges: ['Finance Guru', 'Profile Complete']
    }
];

// Mock Employers Data
export const mockEmployers: MockEmployer[] = [
    {
        id: 'emp_001',
        name: 'Rajesh Kumar',
        email: 'rajesh@techcorp.com',
        company: 'TechCorp Solutions',
        company_size: '500-1000',
        industry: 'Information Technology',
        website: 'https://techcorp.com',
        logo: 'https://ui-avatars.com/api/?name=TechCorp&background=4f46e5&color=fff&size=200'
    },
    {
        id: 'emp_002',
        name: 'Meera Singh',
        email: 'meera@innovateai.com',
        company: 'InnovateAI Labs',
        company_size: '100-500',
        industry: 'Artificial Intelligence',
        website: 'https://innovateai.com',
        logo: 'https://ui-avatars.com/api/?name=InnovateAI&background=10b981&color=fff&size=200'
    },
    {
        id: 'emp_003',
        name: 'Amit Bansal',
        email: 'amit@designstudio.com',
        company: 'Creative Design Studio',
        company_size: '50-100',
        industry: 'Design & Creative',
        website: 'https://designstudio.com',
        logo: 'https://ui-avatars.com/api/?name=Creative+Design&background=ec4899&color=fff&size=200'
    },
    {
        id: 'emp_004',
        name: 'Robert Langdon',
        email: 'robert@globalfintech.com',
        company: 'Global FinTech',
        company_size: '1000-5000',
        industry: 'Financial Services',
        website: 'https://globalfintech.com',
        logo: 'https://ui-avatars.com/api/?name=Global+FinTech&background=3b82f6&color=fff&size=200'
    },
    {
        id: 'emp_005',
        name: 'Jennifer Lopez',
        email: 'jennifer@retailgiants.com',
        company: 'Retail Giants',
        company_size: '5000+',
        industry: 'Retail',
        website: 'https://retailgiants.com',
        logo: 'https://ui-avatars.com/api/?name=Retail+Giants&background=ef4444&color=fff&size=200'
    }
];

// Mock Job Posts Data
export const mockJobPosts: MockJobPost[] = [
    {
        id: 'job_001',
        employer_id: 'emp_001',
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Solutions',
        location: 'Bangalore, Karnataka, India',
        country: 'India',
        state: 'Karnataka',
        city: 'Bangalore',
        remote_type: 'hybrid',
        job_type: 'full_time',
        salary_min: 1200000,
        salary_max: 1800000,
        currency: 'INR',
        experience: '3-5',
        openings: 3,
        description: '<h2><strong>Role Summary</strong></h2><p>We are looking for a talented <strong>Senior Full Stack Developer</strong> to join our team at <strong>TechCorp Solutions</strong>...</p>',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        education_level: ['Undergraduate (B.Tech)', 'Undergraduate (B.E.)'],
        field_of_study: ['Computer Science', 'Information Technology'],
        status: 'approved',
        plan: 'pay-per-hire',
        created_at: '2024-11-15',
        applicant_count: 12
    },
    {
        id: 'job_002',
        employer_id: 'emp_002',
        title: 'Machine Learning Engineer',
        company: 'InnovateAI Labs',
        location: 'Bangalore, Karnataka, India',
        country: 'India',
        state: 'Karnataka',
        city: 'Bangalore',
        remote_type: 'remote',
        job_type: 'full_time',
        salary_min: 1500000,
        salary_max: 2500000,
        currency: 'INR',
        experience: '5-10',
        openings: 2,
        description: '<h2><strong>Role Summary</strong></h2><p>Join our AI research team as a <strong>Machine Learning Engineer</strong>...</p>',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
        education_level: ['Postgraduate (M.Tech)', 'Doctorate (Ph.D.)'],
        field_of_study: ['Computer Science', 'Artificial Intelligence'],
        status: 'approved',
        plan: 'free',
        created_at: '2024-11-20',
        applicant_count: 8
    },
    {
        id: 'job_003',
        employer_id: 'emp_003',
        title: 'UI/UX Designer',
        company: 'Creative Design Studio',
        location: 'Mumbai, Maharashtra, India',
        country: 'India',
        state: 'Maharashtra',
        city: 'Mumbai',
        remote_type: 'hybrid',
        job_type: 'full_time',
        salary_min: 800000,
        salary_max: 1400000,
        currency: 'INR',
        experience: '3-5',
        openings: 2,
        description: '<h2><strong>Role Summary</strong></h2><p>We need a creative <strong>UI/UX Designer</strong> to craft beautiful experiences...</p>',
        skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
        education_level: ['Undergraduate (B.Des)', 'Any Graduate'],
        field_of_study: ['Design', 'Visual Arts'],
        status: 'approved',
        plan: '7day',
        created_at: '2024-11-22',
        applicant_count: 15
    },
    {
        id: 'job_004',
        employer_id: 'emp_001',
        title: 'DevOps Engineer',
        company: 'TechCorp Solutions',
        location: 'Pune, Maharashtra, India',
        country: 'India',
        state: 'Maharashtra',
        city: 'Pune',
        remote_type: 'onsite',
        job_type: 'full_time',
        salary_min: 1000000,
        salary_max: 1600000,
        currency: 'INR',
        experience: '1-3',
        openings: 4,
        description: '<h2><strong>Role Summary</strong></h2><p>Looking for <strong>DevOps Engineers</strong> to manage our cloud infrastructure...</p>',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
        education_level: ['Undergraduate (B.Tech)', 'Undergraduate (B.E.)'],
        field_of_study: ['Computer Science', 'Information Technology'],
        status: 'pending',
        plan: '3day',
        created_at: '2024-11-25',
        applicant_count: 0
    },
    {
        id: 'job_005',
        employer_id: 'emp_002',
        title: 'Digital Marketing Manager',
        company: 'InnovateAI Labs',
        location: 'Hyderabad, Telangana, India',
        country: 'India',
        state: 'Telangana',
        city: 'Hyderabad',
        remote_type: 'hybrid',
        job_type: 'full_time',
        salary_min: 900000,
        salary_max: 1500000,
        currency: 'INR',
        experience: '3-5',
        openings: 1,
        description: '<h2><strong>Role Summary</strong></h2><p>We need an experienced <strong>Digital Marketing Manager</strong>...</p>',
        skills: ['SEO', 'Google Analytics', 'Social Media Marketing', 'Content Marketing'],
        education_level: ['Postgraduate (MBA)', 'Any Postgraduate'],
        field_of_study: ['Marketing', 'Business Administration'],
        status: 'approved',
        plan: 'pay-per-hire',
        created_at: '2024-11-18',
        applicant_count: 10
    },
    {
        id: 'job_006',
        employer_id: 'emp_005',
        title: 'Marketing Executive',
        company: 'Retail Giants',
        location: 'Mumbai, Maharashtra, India',
        country: 'India',
        state: 'Maharashtra',
        city: 'Mumbai',
        remote_type: 'onsite',
        job_type: 'full_time',
        salary_min: 400000,
        salary_max: 600000,
        currency: 'INR',
        experience: '0-2',
        openings: 5,
        description: '<h2><strong>Role Summary</strong></h2><p>We are looking for fresh <strong>Marketing Executives</strong> to join our retail marketing team...</p>',
        skills: ['Marketing', 'Communication', 'Social Media', 'Events'],
        education_level: ['Undergraduate (Any)', 'Postgraduate (MBA)'],
        field_of_study: ['Marketing', 'Business'],
        status: 'approved',
        plan: 'standard',
        created_at: '2024-11-28',
        applicant_count: 25
    },
    {
        id: 'job_007',
        employer_id: 'emp_005',
        title: 'Regional Sales Manager',
        company: 'Retail Giants',
        location: 'Delhi, India',
        country: 'India',
        state: 'Delhi',
        city: 'New Delhi',
        remote_type: 'onsite',
        job_type: 'full_time',
        salary_min: 1500000,
        salary_max: 2200000,
        currency: 'INR',
        experience: '5-8',
        openings: 2,
        description: '<h2><strong>Role Summary</strong></h2><p>Seeking experienced <strong>Sales Managers</strong> to lead our North India operations...</p>',
        skills: ['Sales Management', 'Team Leadership', 'Retail Sales', 'Strategy'],
        education_level: ['Postgraduate (MBA)'],
        field_of_study: ['Sales', 'Marketing'],
        status: 'approved',
        plan: 'premium',
        created_at: '2024-11-27',
        applicant_count: 8
    },
    {
        id: 'job_008',
        employer_id: 'emp_004',
        title: 'Financial Analyst',
        company: 'Global FinTech',
        location: 'Bangalore, Karnataka, India',
        country: 'India',
        state: 'Karnataka',
        city: 'Bangalore',
        remote_type: 'hybrid',
        job_type: 'full_time',
        salary_min: 1000000,
        salary_max: 1500000,
        currency: 'INR',
        experience: '2-4',
        openings: 3,
        description: '<h2><strong>Role Summary</strong></h2><p>Join our finance team as a <strong>Financial Analyst</strong>...</p>',
        skills: ['Financial Analysis', 'Excel', 'SQL', 'Reporting'],
        education_level: ['Undergraduate (B.Com)', 'Postgraduate (MBA/CA)'],
        field_of_study: ['Finance', 'Accounting'],
        status: 'approved',
        plan: 'standard',
        created_at: '2024-11-29',
        applicant_count: 15
    }
];

// Mock Applications Data
export const mockApplications: MockApplication[] = [
    { id: 'app_001', candidate_id: 'cand_001', job_id: 'job_001', status: 'shortlisted', score: 88, applied_at: '2024-11-16' },
    { id: 'app_002', candidate_id: 'cand_001', job_id: 'job_004', status: 'applied', score: 75, applied_at: '2024-11-26' },
    { id: 'app_003', candidate_id: 'cand_002', job_id: 'job_002', status: 'interview_scheduled', score: 95, applied_at: '2024-11-21' },
    { id: 'app_004', candidate_id: 'cand_003', job_id: 'job_003', status: 'hired', score: 92, applied_at: '2024-11-23' },
    { id: 'app_005', candidate_id: 'cand_004', job_id: 'job_001', status: 'screened', score: 78, applied_at: '2024-11-17' },
    { id: 'app_006', candidate_id: 'cand_004', job_id: 'job_004', status: 'shortlisted', score: 85, applied_at: '2024-11-26' },
    { id: 'app_007', candidate_id: 'cand_005', job_id: 'job_005', status: 'interview_scheduled', score: 90, applied_at: '2024-11-19' },
    { id: 'app_008', candidate_id: 'cand_002', job_id: 'job_001', status: 'applied', score: 82, applied_at: '2024-11-18' },
    { id: 'app_009', candidate_id: 'cand_003', job_id: 'job_001', status: 'shortlisted', score: 87, applied_at: '2024-11-17' },
    { id: 'app_010', candidate_id: 'cand_005', job_id: 'job_003', status: 'applied', score: 70, applied_at: '2024-11-24' },
    { id: 'app_011', candidate_id: 'cand_006', job_id: 'job_006', status: 'applied', score: 85, applied_at: '2024-11-29' },
    { id: 'app_012', candidate_id: 'cand_007', job_id: 'job_007', status: 'shortlisted', score: 92, applied_at: '2024-11-28' },
    { id: 'app_013', candidate_id: 'cand_008', job_id: 'job_008', status: 'interview_scheduled', score: 89, applied_at: '2024-11-30' },
    { id: 'app_014', candidate_id: 'cand_001', job_id: 'job_008', status: 'applied', score: 75, applied_at: '2024-11-30' },
    { id: 'app_015', candidate_id: 'cand_002', job_id: 'job_008', status: 'screened', score: 80, applied_at: '2024-11-30' }
];

// Helper functions to get related data
export const getCandidateById = (id: string) => mockCandidates.find(c => c.id === id);
export const getJobById = (id: string) => mockJobPosts.find(j => j.id === id);
export const getEmployerById = (id: string) => mockEmployers.find(e => e.id === id);

export const getApplicationsForJob = (jobId: string) =>
    mockApplications.filter(app => app.job_id === jobId);

export const getApplicationsForCandidate = (candidateId: string) =>
    mockApplications.filter(app => app.candidate_id === candidateId);

export const getCandidatesForJob = (jobId: string) => {
    const applications = getApplicationsForJob(jobId);
    return applications.map(app => ({
        ...getCandidateById(app.candidate_id),
        applicationStatus: app.status,
        applicationScore: app.score,
        appliedAt: app.applied_at
    })).filter(c => c.id);
};

export const getJobsForEmployer = (employerId: string) =>
    mockJobPosts.filter(job => job.employer_id === employerId);

export const getApprovedJobs = () =>
    mockJobPosts.filter(job => job.status === 'approved');

export interface MockInterview {
    id: string;
    application_id: string;
    candidate_id: string;
    job_id: string;
    employer_id: string;
    scheduled_at: string;
    duration_minutes: number;
    type: 'video' | 'phone' | 'in-person';
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    meeting_link?: string;
    notes?: string;
    feedback?: string;
    round: number;
    interviewer_name: string;
}

export const mockInterviews: MockInterview[] = [
    {
        id: 'int_001',
        application_id: 'app_003',
        candidate_id: 'cand_002',
        job_id: 'job_002',
        employer_id: 'emp_002',
        scheduled_at: '2024-12-05T10:00:00Z',
        duration_minutes: 60,
        type: 'video',
        status: 'scheduled',
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        round: 1,
        interviewer_name: 'Dr. Alan Turing'
    },
    {
        id: 'int_002',
        application_id: 'app_007',
        candidate_id: 'cand_005',
        job_id: 'job_005',
        employer_id: 'emp_002',
        scheduled_at: '2024-12-06T14:00:00Z',
        duration_minutes: 45,
        type: 'video',
        status: 'scheduled',
        meeting_link: 'https://meet.google.com/xyz-uvw-rst',
        round: 1,
        interviewer_name: 'Sarah Connor'
    },
    {
        id: 'int_003',
        application_id: 'app_013',
        candidate_id: 'cand_008',
        job_id: 'job_008',
        employer_id: 'emp_004',
        scheduled_at: '2024-12-07T11:00:00Z',
        duration_minutes: 30,
        type: 'phone',
        status: 'scheduled',
        round: 1,
        interviewer_name: 'Jordan Belfort'
    },
    {
        id: 'int_004',
        application_id: 'app_001',
        candidate_id: 'cand_001',
        job_id: 'job_001',
        employer_id: 'emp_001',
        scheduled_at: '2024-11-20T15:00:00Z',
        duration_minutes: 60,
        type: 'video',
        status: 'completed',
        meeting_link: 'https://meet.google.com/completed-link',
        notes: 'Candidate was very knowledgeable about React internals.',
        feedback: 'Strong technical skills, good communication. Recommended for next round.',
        round: 1,
        interviewer_name: 'Steve Wozniak'
    }
];

export const getInterviewsForCandidate = (candidateId: string) =>
    mockInterviews.filter(int => int.candidate_id === candidateId);

export const getInterviewsForEmployer = (employerId: string) =>
    mockInterviews.filter(int => int.employer_id === employerId);

export const getInterviewsForJob = (jobId: string) =>
    mockInterviews.filter(int => int.job_id === jobId);
