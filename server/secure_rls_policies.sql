-- ============================================================
-- HIREGO AI - SECURITY HARDENING SCRIPT
-- Fixes "RLS Policy Always True" warnings (94+ warnings).
-- Replaces insecure "Allow All" policies with strict Role-Based Access.
-- ============================================================

-- Function to drop policies safely (helper)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE policyname LIKE 'Public Access %' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;


-- ============================================================
-- 1. PUBLIC CATALOGS (Read-Only for Everyone, Write for Admin Only)
-- ============================================================

-- Courses & Lessons (Everyone can see, only Backoffice can edit)
DROP POLICY IF EXISTS "Public Access CL" ON course_lessons;
CREATE POLICY "Public Read CL" ON course_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Access CQ" ON course_quizzes;
CREATE POLICY "Public Read CQ" ON course_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Access CAs" ON course_assignments;
CREATE POLICY "Public Read CAs" ON course_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Access LC" ON live_classes;
CREATE POLICY "Public Read LC" ON live_classes FOR SELECT USING (true);

-- Job Posts (Allow public read, but secure writes)
DROP POLICY IF EXISTS "Public Access EJP" ON employer_job_posts;
CREATE POLICY "Public Read Jobs" ON employer_job_posts FOR SELECT USING (true);
CREATE POLICY "Employer Manage Own Jobs" ON employer_job_posts FOR ALL 
USING (auth.uid()::text = employer_id) 
WITH CHECK (auth.uid()::text = employer_id);


-- ============================================================
-- 2. USER PRIVATE DATA (Owner Access Only)
-- ============================================================

-- User Profiles
DROP POLICY IF EXISTS "Public Access" ON user_profiles;
CREATE POLICY "Public Read Profiles" ON user_profiles FOR SELECT USING (true); -- Profiles are usually public
CREATE POLICY "Owner Edit Profiles" ON user_profiles FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Owner Insert Profiles" ON user_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Candidate Progress
DROP POLICY IF EXISTS "Public Access CP" ON candidate_progress;
CREATE POLICY "Owner Manage Progress" ON candidate_progress FOR ALL USING (auth.uid()::text = user_id);

-- Candidate Certificates
DROP POLICY IF EXISTS "Public Access CC" ON candidate_certificates;
CREATE POLICY "Public Read Certs" ON candidate_certificates FOR SELECT USING (true); -- Verification is public
CREATE POLICY "Owner Manage Certs" ON candidate_certificates FOR ALL USING (auth.uid()::text = user_id);

-- Activity Logs (Strictly Private)
DROP POLICY IF EXISTS "Public Access CAL" ON candidate_activity_log;
CREATE POLICY "Owner View Log" ON candidate_activity_log FOR SELECT USING (auth.uid()::text = user_id);

-- Wallet & Finance (Strictly Private)
DROP POLICY IF EXISTS "Public Access WAL" ON wallet;
CREATE POLICY "Owner View Wallet" ON wallet FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Public Access WT" ON wallet_transactions;
CREATE POLICY "Owner View Transactions" ON wallet_transactions FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Public Access PAY" ON payments;
CREATE POLICY "Owner View Payments" ON payments FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Public Access TX" ON transactions;
CREATE POLICY "Owner View Txn" ON transactions FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Public Access ES" ON employer_subscriptions;
CREATE POLICY "Owner View Subs" ON employer_subscriptions FOR SELECT USING (auth.uid()::text = employer_id);

-- Notifications (Strictly Private)
DROP POLICY IF EXISTS "Public Access Notif" ON notifications;
CREATE POLICY "Owner Manage Notifs" ON notifications FOR ALL USING (auth.uid()::text = user_id);


-- ============================================================
-- 3. RECRUITMENT & INTERVIEWS (Complex Logic)
-- ============================================================

-- Applications: Candidate sees own, Employer sees applicants for their jobs
DROP POLICY IF EXISTS "Public Access JA" ON job_applications;
CREATE POLICY "Candidate Manage Own App" ON job_applications FOR ALL 
USING (auth.uid()::text = candidate_id);

