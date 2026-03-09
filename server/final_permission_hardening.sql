-- ============================================================
-- HIREGO AI - DEFINITIVE SECURITY COMPLIANCE (RLS + GRANTS)
-- ============================================================
-- STRATEGY:
-- 1. PERMISSIONS HARDENING: Revoke 'anon' access on private tables.
--    (This is the root cause of stubborn "Anonymous Access" warnings)
-- 2. RLS RESET: Wipe all policies to ensure clean slate.
-- 3. STRICT RLS: Re-apply strictly scoped policies using type-safe casting.
-- ============================================================

DO $$ 
DECLARE 
    -- 1. PUBLIC READ Tables (Anon needs SELECT)
    public_read_tables text[] := ARRAY[
        'jobs', 'courses', 'lessons', 'live_classes', 'employer_job_posts', 
        'assessments', 'course_lessons', 'course_quizzes', 'course_assignments',
        'staff_users'
    ];

    -- 2. USER OWNED Tables (Private, Auth Only)
    user_owned_tables text[] := ARRAY[
        'user_profiles', 'candidate_progress', 'candidate_certificates', 
        'candidate_assessments', 'candidate_activity_log', 'candidate_experience', 
        'candidate_skills', 'candidates', 'certificates', 'wallet', 
        'wallet_transactions', 'notifications', 'assignment_submissions', 
        'transactions', 'payments', 'user_badges', 'user_enrollments', 
        'user_learning_progress', 'lesson_completions'
    ];

    -- 3. EMPLOYER OWNED Tables (Private, Auth Only)
    employer_owned_tables text[] := ARRAY[
        'employer_subscriptions', 'employer_activity_log', 'pay_per_hire_records'
    ];

    t_name text;
    pol record;
    col_type text;
    cast_expr text;
BEGIN
    -- ========================================================
    -- PHASE 1: PERMISSIONS (GRANT/REVOKE)
    -- This fixes "Anonymous Access" warnings at the source of truth.
    -- ========================================================
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        
        -- Start by ensuring Authenticated and Service Role have access
        EXECUTE format('GRANT ALL ON public.%I TO postgres, service_role', t_name);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t_name);

        -- Check if it's a PUBLIC READ table
        IF t_name = ANY(public_read_tables) THEN
            -- Allow Anon SELECT only
            EXECUTE format('GRANT SELECT ON public.%I TO anon', t_name);
            -- Revoke modifications from Anon
            EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.%I FROM anon', t_name);
        ELSE
            -- PRIVATE TABLE: Revoke ALL from Anon
            EXECUTE format('REVOKE ALL ON public.%I FROM anon', t_name);
        END IF;

    END LOOP;

    -- Special Case: Youtube Config (Service Role Only)
    EXECUTE 'REVOKE ALL ON public.youtube_config FROM anon, authenticated';
    
    -- Special Case: Analytics (Auth Insert Only)
    EXECUTE 'REVOKE ALL ON public.analytics FROM anon';
    EXECUTE 'GRANT INSERT ON public.analytics TO authenticated';


    -- ========================================================
    -- PHASE 2: RLS POLICY WIPE
    -- ========================================================
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);
        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t_name LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t_name);
        END LOOP;
        
        -- Service Role "God Mode"
        EXECUTE format('
            CREATE POLICY "service_role_full_%s"
            ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t_name, t_name);
    END LOOP;


    -- ========================================================
    -- PHASE 3: APPLY RLS POLICIES (TYPE SAFE)
    -- ========================================================
    
    -- A. PUBLIC READ
    FOREACH t_name IN ARRAY public_read_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            -- Only explicitly allowed for Select
            EXECUTE format('
                CREATE POLICY "public_read_%s"
                ON public.%I FOR SELECT TO anon, authenticated USING (true)', t_name, t_name);
        END IF;
    END LOOP;

    -- B. USER OWNED (Strict)
    FOREACH t_name IN ARRAY user_owned_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            -- Dynamic Type Check
            col_type := NULL;
            SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = t_name AND column_name = 'user_id';
            
            IF col_type IS NOT NULL THEN
                IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
                EXECUTE format('CREATE POLICY "user_own_%s" ON public.%I FOR ALL TO authenticated USING (user_id = %s) WITH CHECK (user_id = %s)', t_name, t_name, cast_expr, cast_expr);
            ELSE
                 SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = t_name AND column_name = 'id';
                 IF col_type IS NOT NULL AND (t_name IN ('candidates', 'user_profiles', 'users')) THEN
                    IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
                    EXECUTE format('CREATE POLICY "user_own_%s" ON public.%I FOR ALL TO authenticated USING (id = %s) WITH CHECK (id = %s)', t_name, t_name, cast_expr, cast_expr);
                 END IF;
            END IF;
        END IF;
    END LOOP;

    -- C. EMPLOYER OWNED (Strict)
    FOREACH t_name IN ARRAY employer_owned_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = t_name AND column_name = 'employer_id';
            IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
            EXECUTE format('CREATE POLICY "employer_own_%s" ON public.%I FOR ALL TO authenticated USING (employer_id = %s) WITH CHECK (employer_id = %s)', t_name, t_name, cast_expr, cast_expr);
        END IF;
    END LOOP;

    -- D. SPECIAL TABLES
    
    -- Employer Job Posts (Write)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
        EXECUTE format('CREATE POLICY "employer_write_jobs" ON public.employer_job_posts FOR ALL TO authenticated USING (employer_id = %s) WITH CHECK (employer_id = %s)', cast_expr, cast_expr);
    END IF;

    -- Job Applications
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'candidate_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
        EXECUTE format('CREATE POLICY "candidate_access_apps" ON public.job_applications FOR ALL TO authenticated USING (candidate_id = %s) WITH CHECK (candidate_id = %s)', cast_expr, cast_expr);

        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
        EXECUTE format('CREATE POLICY "employer_view_apps" ON public.job_applications FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM employer_job_posts WHERE id = job_applications.job_id AND employer_id = %s))', cast_expr);
    END IF;

    -- Analytics
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analytics') THEN
        CREATE POLICY "auth_insert_analytics" ON public.analytics FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) IS NOT NULL);
    END IF;

END $$;
