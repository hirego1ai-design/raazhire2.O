// src/data/mockCandidates.ts
// Centralized mock candidate data for the application

export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    photoUrl: string;
    videoUrl: string; // short preview clip
    appliedJobTitle: string;
    currentRole: string;
    experienceYears: number;
    skills: string[];
    location: string;
    timezone: string;
    aiScore: number; // 0‑100
    status: 'applied' | 'screened' | 'shortlisted' | 'interview_scheduled' | 'hired';

    // Extended profile information
    bio: string;
    education: {
        degree: string;
        institution: string;
        period: string;
        specialization?: string;
        gpa?: string;
    }[];
    experience: {
        role: string;
        company: string;
        period: string;
        description: string;
    }[];
    portfolio: {
        id: number;
        title: string;
        description: string;
        technologies: string[];
        imageUrl?: string;
    }[];
    socialLinks: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        portfolio?: string;
    };

    // Gamification stats
    gamification: {
        rank: number;
        totalCandidates: number;
        points: number;
        masteryScore: number;
        accuracy: number;
    };

    // Video stats
    videoStats: {
        views: number;
        avgWatchTime: string;
        completionRate: number;
    };

    // Skills breakdown
    technicalSkills: { name: string; score: number }[];
    softSkills: { name: string; score: number }[];
}

