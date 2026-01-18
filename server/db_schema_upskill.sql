-- ============================================
-- UPSKILL PORTAL DATABASE SCHEMA
-- For HireGo AI Learning & Skill Development Platform
-- ============================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_hours INTEGER DEFAULT 0,
    lessons_count INTEGER DEFAULT 0,
    instructor VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    thumbnail TEXT,
    skills JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'video' CHECK (type IN ('video', 'reading', 'quiz', 'interactive')),
    duration_minutes INTEGER DEFAULT 0,
    video_url TEXT,
    content TEXT,
    resources JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Enrollments
CREATE TABLE IF NOT EXISTS user_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress_percent INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    UNIQUE(user_id, course_id)
);

-- Lesson Completions
CREATE TABLE IF NOT EXISTS lesson_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_spent_minutes INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    time_limit_minutes INTEGER DEFAULT 30,
    questions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Results
CREATE TABLE IF NOT EXISTS assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    total_points INTEGER NOT NULL,
    earned_points INTEGER NOT NULL,
    question_results JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    course_title VARCHAR(255) NOT NULL,
    course_category VARCHAR(100),
    skills_acquired JSONB DEFAULT '[]',
    instructor VARCHAR(255),
    duration_hours INTEGER,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    verification_url TEXT
);

-- User Learning Progress (aggregate)
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    total_courses_enrolled INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    total_lessons_completed INTEGER DEFAULT 0,
    total_hours_learned DECIMAL(10,2) DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    certificates_earned INTEGER DEFAULT 0,
    skills_acquired JSONB DEFAULT '[]',
    skill_scores JSONB DEFAULT '{}',
    xp_points INTEGER DEFAULT 0,
    level VARCHAR(50) DEFAULT 'Beginner Learner',
    last_activity TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_id VARCHAR(100) NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(50),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Job Applications from Upskill Portal
CREATE TABLE IF NOT EXISTS upskill_job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_id UUID NOT NULL,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'viewed', 'shortlisted', 'rejected', 'hired')),
    matched_skills JSONB DEFAULT '[]',
    match_score INTEGER,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON user_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_user ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON user_badges(user_id);