CREATE POLICY "Employer View Applicants" ON job_applications FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM employer_job_posts 
  WHERE employer_job_posts.id = job_applications.job_id 
  AND employer_job_posts.employer_id = auth.uid()::text
));

-- Screening Results
DROP POLICY IF EXISTS "Public Access SR" ON screening_results;
CREATE POLICY "Candidate View Own Screening" ON screening_results FOR SELECT USING (auth.uid()::text = candidate_id);
CREATE POLICY "Employer View Job Screening" ON screening_results FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM employer_job_posts 
  WHERE employer_job_posts.id = screening_results.job_id 
  AND employer_job_posts.employer_id = auth.uid()::text
));

-- Submissions
DROP POLICY IF EXISTS "Public Access AS" ON assignment_submissions;
CREATE POLICY "User Manage Submission" ON assignment_submissions FOR ALL USING (auth.uid()::text = user_id);

-- Interviews
DROP POLICY IF EXISTS "Public Access IL" ON interview_logs;
CREATE POLICY "Service Role Only IL" ON interview_logs FOR ALL USING (false); -- Backend only

DROP POLICY IF EXISTS "Public Access IF" ON interview_feedback;
CREATE POLICY "Interviewer View Feedback" ON interview_feedback FOR ALL USING (auth.uid()::text = interviewer_id);

DROP POLICY IF EXISTS "Public Access VIS" ON video_interview_sessions;
CREATE POLICY "Participants View Session" ON video_interview_sessions FOR SELECT 
USING (auth.uid()::text = candidate_id);

DROP POLICY IF EXISTS "Public Access REC" ON session_recordings;
CREATE POLICY "Service Role Only REC" ON session_recordings FOR ALL USING (false); -- Backend handles recordings


-- ============================================================
-- 4. ADMIN & INTERNAL (Locked Down)
-- ============================================================

-- Staff Users
DROP POLICY IF EXISTS "Public Access SU" ON staff_users;
CREATE POLICY "Public Read Staff" ON staff_users FOR SELECT USING (true); -- Often needed for "Contact Us" or directory

-- Admin Users (No Public Access)
DROP POLICY IF EXISTS "Public Access AU" ON admin_users;
-- Implicitly Deny All (No policy created = No access for Anon/Authenticated)
-- Only Service Role can access

-- Admin Settings (Read Only for App Config)
DROP POLICY IF EXISTS "Public Access AS" ON admin_settings;
CREATE POLICY "Public Read Settings" ON admin_settings FOR SELECT USING (is_sensitive = false);

-- CRM Leads
DROP POLICY IF EXISTS "Public Access CRM" ON crm_leads;
CREATE POLICY "Staff View Leads" ON crm_leads FOR ALL 
USING (EXISTS (SELECT 1 FROM staff_users WHERE user_id = auth.uid()::text));

-- Analytics & Logs
DROP POLICY IF EXISTS "Public Access AN" ON analytics;
CREATE POLICY "Insert Analytics" ON analytics FOR INSERT WITH CHECK (true); -- Public can log events
CREATE POLICY "View Analytics" ON analytics FOR SELECT USING (false); -- Only Admin/Service Role

DROP POLICY IF EXISTS "Public Access EL" ON email_logs;
-- Deny All (Backend only)

DROP POLICY IF EXISTS "Public Access SA" ON staff_activity;
-- Deny All (Backend only)

DROP POLICY IF EXISTS "Public Access EAL" ON employer_activity_log;
CREATE POLICY "Employer View Own Log" ON employer_activity_log FOR SELECT USING (auth.uid()::text = employer_id);


-- ============================================================
-- 5. PPH RECORDS
-- ============================================================
DROP POLICY IF EXISTS "Public Access PPH" ON pay_per_hire_records;
CREATE POLICY "Employer View PPH" ON pay_per_hire_records FOR SELECT USING (auth.uid()::text = employer_id);
