-- ============================================================
-- HIREGO AI PLATFORM - PRODUCTION DATABASE INDEXING MIGRATION
-- Migration: 01_performance_indexes.sql
-- ============================================================

-- 1. Job Applications Indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at DESC);

-- 2. Candidate Rankings Indexes
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_job_id ON candidate_rankings(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_candidate_id ON candidate_rankings(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_composite_score ON candidate_rankings(job_id, composite_score DESC);

-- 3. Employer Job Posts Indexes
CREATE INDEX IF NOT EXISTS idx_employer_job_posts_employer_id ON employer_job_posts(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_job_posts_status ON employer_job_posts(status);
CREATE INDEX IF NOT EXISTS idx_employer_job_posts_created_at ON employer_job_posts(created_at DESC);

-- 4. Pay Per Hire (PPH) Records Indexes
CREATE INDEX IF NOT EXISTS idx_pph_records_employer_candidate ON pay_per_hire_records(employer_id, candidate_id);
CREATE INDEX IF NOT EXISTS idx_pph_records_status ON pay_per_hire_records(status);

-- 5. Wallet & Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- 6. Interviews Indexes
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_employer_id ON interviews(employer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
