-- ============================================================
-- HIREGO AI - PRODUCTION RLS SECURITY POLICIES
-- ============================================================
-- Run this ENTIRE script in Supabase SQL Editor.
--
-- WHAT THIS DOES:
-- 1. Drops ALL existing policies on ALL public tables.
-- 2. Enables RLS on every table.
-- 3. Grants service_role full access (for backend admin operations).
-- 4. Creates granular, role-based policies for authenticated users.
-- 5. Grants anonymous SELECT only on explicitly public tables.
-- 6. Uses dynamic type checking (TEXT vs UUID) for auth.uid() casting.
--
-- AFTER RUNNING: Verify policies in Supabase Dashboard > Authentication > Policies
-- ============================================================

DO $$ 
DECLARE 
    -- ========================================================
    -- TABLE CLASSIFICATION
    -- ========================================================

    -- Tables that anonymous users may READ (SELECT only)
    public_read_tables text[] := ARRAY[
        'employer_job_posts',   -- Public job listings
        'courses',              -- Public course catalog
        'course_lessons',       -- Public lesson catalog
        'course_quizzes',       -- Public quiz metadata
        'course_assignments',   -- Public assignment metadata
        'live_classes',         -- Public live class schedule
        'subscription_plans'    -- Public pricing plans
    ];

    -- Tables owned by user via 'user_id' or 'id' column
    user_owned_tables text[] := ARRAY[
        'users',
        'user_profiles',
        'candidates',
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

    -- Tables owned by employer via 'employer_id' column
    employer_owned_tables text[] := ARRAY[
        'employers',
        'employer_subscriptions',
        'employer_activity_log',
        'pay_per_hire_records'
    ];

    -- Tables that are ADMIN ONLY (service_role access only, no user policies)
    admin_only_tables text[] := ARRAY[
        'admin_users',
        'admin_settings',
        'staff_users',
        'staff_activity',
        'platform_reports',
        'email_logs',
        'routes_registry'
    ];

    t_name text;
    pol record;
    col_type text;
    cast_expr text;

BEGIN
    -- ========================================================
    -- STEP 1: GLOBAL CLEANUP — Drop all existing policies
    -- ========================================================
    RAISE NOTICE '🔄 Step 1: Dropping all existing policies...';
    
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        
        -- Enable RLS on every table
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);

        -- Drop ALL existing policies
        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t_name LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t_name);
        END LOOP;

        -- Revoke default PUBLIC role access (PostgreSQL 'PUBLIC' role grants hidden access)
        EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC', t_name);
        EXECUTE format('REVOKE ALL ON public.%I FROM anon', t_name);

        -- Grant base permissions to authenticated (RLS will filter)
        EXECUTE format('GRANT ALL ON public.%I TO service_role', t_name);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t_name);

        -- Service Role: Full access policy (God Mode for backend admin operations)
        EXECUTE format(
            'CREATE POLICY "service_role_bypass_%s"
            ON public.%I
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)', t_name, t_name);
            
    END LOOP;

    RAISE NOTICE '✅ Step 1 complete: All policies dropped, RLS enabled, service_role granted.';

    -- ========================================================
    -- STEP 2: PUBLIC READ ACCESS (Anon + Authenticated SELECT only)
    -- ========================================================
    RAISE NOTICE '🔄 Step 2: Creating public read policies...';
    
    FOREACH t_name IN ARRAY public_read_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            EXECUTE format('GRANT SELECT ON public.%I TO anon', t_name);
            EXECUTE format(
                'CREATE POLICY "public_read_%s"
                ON public.%I
                FOR SELECT
                TO anon, authenticated
                USING (true)', t_name, t_name);
            RAISE NOTICE '  ✅ Public READ: %', t_name;
        END IF;
    END LOOP;

    -- ========================================================
    -- STEP 3: USER-OWNED TABLE POLICIES (Authenticated Only)
    -- ========================================================
    RAISE NOTICE '🔄 Step 3: Creating user-owned policies...';
    
    FOREACH t_name IN ARRAY user_owned_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            
            cast_expr := NULL;
            col_type := NULL;

            -- Check for 'user_id' column first
            SELECT data_type INTO col_type FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'user_id';

            IF col_type IS NOT NULL THEN
                IF col_type = 'uuid' THEN 
                    cast_expr := '(select auth.uid())'; 
                ELSE 
                    cast_expr := '(select auth.uid())::text'; 
                END IF;
                
                EXECUTE format(
                    'CREATE POLICY "user_own_%s"
                    ON public.%I FOR ALL TO authenticated
                    USING (user_id = %s) WITH CHECK (user_id = %s)', t_name, t_name, cast_expr, cast_expr);
                RAISE NOTICE '  ✅ User-owned (user_id): %', t_name;

            ELSE
                -- Fallback: Check 'id' column (for tables like 'users', 'candidates' where id = auth.uid())
                SELECT data_type INTO col_type FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'id';

                IF col_type IS NOT NULL AND (t_name = 'users' OR t_name = 'candidates' OR t_name = 'user_profiles') THEN
                    IF col_type = 'uuid' THEN 
                        cast_expr := '(select auth.uid())'; 
                    ELSE 
                        cast_expr := '(select auth.uid())::text'; 
                    END IF;

                    EXECUTE format(
                        'CREATE POLICY "user_own_%s"
                        ON public.%I FOR ALL TO authenticated
                        USING (id = %s) WITH CHECK (id = %s)', t_name, t_name, cast_expr, cast_expr);
                    RAISE NOTICE '  ✅ User-owned (id): %', t_name;
                ELSE
                    RAISE NOTICE '  ⚠️ Skipped (no user_id or id): %', t_name;
                END IF;
            END IF;
        ELSE
            RAISE NOTICE '  ⚠️ Table not found: %', t_name;
        END IF;
    END LOOP;

    -- ========================================================
    -- STEP 4: EMPLOYER-OWNED TABLE POLICIES (Authenticated Only)
    -- ========================================================
    RAISE NOTICE '🔄 Step 4: Creating employer-owned policies...';
    
    FOREACH t_name IN ARRAY employer_owned_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            
            -- Check for employer_id column
            SELECT data_type INTO col_type FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'employer_id';
            
            IF col_type IS NOT NULL THEN
                IF col_type = 'uuid' THEN 
                    cast_expr := '(select auth.uid())'; 
                ELSE 
                    cast_expr := '(select auth.uid())::text'; 
                END IF;

                EXECUTE format(
                    'CREATE POLICY "employer_own_%s"
                    ON public.%I FOR ALL TO authenticated
                    USING (employer_id = %s) WITH CHECK (employer_id = %s)', t_name, t_name, cast_expr, cast_expr);
                RAISE NOTICE '  ✅ Employer-owned: %', t_name;
            ELSE
                -- Fallback to 'id' for the employers table itself
                IF t_name = 'employers' THEN
                    SELECT data_type INTO col_type FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'id';
                    IF col_type = 'uuid' THEN 
                        cast_expr := '(select auth.uid())'; 
                    ELSE 
                        cast_expr := '(select auth.uid())::text'; 
                    END IF;
                    EXECUTE format(
                        'CREATE POLICY "employer_own_%s"
                        ON public.%I FOR ALL TO authenticated
                        USING (id = %s) WITH CHECK (id = %s)', t_name, t_name, cast_expr, cast_expr);
                    RAISE NOTICE '  ✅ Employer-owned (id): %', t_name;
                END IF;
            END IF;
        END IF;
    END LOOP;

    -- ========================================================
    -- STEP 5: EMPLOYER JOB POSTS (Read public, Write employer-only)
    -- ========================================================
    RAISE NOTICE '🔄 Step 5: Employer job post write policies...';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        -- Employers can INSERT/UPDATE/DELETE their own job posts
        EXECUTE format(
            'CREATE POLICY "employer_write_jobs"
            ON public.employer_job_posts 
            FOR INSERT TO authenticated
            WITH CHECK (employer_id = %s)', cast_expr);
        EXECUTE format(
            'CREATE POLICY "employer_update_jobs"
            ON public.employer_job_posts 
            FOR UPDATE TO authenticated
            USING (employer_id = %s) WITH CHECK (employer_id = %s)', cast_expr, cast_expr);
        EXECUTE format(
            'CREATE POLICY "employer_delete_jobs"
            ON public.employer_job_posts 
            FOR DELETE TO authenticated
            USING (employer_id = %s)', cast_expr);
        RAISE NOTICE '  ✅ Employer job post write policies created.';
    END IF;

    -- ========================================================
    -- STEP 6: JOB APPLICATIONS (Shared: candidate + employer read)
    -- ========================================================
    RAISE NOTICE '🔄 Step 6: Job application policies...';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        -- Candidate: full access to own applications
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'job_applications' AND column_name = 'candidate_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        EXECUTE format(
            'CREATE POLICY "candidate_own_apps"
            ON public.job_applications FOR ALL TO authenticated
            USING (candidate_id = %s) WITH CHECK (candidate_id = %s)', cast_expr, cast_expr);

        -- Employer: can VIEW applications for their jobs
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        EXECUTE format(
            'CREATE POLICY "employer_view_apps"
            ON public.job_applications FOR SELECT TO authenticated
            USING (EXISTS (
                SELECT 1 FROM employer_job_posts 
                WHERE id = job_applications.job_id 
                AND employer_id = %s
            ))', cast_expr);
        RAISE NOTICE '  ✅ Job application policies created.';
    END IF;

    -- ========================================================
    -- STEP 7: SCREENING RESULTS (Shared: candidate + employer)
    -- ========================================================
    RAISE NOTICE '🔄 Step 7: Screening result policies...';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'screening_results') THEN
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'screening_results' AND column_name = 'candidate_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        -- Candidate can see own screening results
        EXECUTE format(
            'CREATE POLICY "candidate_view_screening"
            ON public.screening_results FOR SELECT TO authenticated
            USING (candidate_id = %s)', cast_expr);
        RAISE NOTICE '  ✅ Screening result policies created.';
    END IF;

    -- ========================================================
    -- STEP 8: INTERVIEWS (Shared: candidate + employer) 
    -- ========================================================
    RAISE NOTICE '🔄 Step 8: Interview policies...';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'interviews') THEN
        -- Candidate access
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'interviews' AND column_name = 'candidate_id';
        IF col_type IS NOT NULL THEN
            IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
            EXECUTE format(
                'CREATE POLICY "candidate_view_interviews"
                ON public.interviews FOR SELECT TO authenticated
                USING (candidate_id = %s)', cast_expr);
        END IF;

        -- Employer access (via job post)
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type IS NOT NULL THEN
            IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
            EXECUTE format(
                'CREATE POLICY "employer_view_interviews"
                ON public.interviews FOR SELECT TO authenticated
                USING (EXISTS (
                    SELECT 1 FROM employer_job_posts 
                    WHERE id = interviews.job_id 
                    AND employer_id = %s
                ))', cast_expr);
        END IF;
        RAISE NOTICE '  ✅ Interview policies created.';
    END IF;

    -- ========================================================
    -- STEP 9: INTERVIEW LOGS & FEEDBACK (Same as interviews)
    -- ========================================================
    RAISE NOTICE '🔄 Step 9: Interview logs & feedback policies...';
    
    -- interview_logs: Access via interview_id -> interviews -> candidate/employer
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'interview_logs') THEN
        CREATE POLICY "auth_access_interview_logs"
        ON public.interview_logs FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT 1 FROM interviews i WHERE i.id = interview_logs.interview_id 
        ));
        RAISE NOTICE '  ✅ Interview logs policy created.';
    END IF;

    -- interview_feedback
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'interview_feedback') THEN
        CREATE POLICY "auth_access_interview_feedback"
        ON public.interview_feedback FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT 1 FROM interviews i WHERE i.id = interview_feedback.interview_id
        ));
        RAISE NOTICE '  ✅ Interview feedback policy created.';
    END IF;

    -- ========================================================
    -- STEP 10: VIDEO SESSIONS & RECORDINGS (Auth only)
    -- ========================================================
    RAISE NOTICE '🔄 Step 10: Video session policies...';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'video_interview_sessions') THEN
        CREATE POLICY "auth_access_video_sessions"
        ON public.video_interview_sessions FOR SELECT TO authenticated
        USING ((select auth.uid()) IS NOT NULL);
        RAISE NOTICE '  ✅ Video session policy created.';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'session_recordings') THEN
        CREATE POLICY "auth_access_session_recordings"
        ON public.session_recordings FOR SELECT TO authenticated
        USING ((select auth.uid()) IS NOT NULL);
        RAISE NOTICE '  ✅ Session recordings policy created.';
    END IF;

    -- ========================================================
    -- STEP 11: EDUCATORS & EDUCATOR PAYOUTS
    -- ========================================================
    RAISE NOTICE '🔄 Step 11: Educator policies...';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'educators') THEN
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'educators' AND column_name = 'user_id';
        IF col_type IS NOT NULL THEN
            IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
            EXECUTE format(
                'CREATE POLICY "educator_own"
                ON public.educators FOR ALL TO authenticated
                USING (user_id = %s) WITH CHECK (user_id = %s)', cast_expr, cast_expr);
        ELSE
            -- Fallback to id
            SELECT data_type INTO col_type FROM information_schema.columns 
            WHERE table_name = 'educators' AND column_name = 'id';
            IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
            EXECUTE format(
                'CREATE POLICY "educator_own"
                ON public.educators FOR ALL TO authenticated
                USING (id = %s) WITH CHECK (id = %s)', cast_expr, cast_expr);
        END IF;
        RAISE NOTICE '  ✅ Educator policy created.';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'educator_payouts') THEN
        SELECT data_type INTO col_type FROM information_schema.columns 
        WHERE table_name = 'educator_payouts' AND column_name = 'educator_id';
        IF col_type IS NOT NULL THEN
            IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
            EXECUTE format(
                'CREATE POLICY "educator_own_payouts"
                ON public.educator_payouts FOR SELECT TO authenticated
                USING (educator_id = %s)', cast_expr);
        END IF;
        RAISE NOTICE '  ✅ Educator payouts policy created.';
    END IF;

    -- ========================================================
    -- STEP 12: CRM LEADS (Authenticated insert, admin-only read)
    -- ========================================================
    RAISE NOTICE '🔄 Step 12: CRM leads policies...';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'crm_leads') THEN
        -- Anyone authenticated can create a lead (contact form)
        CREATE POLICY "auth_insert_crm_leads"
        ON public.crm_leads FOR INSERT TO authenticated
        WITH CHECK ((select auth.uid()) IS NOT NULL);
        -- Read/Update/Delete: admin only (handled by service_role policy)
        RAISE NOTICE '  ✅ CRM leads policy created.';
    END IF;

    -- ========================================================
    -- STEP 13: ANALYTICS (Auth insert, admin read)
    -- ========================================================
    RAISE NOTICE '🔄 Step 13: Analytics policies...';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analytics') THEN
        -- Allow authenticated inserts (event tracking)
        CREATE POLICY "auth_insert_analytics"
        ON public.analytics FOR INSERT TO authenticated
        WITH CHECK ((select auth.uid()) IS NOT NULL);
        -- Also allow anonymous page tracking (read-only awareness)
        EXECUTE format('GRANT INSERT ON public.analytics TO anon');
        CREATE POLICY "anon_insert_analytics"
        ON public.analytics FOR INSERT TO anon
        WITH CHECK (true);
        RAISE NOTICE '  ✅ Analytics policies created.';
    END IF;

    -- ========================================================
    -- STEP 14: ADMIN-ONLY TABLES (No user access)
    -- ========================================================
    RAISE NOTICE '🔄 Step 14: Admin-only tables — no user policies needed...';
    
    FOREACH t_name IN ARRAY admin_only_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            -- These tables have NO user policies.
            -- Only service_role (Step 1) can access them.
            RAISE NOTICE '  🔒 Admin-only (no user policy): %', t_name;
        END IF;
    END LOOP;

    -- ========================================================
    -- DONE
    -- ========================================================
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ PRODUCTION RLS POLICIES APPLIED SUCCESSFULLY';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  • All existing policies dropped';
    RAISE NOTICE '  • RLS enabled on all tables';
    RAISE NOTICE '  • Service role: full bypass on all tables';
    RAISE NOTICE '  • Public read: % tables', array_length(public_read_tables, 1);
    RAISE NOTICE '  • User-owned: % tables', array_length(user_owned_tables, 1);
    RAISE NOTICE '  • Employer-owned: % tables', array_length(employer_owned_tables, 1);
    RAISE NOTICE '  • Admin-only: % tables', array_length(admin_only_tables, 1);
    RAISE NOTICE '  • Special policies: job_apps, interviews, screening, video, educators, analytics, crm';
    RAISE NOTICE '============================================================';

END $$;
