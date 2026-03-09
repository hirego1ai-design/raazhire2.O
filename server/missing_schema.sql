-- ============================================================
-- MISSING TABLES REQUIRED BY BACKEND CODE
-- ============================================================
-- These tables are referenced in the backend (index.js, upskill_routes.js)
-- but were missing from the primary schema. Run this script to create them.

-- 1. API Keys (For AI integrations)
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    provider TEXT NOT NULL UNIQUE, -- e.g. 'openai', 'gemini', 'deepseek'
    api_key TEXT NOT NULL, -- Encrypted
    access_token TEXT, -- Encrypted (optional)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- 2. YouTube Configuration (For video uploads)
CREATE TABLE IF NOT EXISTS youtube_config (
    id SERIAL PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE youtube_config ENABLE ROW LEVEL SECURITY;

-- 3. Payment Configuration (For Stripe/Razorpay)
CREATE TABLE IF NOT EXISTS payment_config (
    id SERIAL PRIMARY KEY,
    provider TEXT NOT NULL UNIQUE, -- 'stripe', 'razorpay'
    public_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    currency TEXT DEFAULT 'USD',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;

-- 4. Upskill Learners (Profile extension for Upskill module)
CREATE TABLE IF NOT EXISTS upskill_learners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    career_goal TEXT,
    experience_level TEXT, -- 'Beginner', 'Intermediate', 'Advanced'
    current_skills TEXT[],
    interests TEXT[],
    linkedin_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE upskill_learners ENABLE ROW LEVEL SECURITY;

-- 5. User Learning Progress (Gamification stats)
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    xp_points INTEGER DEFAULT 0,
    level TEXT DEFAULT 'Beginner Learner',
    streak_days INTEGER DEFAULT 0,
    last_activity_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;

-- 6. User Enrollments (Track course participation)
CREATE TABLE IF NOT EXISTS user_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    course_id UUID REFERENCES courses(id) NOT NULL, -- Assumes courses table exists
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'dropped'
    progress INTEGER DEFAULT 0, -- 0-100%
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);
ALTER TABLE user_enrollments ENABLE ROW LEVEL SECURITY;

-- 7. Certificates (Upskill module certificates)
-- Note: schema has 'candidate_certificates', but code uses 'certificates'.
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    course_id UUID REFERENCES courses(id),
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- NOTE: After creating these tables, re-run production_rls_policies.sql
-- to verify RLS logic (though these tables will default to closed anyway).
-- You may need to add specific policies for them if users need direct access.
-- (Currently, backend uses scoped client or admin client, so default closed is okay for config tables,
--  but 'upskill_learners' etc need user policies).
-- ============================================================

-- USER POLICIES FOR NEW TABLES:
-- (Only authenticated users can see their own data)

-- upskill_learners
CREATE POLICY "user_own_upskill_profile" ON upskill_learners
    FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_learning_progress
CREATE POLICY "user_own_learning_progress" ON user_learning_progress
    FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_enrollments
CREATE POLICY "user_own_enrollments" ON user_enrollments
    FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- certificates
CREATE POLICY "user_own_certificates" ON certificates
    FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
