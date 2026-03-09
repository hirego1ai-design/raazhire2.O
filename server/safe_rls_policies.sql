-- ============================================================
-- HIREGO AI - SAFE RLS POLICY MIGRATION
-- Applies strict policies ONLY to existing tables.
-- Is fully idempotent (safe to run multiple times).
-- ============================================================

-- Function to safely drop insecure policies on existing tables
DO $$ 
DECLARE 
    tbl record;
    pol record;
BEGIN 
    -- Loop through all existing public tables
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        -- Remove policies mimicking "Public Access"
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl.tablename AND (policyname LIKE 'Public Access %' OR policyname = 'Enable read access for all users') LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl.tablename);
        END LOOP;
    END LOOP; 
END $$;


-- ============================================================
-- 1. USER PRIVATE DATA
-- ============================================================

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles') THEN
        DROP POLICY IF EXISTS "Owner Access user_profiles" ON user_profiles;
        CREATE POLICY "Owner Access user_profiles" ON user_profiles FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_progress') THEN
        DROP POLICY IF EXISTS "Owner Access candidate_progress" ON candidate_progress;
        CREATE POLICY "Owner Access candidate_progress" ON candidate_progress FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_certificates') THEN
        DROP POLICY IF EXISTS "Owner Access candidate_certificates" ON candidate_certificates;
        CREATE POLICY "Owner Access candidate_certificates" ON candidate_certificates FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_assessments') THEN
        DROP POLICY IF EXISTS "Owner Access candidate_assessments" ON candidate_assessments;
        CREATE POLICY "Owner Access candidate_assessments" ON candidate_assessments FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_activity_log') THEN
        DROP POLICY IF EXISTS "Owner Access candidate_activity_log" ON candidate_activity_log;
        CREATE POLICY "Owner Access candidate_activity_log" ON candidate_activity_log FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'wallet') THEN
        DROP POLICY IF EXISTS "Owner Access wallet" ON wallet;
        CREATE POLICY "Owner Access wallet" ON wallet FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'wallet_transactions') THEN
        DROP POLICY IF EXISTS "Owner Access wallet_transactions" ON wallet_transactions;
        CREATE POLICY "Owner Access wallet_transactions" ON wallet_transactions FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transactions') THEN
        DROP POLICY IF EXISTS "Owner Access transactions" ON transactions;
        CREATE POLICY "Owner Access transactions" ON transactions FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments') THEN
        DROP POLICY IF EXISTS "Owner Access payments" ON payments;
        CREATE POLICY "Owner Access payments" ON payments FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications') THEN
        DROP POLICY IF EXISTS "Owner Access notifications" ON notifications;
        CREATE POLICY "Owner Access notifications" ON notifications FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assignment_submissions') THEN
        DROP POLICY IF EXISTS "Owner Access assignment_submissions" ON assignment_submissions;
        CREATE POLICY "Owner Access assignment_submissions" ON assignment_submissions FOR ALL 
        USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
    END IF;
END $$;


-- ============================================================
-- 2. EMPLOYER DATA
-- ============================================================

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_subscriptions') THEN
        DROP POLICY IF EXISTS "Employer Access employer_subscriptions" ON employer_subscriptions;
        CREATE POLICY "Employer Access employer_subscriptions" ON employer_subscriptions FOR ALL 
        USING (auth.uid()::text = employer_id) WITH CHECK (auth.uid()::text = employer_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_activity_log') THEN
        DROP POLICY IF EXISTS "Employer Access employer_activity_log" ON employer_activity_log;
        CREATE POLICY "Employer Access employer_activity_log" ON employer_activity_log FOR ALL 
        USING (auth.uid()::text = employer_id) WITH CHECK (auth.uid()::text = employer_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pay_per_hire_records') THEN
        DROP POLICY IF EXISTS "Employer Access pay_per_hire_records" ON pay_per_hire_records;
        CREATE POLICY "Employer Access pay_per_hire_records" ON pay_per_hire_records FOR ALL 
        USING (auth.uid()::text = employer_id) WITH CHECK (auth.uid()::text = employer_id);
    END IF;
END $$;


-- ============================================================
-- 3. SHARED / PUBLIC READ DATA
-- ============================================================

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        DROP POLICY IF EXISTS "Public Read employer_job_posts" ON employer_job_posts;
        CREATE POLICY "Public Read employer_job_posts" ON employer_job_posts FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Employer Write employer_job_posts" ON employer_job_posts;
        CREATE POLICY "Employer Write employer_job_posts" ON employer_job_posts FOR ALL 
        USING (auth.uid()::text = employer_id) WITH CHECK (auth.uid()::text = employer_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'course_lessons') THEN
        DROP POLICY IF EXISTS "Public Read course_lessons" ON course_lessons;
        CREATE POLICY "Public Read course_lessons" ON course_lessons FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'course_quizzes') THEN
        DROP POLICY IF EXISTS "Public Read course_quizzes" ON course_quizzes;
        CREATE POLICY "Public Read course_quizzes" ON course_quizzes FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'course_assignments') THEN
        DROP POLICY IF EXISTS "Public Read course_assignments" ON course_assignments;
        CREATE POLICY "Public Read course_assignments" ON course_assignments FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'live_classes') THEN
        DROP POLICY IF EXISTS "Public Read live_classes" ON live_classes;
        CREATE POLICY "Public Read live_classes" ON live_classes FOR SELECT USING (true);
    END IF;
END $$;


-- ============================================================
-- 4. RECRUITMENT DATA
-- ============================================================

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        DROP POLICY IF EXISTS "Candidate Access job_applications" ON job_applications;
        CREATE POLICY "Candidate Access job_applications" ON job_applications FOR ALL 
        USING (auth.uid()::text = candidate_id) WITH CHECK (auth.uid()::text = candidate_id);
        
        DROP POLICY IF EXISTS "Employer View job_applications" ON job_applications;
        CREATE POLICY "Employer View job_applications" ON job_applications FOR SELECT 
        USING (EXISTS (SELECT 1 FROM employer_job_posts WHERE id = job_applications.job_id AND employer_id = auth.uid()::text));
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'screening_results') THEN
        DROP POLICY IF EXISTS "Candidate View screening_results" ON screening_results;
        CREATE POLICY "Candidate View screening_results" ON screening_results FOR SELECT 
        USING (auth.uid()::text = candidate_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'video_interview_sessions') THEN
        DROP POLICY IF EXISTS "Participant View video_interview_sessions" ON video_interview_sessions;
        CREATE POLICY "Participant View video_interview_sessions" ON video_interview_sessions FOR SELECT 
        USING (auth.uid()::text = candidate_id);
    END IF;
END $$;


-- ============================================================
-- 5. ADMIN / STAFF / ANALYTICS
-- ============================================================

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'staff_users') THEN
        DROP POLICY IF EXISTS "Public Read staff_users" ON staff_users;
        CREATE POLICY "Public Read staff_users" ON staff_users FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analytics') THEN
        DROP POLICY IF EXISTS "Public Insert analytics" ON analytics;
        CREATE POLICY "Public Insert analytics" ON analytics FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Lock down sensitive tables if they exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'email_logs') THEN
        DROP POLICY IF EXISTS "No Access email_logs" ON email_logs; 
        -- No policy = No public access
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'staff_activity') THEN
        DROP POLICY IF EXISTS "No Access staff_activity" ON staff_activity; 
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'session_recordings') THEN
        DROP POLICY IF EXISTS "No Access session_recordings" ON session_recordings; 
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'interview_logs') THEN
        DROP POLICY IF EXISTS "No Access interview_logs" ON interview_logs; 
    END IF;
END $$;
