-- ============================================================
-- HIREGO AI - COMPLETE RLS REWRITE (STRICTEST MODE)
-- ============================================================
-- 1. CLEANUP: Drops ALL existing policies.
-- 2. PERMISSIONS: Revokes 'public'/'anon' access at the root.
-- 3. POLICIES: Recreates explicitly allowed policies ONLY.
-- 4. SAFETY: Uses dynamic type checking to prevent SQL errors.
-- ============================================================

DO $$ 
DECLARE 
    -- 1. PUBLIC READ (Explicitly Approved for Anon SELECT)
    public_read_tables text[] := ARRAY[
        'jobs', 'courses', 'lessons', 'live_classes', 'employer_job_posts', 
        'assessments', 'course_lessons', 'course_quizzes', 'course_assignments',
        'staff_users'
    ];

    -- 2. USER OWNED (Strictly Authenticated Only)
    user_owned_tables text[] := ARRAY[
        'user_profiles', 'candidate_progress', 'candidate_certificates', 
        'candidate_assessments', 'candidate_activity_log', 'candidate_experience', 
        'candidate_skills', 'candidates', 'certificates', 'wallet', 
        'wallet_transactions', 'notifications', 'assignment_submissions', 
        'transactions', 'payments', 'user_badges', 'user_enrollments', 
        'user_learning_progress', 'lesson_completions'
    ];

    -- 3. EMPLOYER OWNED (Strictly Authenticated Only)
    employer_owned_tables text[] := ARRAY[
        'employer_subscriptions', 'employer_activity_log', 'pay_per_hire_records'
    ];

    t_name text;
    pol record;
    col_type text;
    cast_expr text;
BEGIN
    -- ========================================================
    -- GLOBAL WIPE & PERMISSION RESET
    -- ========================================================
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        
        -- 1. Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);

        -- 2. Drop ALL Policies (Clear the slate)
        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t_name LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t_name);
        END LOOP;

        -- 3. Reset Permissions (Strip 'public' and 'anon' rights)
        -- 'PUBLIC' role in PG often creates hidden access. We revoke it.
        EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC', t_name);
        EXECUTE format('REVOKE ALL ON public.%I FROM anon', t_name);

        -- 4. Grant Base Permissions (Explicitly needed after revoking PUBLIC)
        EXECUTE format('GRANT ALL ON public.%I TO service_role', t_name);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t_name); -- Base grant, RLS will filter.
        
        -- 5. Grant Anon SELECT only if whitelisted
        IF t_name = ANY(public_read_tables) THEN
            EXECUTE format('GRANT SELECT ON public.%I TO anon', t_name);
        END IF;

        -- 6. Create Service Role Policy (God Mode)
        -- Must explicitly state 'TO service_role'
        EXECUTE format('
            CREATE POLICY "service_role_full_%s"
            ON public.%I
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)', t_name, t_name);

    END LOOP;

    -- ========================================================
    -- SECTION A: PUBLIC READ POLICIES (Anon + Auth)
    -- ========================================================
    FOREACH t_name IN ARRAY public_read_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            -- SELECT ONLY. TO anon, authenticated.
            EXECUTE format('
                CREATE POLICY "public_read_%s"
                ON public.%I
                FOR SELECT
                TO anon, authenticated
                USING (true)', t_name, t_name);
        END IF;
    END LOOP;

    -- ========================================================
    -- SECTION B: USER OWNED POLICIES (Auth Only)
    -- ========================================================
    FOREACH t_name IN ARRAY user_owned_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            
            col_type := NULL;
            -- Check for 'user_id'
            SELECT data_type INTO col_type FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'user_id';

            IF col_type IS NOT NULL THEN
                -- Type Safe Casting
                IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;
                
                -- STRICT POLICY: TO authenticated ONLY
                EXECUTE format('
                    CREATE POLICY "user_own_%s"
                    ON public.%I
                    FOR ALL
                    TO authenticated
                    USING (user_id = %s)
                    WITH CHECK (user_id = %s)', t_name, t_name, cast_expr, cast_expr);
            
            ELSE
                 -- Fallback for 'id' (candidates, users, etc)
                 SELECT data_type INTO col_type FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'id';
                 
                 IF col_type IS NOT NULL AND (t_name IN ('candidates', 'user_profiles', 'users')) THEN
                    IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

                    EXECUTE format('
                        CREATE POLICY "user_own_%s"
                        ON public.%I
                        FOR ALL
                        TO authenticated
                        USING (id = %s)
                        WITH CHECK (id = %s)', t_name, t_name, cast_expr, cast_expr);
                 END IF;
            END IF;
        END IF;
    END LOOP;

    -- ========================================================
    -- SECTION C: EMPLOYER OWNED POLICIES (Auth Only)
    -- ========================================================
    FOREACH t_name IN ARRAY employer_owned_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            
            SELECT data_type INTO col_type FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'employer_id';
            
            IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

            EXECUTE format('
                CREATE POLICY "employer_own_%s"
                ON public.%I
                FOR ALL
                TO authenticated
                USING (employer_id = %s)
                WITH CHECK (employer_id = %s)', t_name, t_name, cast_expr, cast_expr);
        END IF;
    END LOOP;

    -- ========================================================
    -- SECTION D: SPECIAL TABLES
    -- ========================================================

    -- 1. Employer Job Posts (Write for Owners)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        EXECUTE format('
            CREATE POLICY "employer_write_jobs"
            ON public.employer_job_posts
            FOR ALL
            TO authenticated
            USING (employer_id = %s)
            WITH CHECK (employer_id = %s)', cast_expr, cast_expr);
    END IF;

    -- 2. Job Applications (Shared)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        -- Candidate Access (Auth Only)
        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'candidate_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        EXECUTE format('
            CREATE POLICY "candidate_access_apps"
            ON public.job_applications
            FOR ALL
            TO authenticated
            USING (candidate_id = %s)
            WITH CHECK (candidate_id = %s)', cast_expr, cast_expr);

        -- Employer View Access (Auth Only)
        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        EXECUTE format('
            CREATE POLICY "employer_view_apps"
            ON public.job_applications
            FOR SELECT
            TO authenticated
            USING (EXISTS (
                SELECT 1 FROM employer_job_posts 
                WHERE id = job_applications.job_id 
                AND employer_id = %s
            ))', cast_expr);
    END IF;

    -- 3. Analytics (Strict Insert)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analytics') THEN
        -- Explicit TO authenticated
        CREATE POLICY "auth_insert_analytics"
        ON public.analytics
        FOR INSERT
        TO authenticated
        WITH CHECK ((select auth.uid()) IS NOT NULL);
    END IF;

    -- 4. Youtube Config (Strict Service Role)
    -- Permissions revoked in Global Wipe. Only Service Role policy created.
    -- No action needed.

END $$;
