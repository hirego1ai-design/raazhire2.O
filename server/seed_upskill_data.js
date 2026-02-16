
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load from current directory first, then parent
dotenv.config({ path: join(__dirname, '.env') });
if (!process.env.SUPABASE_URL) {
    dotenv.config({ path: join(__dirname, '../.env') });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log(`Debug: URL found: ${!!supabaseUrl}, Key found: ${!!supabaseKey}`);

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const courses = [
    {
        title: 'Data Science Fundamentals',
        description: 'Master the basics of data science including Python, statistics, and machine learning.',
        category: 'Data & Analytics',
        difficulty: 'beginner',
        duration_hours: 40,
        lessons_count: 24,
        instructor: 'Dr. Sarah Chen',
        rating: 4.8,
        enrolled_count: 12500,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        skills: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
        is_featured: true,
        price: 0
    },
    {
        title: 'AI & Machine Learning Masterclass',
        description: 'Deep dive into neural networks, deep learning, and modern AI architectures.',
        category: 'AI & Machine Learning',
        difficulty: 'intermediate',
        duration_hours: 60,
        lessons_count: 36,
        instructor: 'Prof. James Miller',
        rating: 4.9,
        enrolled_count: 8700,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        skills: ['TensorFlow', 'PyTorch', 'Neural Networks', 'NLP'],
        is_featured: true,
        price: 49.99
    },
    {
        title: 'Full Stack Web Development',
        description: 'Build modern web applications with React, Node.js, and databases.',
        category: 'Coding & Software',
        difficulty: 'intermediate',
        duration_hours: 80,
        lessons_count: 48,
        instructor: 'Alex Johnson',
        rating: 4.7,
        enrolled_count: 15200,
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
        is_featured: true,
        price: 0
    },
    {
        title: 'Business Communication Excellence',
        description: 'Master professional communication, presentations, and stakeholder management.',
        category: 'Communication Skills',
        difficulty: 'beginner',
        duration_hours: 20,
        lessons_count: 12,
        instructor: 'Maria Garcia',
        rating: 4.6,
        enrolled_count: 9800,
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        skills: ['Presentation', 'Email Writing', 'Public Speaking', 'Negotiation'],
        is_featured: false,
        price: 0
    },
    {
        title: 'Customer Service Mastery',
        description: 'Learn best practices for BPO, customer support, and service excellence.',
        category: 'BPO / Customer Support',
        difficulty: 'beginner',
        duration_hours: 25,
        lessons_count: 15,
        instructor: 'Robert Kim',
        rating: 4.5,
        enrolled_count: 6500,
        thumbnail: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800',
        skills: ['CRM Tools', 'Conflict Resolution', 'Active Listening', 'Ticketing Systems'],
        is_featured: false,
        price: 0
    },
    {
        title: 'HR Management & Recruitment',
        description: 'Comprehensive training in human resources and talent acquisition.',
        category: 'HR & Admin Skills',
        difficulty: 'intermediate',
        duration_hours: 35,
        lessons_count: 20,
        instructor: 'Lisa Thompson',
        rating: 4.7,
        enrolled_count: 4200,
        thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
        skills: ['Talent Acquisition', 'HRIS', 'Compensation', 'Employee Relations'],
        is_featured: false,
        price: 29.99
    },
    {
        title: 'UI/UX Design Bootcamp',
        description: 'Learn user interface design, user experience principles, and design tools.',
        category: 'Creative & Design',
        difficulty: 'beginner',
        duration_hours: 45,
        lessons_count: 28,
        instructor: 'Emma Wilson',
        rating: 4.8,
        enrolled_count: 11000,
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        is_featured: true,
        price: 0
    },
    {
        title: 'Project Management Professional',
        description: 'Master project management methodologies including Agile and Scrum.',
        category: 'Business & Operations',
        difficulty: 'advanced',
        duration_hours: 50,
        lessons_count: 30,
        instructor: 'David Brown',
        rating: 4.9,
        enrolled_count: 7800,
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        skills: ['Agile', 'Scrum', 'Risk Management', 'Stakeholder Communication'],
        is_featured: true,
        price: 79.99
    }
];

const lessonTemplates = [
    { title: 'Introduction & Overview', type: 'video', duration_minutes: 15 },
    { title: 'Core Concepts', type: 'video', duration_minutes: 25 },
    { title: 'Hands-On Practice', type: 'interactive', duration_minutes: 30 },
    { title: 'Deep Dive', type: 'video', duration_minutes: 35 },
    { title: 'Case Study', type: 'reading', duration_minutes: 20 },
    { title: 'Quiz & Review', type: 'quiz', duration_minutes: 15 }
];

async function seed() {
    console.log('🌱 Starting Upskill Data Seed...');

    for (const courseData of courses) {
        console.log(`Processing course: ${courseData.title}`);

        // Insert Course
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert(courseData)
            .select()
            .single();

        if (courseError) {
            console.error('Error inserting course:', courseError);
            continue;
        }

        console.log(`✅ Course Created: ${course.id}`);

        // Create Lessons
        let lessonOrder = 1;
        for (const template of lessonTemplates) {
            const lessonData = {
                course_id: course.id,
                order: lessonOrder++,
                title: `Module ${lessonOrder - 1}: ${template.title}`,
                description: `Learn about ${template.title.toLowerCase()} in this comprehensive lesson.`,
                type: template.type,
                duration_minutes: template.duration_minutes,
                video_url: template.type === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : null,
                content: template.type === 'reading' ? 'This is the lesson content...' : null,
                resources: [
                    { name: 'Supplementary PDF', url: '#' },
                    { name: 'Practice Files', url: '#' }
                ]
            };

            const { error: lessonError } = await supabase
                .from('lessons')
                .insert(lessonData);

            // if (lessonError) console.error('Error inserting lesson:', lessonError);
        }

        // Create Assessment
        const assessmentData = {
            course_id: course.id,
            title: `${courseData.title} - Final Assessment`,
            description: 'Test your knowledge from this course',
            passing_score: 70,
            time_limit_minutes: 30,
            questions: [
                {
                    id: 'q1',
                    type: 'multiple_choice',
                    question: 'What is the primary purpose of this concept?',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correct_answer: 0,
                    points: 10
                },
                {
                    id: 'q2',
                    type: 'true_false',
                    question: 'This technique is always applicable.',
                    correct_answer: false,
                    points: 5
                },
                {
                    id: 'q3',
                    type: 'multiple_choice',
                    question: 'What is the recommended next step?',
                    options: ['Step A', 'Step B', 'Step C', 'Step D'],
                    correct_answer: 3,
                    points: 15
                }
            ]
        };

        const { error: assessError } = await supabase
            .from('assessments')
            .insert(assessmentData);

        // if (assessError) console.error('Error inserting assessment:', assessError);

    }

    console.log('✅ Seeding Complete!');
}

seed();
