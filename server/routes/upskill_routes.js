/**
 * ============================================
 * UPSKILL PORTAL ROUTES
 * Complete Backend for Learning & Skill Development Platform
 * ============================================
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate unique ID for local fallback
 */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

/**
 * Mock course data for fallback/demo
 */
const getMockCourses = () => [
    {
        id: 'course-1',
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
        price: 0,
        created_at: new Date().toISOString()
    },
    {
        id: 'course-2',
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
        price: 49.99,
        created_at: new Date().toISOString()
    },
    {
        id: 'course-3',
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
        price: 0,
        created_at: new Date().toISOString()
    },
    {
        id: 'course-4',
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
        price: 0,
        created_at: new Date().toISOString()
    },
    {
        id: 'course-5',
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
        price: 0,
        created_at: new Date().toISOString()
    },
    {
        id: 'course-6',
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
        price: 29.99,
        created_at: new Date().toISOString()
    },
    {
        id: 'course-7',
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
        price: 0,
        created_at: new Date().toISOString()
    },
    {
        id: 'course-8',
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
        price: 79.99,
        created_at: new Date().toISOString()
    }
];

/**
 * Generate mock lessons for a course
 */
const getMockLessons = (courseId) => {
    const lessonTemplates = [
        { title: 'Introduction & Overview', type: 'video', duration_minutes: 15 },
        { title: 'Core Concepts', type: 'video', duration_minutes: 25 },
        { title: 'Hands-On Practice', type: 'interactive', duration_minutes: 30 },
        { title: 'Deep Dive', type: 'video', duration_minutes: 35 },
        { title: 'Case Study', type: 'reading', duration_minutes: 20 },
        { title: 'Quiz & Review', type: 'quiz', duration_minutes: 15 }
    ];

    return lessonTemplates.map((template, index) => ({
        id: `${courseId}-lesson-${index + 1}`,
        course_id: courseId,
        order: index + 1,
        title: `Module ${index + 1}: ${template.title}`,
        description: `Learn about ${template.title.toLowerCase()} in this comprehensive lesson.`,
        type: template.type,
        duration_minutes: template.duration_minutes,
        video_url: template.type === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : null,
        content: template.type === 'reading' ? 'This is the lesson content...' : null,
        resources: [
            { name: 'Supplementary PDF', url: '#' },
            { name: 'Practice Files', url: '#' }
        ],
        created_at: new Date().toISOString()
    }));
};

/**
 * Generate mock assessment questions
 */
const getMockAssessment = (courseId) => ({
    id: `assessment-${courseId}`,
    course_id: courseId,
    title: 'Final Assessment',
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
            type: 'multiple_choice',
            question: 'Which of the following is a best practice?',
            options: ['Practice A', 'Practice B', 'Practice C', 'Practice D'],
            correct_answer: 2,
            points: 10
        },
        {
            id: 'q3',
            type: 'multiple_choice',
            question: 'How would you approach this problem?',
            options: ['Approach A', 'Approach B', 'Approach C', 'Approach D'],
            correct_answer: 1,
            points: 10
        },
        {
            id: 'q4',
            type: 'true_false',
            question: 'This technique is always applicable.',
            correct_answer: false,
            points: 5
        },
        {
            id: 'q5',
            type: 'multiple_choice',
            question: 'What is the recommended next step?',
            options: ['Step A', 'Step B', 'Step C', 'Step D'],
            correct_answer: 3,
            points: 15
        }
    ],
    created_at: new Date().toISOString()
});

// ==================== COURSE ROUTES ====================

/**
 * GET /api/upskill/courses
 * List all available courses with optional filters
 */
