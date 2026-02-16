-- Security Improvements: Fix RLS Policies
-- Run this in Supabase SQL Editor to resolve security warnings

-- ========================================================
-- 1. SENSITIVE TABLES (Backend Access Only)
-- Remove "Allow All" policies. Default behavior is DENY for public API.
-- Service Role (Backend) will still have access.
-- ========================================================

-- API Keys
DROP POLICY IF EXISTS "Public Access api_keys" ON api_keys;
-- No policy = Deny All (good for backend-only tables)

-- System Logs
DROP POLICY IF EXISTS "Public Access system_logs" ON system_logs;

-- YouTube Config
DROP POLICY IF EXISTS "Public Access youtube_config" ON youtube_config;

-- Payment Config (if exists from previous/other schemas, good practice)
DROP POLICY IF EXISTS "Public Access payment_config" ON payment_config;


-- ========================================================
-- 2. REFERENCE TABLES (Public Read, Admin Write)
-- ========================================================

-- Subscription Plans
DROP POLICY IF EXISTS "Public Access subscription_plans" ON subscription_plans;
CREATE POLICY "Enable read access for all users" ON subscription_plans FOR SELECT USING (true);

-- Salary Slabs
DROP POLICY IF EXISTS "Public Access salary_slabs" ON salary_slabs;
CREATE POLICY "Enable read access for all users" ON salary_slabs FOR SELECT USING (true);


-- ========================================================
-- 3. USER DATA TABLES (Row Level Security)
-- ========================================================

-- Assessment Results
DROP POLICY IF EXISTS "Public Access assessment_results" ON assessment_results;
-- Users can see their own results
CREATE POLICY "Users can view own results" ON assessment_results FOR SELECT USING (auth.uid()::text = user_id);
-- Users can insert their own results (if frontend does it directly)
CREATE POLICY "Users can insert own results" ON assessment_results FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Candidate Profiles
DROP POLICY IF EXISTS "Public Access candidates" ON candidates;
-- Everyone can view candidates (for employers/public profiles)
CREATE POLICY "Enable read access for all users" ON candidates FOR SELECT USING (true);
-- Users can update/insert their own profile
CREATE POLICY "Users can update own profile" ON candidates FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own profile" ON candidates FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Candidate Experience
DROP POLICY IF EXISTS "Public Access candidate_experience" ON candidate_experience;
CREATE POLICY "Enable read access for all users" ON candidate_experience FOR SELECT USING (true);
CREATE POLICY "Users can manage own experience" ON candidate_experience FOR ALL USING (auth.uid()::text = user_id);

-- Candidate Skills
DROP POLICY IF EXISTS "Public Access candidate_skills" ON candidate_skills;
CREATE POLICY "Enable read access for all users" ON candidate_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON candidate_skills FOR ALL USING (auth.uid()::text = user_id);

-- Users Table (Base)
DROP POLICY IF EXISTS "Public Access users" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id);
-- Allow public read of basic user info? Maybe restrict. For now, let's allow read for auth users or specific flows. 
-- But existing code might rely on reading users. Let's keep it READ ALL for now to avoid breakage, but RESTRICT UPDATE.
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Applications
DROP POLICY IF EXISTS "Public Access applications" ON applications;
CREATE POLICY "Candidates can view own applications" ON applications FOR SELECT USING (auth.uid()::text = candidate_id);
CREATE POLICY "Candidates can create applications" ON applications FOR INSERT WITH CHECK (auth.uid()::text = candidate_id);
-- Employers need to view applications for their jobs. This requires a join or a more complex policy.
-- For simplicity, if we want employers to see, we might need a function or trusted backend.
-- OR:
-- CREATE POLICY "Employers can view applications for their jobs" ON applications FOR SELECT USING (
--   EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()::text)
-- );
-- Note: Complex policies can impact performance.
