-- ============================================================
-- HIREGO AI - FINAL IDEMPOTENT PRODUCTION SECURITY SCRIPT
-- ============================================================
-- This script safely drops existing policies before creating new ones.
-- It works on existing tables only.
-- No "policy already exists" errors.
-- No "relation does not exist" errors.
-- ============================================================

-- ============================================================
-- 1. SERVICE_ROLE ONLY TABLES (Admin/System)
-- ============================================================
DO $$ 
DECLARE 
    t_name text;
    srv_tables text[] := ARRAY[
        'admin_settings', 'admin_users', 'api_keys', 'crm_leads', 
        'email_logs', 'interview_feedback', 'interview_logs', 
        'platform_reports', 'salary_slabs', 'session_recordings', 
        'staff_activity', 'subscription_plans', 'system_logs', 
        'youtube_config', 'staff_users'
    ];
BEGIN
    FOREACH t_name IN ARRAY srv_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);
            
            -- Drop specific policy if exists
            EXECUTE format('DROP POLICY IF EXISTS "service_role_full_access_%s_policy" ON public.%I', t_name, t_name);
            
            -- Create policy
            EXECUTE format('
                CREATE POLICY "service_role_full_access_%s_policy"
                ON public.%I
                FOR ALL
                TO service_role
                USING (true)
                WITH CHECK (true)', t_name, t_name);
        END IF;
    END LOOP;
END $$;


-- ============================================================
-- 2. PUBLIC READ TABLES (jobs, courses, etc.)
-- ============================================================
DO $$ 
DECLARE 
    t_name text;
    pub_tables text[] := ARRAY['jobs', 'courses', 'lessons', 'live_classes', 'employer_job_posts'];
BEGIN
    FOREACH t_name IN ARRAY pub_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);

            -- 1. Public Select Policy
            EXECUTE format('DROP POLICY IF EXISTS "public_select_%s_policy" ON public.%I', t_name, t_name);
            EXECUTE format('
                CREATE POLICY "public_select_%s_policy"
                ON public.%I
                FOR SELECT
                TO anon, authenticated
                USING (true)', t_name, t_name);

            -- 2. Service Role Full Access
            EXECUTE format('DROP POLICY IF EXISTS "service_role_full_access_%s_policy" ON public.%I', t_name, t_name);
            EXECUTE format('
                CREATE POLICY "service_role_full_access_%s_policy"
                ON public.%I
                FOR ALL
                TO service_role
                USING (true) WITH CHECK (true)', t_name, t_name);
        END IF;
    END LOOP;
END $$;

-- Specific Write Policy for Employer Job Posts
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        DROP POLICY IF EXISTS "authenticated_employer_write_jobs_policy" ON public.employer_job_posts;
        CREATE POLICY "authenticated_employer_write_jobs_policy"
        ON public.employer_job_posts FOR ALL
        TO authenticated
        USING ((select auth.uid())::text = employer_id)
        WITH CHECK ((select auth.uid())::text = employer_id);
    END IF;
END $$;


-- ============================================================
-- 3. USER OWNED DATA (Auth Only)
-- ============================================================
DO $$ 
DECLARE 
    t_name text;
    user_tables text[] := ARRAY[
        'user_profiles', 'candidate_progress', 'candidate_certificates', 
        'candidate_assessments', 'candidate_activity_log', 'wallet', 
        'wallet_transactions', 'notifications', 'assignment_submissions',
        'transactions', 'payments'
    ];
BEGIN
    FOREACH t_name IN ARRAY user_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);

            -- 1. Owner Access
            EXECUTE format('DROP POLICY IF EXISTS "authenticated_owner_%s_policy" ON public.%I', t_name, t_name);
            EXECUTE format('
                CREATE POLICY "authenticated_owner_%s_policy"
                ON public.%I
                FOR ALL
                TO authenticated
                USING ((select auth.uid())::text = user_id)
                WITH CHECK ((select auth.uid())::text = user_id)', t_name, t_name);

            -- 2. Service Role Access
            EXECUTE format('DROP POLICY IF EXISTS "service_role_full_access_%s_policy" ON public.%I', t_name, t_name);
            EXECUTE format('
                CREATE POLICY "service_role_full_access_%s_policy"
                ON public.%I
                FOR ALL
                TO service_role
                USING (true) WITH CHECK (true)', t_name, t_name);
        END IF;
    END LOOP;
END $$;


-- ============================================================
-- 4. EMPLOYER OWNED DATA
-- ============================================================
DO $$ 
DECLARE 
    t_name text;
    emp_tables text[] := ARRAY[
        'employer_subscriptions', 'employer_activity_log', 'pay_per_hire_records'
    ];
BEGIN
    FOREACH t_name IN ARRAY emp_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);

            -- 1. Employer Access
            EXECUTE format('DROP POLICY IF EXISTS "authenticated_employer_%s_policy" ON public.%I', t_name, t_name);
            EXECUTE format('
                CREATE POLICY "authenticated_employer_%s_policy"
                ON public.%I
                FOR ALL
                TO authenticated
                USING ((select auth.uid())::text = employer_id)
                WITH CHECK ((select auth.uid())::text = employer_id)', t_name, t_name);

            -- 2. Service Role Access
            EXECUTE format('DROP POLICY IF EXISTS "service_role_full_access_%s_policy" ON public.%I', t_name, t_name);
            EXECUTE format('
                CREATE POLICY "service_role_full_access_%s_policy"
                ON public.%I
                FOR ALL
                TO service_role
                USING (true) WITH CHECK (true)', t_name, t_name);
        END IF;
    END LOOP;
END $$;


-- ============================================================
-- 5. ANALYTICS (Special Case)
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analytics') THEN
        DROP POLICY IF EXISTS "authenticated_insert_analytics_policy" ON public.analytics;
        CREATE POLICY "authenticated_insert_analytics_policy"
        ON public.analytics FOR INSERT
        TO authenticated
        WITH CHECK (true);

        DROP POLICY IF EXISTS "service_role_full_access_analytics_policy" ON public.analytics;
        CREATE POLICY "service_role_full_access_analytics_policy"
        ON public.analytics FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);
    END IF;
END $$;


-- ============================================================
-- 6. JOB APPLICATIONS (Shared)
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        DROP POLICY IF EXISTS "authenticated_candidate_apps_policy" ON public.job_applications;
        CREATE POLICY "authenticated_candidate_apps_policy"
        ON public.job_applications FOR ALL
        TO authenticated
        USING ((select auth.uid())::text = candidate_id)
        WITH CHECK ((select auth.uid())::text = candidate_id);

        DROP POLICY IF EXISTS "authenticated_employer_view_apps_policy" ON public.job_applications;
        CREATE POLICY "authenticated_employer_view_apps_policy"
        ON public.job_applications FOR SELECT
        TO authenticated
        USING (EXISTS (
            SELECT 1 FROM employer_job_posts 
            WHERE id = job_applications.job_id 
            AND employer_id = (select auth.uid())::text
        ));

        DROP POLICY IF EXISTS "service_role_full_access_apps_policy" ON public.job_applications;
        CREATE POLICY "service_role_full_access_apps_policy"
        ON public.job_applications FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);
    END IF;
END $$;


-- ============================================================
-- 7. SCREENING & VIDEO (Shared)
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'screening_results') THEN
        DROP POLICY IF EXISTS "authenticated_candidate_view_screening_policy" ON public.screening_results;
        CREATE POLICY "authenticated_candidate_view_screening_policy"
        ON public.screening_results FOR SELECT
        TO authenticated
        USING ((select auth.uid())::text = candidate_id);

        DROP POLICY IF EXISTS "service_role_full_access_screening_policy" ON public.screening_results;
        CREATE POLICY "service_role_full_access_screening_policy"
        ON public.screening_results FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'video_interview_sessions') THEN
        DROP POLICY IF EXISTS "authenticated_participant_view_video_policy" ON public.video_interview_sessions;
        CREATE POLICY "authenticated_participant_view_video_policy"
        ON public.video_interview_sessions FOR SELECT
        TO authenticated
        USING ((select auth.uid())::text = candidate_id);

        DROP POLICY IF EXISTS "service_role_full_access_video_policy" ON public.video_interview_sessions;
        CREATE POLICY "service_role_full_access_video_policy"
        ON public.video_interview_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;