router.get('/courses', async (req, res) => {
    try {
        const { category, difficulty, search, featured } = req.query;

        let courses = getMockCourses();

        // Apply filters
        if (category) {
            courses = courses.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
        }
        if (difficulty) {
            courses = courses.filter(c => c.difficulty === difficulty);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            courses = courses.filter(c =>
                c.title.toLowerCase().includes(searchLower) ||
                c.description.toLowerCase().includes(searchLower) ||
                c.skills.some(s => s.toLowerCase().includes(searchLower))
            );
        }
        if (featured === 'true') {
            courses = courses.filter(c => c.is_featured);
        }

        res.json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

/**
 * GET /api/upskill/courses/:id
 * Get single course details with lessons
 */
router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const courses = getMockCourses();
        const course = courses.find(c => c.id === id);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Include lessons
        const lessons = getMockLessons(id);

        res.json({
            success: true,
            course: {
                ...course,
                lessons
            }
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
});

/**
 * GET /api/upskill/categories
 * Get all course categories
 */
router.get('/categories', async (req, res) => {
    try {
        const courses = getMockCourses();
        const categories = [...new Set(courses.map(c => c.category))];

        const categoryStats = categories.map(cat => ({
            name: cat,
            count: courses.filter(c => c.category === cat).length
        }));

        res.json({
            success: true,
            categories: categoryStats
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// ==================== ENROLLMENT ROUTES ====================

/**
 * POST /api/upskill/enroll
 * Enroll user in a course
 */
router.post('/enroll', async (req, res) => {
    try {
        const { user_id, course_id } = req.body;

        if (!user_id || !course_id) {
            return res.status(400).json({ error: 'user_id and course_id are required' });
        }

        const enrollment = {
            id: generateId(),
            user_id,
            course_id,
            enrolled_at: new Date().toISOString(),
            progress_percent: 0,
            completed_lessons: [],
            status: 'active'
        };

        // In production, save to database
        console.log(`✅ User ${user_id} enrolled in course ${course_id}`);

        res.json({
            success: true,
            message: 'Successfully enrolled in course',
            enrollment
        });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ error: 'Failed to enroll in course' });
    }
});

/**
 * GET /api/upskill/enrollments/:userId
 * Get all enrollments for a user
 */
router.get('/enrollments/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Mock enrolled courses
        const courses = getMockCourses().slice(0, 3);
        const enrollments = courses.map((course, index) => ({
            id: generateId(),
            user_id: userId,
            course_id: course.id,
            course,
            enrolled_at: new Date(Date.now() - index * 86400000).toISOString(),
            progress_percent: Math.floor(Math.random() * 80) + 10,
            last_accessed: new Date(Date.now() - index * 3600000).toISOString(),
            status: 'active'
        }));

        res.json({
            success: true,
            count: enrollments.length,
            enrollments
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
});

// ==================== LESSON ROUTES ====================

/**
 * GET /api/upskill/lessons/:courseId
 * Get all lessons for a course
 */
router.get('/lessons/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const lessons = getMockLessons(courseId);

        res.json({
            success: true,
            count: lessons.length,
            lessons
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});

/**
 * GET /api/upskill/lesson/:lessonId
 * Get single lesson details
 */
router.get('/lesson/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;

        // Parse courseId from lessonId (format: courseId-lesson-N)
        const parts = lessonId.split('-lesson-');
        if (parts.length < 2) {
            return res.status(400).json({ error: 'Invalid lesson ID format' });
        }

        const courseId = parts[0];
        const lessons = getMockLessons(courseId);
        const lesson = lessons.find(l => l.id === lessonId);

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.json({
            success: true,
            lesson
        });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ error: 'Failed to fetch lesson' });
    }
});

/**
 * POST /api/upskill/lesson/complete
 * Mark a lesson as completed
 */
router.post('/lesson/complete', async (req, res) => {
    try {
        const { user_id, course_id, lesson_id } = req.body;

        if (!user_id || !course_id || !lesson_id) {
            return res.status(400).json({ error: 'user_id, course_id, and lesson_id are required' });
        }

        const completion = {
            id: generateId(),
            user_id,
            course_id,
            lesson_id,
            completed_at: new Date().toISOString()
        };

        console.log(`✅ User ${user_id} completed lesson ${lesson_id}`);

        res.json({
            success: true,
            message: 'Lesson marked as completed',
            completion
        });
    } catch (error) {
        console.error('Error completing lesson:', error);
        res.status(500).json({ error: 'Failed to mark lesson as completed' });
    }
});

// ==================== PROGRESS ROUTES ====================

/**
 * GET /api/upskill/progress/:userId
 * Get overall learning progress for a user
 */
router.get('/progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Mock progress data
        const progress = {
            user_id: userId,
            total_courses_enrolled: 5,
            courses_completed: 2,
            total_lessons_completed: 47,
            total_hours_learned: 32.5,
            current_streak_days: 7,
            longest_streak_days: 14,
            certificates_earned: 2,
            skills_acquired: ['Python', 'Data Analysis', 'Machine Learning', 'SQL', 'React'],
            skill_scores: {
                'Data & Analytics': 85,
                'AI & Machine Learning': 72,
                'Coding & Software': 90,
                'Communication Skills': 68
            },
            recent_activity: [
                { type: 'lesson_completed', title: 'Advanced Python Techniques', date: new Date().toISOString() },
                { type: 'course_started', title: 'Machine Learning Basics', date: new Date(Date.now() - 86400000).toISOString() },
                { type: 'certificate_earned', title: 'Data Science Fundamentals', date: new Date(Date.now() - 172800000).toISOString() }
            ],
            weekly_goal: { target_hours: 10, completed_hours: 6.5 },
            level: 'Intermediate Learner',
            xp_points: 2450,
            next_level_xp: 3000
        };

        res.json({
            success: true,
            progress
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

/**
 * GET /api/upskill/progress/:userId/course/:courseId
 * Get progress for a specific course
 */
router.get('/progress/:userId/course/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;

        const lessons = getMockLessons(courseId);
        const completedCount = Math.floor(lessons.length * 0.6); // Mock 60% completion

        const courseProgress = {
            user_id: userId,
            course_id: courseId,
            total_lessons: lessons.length,
            completed_lessons: completedCount,
            progress_percent: Math.round((completedCount / lessons.length) * 100),
            time_spent_minutes: completedCount * 25,
            last_lesson_id: lessons[completedCount - 1]?.id || null,
            next_lesson_id: lessons[completedCount]?.id || null,
            started_at: new Date(Date.now() - 604800000).toISOString(),
            last_accessed: new Date().toISOString(),
            estimated_completion: '2 hours remaining'
        };

        res.json({
            success: true,
            progress: courseProgress
        });
    } catch (error) {
        console.error('Error fetching course progress:', error);
        res.status(500).json({ error: 'Failed to fetch course progress' });
    }
});

// ==================== ASSESSMENT ROUTES ====================

/**
 * GET /api/upskill/assessment/:courseId
 * Get assessment for a course
 */
router.get('/assessment/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const assessment = getMockAssessment(courseId);

        // Don't send correct answers to client
        const clientAssessment = {
            ...assessment,
            questions: assessment.questions.map(q => ({
                ...q,
                correct_answer: undefined // Hide answers
            }))
        };

        res.json({
            success: true,
            assessment: clientAssessment
        });
    } catch (error) {
        console.error('Error fetching assessment:', error);
        res.status(500).json({ error: 'Failed to fetch assessment' });
    }
});

/**
 * POST /api/upskill/assessment/submit
 * Submit assessment answers and get results
 */
router.post('/assessment/submit', async (req, res) => {
    try {
        const { user_id, course_id, answers } = req.body;

        if (!user_id || !course_id || !answers) {
            return res.status(400).json({ error: 'user_id, course_id, and answers are required' });
        }

        const assessment = getMockAssessment(course_id);

        // Grade the assessment
        let totalPoints = 0;
        let earnedPoints = 0;
        const questionResults = [];

        assessment.questions.forEach(question => {
            totalPoints += question.points;
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct_answer;

            if (isCorrect) {
                earnedPoints += question.points;
            }

            questionResults.push({
                question_id: question.id,
                user_answer: userAnswer,
                correct_answer: question.correct_answer,
                is_correct: isCorrect,
                points_earned: isCorrect ? question.points : 0
            });
        });

        const score = Math.round((earnedPoints / totalPoints) * 100);
        const passed = score >= assessment.passing_score;

        const result = {
            id: generateId(),
            user_id,
            course_id,
            assessment_id: assessment.id,
            score,
            passed,
            total_points: totalPoints,
            earned_points: earnedPoints,
            passing_score: assessment.passing_score,
            question_results: questionResults,
            completed_at: new Date().toISOString(),
            certificate_eligible: passed
        };

        console.log(`📊 User ${user_id} completed assessment for ${course_id}: ${score}% (${passed ? 'PASSED' : 'FAILED'})`);

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({ error: 'Failed to submit assessment' });
    }
});

/**
 * GET /api/upskill/assessment/history/:userId
 * Get assessment history for a user
 */
router.get('/assessment/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Mock assessment history
        const history = [
            {
                id: generateId(),
                course_id: 'course-1',
                course_title: 'Data Science Fundamentals',
                score: 92,
                passed: true,
                completed_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: generateId(),
                course_id: 'course-3',
                course_title: 'Full Stack Web Development',
                score: 85,
                passed: true,
                completed_at: new Date(Date.now() - 604800000).toISOString()
            },
            {
                id: generateId(),
                course_id: 'course-2',
                course_title: 'AI & Machine Learning Masterclass',
                score: 65,
                passed: false,
                completed_at: new Date(Date.now() - 1209600000).toISOString()
            }
        ];

        res.json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        console.error('Error fetching assessment history:', error);
        res.status(500).json({ error: 'Failed to fetch assessment history' });
    }
});

// ==================== CERTIFICATE ROUTES ====================

/**
 * POST /api/upskill/certificate/generate
 * Generate certificate for completed course
 */
router.post('/certificate/generate', async (req, res) => {
    try {
        const { user_id, course_id, user_name } = req.body;

        if (!user_id || !course_id) {
            return res.status(400).json({ error: 'user_id and course_id are required' });
        }

        const courses = getMockCourses();
        const course = courses.find(c => c.id === course_id);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const certificate = {
            id: generateId(),
            certificate_number: `HIREGO-${Date.now().toString(36).toUpperCase()}`,
            user_id,
            user_name: user_name || 'Learner',
            course_id,
            course_title: course.title,
            course_category: course.category,
            skills_acquired: course.skills,
            instructor: course.instructor,
            duration_hours: course.duration_hours,
            issued_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 31536000000 * 2).toISOString(), // 2 years
            verification_url: `https://hirego.ai/verify/${generateId()}`
        };

        console.log(`🎓 Certificate generated for user ${user_id}: ${certificate.certificate_number}`);

        res.json({
            success: true,
            message: 'Certificate generated successfully',
            certificate
        });
    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({ error: 'Failed to generate certificate' });
    }
});

