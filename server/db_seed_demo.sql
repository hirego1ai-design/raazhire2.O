-- ============================================================
-- SEED DATA FOR HIREGO AI PORTAL - DEMO ACCOUNTS & MOCK DATA
-- Run this AFTER the main schema files (db_schema_final.sql, db_schema_admin.sql)
-- ============================================================

-- ==================== DEMO USER ACCOUNTS ====================
-- NOTE: These users must be created in Supabase Auth first!
-- The passwords below are for reference only - create users in Supabase Dashboard
-- 
-- DEMO CREDENTIALS:
-- ┌─────────────────────────────────────────────────────────────┐
-- │  CANDIDATE                                                 │
-- │  Email: candidate@hirego.demo                              │
-- │  Password: Demo@2024                                       │
-- ├─────────────────────────────────────────────────────────────┤
-- │  EMPLOYER                                                  │
-- │  Email: employer@hirego.demo                               │
-- │  Password: Demo@2024                                       │
-- ├─────────────────────────────────────────────────────────────┤
-- │  ADMIN                                                     │
-- │  Email: admin@hirego.demo                                  │
-- │  Password: Admin@2024                                      │
-- └─────────────────────────────────────────────────────────────┘

-- Insert demo users (IDs should match Supabase Auth UIDs after creation)
INSERT INTO users (id, email, name, role, status, phone, location, avatar_url, wallet_balance, plan) VALUES
('demo-candidate-001', 'candidate@hirego.demo', 'Alex Johnson', 'candidate', 'Active', '+1-555-0101', 'San Francisco, CA', 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff', 0, 'Free'),
('demo-employer-001', 'employer@hirego.demo', 'Sarah Mitchell', 'employer', 'Active', '+1-555-0202', 'New York, NY', 'https://ui-avatars.com/api/?name=Sarah+Mitchell&background=5D3FD3&color=fff', 500, 'Professional'),
('demo-admin-001', 'admin@hirego.demo', 'System Admin', 'admin', 'Active', '+1-555-0303', 'Austin, TX', 'https://ui-avatars.com/api/?name=System+Admin&background=DC143C&color=fff', 0, 'Enterprise')
ON CONFLICT (id) DO NOTHING;

-- ==================== CANDIDATE PROFILE ====================
INSERT INTO candidates (user_id, email, name, phone, job_profile, title, location, bio, education_10th, education_12th, graduation) VALUES
('demo-candidate-001', 'candidate@hirego.demo', 'Alex Johnson', '+1-555-0101', 'Full Stack Developer', 'Senior Software Engineer', 'San Francisco, CA',
'Passionate full-stack developer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies.',
'{"school": "Lincoln High School", "board": "State Board", "percentage": 92, "year": 2014}'::jsonb,
'{"school": "Lincoln High School", "board": "State Board", "percentage": 88, "year": 2016}'::jsonb,
'{"college": "Stanford University", "degree": "B.S. Computer Science", "cgpa": 3.8, "year": 2020}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

-- Candidate Skills
INSERT INTO candidate_skills (user_id, skill, score, category) VALUES
('demo-candidate-001', 'React', 95, 'technical'),
('demo-candidate-001', 'Node.js', 90, 'technical'),
('demo-candidate-001', 'TypeScript', 88, 'technical'),
('demo-candidate-001', 'PostgreSQL', 85, 'technical'),
('demo-candidate-001', 'AWS', 80, 'technical'),
('demo-candidate-001', 'Communication', 92, 'soft'),
('demo-candidate-001', 'Problem Solving', 90, 'soft')
ON CONFLICT DO NOTHING;

-- Candidate Experience
INSERT INTO candidate_experience (user_id, company, role, start_date, end_date, description) VALUES
('demo-candidate-001', 'TechCorp Inc.', 'Senior Software Engineer', '2022-01', 'Present', 'Lead developer for customer-facing applications. Reduced page load time by 40%.'),
('demo-candidate-001', 'StartupXYZ', 'Software Engineer', '2020-06', '2021-12', 'Built microservices architecture handling 1M+ daily requests.')
ON CONFLICT DO NOTHING;

-- ==================== SAMPLE JOBS ====================
INSERT INTO jobs (employer_id, title, description, requirements, skills, location, work_mode, type, salary_min, salary_max, status, job_type) VALUES
('demo-employer-001', 'Senior React Developer', 
'We are looking for an experienced React developer to join our growing team. You will be responsible for building and maintaining our customer-facing web applications.',
'- 4+ years of React experience\n- Strong TypeScript skills\n- Experience with state management (Redux/Zustand)\n- CI/CD experience',
ARRAY['React', 'TypeScript', 'Node.js', 'AWS'],
'New York, NY', 'Hybrid', 'Full-time', '120000', '160000', 'active', 'premium'),

('demo-employer-001', 'Full Stack Engineer',
'Join our engineering team to build scalable solutions. Work on both frontend and backend systems.',
'- 3+ years full-stack experience\n- React + Node.js proficiency\n- Database design skills',
ARRAY['React', 'Node.js', 'PostgreSQL', 'Docker'],
'Remote', 'Remote', 'Full-time', '100000', '140000', 'active', 'standard'),

('demo-employer-001', 'DevOps Engineer',
'Looking for a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.',
'- AWS/GCP experience\n- Kubernetes knowledge\n- Terraform/IaC skills',
ARRAY['AWS', 'Kubernetes', 'Docker', 'Terraform'],
'Austin, TX', 'On-site', 'Full-time', '130000', '170000', 'active', 'urgent')
ON CONFLICT DO NOTHING;

-- ==================== SAMPLE APPLICATIONS ====================
INSERT INTO applications (job_id, candidate_id, status, match_score, cover_letter) VALUES
(1, 'demo-candidate-001', 'shortlisted', 92, 'I am excited to apply for the Senior React Developer position. With 5+ years of React experience...'),
(2, 'demo-candidate-001', 'applied', 85, 'I believe my full-stack experience makes me an ideal candidate for this role.')
ON CONFLICT DO NOTHING;

-- ==================== SAMPLE INTERVIEWS ====================
INSERT INTO interviews (candidate_id, job_id, employer_id, scheduled_date, duration, status, round, type, meeting_link, proctoring_enabled) VALUES
('demo-candidate-001', 1, 'demo-employer-001', NOW() + INTERVAL '2 days', 60, 'scheduled', 'technical', 'Video', 'https://meet.google.com/abc-defg-hij', true),
('demo-candidate-001', 2, 'demo-employer-001', NOW() + INTERVAL '5 days', 45, 'scheduled', 'screening', 'Video', 'https://meet.google.com/xyz-uvwx-yz', true)
ON CONFLICT DO NOTHING;

-- ==================== GAMIFICATION DATA ====================
-- Initialize gamification stats for demo candidate
INSERT INTO gamification_stats (user_id, level, current_xp, next_level_xp, streak_days, total_badges, leaderboard_rank) VALUES
('demo-candidate-001', 3, 750, 1000, 5, 3, 42)
ON CONFLICT (user_id) DO NOTHING;

-- Award some badges to demo candidate
INSERT INTO gamification_user_badges (user_id, badge_id) VALUES
('demo-candidate-001', 1),
('demo-candidate-001', 2),
('demo-candidate-001', 4)
ON CONFLICT DO NOTHING;

-- ==================== SYSTEM LOGS ====================
INSERT INTO system_logs (level, source, message) VALUES
('INFO', 'AuthService', 'Demo environment initialized successfully'),
('SUCCESS', 'JobService', 'Sample jobs created for demo employer'),
('INFO', 'AIProvider', 'AI services ready: Gemini, GPT-4'),
('SUCCESS', 'GamificationService', 'Demo candidate badges awarded')
ON CONFLICT DO NOTHING;

-- ==================== CONFIRMATION ====================
-- Run this query to verify the data was inserted:
-- SELECT 'Users:' as table_name, COUNT(*) as count FROM users
-- UNION ALL SELECT 'Jobs:', COUNT(*) FROM jobs
-- UNION ALL SELECT 'Applications:', COUNT(*) FROM applications
-- UNION ALL SELECT 'Interviews:', COUNT(*) FROM interviews;