export const MOCK_CANDIDATES: Candidate[] = [
    {
        id: 'c1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1 (555) 234-5678',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        videoUrl: '/videos/sarah_preview.mp4',
        appliedJobTitle: 'Senior Frontend Engineer',
        currentRole: 'Senior Frontend Developer',
        experienceYears: 5,
        skills: ['React', 'TypeScript', 'Tailwind', 'Node.js', 'Next.js', 'GraphQL'],
        location: 'New York, NY',
        timezone: 'EST (UTC‑5)',
        aiScore: 92,
        status: 'applied',
        bio: 'Passionate Frontend Developer with 5+ years of experience building scalable, user-centric web applications. Expertise in React ecosystem and modern web technologies. Love creating beautiful, performant UIs that users enjoy.',
        education: [
            {
                degree: 'Master of Computer Science',
                institution: 'Stanford University',
                period: '2016 - 2018',
                specialization: 'Human-Computer Interaction',
                gpa: '3.9/4.0'
            },
            {
                degree: 'B.S. Computer Science',
                institution: 'UC Berkeley',
                period: '2012 - 2016',
                gpa: '3.8/4.0'
            }
        ],
        experience: [
            {
                role: 'Senior Frontend Engineer',
                company: 'TechCorp Inc.',
                period: '2022 - Present',
                description: 'Leading the frontend team, migrating legacy codebase to React 18 and Next.js 14. Improved performance by 40%.'
            },
            {
                role: 'Frontend Developer',
                company: 'StartUp Flow',
                period: '2020 - 2022',
                description: 'Built the MVP from scratch using React and TypeScript. Scaled to 100k users.'
            },
            {
                role: 'Junior Developer',
                company: 'WebSolutions',
                period: '2018 - 2020',
                description: 'Developed responsive websites and e-commerce platforms using modern web technologies.'
            }
        ],
        portfolio: [
            { id: 1, title: 'E-commerce Platform', description: 'Full-featured online store', technologies: ['React', 'Node.js', 'MongoDB'] },
            { id: 2, title: 'Task Management App', description: 'Collaborative project management tool', technologies: ['Next.js', 'TypeScript', 'Prisma'] },
            { id: 3, title: 'AI Chat Interface', description: 'Real-time AI-powered chat application', technologies: ['React', 'WebSocket', 'OpenAI'] }
        ],
        socialLinks: {
            github: 'https://github.com/sarahjohnson',
            linkedin: 'https://linkedin.com/in/sarahjohnson',
            twitter: 'https://twitter.com/sarahdev',
            portfolio: 'https://sarahjohnson.dev'
        },
        gamification: {
            rank: 850,
            totalCandidates: 98000,
            points: 3200,
            masteryScore: 920,
            accuracy: 94
        },
        videoStats: {
            views: 2340,
            avgWatchTime: '2:05',
            completionRate: 87
        },
        technicalSkills: [
            { name: 'React', score: 95 },
            { name: 'TypeScript', score: 92 },
            { name: 'Node.js', score: 85 },
            { name: 'Next.js', score: 90 },
            { name: 'GraphQL', score: 80 }
        ],
        softSkills: [
            { name: 'Communication', score: 95 },
            { name: 'Leadership', score: 88 },
            { name: 'Problem Solving', score: 96 },
            { name: 'Teamwork', score: 92 }
        ]
    },
    {
        id: 'c2',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        phone: '+1 (555) 345-6789',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        videoUrl: '/videos/michael_preview.mp4',
        appliedJobTitle: 'Full‑Stack Engineer',
        currentRole: 'Full Stack Developer',
        experienceYears: 3,
        skills: ['Python', 'Django', 'React', 'AWS', 'Docker', 'PostgreSQL'],
        location: 'San Francisco, CA',
        timezone: 'PST (UTC‑8)',
        aiScore: 85,
        status: 'shortlisted',
        bio: 'Full Stack Developer passionate about building robust backend systems and elegant frontends. Experienced in cloud architecture and DevOps practices.',
        education: [
            {
                degree: 'B.S. Software Engineering',
                institution: 'MIT',
                period: '2017 - 2021',
                gpa: '3.7/4.0'
            }
        ],
        experience: [
            {
                role: 'Full Stack Developer',
                company: 'CloudTech Solutions',
                period: '2021 - Present',
                description: 'Building scalable microservices architecture using Python and React. Deployed on AWS with Docker and Kubernetes.'
            },
            {
                role: 'Software Engineering Intern',
                company: 'Google',
                period: '2020 - 2021',
                description: 'Worked on internal tools using Python and Go. Contributed to cloud infrastructure projects.'
            }
        ],
        portfolio: [
            { id: 1, title: 'Cloud Dashboard', description: 'Real-time monitoring dashboard', technologies: ['React', 'Python', 'AWS'] },
            { id: 2, title: 'API Gateway', description: 'Microservices API gateway', technologies: ['Django', 'Redis', 'Docker'] }
        ],
        socialLinks: {
            github: 'https://github.com/michaelchen',
            linkedin: 'https://linkedin.com/in/michaelchen',
            portfolio: 'https://michaelchen.io'
        },
        gamification: {
            rank: 1250,
            totalCandidates: 98000,
            points: 2450,
            masteryScore: 850,
            accuracy: 92
        },
        videoStats: {
            views: 1560,
            avgWatchTime: '1:50',
            completionRate: 82
        },
        technicalSkills: [
            { name: 'Python', score: 93 },
            { name: 'Django', score: 90 },
            { name: 'React', score: 85 },
            { name: 'AWS', score: 88 },
            { name: 'Docker', score: 86 }
        ],
        softSkills: [
            { name: 'Communication', score: 88 },
            { name: 'Leadership', score: 82 },
            { name: 'Problem Solving', score: 94 },
            { name: 'Teamwork', score: 90 }
        ]
    },
    {
        id: 'c3',
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+44 20 1234 5678',
        photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        videoUrl: '/videos/emily_preview.mp4',
        appliedJobTitle: 'UI/UX Designer',
        currentRole: 'Senior UI/UX Designer',
        experienceYears: 4,
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
        location: 'Remote',
        timezone: 'GMT+0',
        aiScore: 78,
        status: 'interview_scheduled',
        bio: 'Creative UI/UX Designer with a passion for creating intuitive, beautiful user experiences. Experienced in design systems and user research methodologies.',
        education: [
            {
                degree: 'M.A. Interaction Design',
                institution: 'Royal College of Art',
                period: '2018 - 2020'
            },
            {
                degree: 'B.A. Graphic Design',
                institution: 'Central Saint Martins',
                period: '2014 - 2018'
            }
        ],
        experience: [
            {
                role: 'Senior UI/UX Designer',
                company: 'DesignHub',
                period: '2022 - Present',
                description: 'Leading design for enterprise SaaS products. Built comprehensive design system used across 5 products.'
            },
            {
                role: 'UI/UX Designer',
                company: 'Creative Agency',
                period: '2020 - 2022',
                description: 'Designed mobile and web applications for various clients. Conducted user research and usability testing.'
            }
        ],
        portfolio: [
            { id: 1, title: 'Banking App Redesign', description: 'Complete redesign of mobile banking app', technologies: ['Figma', 'Prototyping'] },
            { id: 2, title: 'Design System', description: 'Enterprise design system', technologies: ['Figma', 'Storybook'] },
            { id: 3, title: 'E-commerce UX', description: 'User research and UX optimization', technologies: ['User Research', 'A/B Testing'] }
        ],
        socialLinks: {
            linkedin: 'https://linkedin.com/in/emilydavis',
            portfolio: 'https://emilydavis.design',
            twitter: 'https://twitter.com/emilydesigns'
        },
        gamification: {
            rank: 2100,
            totalCandidates: 98000,
            points: 1850,
            masteryScore: 780,
            accuracy: 89
        },
        videoStats: {
            views: 980,
            avgWatchTime: '1:35',
            completionRate: 75
        },
        technicalSkills: [
            { name: 'Figma', score: 98 },
            { name: 'Adobe XD', score: 92 },
            { name: 'Prototyping', score: 95 },
            { name: 'User Research', score: 90 },
            { name: 'Design Systems', score: 93 }
        ],
        softSkills: [
            { name: 'Communication', score: 96 },
            { name: 'Creativity', score: 98 },
            { name: 'Problem Solving', score: 92 },
            { name: 'Teamwork', score: 94 }
        ]
    },
    {
        id: 'c4',
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        phone: '+1 (555) 456-7890',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        videoUrl: '/videos/david_preview.mp4',
        appliedJobTitle: 'Backend Engineer',
        currentRole: 'Senior Backend Engineer',
        experienceYears: 6,
        skills: ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes', 'PostgreSQL'],
        location: 'Austin, TX',
        timezone: 'CST (UTC‑6)',
        aiScore: 88,
        status: 'applied',
        bio: 'Experienced Backend Engineer specializing in building high-performance, scalable microservices. Expert in Java ecosystem and cloud-native architectures.',
        education: [
            {
                degree: 'M.S. Computer Science',
                institution: 'University of Texas at Austin',
                period: '2016 - 2018',
                specialization: 'Distributed Systems'
            },
            {
                degree: 'B.S. Computer Engineering',
                institution: 'Texas A&M University',
                period: '2012 - 2016'
            }
        ],
        experience: [
            {
                role: 'Senior Backend Engineer',
                company: 'Enterprise Solutions Inc.',
                period: '2020 - Present',
                description: 'Architecting and implementing microservices for enterprise clients. Leading a team of 5 engineers.'
            },
            {
                role: 'Backend Developer',
                company: 'FinTech Startup',
                period: '2018 - 2020',
                description: 'Built payment processing system handling $10M+ in transactions. Implemented fraud detection algorithms.'
            }
        ],
        portfolio: [
            { id: 1, title: 'Payment Gateway', description: 'High-throughput payment processing system', technologies: ['Java', 'Spring Boot', 'Kafka'] },
            { id: 2, title: 'Microservices Platform', description: 'Enterprise microservices architecture', technologies: ['Java', 'Docker', 'Kubernetes'] }
        ],
        socialLinks: {
            github: 'https://github.com/davidwilson',
            linkedin: 'https://linkedin.com/in/davidwilson'
        },
        gamification: {
            rank: 950,
            totalCandidates: 98000,
            points: 2980,
            masteryScore: 890,
            accuracy: 93
        },
        videoStats: {
            views: 1780,
            avgWatchTime: '1:58',
            completionRate: 84
        },
        technicalSkills: [
            { name: 'Java', score: 96 },
            { name: 'Spring Boot', score: 94 },
            { name: 'Microservices', score: 92 },
            { name: 'Docker', score: 90 },
            { name: 'Kubernetes', score: 88 }
        ],
        softSkills: [
            { name: 'Communication', score: 90 },
            { name: 'Leadership', score: 92 },
            { name: 'Problem Solving', score: 95 },
            { name: 'Teamwork', score: 91 }
        ]
    }
];

// Helper function to get candidate by ID
export const getCandidateById = (id: string): Candidate | undefined => {
    return MOCK_CANDIDATES.find(candidate => candidate.id === id);
};

// Helper function to get candidates by status
export const getCandidatesByStatus = (status: Candidate['status']): Candidate[] => {
    return MOCK_CANDIDATES.filter(candidate => candidate.status === status);
};