/**
 * GET /api/upskill/certificates/:userId
 * Get all certificates for a user
 */
router.get('/certificates/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Mock certificates
        const certificates = [
            {
                id: generateId(),
                certificate_number: 'HIREGO-ABC123XYZ',
                course_id: 'course-1',
                course_title: 'Data Science Fundamentals',
                course_category: 'Data & Analytics',
                skills_acquired: ['Python', 'Statistics', 'Machine Learning'],
                instructor: 'Dr. Sarah Chen',
                issued_at: new Date(Date.now() - 2592000000).toISOString(),
                verification_url: 'https://hirego.ai/verify/abc123'
            },
            {
                id: generateId(),
                certificate_number: 'HIREGO-DEF456UVW',
                course_id: 'course-3',
                course_title: 'Full Stack Web Development',
                course_category: 'Coding & Software',
                skills_acquired: ['React', 'Node.js', 'PostgreSQL'],
                instructor: 'Alex Johnson',
                issued_at: new Date(Date.now() - 5184000000).toISOString(),
                verification_url: 'https://hirego.ai/verify/def456'
            }
        ];

        res.json({
            success: true,
            count: certificates.length,
            certificates
        });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

/**
 * GET /api/upskill/certificate/verify/:certificateNumber
 * Verify a certificate
 */
router.get('/certificate/verify/:certificateNumber', async (req, res) => {
    try {
        const { certificateNumber } = req.params;

        // Mock verification (would check database in production)
        const isValid = certificateNumber.startsWith('HIREGO-');

        res.json({
            success: true,
            valid: isValid,
            certificate: isValid ? {
                certificate_number: certificateNumber,
                holder_name: 'John Doe',
                course_title: 'Data Science Fundamentals',
                issued_at: new Date(Date.now() - 2592000000).toISOString(),
                issuer: 'HireGo AI'
            } : null
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(500).json({ error: 'Failed to verify certificate' });
    }
});

// ==================== JOB MATCHING ROUTES ====================

/**
 * GET /api/upskill/job-matches/:userId
 * Get job matches based on user's skills
 */
router.get('/job-matches/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Mock job matches based on acquired skills
        const jobMatches = [
            {
                id: 'job-1',
                title: 'Data Analyst',
                company: 'TechCorp Inc.',
                location: 'Remote',
                salary_range: '$70,000 - $90,000',
                match_score: 95,
                matching_skills: ['Python', 'Data Analysis', 'SQL'],
                missing_skills: ['Tableau'],
                posted_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'job-2',
                title: 'Junior Data Scientist',
                company: 'AI Solutions Ltd.',
                location: 'New York, NY',
                salary_range: '$85,000 - $110,000',
                match_score: 87,
                matching_skills: ['Python', 'Machine Learning', 'Statistics'],
                missing_skills: ['Deep Learning', 'TensorFlow'],
                posted_at: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 'job-3',
                title: 'Full Stack Developer',
                company: 'StartupXYZ',
                location: 'Remote',
                salary_range: '$80,000 - $100,000',
                match_score: 92,
                matching_skills: ['React', 'Node.js', 'TypeScript'],
                missing_skills: ['AWS'],
                posted_at: new Date(Date.now() - 259200000).toISOString()
            }
        ];

        res.json({
            success: true,
            count: jobMatches.length,
            matches: jobMatches
        });
    } catch (error) {
        console.error('Error fetching job matches:', error);
        res.status(500).json({ error: 'Failed to fetch job matches' });
    }
});

/**
 * POST /api/upskill/job-apply
 * Apply to a matched job
 */
router.post('/job-apply', async (req, res) => {
    try {
        const { user_id, job_id, cover_letter } = req.body;

        if (!user_id || !job_id) {
            return res.status(400).json({ error: 'user_id and job_id are required' });
        }

        const application = {
            id: generateId(),
            user_id,
            job_id,
            cover_letter: cover_letter || '',
            status: 'submitted',
            applied_at: new Date().toISOString()
        };

        console.log(`📝 User ${user_id} applied to job ${job_id}`);

        res.json({
            success: true,
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        console.error('Error applying to job:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// ==================== SKILL RECOMMENDATIONS ====================

/**
 * GET /api/upskill/recommendations/:userId
 * Get personalized course recommendations
 */
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const allCourses = getMockCourses();

        // Mock personalized recommendations
        const recommendations = allCourses.slice(0, 4).map(course => ({
            ...course,
            recommendation_reason: [
                'Based on your learning history',
                'Popular in your field',
                'Recommended for career growth',
                'Trending this month'
            ][Math.floor(Math.random() * 4)],
            relevance_score: Math.floor(Math.random() * 20) + 80
        }));

        res.json({
            success: true,
            count: recommendations.length,
            recommendations
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// ==================== LEADERBOARD & GAMIFICATION ====================

/**
 * GET /api/upskill/leaderboard
 * Get learning leaderboard
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const { period = 'weekly' } = req.query;

        // Mock leaderboard data
        const leaderboard = [
            { rank: 1, user_id: 'user-1', name: 'Priya Sharma', avatar: null, xp_points: 4520, courses_completed: 8, badges: 12 },
            { rank: 2, user_id: 'user-2', name: 'Rahul Verma', avatar: null, xp_points: 4280, courses_completed: 7, badges: 10 },
            { rank: 3, user_id: 'user-3', name: 'Ananya Patel', avatar: null, xp_points: 3950, courses_completed: 6, badges: 9 },
            { rank: 4, user_id: 'user-4', name: 'Vikram Singh', avatar: null, xp_points: 3720, courses_completed: 6, badges: 8 },
            { rank: 5, user_id: 'user-5', name: 'Neha Gupta', avatar: null, xp_points: 3580, courses_completed: 5, badges: 7 },
            { rank: 6, user_id: 'user-6', name: 'Amit Kumar', avatar: null, xp_points: 3420, courses_completed: 5, badges: 7 },
            { rank: 7, user_id: 'user-7', name: 'Deepika Reddy', avatar: null, xp_points: 3280, courses_completed: 5, badges: 6 },
            { rank: 8, user_id: 'user-8', name: 'Arjun Nair', avatar: null, xp_points: 3150, courses_completed: 4, badges: 6 },
            { rank: 9, user_id: 'user-9', name: 'Kavita Joshi', avatar: null, xp_points: 2980, courses_completed: 4, badges: 5 },
            { rank: 10, user_id: 'user-10', name: 'Ravi Krishnan', avatar: null, xp_points: 2850, courses_completed: 4, badges: 5 }
        ];

        res.json({
            success: true,
            period,
            leaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

/**
 * GET /api/upskill/badges/:userId
 * Get user's earned badges
 */
router.get('/badges/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const badges = [
            { id: 'badge-1', name: 'Quick Learner', description: 'Complete 5 lessons in one day', icon: '🚀', earned_at: new Date(Date.now() - 604800000).toISOString() },
            { id: 'badge-2', name: 'Week Warrior', description: 'Learn 7 days in a row', icon: '🔥', earned_at: new Date(Date.now() - 432000000).toISOString() },
            { id: 'badge-3', name: 'Data Master', description: 'Complete Data Science track', icon: '📊', earned_at: new Date(Date.now() - 259200000).toISOString() },
            { id: 'badge-4', name: 'First Steps', description: 'Complete your first course', icon: '👣', earned_at: new Date(Date.now() - 1209600000).toISOString() },
            { id: 'badge-5', name: 'Code Ninja', description: 'Score 100% on a coding assessment', icon: '🥷', earned_at: new Date(Date.now() - 86400000).toISOString() }
        ];

        res.json({
            success: true,
            count: badges.length,
            badges
        });
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
});

export default router;
