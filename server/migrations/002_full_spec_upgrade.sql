-- =====================================================
-- MIGRATION 002: Full Spec Upgrade — HireGo AI Production Schema
-- Run in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- =====================================================

-- ============================================================
-- 1. UPGRADE CANDIDATES TABLE (add 25+ missing columns)
-- ============================================================
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT false;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS work_authorization TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_job_title TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS total_experience_years INTEGER DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_salary DECIMAL(12,2);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_salary DECIMAL(12,2);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS notice_period_days INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS preferred_job_type TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS preferred_locations JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS field_of_study TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS technical_skills JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS soft_skills JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS languages_known JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skill_proficiency JSONB DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS video_resume_url TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS transcript_text TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS profile_completeness_score INTEGER DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS interview_readiness_score INTEGER DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_overall_score INTEGER DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS confidence_score INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS clarity_score INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS communication_score INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skill_match_score INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS behavioral_score INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS professionalism_score INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_strengths JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_weaknesses JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_improvement_suggestions JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS fraud_detection_flag BOOLEAN DEFAULT false;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_evaluation_status TEXT DEFAULT 'pending';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================
-- 2. UPGRADE EMPLOYERS TABLE (add missing columns)
-- ============================================================
ALTER TABLE employers ADD COLUMN IF NOT EXISTS cin_registration_id TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS official_email TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS verification_document_url TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS billing_info JSONB DEFAULT '{}';
ALTER TABLE employers ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE employers ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending';

-- ============================================================
-- 3. UPGRADE EMPLOYER_JOB_POSTS TABLE (add AI job fields)
-- ============================================================
ALTER TABLE employer_job_posts ADD COLUMN IF NOT EXISTS ai_generated_description TEXT;
ALTER TABLE employer_job_posts ADD COLUMN IF NOT EXISTS ai_screening_criteria JSONB DEFAULT '{}';
ALTER TABLE employer_job_posts ADD COLUMN IF NOT EXISTS ai_scoring_matrix JSONB DEFAULT '{}';
ALTER TABLE employer_job_posts ADD COLUMN IF NOT EXISTS ai_interview_questions JSONB DEFAULT '[]';
ALTER TABLE employer_job_posts ADD COLUMN IF NOT EXISTS ideal_candidate_profile TEXT;
ALTER TABLE employer_job_posts ADD COLUMN IF NOT EXISTS required_skills JSONB DEFAULT '[]';

-- ============================================================
-- 4. UPGRADE JOB_APPLICATIONS TABLE (add screening columns)
-- ============================================================
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS screening_score INTEGER;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS ranking_position INTEGER;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_score INTEGER;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS video_score INTEGER;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS skill_match_score INTEGER;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS experience_relevance_score INTEGER;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS auto_shortlisted BOOLEAN DEFAULT false;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS shortlist_reason TEXT;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS screening_agent_status TEXT DEFAULT 'not_started';
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS screening_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS employer_id TEXT;

-- ============================================================
-- 5. CREATE AI_EVALUATIONS TABLE (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_evaluations (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  candidate_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  application_id BIGINT REFERENCES job_applications(id) ON DELETE SET NULL,
  model_a_output JSONB DEFAULT '{}',
  model_b_output JSONB DEFAULT '{}',
  model_c_output JSONB DEFAULT '{}',
  model_d_output JSONB DEFAULT '{}',
  model_e_output JSONB DEFAULT '{}',
  final_score_json JSONB DEFAULT '{}',
  retry_count INTEGER DEFAULT 0,
  evaluation_status TEXT DEFAULT 'queued',
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_eval_candidate ON ai_evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ai_eval_status ON ai_evaluations(evaluation_status);

-- ============================================================
-- 6. CREATE WORKFLOW_EVENTS TABLE (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_events (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  entity_type TEXT,
  entity_id TEXT,
  event_name TEXT NOT NULL,
  event_status TEXT DEFAULT 'triggered',
  payload JSONB DEFAULT '{}',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_wf_entity ON workflow_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_wf_status ON workflow_events(event_status);
CREATE INDEX IF NOT EXISTS idx_wf_name ON workflow_events(event_name);

-- ============================================================
-- 7. CREATE AUDIT_LOGS TABLE (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  actor_type TEXT,
  actor_id TEXT,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  before_state JSONB,
  after_state JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at);

-- ============================================================
-- 8. CREATE CANDIDATE_EXPERIENCE TABLE (if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS candidate_experience (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_candidate_experience_user ON candidate_experience(user_id);

-- ============================================================
-- 9. CREATE CANDIDATE_SKILLS TABLE (if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS candidate_skills (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  proficiency TEXT DEFAULT 'intermediate',
  years_of_experience INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill)
);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_user ON candidate_skills(user_id);

-- ============================================================
-- 10. CREATE ASSESSMENT_RESULTS TABLE (if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_results (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  assessment_type TEXT DEFAULT 'coding',
  score INTEGER,
  max_score INTEGER DEFAULT 100,
  duration_seconds INTEGER,
  result_data JSONB DEFAULT '{}',
  passed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assessment_results_user ON assessment_results(user_id);

-- ============================================================
-- 11. ENABLE RLS ON NEW TABLES
-- ============================================================
ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- Public access policies (use service role key for server-side writes)
CREATE POLICY IF NOT EXISTS "Public Access" ON ai_evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public Access" ON workflow_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public Access" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public Access" ON candidate_experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public Access" ON candidate_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public Access" ON assessment_results FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 002 COMPLETE
-- New tables: ai_evaluations, workflow_events, audit_logs,
--             candidate_experience, candidate_skills, assessment_results
-- Upgraded: candidates (+25 cols), employers (+8 cols),
--           employer_job_posts (+6 cols), job_applications (+11 cols)
-- ============================================================
