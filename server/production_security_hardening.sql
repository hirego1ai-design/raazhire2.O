-- ============================================================
-- HIREGO AI - PRODUCTION SECURITY HARDENING (FINAL)
-- Phase 1: Fix ALWAYS TRUE Policies
-- Phase 2: Remove Anonymous Access (Global Hardening)
-- Phase 3: Fix Service-Role Only Tables
-- Phase 4: Performance Optimization (Cached Auth)
-- ============================================================

-- Helper procedure to wipe policies for a table (Start Fresh)
DO $$
CREATE OR REPLACE FUNCTION drop_policies_for_table(t_name text) RETURNS void AS '
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = ''public'' AND tablename = t_name LOOP
        EXECUTE format(''DROP POLICY IF EXISTS %I ON %I'', pol.policyname, t_name);
    END LOOP;
END;
' LANGUAGE plpgsql;
$$;


-- ============================================================
-- PHASE 1 & 3: SERVICE_ROLE ONLY TABLES
-- (Locks down admin/system tables completely)
-- ============================================================
DO $$ 
DECLARE 
    srv_tables text[] := ARRAY[
        'admin_settings', 
        'admin_users', 
        'api_keys', 
        'crm_leads', 
        'email_logs', 
        'interview_feedback', 
        'interview_logs', 
        'platform_reports', 
        'salary_slabs', 
        'session_recordings', 
        'staff_activity', 
        'subscription_plans', 
        'system_logs', 
        'youtube_config',
        'staff_users' -- Usually internal only
    ];
    t_name text;
BEGIN
    FOREACH t_name IN ARRAY srv_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            -- 1. Enable RLS
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t_name);
            
            -- 2. Drop existing policies
            PERFORM drop_policies_for_table(t_name);
            
            -- 3. Create Service Role Full Access
            EXECUTE format('
                CREATE POLICY "service_role_full_access_%s_policy"
                ON %I
                FOR ALL
                TO service_role
                USING (true)
                WITH CHECK (true)', t_name, t_name);
                
            RAISE NOTICE 'Secured Table (Service Role Only): %', t_name;
        END IF;
    END LOOP;
END $$;


-- ============================================================
-- PHASE 1 (Specific): ANALYTICS
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analytics') THEN
        PERFORM drop_policies_for_table('analytics');
        
        -- Insert for Authenticated Users Only
        CREATE POLICY "authenticated_insert_analytics_policy"
        ON analytics FOR INSERT
        TO authenticated
        WITH CHECK (true); -- Allow logging events, user_id check optional/handled by backend
        
        -- Service Role Full Access
        CREATE POLICY "service_role_full_access_analytics_policy"
        ON analytics FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);
    END IF;
END $$;


-- ============================================================
-- PHASE 2 & 4: PUBLIC READ ALLOWED (Exceptions)
-- (jobs, courses, lessons, live_classes)
-- ============================================================
DO $$ 
DECLARE 
    pub_tables text[] := ARRAY['jobs', 'courses', 'lessons', 'live_classes', 'employer_job_posts']; -- Added employer_job_posts for site function
    t_name text;
