-- ============================================================
-- HIREGO AI - AGGRESSIVE SECURITY SCRIPT (TYPE CAST FIX)
-- ============================================================
-- 1. Drops policies to ensure clean state.
-- 2. Dynamically checks column types (UUID vs TEXT) and casts correctly.
-- 3. Fixes "operator does not exist: text = uuid" error.
-- ============================================================

DO $$ 
DECLARE 
    -- 1. Tables allowed for PUBLIC READ (Anon needs access)
    public_read_tables text[] := ARRAY[
        'jobs', 'courses', 'lessons', 'live_classes', 
        'employer_job_posts', 
        'assessments', 'course_lessons', 'course_quizzes', 'course_assignments',
        'staff_users' 
    ];

    -- 2. User Owned Tables (Strictly Auth, Own Data)
    user_owned_tables text[] := ARRAY[
        'user_profiles', 
        'candidate_progress', 'candidate_certificates', 'candidate_assessments', 'candidate_activity_log', 
        'candidate_experience', 'candidate_skills', 'candidates', 'certificates', 
        'wallet', 'wallet_transactions', 'notifications', 
        'assignment_submissions', 'transactions', 'payments', 
        'user_badges', 'user_enrollments', 'user_learning_progress', 
        'lesson_completions'
    ];

    -- 3. Employer Owned Tables
    employer_owned_tables text[] := ARRAY[
        'employer_subscriptions', 'employer_activity_log', 'pay_per_hire_records'
    ];

    t_name text;
    pol record;
    col_type text;
    cast_expr text;
BEGIN
    -- ========================================================
    -- STEP A: WIPE ALL POLICIES
    -- ========================================================
    FOR t_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);
        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t_name LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t_name);
        END LOOP;
        
        -- Service Role Backup
        EXECUTE format('
            CREATE POLICY "service_role_full_%s"
            ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t_name, t_name);
    END LOOP;

    -- ========================================================
    -- STEP B: PUBLIC READ ACCESS
    -- ========================================================
    FOREACH t_name IN ARRAY public_read_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            EXECUTE format('
                CREATE POLICY "public_read_%s"
                ON public.%I FOR SELECT TO anon, authenticated USING (true)', t_name, t_name);
        END IF;
    END LOOP;

    -- ========================================================
    -- STEP C: USER OWNED ACCESS (With UUID/Text Check)
    -- ========================================================
    FOREACH t_name IN ARRAY user_owned_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
            
            -- Check for 'user_id' column
            SELECT data_type INTO col_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'user_id';

            IF FOUND THEN
                -- Decide strict casting based on column type
                IF col_type = 'uuid' THEN
                    cast_expr := '(select auth.uid())'; -- Compare UUID to UUID
                ELSE
                    cast_expr := '(select auth.uid())::text'; -- Compare Text to Text
                END IF;

                EXECUTE format('
                    CREATE POLICY "user_own_%s"
                    ON public.%I
                    FOR ALL
                    TO authenticated
                    USING (%s = user_id)
                    WITH CHECK (%s = user_id)', t_name, t_name, cast_expr, cast_expr);
            
            -- Fallback for 'id' column tables (candidates/users)
            ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'id') THEN
                 IF t_name = 'candidates' OR t_name = 'user_profiles' OR t_name = 'users' THEN
                    
                    SELECT data_type INTO col_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'id';

                    IF col_type = 'uuid' THEN
                        cast_expr := '(select auth.uid())';
                    ELSE
                        cast_expr := '(select auth.uid())::text';
                    END IF;

                     EXECUTE format('
                        CREATE POLICY "user_own_%s"
                        ON public.%I
                        FOR ALL
                        TO authenticated
                        USING (%s = id)
                        WITH CHECK (%s = id)', t_name, t_name, cast_expr, cast_expr);
                 END IF;
            END IF;
        END IF;
    END LOOP;

    -- ========================================================
    -- STEP D: EMPLOYER ACCESS (With Type Check)
    -- ========================================================
    FOREACH t_name IN ARRAY employer_owned_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
             
            SELECT data_type INTO col_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = t_name AND column_name = 'employer_id';

            IF col_type = 'uuid' THEN
                cast_expr := '(select auth.uid())';
            ELSE
                cast_expr := '(select auth.uid())::text';
            END IF;

             EXECUTE format('
                CREATE POLICY "employer_own_%s"
                ON public.%I
                FOR ALL
                TO authenticated
                USING (%s = employer_id)
                WITH CHECK (%s = employer_id)', t_name, t_name, cast_expr, cast_expr);
        END IF;
    END LOOP;

    -- ========================================================
    -- STEP E: EMPLOYER JOB POSTS (Write Access)
    -- ========================================================
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        -- Dynamic check for employer_id type
        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        EXECUTE format('
            CREATE POLICY "employer_write_jobs"
            ON public.employer_job_posts FOR ALL
            TO authenticated
            USING (%s = employer_id)
            WITH CHECK (%s = employer_id)', cast_expr, cast_expr);
    END IF;

    -- ========================================================
    -- STEP F: SHARED TABLES (Special Logic)
    -- ========================================================
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        -- Check candidate_id type
        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'job_applications' AND column_name = 'candidate_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        EXECUTE format('
            CREATE POLICY "candidate_access_apps"
            ON public.job_applications FOR ALL
            TO authenticated
            USING (%s = candidate_id)
            WITH CHECK (%s = candidate_id)', cast_expr, cast_expr);

        -- Check employer_id type for sub-select
        SELECT data_type INTO col_type FROM information_schema.columns WHERE table_name = 'employer_job_posts' AND column_name = 'employer_id';
        IF col_type = 'uuid' THEN cast_expr := '(select auth.uid())'; ELSE cast_expr := '(select auth.uid())::text'; END IF;

        EXECUTE format('
            CREATE POLICY "employer_view_apps"
            ON public.job_applications FOR SELECT
            TO authenticated
            USING (EXISTS (
                SELECT 1 FROM employer_job_posts 
                WHERE id = job_applications.job_id 
                AND employer_id = %s
            ))', cast_expr);
    END IF;

    -- Analytics Linter Fix
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analytics') THEN
        CREATE POLICY "auth_insert_analytics"
        ON public.analytics FOR INSERT
        TO authenticated
        WITH CHECK ((select auth.uid()) IS NOT NULL);
    END IF;

END $$;
