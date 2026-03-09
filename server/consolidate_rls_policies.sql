-- ============================================================
-- HIREGO AI - RLS PERFORMANCE OPTIMIZATION
-- Fixes "Multiple Permissive Policies" warnings (24 warnings).
-- Consolidates overlapping policies into distinct Action-Based policies.
-- ============================================================

-- ============================================================
-- 1. PUBLIC.USER_PROFILES
-- Issue: Overlap between "Owner Access" (ALL) and "Public Access" (SELECT)
-- Fix: Split into "Public Read" (SELECT) and "Owner Write" (I/U/D)
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles') THEN
        -- Drop old overlapping policies
        DROP POLICY IF EXISTS "Owner Access user_profiles" ON user_profiles;
        DROP POLICY IF EXISTS "Public Access" ON user_profiles;
        DROP POLICY IF EXISTS "Public Read Profiles" ON user_profiles; -- if exists from prev attempts

        -- 1. Unified Read (Everyone)
        CREATE POLICY "Public Read Profiles" ON user_profiles FOR SELECT 
        USING (true);

        -- 2. Owner Write Actions (Split to avoid SELECT overlap)
        CREATE POLICY "Owner Insert Profiles" ON user_profiles FOR INSERT 
        WITH CHECK ((select auth.uid())::text = user_id);

        CREATE POLICY "Owner Update Profiles" ON user_profiles FOR UPDATE 
        USING ((select auth.uid())::text = user_id);

        CREATE POLICY "Owner Delete Profiles" ON user_profiles FOR DELETE 
        USING ((select auth.uid())::text = user_id);
    END IF;
END $$;


-- ============================================================
-- 2. PUBLIC.EMPLOYER_JOB_POSTS
-- Issue: Overlap between "Employer Write" (ALL) and "Public Read" (SELECT)
-- Fix: Split "Employer Write" into Insert/Update/Delete only.
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_job_posts') THEN
        -- Drop old overlapping policies
        DROP POLICY IF EXISTS "Employer Write employer_job_posts" ON employer_job_posts;
        DROP POLICY IF EXISTS "Public Read employer_job_posts" ON employer_job_posts;
        DROP POLICY IF EXISTS "Public Access EJP" ON employer_job_posts;

        -- 1. Public Read
        CREATE POLICY "Public Read Jobs" ON employer_job_posts FOR SELECT 
        USING (true);

        -- 2. Employer Write Actions
        CREATE POLICY "Employer Insert Jobs" ON employer_job_posts FOR INSERT 
        WITH CHECK ((select auth.uid())::text = employer_id);

        CREATE POLICY "Employer Update Jobs" ON employer_job_posts FOR UPDATE 
        USING ((select auth.uid())::text = employer_id);

        CREATE POLICY "Employer Delete Jobs" ON employer_job_posts FOR DELETE 
        USING ((select auth.uid())::text = employer_id);
    END IF;
END $$;


-- ============================================================
-- 3. PUBLIC.JOB_APPLICATIONS
-- Issue: Overlap between "Candidate Access" (ALL) and "Employer View" (SELECT)
-- Fix: Create one "Unified Read" policy and separate "Candidate Write" policies.
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications') THEN
        -- Drop old overlapping policies
        DROP POLICY IF EXISTS "Candidate Access job_applications" ON job_applications;
        DROP POLICY IF EXISTS "Employer View job_applications" ON job_applications;
        DROP POLICY IF EXISTS "Public Access JA" ON job_applications;

        -- 1. Unified Read (Candidate OR Employer)
        -- Combines logic to avoid executing two policies for every SELECT
        CREATE POLICY "Unified Read Applications" ON job_applications FOR SELECT 
        USING (
            (select auth.uid())::text = candidate_id 
            OR 
            EXISTS (
                SELECT 1 FROM employer_job_posts 
                WHERE id = job_applications.job_id 
                AND employer_id = (select auth.uid())::text
            )
        );

        -- 2. Candidate Write Actions
        CREATE POLICY "Candidate Insert Applications" ON job_applications FOR INSERT 
        WITH CHECK ((select auth.uid())::text = candidate_id);

        CREATE POLICY "Candidate Update Applications" ON job_applications FOR UPDATE 
        USING ((select auth.uid())::text = candidate_id);

        CREATE POLICY "Candidate Delete Applications" ON job_applications FOR DELETE 
        USING ((select auth.uid())::text = candidate_id);
    END IF;
END $$;

-- ============================================================
-- 4. CLEANUP ANY OTHER "PUBLIC ACCESS" REMNANTS
-- ============================================================
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND policyname = 'Public Access' LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP; 
END $$;