BEGIN
    FOREACH t_name IN ARRAY pub_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            PERFORM drop_policies_for_table(t_name);
            
            -- 1. Public Read (Anon + Auth)
            EXECUTE format('
                CREATE POLICY "public_select_%s_policy"
                ON %I
                FOR SELECT
                TO anon, authenticated
                USING (true)', t_name, t_name);
                
            -- 2. Write Policies (Dependent on table type, handled below or generic owner)
             -- Adding Service Role backup for all
            EXECUTE format('
                CREATE POLICY "service_role_full_access_%s_policy"
                ON %I
                FOR ALL
                TO service_role
                USING (true) WITH CHECK (true)', t_name, t_name);
        END IF;
    END LOOP;
END $$;

-- Specific Write Policies for the Public Tables
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        CREATE POLICY "authenticated_employer_write_jobs_policy"
        ON employer_job_posts FOR ALL
        TO authenticated
        USING ((select auth.uid())::text = employer_id)
        WITH CHECK ((select auth.uid())::text = employer_id);
    END IF;
END $$;


-- ============================================================
-- PHASE 2 & 4: USER OWNED DATA (Strict Authenticated Only)
-- (No Anon Access)
-- ============================================================
DO $$ 
DECLARE 
    user_tables text[] := ARRAY[
        'user_profiles', 
        'candidate_progress', 
        'candidate_certificates', 
        'candidate_assessments',
        'candidate_activity_log',
        'wallet', 
        'wallet_transactions', 
        'notifications', 
        'assignment_submissions',
        'transactions',
        'payments'
    ];
    t_name text;
BEGIN
    FOREACH t_name IN ARRAY user_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            PERFORM drop_policies_for_table(t_name);
            
            -- 1. Authenticated Owner Access
            EXECUTE format('
                CREATE POLICY "authenticated_owner_%s_policy"
                ON %I
                FOR ALL
                TO authenticated
                USING ((select auth.uid())::text = user_id)
                WITH CHECK ((select auth.uid())::text = user_id)', t_name, t_name);
            
            -- 2. Service Role Access
            EXECUTE format('
                CREATE POLICY "service_role_full_access_%s_policy"
                ON %I
                FOR ALL
                TO service_role
                USING (true) WITH CHECK (true)', t_name, t_name);
        END IF;
    END LOOP;
END $$;


-- ============================================================
-- PHASE 2 & 4: EMPLOYER OWNED DATA
-- ============================================================
DO $$ 
DECLARE 
    emp_tables text[] := ARRAY[
        'employer_subscriptions', 
        'employer_activity_log', 
        'pay_per_hire_records'
    ];
    t_name text;
BEGIN
    FOREACH t_name IN ARRAY emp_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            PERFORM drop_policies_for_table(t_name);
            
            -- 1. Employer Access
            EXECUTE format('
                CREATE POLICY "authenticated_employer_%s_policy"
                ON %I
                FOR ALL
                TO authenticated
                USING ((select auth.uid())::text = employer_id)
                WITH CHECK ((select auth.uid())::text = employer_id)', t_name, t_name);

            -- 2. Service Role Access
            EXECUTE format('
                CREATE POLICY "service_role_full_access_%s_policy"
                ON %I
                FOR ALL
                TO service_role
                USING (true) WITH CHECK (true)', t_name, t_name);
        END IF;
    END LOOP;
END $$;


-- ============================================================
-- SPECIAL CASE: JOB APPLICATIONS (Shared)
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        PERFORM drop_policies_for_table('job_applications');

        -- 1. Candidate Own Access (Auth only)
        CREATE POLICY "authenticated_candidate_apps_policy"
        ON job_applications FOR ALL
        TO authenticated
        USING ((select auth.uid())::text = candidate_id)
        WITH CHECK ((select auth.uid())::text = candidate_id);

        -- 2. Employer View Access (Auth only)
        CREATE POLICY "authenticated_employer_view_apps_policy"
        ON job_applications FOR SELECT
        TO authenticated
        USING (EXISTS (
            SELECT 1 FROM employer_job_posts 
            WHERE id = job_applications.job_id 
            AND employer_id = (select auth.uid())::text
        ));

        -- 3. Service Role
        CREATE POLICY "service_role_full_access_apps_policy"
        ON job_applications FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);
    END IF;
END $$;


-- ============================================================
-- SPECIAL CASE: SCREENING RESULTS & VIDEO SESSIONS
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'screening_results') THEN
        PERFORM drop_policies_for_table('screening_results');
        
        CREATE POLICY "authenticated_candidate_view_screening_policy"
        ON screening_results FOR SELECT
        TO authenticated
        USING ((select auth.uid())::text = candidate_id);

        CREATE POLICY "service_role_full_access_screening_policy"
        ON screening_results FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'video_interview_sessions') THEN
        PERFORM drop_policies_for_table('video_interview_sessions');
        
        CREATE POLICY "authenticated_participant_view_video_policy"
        ON video_interview_sessions FOR SELECT
        TO authenticated
        USING ((select auth.uid())::text = candidate_id);

        CREATE POLICY "service_role_full_access_video_policy"
        ON video_interview_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Cleanup Helper
DROP FUNCTION IF EXISTS drop_policies_for_table;
