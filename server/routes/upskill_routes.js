/**
 * ============================================
 * UPSKILL PORTAL ROUTES
 * Complete Backend for Learning & Skill Development Platform
 * ============================================
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { DeepSeekAgent } from '../agents/deepseek_agent.js';
import { YouTubeLiveAgent } from '../agents/youtube_live_agent.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// ==================== CONFIG & UTILS ====================

// Decryption helper
const decrypt = (text) => {
    if (!text) return null;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return text; // Return original if decryption fails (fallback)
    }
};

// Helper to get API keys
const getApiKey = async (provider, supabase) => {
    try {
        // Try Supabase first
        if (supabase) {
            const { data } = await supabase
                .from('api_keys')
                .select('api_key')
                .eq('provider', provider)
                .single();
            if (data?.api_key) return decrypt(data.api_key);
        }

        // Fallback to local DB
        const localDbPath = path.join(process.cwd(), 'local_db.json');
        if (fs.existsSync(localDbPath)) {
            const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
            const keyData = localData.api_keys?.find(k => k.provider === provider);
            if (keyData?.api_key) return decrypt(keyData.api_key);
        }
    } catch (error) {
        console.error(`Error fetching ${provider} API key:`, error);
    }
    return null;
};

// ==================== COURSE ROUTES ====================

/**
 * GET /api/upskill/courses
 * List all available courses with optional filters
 */
