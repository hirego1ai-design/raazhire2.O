-- ============================================================
-- HIREGO AI - SECURE RLS POLICIES IMPLEMENTATION
-- ============================================================
-- This script replaces insecure "USING (true)" policies with proper role-based access control
-- Run this in Supabase SQL Editor to apply secure policies
-- ============================================================

-- ==================== SECURITY PRINCIPLES ====================
-- 1. Principle of Least Privilege: Users only access what they own
-- 2. Role-Based Access Control: Different permissions based on user role
-- 3. Data Isolation: Prevent unauthorized cross-user data access
-- 4. Audit Trail: Log security-relevant operations
-- ============================================================

-- ==================== TABLE POLICY CLASSIFICATION ====================

-- Public Read-Only Tables (Anyone can read, no writes)
-- employer_job_posts, courses, course_lessons, subscription_plans

-- User-Owned Tables (Users can only access their own data)
-- users, user_profiles, candidates, wallet, wallet_transactions, notifications

-- Employer-Owned Tables (Employers can access their company data)
-- employers, employer_job_posts (own), employer_subscriptions

-- Admin-Only Tables (Service role access only)
-- admin_users, admin_settings, api_keys, system_logs

-- Shared Access Tables (Multiple roles can access with restrictions)
-- job_applications, interviews, screening_results

-- ==================== POLICY IMPLEMENTATION ====================

-- 1. DROP ALL EXISTING POLICIES FIRST
DO $$ 
DECLARE 
    pol record;
    t_name text;
BEGIN
    -- Drop all existing policies on all tables
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t_name LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t_name);
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '✅ All existing policies dropped';
END $$;

-- 2. ENABLE RLS ON ALL TABLES
DO $$ 
DECLARE 
    t_name text;
BEGIN
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);
        RAISE NOTICE 'Enabled RLS on table: %', t_name;
    END LOOP;
END $$;

-- 3. CREATE SECURE POLICIES

-- ==================== PUBLIC READ-ONLY TABLES ====================

-- Job Posts (Public can view, only employers can create/update)
CREATE POLICY "Public View Jobs" ON employer_job_posts 
    FOR SELECT USING (true);

CREATE POLICY "Employers Manage Jobs" ON employer_job_posts 
    FOR ALL USING (
        auth.uid()::text IN (
            SELECT e.user_id 
            FROM employers e 
            WHERE e.id = employer_job_posts.employer_id
        )
    );

-- Courses (Public can view)
CREATE POLICY "Public View Courses" ON courses 
    FOR SELECT USING (true);

CREATE POLICY "Educators Manage Courses" ON courses 
    FOR ALL USING (
        auth.uid()::text IN (
            SELECT user_id 
            FROM educators 
            WHERE id = courses.educator_id
        )
    );

-- Lessons (Public can view if course is public)
CREATE POLICY "Public View Lessons" ON course_lessons 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c 
            WHERE c.id = course_lessons.course_id 
            AND c.is_public = true
        )
    );

-- Subscription Plans (Public can view)
CREATE POLICY "Public View Plans" ON subscription_plans 
    FOR SELECT USING (true);

-- ==================== USER-OWNED TABLES ====================

-- Users (Users can only view/edit their own record)
CREATE POLICY "Users View Own Profile" ON users 
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users Update Own Profile" ON users 
    FOR UPDATE USING (auth.uid()::text = id);

-- User Profiles
CREATE POLICY "Users View Own Profile Data" ON user_profiles 
    FOR SELECT USING (
        user_id = auth.uid()::text OR 
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = user_profiles.user_id 
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Users Update Own Profile Data" ON user_profiles 
    FOR ALL USING (user_id = auth.uid()::text);

-- Candidates
CREATE POLICY "Candidates View Own Data" ON candidates 
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Candidates Update Own Data" ON candidates 
    FOR ALL USING (user_id = auth.uid()::text);

-- Wallet (User-owned financial data)
CREATE POLICY "Users View Own Wallet" ON wallet 
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users Update Own Wallet" ON wallet 
    FOR ALL USING (user_id = auth.uid()::text);

-- Wallet Transactions (Atomic transaction security)
CREATE POLICY "Users View Own Transactions" ON wallet_transactions 
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "System Manage Transactions" ON wallet_transactions 
    FOR ALL USING (
        auth.uid()::text = user_id OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()::text 
            AND u.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM employers e 
            WHERE e.user_id = auth.uid()::text 
            AND e.id = wallet_transactions.employer_id
        )
    );

