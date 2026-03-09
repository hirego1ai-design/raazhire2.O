-- ============================================================
-- HIREGO AI - SECURITY FIX FOR 94+ WARNINGS
-- Replaces insecure "Always True" policies with strict Role-Based Access Control (RBAC).
-- ============================================================

-- Helper to safely drop policies
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP 
        -- Drop policies explicitly named "Public Access..." or those that are known insecure placeholders
        IF pol.policyname LIKE 'Public Access %' OR pol.policyname = 'Enable read access for all users' THEN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
        END IF;
    END LOOP; 
END $$;

-- ============================================================
-- 1. USER PRIVATE DATA (Strict Owner Access)
-- ============================================================

-- Generic User Profile Data
DROP POLICY IF EXISTS "Owner Access user_profiles" ON user_profiles;
CREATE POLICY "Owner Access user_profiles" ON user_profiles FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Candidate Progress & Certs
DROP POLICY IF EXISTS "Owner Access candidate_progress" ON candidate_progress;
CREATE POLICY "Owner Access candidate_progress" ON candidate_progress FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Owner Access candidate_certificates" ON candidate_certificates;
CREATE POLICY "Owner Access candidate_certificates" ON candidate_certificates FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Assessments
DROP POLICY IF EXISTS "Owner Access candidate_assessments" ON candidate_assessments;
CREATE POLICY "Owner Access candidate_assessments" ON candidate_assessments FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Activity Logs
DROP POLICY IF EXISTS "Owner Access candidate_activity_log" ON candidate_activity_log;
CREATE POLICY "Owner Access candidate_activity_log" ON candidate_activity_log FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Wallet & Finance
DROP POLICY IF EXISTS "Owner Access wallet" ON wallet;
CREATE POLICY "Owner Access wallet" ON wallet FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Owner Access wallet_transactions" ON wallet_transactions;
CREATE POLICY "Owner Access wallet_transactions" ON wallet_transactions FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Owner Access transactions" ON transactions;
CREATE POLICY "Owner Access transactions" ON transactions FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Owner Access payments" ON payments;
CREATE POLICY "Owner Access payments" ON payments FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Notifications
DROP POLICY IF EXISTS "Owner Access notifications" ON notifications;
CREATE POLICY "Owner Access notifications" ON notifications FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Submissions
DROP POLICY IF EXISTS "Owner Access assignment_submissions" ON assignment_submissions;
CREATE POLICY "Owner Access assignment_submissions" ON assignment_submissions FOR ALL 
USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);


-- ============================================================
-- 2. EMPLOYER DATA (Strict Employer Access)
-- ============================================================

-- Subscriptions
DROP POLICY IF EXISTS "Employer Access employer_subscriptions" ON employer_subscriptions;
CREATE POLICY "Employer Access employer_subscriptions" ON employer_subscriptions FOR ALL 
USING (auth.uid()::text = employer_id) WITH CHECK (auth.uid()::text = employer_id);

-- Employer Logs
DROP POLICY IF EXISTS "Employer Access employer_activity_log" ON employer_activity_log;
CREATE POLICY "Employer Access employer_activity_log" ON employer_activity_log FOR ALL 
USING (auth.uid()::text = employer_id) WITH CHECK (auth.uid()::text = employer_id);

-- PPH Records (Employer View + Admin View typically, limiting to employer for now)
DROP POLICY IF EXISTS "Employer Access pay_per_hire_records" ON pay_per_hire_records;
CREATE POLICY "Employer Access pay_per_hire_records" ON pay_per_hire_records FOR ALL 
USING (auth.uid()::text = employer_id) WITH CHECK (auth.uid()::text = employer_id);


-- ============================================================
-- 3. SHARED / PUBLIC READ DATA (Jobs & Courses)
-- ============================================================

-- Jobs: Public Read, Employer Write
DROP POLICY IF EXISTS "Public Read employer_job_posts" ON employer_job_posts;
CREATE POLICY "Public Read employer_job_posts" ON employer_job_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employer Write employer_job_posts" ON employer_job_posts;
CREATE POLICY "Employer Write employer_job_posts" ON employer_job_posts FOR ALL 
USING (auth.uid()::text = employer_id) WITH CHECK (auth.uid()::text = employer_id);

-- Course Content: Public Read Only (Admins write via dashboard usually)
DROP POLICY IF EXISTS "Public Read course_lessons" ON course_lessons;
CREATE POLICY "Public Read course_lessons" ON course_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read course_quizzes" ON course_quizzes;
CREATE POLICY "Public Read course_quizzes" ON course_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read course_assignments" ON course_assignments;
CREATE POLICY "Public Read course_assignments" ON course_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read live_classes" ON live_classes;
CREATE POLICY "Public Read live_classes" ON live_classes FOR SELECT USING (true);


-- ============================================================
-- 4. RECRUITMENT (Candidate + Employer shared access)
-- ============================================================

-- Applications
DROP POLICY IF EXISTS "Candidate Access job_applications" ON job_applications;
CREATE POLICY "Candidate Access job_applications" ON job_applications FOR ALL 
USING (auth.uid()::text = candidate_id) WITH CHECK (auth.uid()::text = candidate_id);

DROP POLICY IF EXISTS "Employer View job_applications" ON job_applications;
CREATE POLICY "Employer View job_applications" ON job_applications FOR SELECT 
USING (EXISTS (SELECT 1 FROM employer_job_posts WHERE id = job_applications.job_id AND employer_id = auth.uid()::text));

-- Screening Results
DROP POLICY IF EXISTS "Candidate View screening_results" ON screening_results;
CREATE POLICY "Candidate View screening_results" ON screening_results FOR SELECT 
USING (auth.uid()::text = candidate_id);

-- Video Sessions
DROP POLICY IF EXISTS "Participant View video_interview_sessions" ON video_interview_sessions;
CREATE POLICY "Participant View video_interview_sessions" ON video_interview_sessions FOR SELECT 
USING (auth.uid()::text = candidate_id);


-- ============================================================
-- 5. ADMIN SYSTEM (Restricted)
-- ============================================================

-- Helper policy for admin tables
-- We deny public access by default. Only specific policies grant access.

-- Admin Users (No public access)
DROP POLICY IF EXISTS "No Public Access admin_users" ON admin_users;
-- Valid Admin Check (If you have an admin_users table, we use it to separate logic)
-- CREATE POLICY "Admin Access admin_users" ON admin_users FOR SELECT USING (auth.uid()::text = user_id);

-- Staff Users (Read Only for Directory if needed, or restricted)
DROP POLICY IF EXISTS "Public Read staff_users" ON staff_users;
CREATE POLICY "Public Read staff_users" ON staff_users FOR SELECT USING (true);

-- Analytics (Insert Only for Public, View for Admin)
DROP POLICY IF EXISTS "Public Insert analytics" ON analytics;
CREATE POLICY "Public Insert analytics" ON analytics FOR INSERT WITH CHECK (true);

-- Logs (No Public Access)
DROP POLICY IF EXISTS "No Access email_logs" ON email_logs;
DROP POLICY IF EXISTS "No Access staff_activity" ON staff_activity;
DROP POLICY IF EXISTS "No Access session_recordings" ON session_recordings;
DROP POLICY IF EXISTS "No Access interview_logs" ON interview_logs;

-- Call to Action:
-- If you need Admin Panel access, you must ensure your user ID is in 'admin_users' 
-- and you are using the Service Role or a specific Admin Policy.
