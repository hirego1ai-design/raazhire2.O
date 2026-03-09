-- ============================================================
-- HIREGO AI - DATABASE PERFORMANCE OPTIMIZATION
-- 1. Auto-Index all unindexed Foreign Keys (Fixes "Unindexed foreign keys" warning)
-- 2. Optimize RLS Policies with cached Auth calls (Fixes "Auth RLS Initialization Plan" warning)
-- ============================================================

-- ============================================================
-- 1. AUTO-INDEX UNINDEXED FOREIGN KEYS
-- ============================================================
DO $$ 
DECLARE 
    r RECORD;
    idx_name TEXT;
BEGIN 
    -- Find all Foreign Keys in 'public' schema that do NOT have a matching index
    FOR r IN 
        SELECT 
            c.conrelid::regclass AS table_name, 
            a.attname AS column_name, 
            c.conname AS constraint_name
        FROM pg_constraint c 
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE c.contype = 'f' 
        AND n.nspname = 'public'
        -- Exclude if an index already exists starting with this column
        AND NOT EXISTS (
            SELECT 1 FROM pg_index i 
            WHERE i.indrelid = c.conrelid 
            AND i.indkey[0] = a.attnum -- Checks if the FK column is the first column in any index
        )
    LOOP 
        -- Generate a safe index name: idx_<table_name>_<column_name>
        idx_name := 'idx_' || replace(r.table_name::text, 'public.', '') || '_' || r.column_name;
        
        -- Create the index
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s(%I);', 
            idx_name, 
            r.table_name, 
            r.column_name
        );
        
        RAISE NOTICE 'Created missing index: % on %', idx_name, r.table_name;
    END LOOP; 
END $$;


-- ============================================================
-- 2. OPTIMIZE RLS POLICIES (Cache auth.uid() calls)
-- ============================================================

-- Function to safely apply optimized policies
-- We drop existing policies and recreate them with (select auth.uid()) optimization.

-- 2.1 USER PRIVATE DATA
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles') THEN
        DROP POLICY IF EXISTS "Owner Access user_profiles" ON user_profiles;
        CREATE POLICY "Owner Access user_profiles" ON user_profiles FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_progress') THEN
        DROP POLICY IF EXISTS "Owner Access candidate_progress" ON candidate_progress;
        CREATE POLICY "Owner Access candidate_progress" ON candidate_progress FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_certificates') THEN
        DROP POLICY IF EXISTS "Owner Access candidate_certificates" ON candidate_certificates;
        CREATE POLICY "Owner Access candidate_certificates" ON candidate_certificates FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_assessments') THEN
        DROP POLICY IF EXISTS "Owner Access candidate_assessments" ON candidate_assessments;
        CREATE POLICY "Owner Access candidate_assessments" ON candidate_assessments FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'candidate_activity_log') THEN
        DROP POLICY IF EXISTS "Owner Access candidate_activity_log" ON candidate_activity_log;
        CREATE POLICY "Owner Access candidate_activity_log" ON candidate_activity_log FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'wallet') THEN
        DROP POLICY IF EXISTS "Owner Access wallet" ON wallet;
        CREATE POLICY "Owner Access wallet" ON wallet FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'wallet_transactions') THEN
        DROP POLICY IF EXISTS "Owner Access wallet_transactions" ON wallet_transactions;
        CREATE POLICY "Owner Access wallet_transactions" ON wallet_transactions FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transactions') THEN
        DROP POLICY IF EXISTS "Owner Access transactions" ON transactions;
        CREATE POLICY "Owner Access transactions" ON transactions FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments') THEN
        DROP POLICY IF EXISTS "Owner Access payments" ON payments;
        CREATE POLICY "Owner Access payments" ON payments FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications') THEN
        DROP POLICY IF EXISTS "Owner Access notifications" ON notifications;
        CREATE POLICY "Owner Access notifications" ON notifications FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assignment_submissions') THEN
        DROP POLICY IF EXISTS "Owner Access assignment_submissions" ON assignment_submissions;
        CREATE POLICY "Owner Access assignment_submissions" ON assignment_submissions FOR ALL 
        USING ((select auth.uid())::text = user_id) WITH CHECK ((select auth.uid())::text = user_id);
    END IF;
END $$;


-- 2.2 EMPLOYER DATA
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_subscriptions') THEN
        DROP POLICY IF EXISTS "Employer Access employer_subscriptions" ON employer_subscriptions;
        CREATE POLICY "Employer Access employer_subscriptions" ON employer_subscriptions FOR ALL 
        USING ((select auth.uid())::text = employer_id) WITH CHECK ((select auth.uid())::text = employer_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_activity_log') THEN
        DROP POLICY IF EXISTS "Employer Access employer_activity_log" ON employer_activity_log;
        CREATE POLICY "Employer Access employer_activity_log" ON employer_activity_log FOR ALL 
        USING ((select auth.uid())::text = employer_id) WITH CHECK ((select auth.uid())::text = employer_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pay_per_hire_records') THEN
        DROP POLICY IF EXISTS "Employer Access pay_per_hire_records" ON pay_per_hire_records;
        CREATE POLICY "Employer Access pay_per_hire_records" ON pay_per_hire_records FOR ALL 
        USING ((select auth.uid())::text = employer_id) WITH CHECK ((select auth.uid())::text = employer_id);
    END IF;
END $$;


-- 2.3 SHARED / PUBLIC READ DATA
-- (Update Write policies only, Read policies use 'true' which is already optimal)

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        DROP POLICY IF EXISTS "Employer Write employer_job_posts" ON employer_job_posts;
        CREATE POLICY "Employer Write employer_job_posts" ON employer_job_posts FOR ALL 
        USING ((select auth.uid())::text = employer_id) WITH CHECK ((select auth.uid())::text = employer_id);
    END IF;
END $$;


-- 2.4 RECRUITMENT DATA
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        DROP POLICY IF EXISTS "Candidate Access job_applications" ON job_applications;
        CREATE POLICY "Candidate Access job_applications" ON job_applications FOR ALL 
        USING ((select auth.uid())::text = candidate_id) WITH CHECK ((select auth.uid())::text = candidate_id);
        
        DROP POLICY IF EXISTS "Employer View job_applications" ON job_applications;
        CREATE POLICY "Employer View job_applications" ON job_applications FOR SELECT 
        USING (EXISTS (SELECT 1 FROM employer_job_posts WHERE id = job_applications.job_id AND employer_id = (select auth.uid())::text));
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'screening_results') THEN
        DROP POLICY IF EXISTS "Candidate View screening_results" ON screening_results;
        CREATE POLICY "Candidate View screening_results" ON screening_results FOR SELECT 
        USING ((select auth.uid())::text = candidate_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'video_interview_sessions') THEN
        DROP POLICY IF EXISTS "Participant View video_interview_sessions" ON video_interview_sessions;
        CREATE POLICY "Participant View video_interview_sessions" ON video_interview_sessions FOR SELECT 
        USING ((select auth.uid())::text = candidate_id);
    END IF;
END $$;