router.get('/courses', async (req, res) => {
    try {
        const { category, difficulty, search, featured } = req.query;
        const supabase = req.supabase;

        let query = supabase.from('courses').select('*');

        // Apply filters
        if (category && category !== 'All') {
            query = query.ilike('category', `%${category}%`);
        }
        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }
        if (search) {
            // Search in title, description, or instructor
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,instructor.ilike.%${search}%`);
        }
        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        // Order by popularity (enrolled_count) by default
        query = query.order('enrolled_count', { ascending: false });

        const { data: courses, error } = await query;

        if (error) throw error;

        // Fallback for demo if no courses found
        if (!courses || courses.length === 0) {
            console.log('ℹ️ No courses found in DB, returning empty list (Run seed script!)');
        }

        res.json({
            success: true,
            count: courses?.length || 0,
            courses: courses || []
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
        const supabase = req.supabase;

        // Fetch course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (courseError || !course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Fetch lessons
        const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', id)
            .order('order', { ascending: true });

        if (lessonsError) {
            console.warn('Error fetching lessons:', lessonsError);
        }

        res.json({
            success: true,
            course: {
                ...course,
                lessons: lessons || []
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
        const supabase = req.supabase;

        // Get unique categories and their counts
        // Note: Supabase doesn't support easy GROUP BY with COUNT in standard client, 
        // so we fetch all courses and aggregate (fine for small datasets) or use RPC.
        // For scalability, create a check_categories view or rpc function.

        const { data: courses, error } = await supabase
            .from('courses')
            .select('category');

        if (error) throw error;

        const categoryMap = {};
        courses.forEach(c => {
            if (!categoryMap[c.category]) categoryMap[c.category] = 0;
            categoryMap[c.category]++;
        });

        const categoryStats = Object.keys(categoryMap).map(name => ({
            name,
            count: categoryMap[name]
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
        const supabase = req.supabase;

        if (!user_id || !course_id) {
            return res.status(400).json({ error: 'user_id and course_id are required' });
        }

        // Insert enrollment
        const { data: enrollment, error } = await supabase
            .from('user_enrollments')
            .insert([{
                user_id,
                course_id,
                progress_percent: 0,
                status: 'active',
                enrolled_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            // Check for duplicate enrollment
            if (error.code === '23505') { // Unique violation
                return res.status(200).json({ // Return success but message already enrolled
                    success: true,
                    message: 'Already enrolled in course',
                    alreadyEnrolled: true
                });
            }
            throw error;
        }

        // Increment enrolled_count in courses table
        // Note: For this to work, we need an RPC or just update directly
        // await supabase.rpc('increment_course_enrollment', { course_id_param: course_id });

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
        const supabase = req.supabase;

        const { data: enrollments, error } = await supabase
            .from('user_enrollments')
            .select(`
                *,
                course:courses(*)
            `)
            .eq('user_id', userId)
            .order('last_accessed', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            count: enrollments?.length || 0,
            enrollments: enrollments || []
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
        const supabase = req.supabase;

        const { data: lessons, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order', { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            count: lessons?.length || 0,
            lessons: lessons || []
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
        const supabase = req.supabase;

        const { data: lesson, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (error || !lesson) {
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
        const { user_id, course_id, lesson_id, time_spent_minutes } = req.body;
        const supabase = req.supabase;

        if (!user_id || !course_id || !lesson_id) {
            return res.status(400).json({ error: 'user_id, course_id, and lesson_id are required' });
        }

        // 1. Record completion
        const { data: completion, error } = await supabase
            .from('lesson_completions')
            .upsert({
                user_id,
                course_id,
                lesson_id,
                time_spent_minutes: time_spent_minutes || 0,
                completed_at: new Date().toISOString()
            }, { onConflict: 'user_id,lesson_id' })
            .select()
            .single();

        if (error) throw error;

        // 2. Update overall progress percent
        // Get total lessons count
        const { count: totalLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course_id);

        // Get completed lessons count
        const { count: completedCount } = await supabase
            .from('lesson_completions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .eq('course_id', course_id);

        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        // Update enrollment progress
        await supabase
            .from('user_enrollments')
            .update({
                progress_percent: progressPercent,
                last_accessed: new Date().toISOString(),
                status: progressPercent === 100 ? 'completed' : 'active'
            })
            .eq('user_id', user_id)
            .eq('course_id', course_id);

        res.json({
            success: true,
            message: 'Lesson marked as completed',
            completion,
            newProgress: progressPercent
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
        const supabase = req.supabase;

        if (!userId || userId === 'undefined') {
            return res.json({ success: false, message: 'Invalid user ID' });
        }

        // Fetch aggregated progress from DB
        let { data: progress, error } = await supabase
            .from('user_learning_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            // throw error; 
            // Be silent about error, try fallback
        }

        // If no progress record exists, calculate fresh or return defaults
        if (!progress) {
            // Calculate from enrollments
            const { data: enrollments } = await supabase
                .from('user_enrollments')
                .select('*')
                .eq('user_id', userId);

            const totalEnrollments = enrollments?.length || 0;
            const coursesCompleted = enrollments?.filter(e => e.status === 'completed').length || 0;

            progress = {
                user_id: userId,
                total_courses_enrolled: totalEnrollments,
                courses_completed: coursesCompleted,
                total_lessons_completed: 0, // Need to count completions table
                total_hours_learned: 0,
                current_streak_days: 0,
                skills_acquired: ['React', 'Communication'], // Mock needed for UI until DB is populated
                skill_scores: { 'Coding': 70, 'Business': 50 },
                level: 'Beginner Learner',
                xp_points: 0
            };
        }

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
        const supabase = req.supabase;

        const { data: enrollment, error } = await supabase
            .from('user_enrollments')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (error || !enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        // Get completed lessons IDs
        const { data: completions } = await supabase
            .from('lesson_completions')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('course_id', courseId);

        const completedLessonIds = completions?.map(c => c.lesson_id) || [];

        // Get next lesson
        const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', courseId)
            .order('order', { ascending: true });

        const nextLesson = lessons.find(l => !completedLessonIds.includes(l.id));

        const courseProgress = {
            ...enrollment,
            completed_lessons_count: completedLessonIds.length,
            next_lesson_id: nextLesson?.id || null,
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
        const supabase = req.supabase;

        const { data: assessment, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('course_id', courseId)
            .single();

        if (error || !assessment) {
            // Check if assessment with this ID exists directly (sometimes ID is passed instead of courseId)
            const { data: assessmentById, error: errorById } = await supabase
                .from('assessments')
                .select('*')
                .eq('id', courseId)
                .single();

            if (assessmentById) {
                const clientAssessment = {
                    ...assessmentById,
                    questions: assessmentById.questions.map(q => {
                        const { correct_answer, ...rest } = q;
                        return rest;
                    })
                };
                return res.json({ success: true, assessment: clientAssessment });
            }

            return res.status(404).json({ error: 'Assessment not found for this course' });
        }

        // Don't send correct answers to client
        const clientAssessment = {
            ...assessment,
            questions: assessment.questions.map(q => {
                const { correct_answer, ...rest } = q;
                return rest;
            })
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
 * GET /api/upskill/assessments
 * List all available assessments
 */
router.get('/assessments', async (req, res) => {
    try {
        const supabase = req.supabase;
        const { data: assessments, error } = await supabase
            .from('assessments')
            .select('*');

        if (error) throw error;

        res.json({
            success: true,
            assessments: assessments || []
        });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
});

/**
 * POST /api/upskill/assessment/submit
 * Submit assessment answers and get results
 */
router.post('/assessment/submit', async (req, res) => {
    try {
        const { user_id, assessment_id, course_id, answers } = req.body;
        const supabase = req.supabase;

        // Fetch original assessment to check answers
        const { data: assessment, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('id', assessment_id)
            .single();

        if (error || !assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        // Grading Logic
        let totalPoints = 0;
        let earnedPoints = 0;
        const questionResults = [];

        assessment.questions.forEach((q, index) => {
            totalPoints += (q.points || 1);
            const userAnswer = answers[q.id] || answers[index]; // Support ID or Index keyed answers

            const isCorrect = userAnswer === q.correct_answer;
            if (isCorrect) earnedPoints += (q.points || 1);

            questionResults.push({
                question_id: q.id,
                correct: isCorrect,
                user_answer: userAnswer,
                correct_answer: q.correct_answer // Send back correct answer now
            });
        });

        const score = Math.round((earnedPoints / totalPoints) * 100);
        const passed = score >= assessment.passing_score;

        // Save result
        const { data: result, error: saveError } = await supabase
            .from('assessment_results')
            .insert([{
                user_id,
                assessment_id,
                course_id,
                score,
                passed,
                total_points: totalPoints,
                earned_points: earnedPoints,
                question_results: questionResults,
                completed_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (saveError) throw saveError;

        // If passed, generate certificate (placeholder logic)
        if (passed) {
            // trigger certificate generation logic here
        }

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({ error: 'Failed to submit assessment' });
    }
});

// ==================== AI RECOMMENDATION ROUTES ====================

/**
 * GET /api/upskill/recommendations/:userId
 * Get AI-powered course recommendations using DeepSeek
 */
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const supabase = req.supabase; // Assuming middleware adds this

        // 1. Get DeepSeek API Key
        const deepSeekKey = await getApiKey('deepseek', supabase);
        if (!deepSeekKey) {
            console.warn('DeepSeek API key not found, using fallback logic');
        }

        const agent = new DeepSeekAgent(deepSeekKey);

        // 2. Gather user context (mocked for now, retrieve from DB in production)
        const userProfile = {
            skills: ['JavaScript', 'React', 'HTML'],
            careerGoal: 'Senior Frontend Developer',
            experienceLevel: 'Intermediate'
        };

        // Fetch courses from DB
        const { data: courses } = await supabase.from('courses').select('*');
        const enrolled = []; // Fetch from DB

        // 3. Generate recommendations
        const aiResponse = await agent.generateCourseRecommendations(userProfile, courses || [], enrolled);

        // 4. Enrich recommendations with full course data
        const enrichedRecs = {
            ...aiResponse,
            recommendations: aiResponse.recommendations?.map(rec => {
                const courseDetails = courses?.find(c => c.id === rec.courseId);
                return {
                    ...rec,
                    ...courseDetails, // Merges title, description, thumbnail, etc.
                    // Priority to AI explanations if they differ, but visuals from DB
                    title: courseDetails?.title || rec.courseTitle,
                    id: rec.courseId
                };
            }) || []
        };

        res.json({
            success: true,
            data: enrichedRecs
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        // Fallback response
        res.json({
            success: true,
            data: { recommendations: [] }
        });
    }
});

/**
 * GET /api/upskill/insights/:userId
 * Get AI learning insights using DeepSeek
 */
router.get('/insights/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const supabase = req.supabase;

        const deepSeekKey = await getApiKey('deepseek', supabase);
        const agent = new DeepSeekAgent(deepSeekKey);

        // Mock progress data
        const progress = {
            totalCoursesEnrolled: 4,
            coursesCompleted: 2,
            totalHoursLearned: 45,
            currentStreakDays: 5,
            skillsAcquired: ['React', 'TypeScript'],
            xpPoints: 1200
        };

        const insights = await agent.generateLearningInsights(progress, []);

        res.json({
            success: true,
            data: insights
        });
    } catch (error) {
        console.error('Error generating insights:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

/**
 * GET /api/upskill/gamification
 * Get current user's gamification stats
 */
router.get('/gamification', async (req, res) => {
    try {
        const supabase = req.supabase;
        let userId = null;

        // Manually check auth since this router isn't protected by default middleware
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) userId = user.id;
        }

        if (!userId) {
            // Check current dev environment for mock user fallback if not prod
            if (process.env.NODE_ENV !== 'production') {
                // userId = 'demo-candidate-001'; 
                // Actually, better to enforce auth or return 401. 
                // Let's return 401 to force frontend to handle it or login.
            }
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { data: stats } = await supabase
            .from('gamification_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Default stats if none exist
        const safeStats = stats || {
            level: 'Bronze',
            points: 0,
            next_level_points: 1000,
            global_rank: 0,
            total_candidates: 100, // Minimal social proof
            skill_mastery: 0,
            correct_rate: 0,
            challenges_completed: 0,
            total_attempts: 0,
            streak: 0
        };

        // CamelCase conversion for frontend
        const frontendStats = {
            level: safeStats.level,
            points: safeStats.points,
            nextLevelPoints: safeStats.next_level_points,
            globalRank: safeStats.global_rank,
            totalCandidates: safeStats.total_candidates,
            skillMastery: safeStats.skill_mastery,
            correctRate: safeStats.correct_rate,
            challengesCompleted: safeStats.challenges_completed,
            totalAttempts: safeStats.total_attempts,
            streak: safeStats.streak
        };

        res.json({
            success: true,
            stats: frontendStats
        });
    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        res.status(500).json({ error: 'Failed to fetch gamification stats' });
    }
});

// ==================== LIVE CLASS ROUTES ====================

/**
 * GET /api/upskill/live-classes
 * Get simplified live classes (Mock for now, easy to extend)
 */
router.get('/live-classes', async (req, res) => {
    try {
        const supabase = req.supabase;
        // Fetch real live classes from DB
        const { data: classes, error } = await supabase
            .from('live_classes')
            .select('*')
            .gte('scheduled_start_time', new Date().toISOString())
            .order('scheduled_start_time', { ascending: true });

        if (error && error.code !== '42P01') { // Ignore "relation does not exist" for now, return empty
            console.error('Error fetching live classes:', error);
        }

        res.json({
            success: true,
            classes: classes || []
        });
    } catch (error) {
        console.error('Error fetching live classes:', error);
        res.json({ success: true, classes: [] });
    }
});

// ==================== UPSKILL AUTH ROUTES ====================

/**
 * POST /api/upskill/register
 * Register a new Upskill learner
 */
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, phone, careerGoal, experienceLevel, currentSkills, interests } = req.body;
        const supabase = req.supabase;

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Full name, email, and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if email already exists
        const { data: existing, error: checkError } = await supabase
            .from('upskill_learners')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
        }

        // Hash the password using crypto (no bcrypt dependency needed)
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
        const storedHash = `${salt}:${passwordHash}`;

        // Insert learner
        const { data: learner, error: insertError } = await supabase
            .from('upskill_learners')
            .insert([{
                full_name: fullName.trim(),
                email: email.toLowerCase().trim(),
                password_hash: storedHash,
                phone: phone || null,
                career_goal: careerGoal || null,
                experience_level: experienceLevel || 'beginner',
                current_skills: currentSkills || [],
                interests: interests || [],
                is_active: true,
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select('id, full_name, email, experience_level, career_goal, current_skills, interests, created_at')
            .single();

        if (insertError) {
            console.error('Registration error:', insertError);
            throw insertError;
        }

        // Generate a simple session token
        const sessionToken = crypto.randomBytes(32).toString('hex');

        // Also initialize learning progress for this user
        await supabase
            .from('user_learning_progress')
            .insert([{
                user_id: learner.id,
                total_courses_enrolled: 0,
                courses_completed: 0,
                total_lessons_completed: 0,
                total_hours_learned: 0,
                current_streak_days: 0,
                longest_streak_days: 0,
                certificates_earned: 0,
                skills_acquired: currentSkills || [],
                skill_scores: {},
                xp_points: 0,
                level: 'Beginner Learner'
            }]);

        console.log(`✅ New Upskill Learner Registered: ${learner.email}`);

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            user: learner,
            token: sessionToken
        });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

/**
 * POST /api/upskill/login
 * Login an Upskill learner
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const supabase = req.supabase;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Fetch user by email
        const { data: learner, error } = await supabase
            .from('upskill_learners')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (error || !learner) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!learner.is_active) {
            return res.status(403).json({ error: 'Account is deactivated. Please contact support.' });
        }

        // Verify password
        const [salt, storedHash] = learner.password_hash.split(':');
        const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

        if (hash !== storedHash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        await supabase
            .from('upskill_learners')
            .update({ last_login: new Date().toISOString() })
            .eq('id', learner.id);

        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');

        // Return user data (without password hash)
        const { password_hash, ...safeUser } = learner;

        console.log(`✅ Upskill Learner Logged In: ${learner.email}`);

        res.json({
            success: true,
            message: 'Login successful!',
            user: safeUser,
            token: sessionToken
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

/**
 * GET /api/upskill/profile/:userId
 * Get learner profile
 */
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const supabase = req.supabase;

        const { data: learner, error } = await supabase
            .from('upskill_learners')
            .select('id, full_name, email, phone, avatar_url, career_goal, experience_level, current_skills, interests, linkedin_url, is_verified, created_at')
            .eq('id', userId)
            .single();

        if (error || !learner) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Also fetch learning progress
        const { data: progress } = await supabase
            .from('user_learning_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Fetch enrolled courses count
        const { count: enrolledCount } = await supabase
            .from('user_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Fetch certificates count
        const { count: certsCount } = await supabase
            .from('certificates')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        res.json({
            success: true,
            profile: {
                ...learner,
                progress: progress || null,
                stats: {
                    courses_enrolled: enrolledCount || 0,
                    certificates_earned: certsCount || 0,
                    xp_points: progress?.xp_points || 0,
                    level: progress?.level || 'Beginner Learner'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * PUT /api/upskill/profile/:userId
 * Update learner profile
 */
router.put('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, phone, careerGoal, experienceLevel, currentSkills, interests, linkedinUrl } = req.body;
        const supabase = req.supabase;

        const updateData = {};
        if (fullName) updateData.full_name = fullName;
        if (phone !== undefined) updateData.phone = phone;
        if (careerGoal !== undefined) updateData.career_goal = careerGoal;
        if (experienceLevel) updateData.experience_level = experienceLevel;
        if (currentSkills) updateData.current_skills = currentSkills;
        if (interests) updateData.interests = interests;
        if (linkedinUrl !== undefined) updateData.linkedin_url = linkedinUrl;
        updateData.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('upskill_learners')
            .update(updateData)
            .eq('id', userId)
            .select('id, full_name, email, phone, career_goal, experience_level, current_skills, interests, linkedin_url')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updated
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});


/**
 * GET /api/upskill/gamification
 * Get user gamification statistics
 */
router.get('/gamification', async (req, res) => {
    try {
        // Authenticate
        const authHeader = req.headers.authorization;
        const supabase = req.supabase;

        if (!authHeader) {
            return res.status(401).json({ error: 'Missing Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = user.id;

        // 1. Get User Progress
        let { data: progress } = await supabase
            .from('user_learning_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!progress) {
            // Create default if missing
            progress = {
                xp_points: 0,
                current_streak_days: 0,
                level: 'Beginner'
            };
        }

        const xp = progress.xp_points || 0;

        // 2. Calculate Global Rank (users with more XP)
        const { count: rankCount } = await supabase
            .from('user_learning_progress')
            .select('*', { count: 'exact', head: true })
            .gt('xp_points', xp);

        const globalRank = (rankCount || 0) + 1;

        // 3. Total Candidates/Learners
        const { count: totalLearners } = await supabase
            .from('user_learning_progress')
            .select('*', { count: 'exact', head: true });

        // 4. Challenges/Lessons Completed
        const { count: completedLessons } = await supabase
            .from('lesson_completions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // 5. Calculate Stats
        const nextLevelPoints = Math.ceil((xp + 1) / 1000) * 1000;
        const level = xp < 1000 ? 'Beginner' : xp < 5000 ? 'Intermediate' : 'Advanced';

        res.json({
            success: true,
            stats: {
                level: level,
                points: xp,
                nextLevelPoints: nextLevelPoints,
                globalRank: globalRank,
                totalCandidates: totalLearners || 1,
                skillMastery: 75, // Placeholder: could be calc from avg quiz scores
                correctRate: 85, // Placeholder
                challengesCompleted: completedLessons || 0,
                totalAttempts: completedLessons || 0,
                streak: progress.current_streak_days || 0
            }
        });

    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        res.status(500).json({ error: 'Failed to fetch gamification stats' });
    }
});

export default router;