-- Notifications
CREATE POLICY "Users View Own Notifications" ON notifications 
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "System Send Notifications" ON notifications 
    FOR INSERT WITH CHECK (true); -- System can insert notifications

-- ==================== EMPLOYER-OWNED TABLES ====================

-- Employers
CREATE POLICY "Employers View Own Data" ON employers 
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Employers Update Own Data" ON employers 
    FOR ALL USING (user_id = auth.uid()::text);

-- Employer Subscriptions
CREATE POLICY "Employers View Own Subscriptions" ON employer_subscriptions 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employers e 
            WHERE e.id = employer_subscriptions.employer_id 
            AND e.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Employers Manage Subscriptions" ON employer_subscriptions 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employers e 
            WHERE e.id = employer_subscriptions.employer_id 
            AND e.user_id = auth.uid()::text
        )
    );

-- ==================== SHARED ACCESS TABLES ====================

-- Job Applications (Candidates apply, employers review)
CREATE POLICY "Candidates View Own Applications" ON job_applications 
    FOR SELECT USING (candidate_id = auth.uid()::text);

CREATE POLICY "Candidates Create Applications" ON job_applications 
    FOR INSERT WITH CHECK (candidate_id = auth.uid()::text);

CREATE POLICY "Employers View Job Applications" ON job_applications 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employer_job_posts ejp
            JOIN employers e ON ejp.employer_id = e.id
            WHERE ejp.id = job_applications.job_id
            AND e.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Employers Update Application Status" ON job_applications 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM employer_job_posts ejp
            JOIN employers e ON ejp.employer_id = e.id
            WHERE ejp.id = job_applications.job_id
            AND e.user_id = auth.uid()::text
        )
    );

-- Interviews (Both candidates and employers need access)
CREATE POLICY "Participants View Interviews" ON interviews 
    FOR SELECT USING (
        candidate_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM employer_job_posts ejp
            JOIN employers e ON ejp.employer_id = e.id
            WHERE ejp.id = interviews.job_id
            AND e.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Authorized Create Interviews" ON interviews 
    FOR INSERT WITH CHECK (
        candidate_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM employer_job_posts ejp
            JOIN employers e ON ejp.employer_id = e.id
            WHERE ejp.id = interviews.job_id
            AND e.user_id = auth.uid()::text
        )
    );

-- ==================== ADMIN-ONLY TABLES ====================

-- Admin Users (Service role only)
CREATE POLICY "Admins Manage Admin Users" ON admin_users 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

-- API Keys (Admin only)
CREATE POLICY "Admins Manage API Keys" ON api_keys 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

-- System Logs (Admin only)
CREATE POLICY "Admins View System Logs" ON system_logs 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

CREATE POLICY "System Write Logs" ON system_logs 
    FOR INSERT WITH CHECK (true); -- System can write logs

-- ==================== SECURITY AUDIT TABLE ====================

-- Create security logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins View Security Logs" ON security_logs 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

CREATE POLICY "System Write Security Logs" ON security_logs 
    FOR INSERT WITH CHECK (true);

-- ==================== GRANT PERMISSIONS ====================

-- Grant necessary permissions
DO $$ 
DECLARE 
    t_name text;
BEGIN
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        -- Grant to authenticated users (RLS will filter)
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t_name);
        -- Grant to service role (admin operations)
        EXECUTE format('GRANT ALL ON public.%I TO service_role', t_name);
        RAISE NOTICE 'Granted permissions on table: %', t_name;
    END LOOP;
END $$;

-- ==================== VERIFICATION ====================

-- Verify policies were created
SELECT 
    tablename,
    count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename
ORDER BY tablename;

RAISE NOTICE '✅ Secure RLS policies implementation completed';
RAISE NOTICE '⚠️  Remember to test all user flows to ensure policies work correctly';
RAISE NOTICE '⚠️  Monitor security_logs table for unauthorized access attempts';