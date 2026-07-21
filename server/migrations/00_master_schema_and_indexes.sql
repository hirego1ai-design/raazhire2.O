-- ============================================================
-- HIREGO AI PLATFORM - MASTER PRODUCTION DATABASE SETUP
-- Migration: 00_master_schema_and_indexes.sql
-- Run this in the Supabase SQL Editor to initialize all tables, RLS, and performance indexes.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'employer', 'admin', 'educator')),
    avatar_url TEXT,
    wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    ai_interview_score NUMERIC(5, 2) DEFAULT 0.00,
    communication_clarity NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    city TEXT,
    current_job_title TEXT,
    job_profile TEXT,
    total_experience_years NUMERIC(4, 1) DEFAULT 0,
    technical_skills JSONB DEFAULT '[]'::jsonb,
    soft_skills JSONB DEFAULT '[]'::jsonb,
    degree TEXT,
    university TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    resume_url TEXT,
    video_resume_url TEXT,
    ai_overall_score NUMERIC(5, 2) DEFAULT 0.00,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. EMPLOYERS TABLE
CREATE TABLE IF NOT EXISTS public.employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    industry TEXT,
    company_size TEXT,
    website TEXT,
    description TEXT,
    job_posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EMPLOYER JOB POSTS TABLE
CREATE TABLE IF NOT EXISTS public.employer_job_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    location TEXT,
    country TEXT DEFAULT 'IN',
    work_mode TEXT DEFAULT 'Remote' CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')),
    employment_type TEXT DEFAULT 'Full-time',
    experience_min INTEGER DEFAULT 0,
    experience_max INTEGER,
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_currency TEXT DEFAULT 'INR',
    education_required JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    job_type TEXT DEFAULT 'free',
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft', 'archived')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.employer_job_posts(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'screened', 'shortlisted', 'interviewed', 'hired', 'rejected')),
    screening_score NUMERIC(5, 2) DEFAULT 0.00,
    ai_feedback TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

-- 6. CANDIDATE EVALUATIONS & RANKINGS
CREATE TABLE IF NOT EXISTS public.candidate_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.employer_job_posts(id) ON DELETE SET NULL,
    layer1_score NUMERIC(5, 2) DEFAULT 0.00,
    layer2_score NUMERIC(5, 2) DEFAULT 0.00,
    layer3_score NUMERIC(5, 2) DEFAULT 0.00,
    layer4_authenticity NUMERIC(5, 2) DEFAULT 100.00,
    fraud_flag BOOLEAN DEFAULT FALSE,
    final_score NUMERIC(5, 2) DEFAULT 0.00,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.employer_job_posts(id) ON DELETE CASCADE,
    rank INTEGER,
    composite_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

-- 7. WALLET & PAYMENTS
CREATE TABLE IF NOT EXISTS public.wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES public.wallet(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund', 'payment')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    description TEXT,
    reference_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pay_per_hire_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.employer_job_posts(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'completed',
    transaction_reference TEXT,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employer_id, candidate_id)
);

-- 8. SYSTEM CONFIGURATIONS
CREATE TABLE IF NOT EXISTS public.api_keys (
    id SERIAL PRIMARY KEY,
    provider TEXT UNIQUE NOT NULL,
    api_key TEXT,
    client_id TEXT,
    client_secret TEXT,
    access_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== B-TREE PERFORMANCE INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON public.job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_job_id ON public.candidate_rankings(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_composite ON public.candidate_rankings(job_id, composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_employer_job_posts_employer ON public.employer_job_posts(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_job_posts_status ON public.employer_job_posts(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pph_records_emp_cand ON public.pay_per_hire_records(employer_id, candidate_id);

-- ==================== ROW LEVEL SECURITY (RLS) ====================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Base RLS Policies
CREATE POLICY "Users can read own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public job posts readable by all" ON public.employer_job_posts FOR SELECT USING (status = 'active');
CREATE POLICY "Employers manage own job posts" ON public.employer_job_posts FOR ALL USING (auth.uid() = employer_id);
CREATE POLICY "Candidates manage own applications" ON public.job_applications FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Users manage own wallet" ON public.wallet FOR ALL USING (auth.uid() = user_id);
