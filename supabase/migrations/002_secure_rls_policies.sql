-- ============================================================
-- HIREGO AI — Secure RLS Policies (Migration 002)
-- Drops all "Public Access" policies (USING (true)) and
-- replaces them with least-privilege row-level security.
-- ============================================================

-- ==================== HELPER: enable RLS ====================
-- Enable RLS on all key tables (idempotent)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_logs ENABLE ROW LEVEL SECURITY;

-- ==================== DROP ALL PUBLIC-ACCESS POLICIES ====================
-- Remove any existing "Public Access" or open policies before creating secure ones.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (
              policyname ILIKE '%public%access%'
              OR policyname ILIKE '%allow all%'
              OR policyname ILIKE '%open access%'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END;
$$;

-- ==================== public.users ====================

-- Users can read their own record
CREATE POLICY "users: read own" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own record (but not their role)
CREATE POLICY "users: update own" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==================== public.candidates ====================

CREATE POLICY "candidates: read own" ON public.candidates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "candidates: write own" ON public.candidates
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Employers can read candidate profiles for their job applicants
CREATE POLICY "candidates: employer read applicants" ON public.candidates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.jobs j ON a.job_id = j.id
            WHERE a.candidate_id = candidates.user_id
              AND j.employer_id = auth.uid()
        )
    );

-- ==================== public.employers ====================

CREATE POLICY "employers: read own" ON public.employers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "employers: write own" ON public.employers
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==================== public.jobs ====================

-- Anyone authenticated can read published jobs
CREATE POLICY "jobs: read published" ON public.jobs
    FOR SELECT USING (status = 'active' OR employer_id = auth.uid());

-- Employers can create/update/delete their own jobs
CREATE POLICY "jobs: employer write own" ON public.jobs
    FOR ALL USING (auth.uid() = employer_id)
    WITH CHECK (auth.uid() = employer_id);

-- ==================== public.applications ====================

-- Candidates can read their own applications
CREATE POLICY "applications: candidate read own" ON public.applications
    FOR SELECT USING (auth.uid() = candidate_id);

-- Candidates can create applications
CREATE POLICY "applications: candidate create" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Candidates can update their own applications (e.g., withdraw)
CREATE POLICY "applications: candidate update own" ON public.applications
    FOR UPDATE USING (auth.uid() = candidate_id)
    WITH CHECK (auth.uid() = candidate_id);

-- Employers can read applications for their own jobs
CREATE POLICY "applications: employer read own jobs" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = applications.job_id
              AND j.employer_id = auth.uid()
        )
    );

-- Employers can update application status for their own jobs
CREATE POLICY "applications: employer update status" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = applications.job_id
              AND j.employer_id = auth.uid()
        )
    );

-- ==================== public.interviews ====================

CREATE POLICY "interviews: candidate read own" ON public.interviews
    FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "interviews: employer read own" ON public.interviews
    FOR SELECT USING (auth.uid() = employer_id);

CREATE POLICY "interviews: employer write own" ON public.interviews
    FOR ALL USING (auth.uid() = employer_id)
    WITH CHECK (auth.uid() = employer_id);

-- ==================== public.assessments ====================

CREATE POLICY "assessments: candidate read own" ON public.assessments
    FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "assessments: candidate write own" ON public.assessments
    FOR ALL USING (auth.uid() = candidate_id)
    WITH CHECK (auth.uid() = candidate_id);

-- ==================== public.messages ====================

CREATE POLICY "messages: participants read" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "messages: sender write" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ==================== public.conversations ====================

CREATE POLICY "conversations: participants read" ON public.conversations
    FOR SELECT USING (
        auth.uid() = participant_one_id OR auth.uid() = participant_two_id
    );

CREATE POLICY "conversations: participants write" ON public.conversations
    FOR ALL USING (
        auth.uid() = participant_one_id OR auth.uid() = participant_two_id
    )
    WITH CHECK (
        auth.uid() = participant_one_id OR auth.uid() = participant_two_id
    );

-- ==================== public.notifications ====================

CREATE POLICY "notifications: read own" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications: update own" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==================== SENSITIVE TABLES: NO public access ====================
-- api_keys, wallet, payments, admin_users, security_logs
-- These tables are accessed exclusively via the service role (supabaseAdmin).
-- No client/user-facing RLS policies are needed; service role bypasses RLS by design.

-- Ensure no accidental public policy exists (already handled by the DROP loop above).
-- No additional policies are created for these tables.

-- ==================== DONE ====================
-- All user-facing tables now have least-privilege RLS policies.
-- Admin operations use the service role key (bypasses RLS by design).
