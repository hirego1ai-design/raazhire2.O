-- ========================================================
-- MIGRATION: Migrate Upskill to Supabase Auth & Unify Schema
-- Replaces custom upskill auth with Supabase Auth integration
-- ========================================================

-- 0. Ensure Host User Table (users) exists
-- This is the "Master Auth Table" linked to auth.users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'candidate',
  status TEXT DEFAULT 'Active',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Modify upskill_learners table structure
-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'upskill_learners' AND column_name = 'user_id') THEN
        ALTER TABLE upskill_learners ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        ALTER TABLE upskill_learners ADD CONSTRAINT upskill_learners_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Drop password_hash column if it exists (DESTRUCTIVE - Ensure backups!)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'upskill_learners' AND column_name = 'password_hash') THEN
        ALTER TABLE upskill_learners DROP COLUMN password_hash;
    END IF;
END $$;

-- 2. Enable Row Level Security (RLS) on upskill_learners
ALTER TABLE upskill_learners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON upskill_learners;
DROP POLICY IF EXISTS "Users can view their own profile" ON upskill_learners;
DROP POLICY IF EXISTS "Users can update their own profile" ON upskill_learners;
DROP POLICY IF EXISTS "Users can insert their own profile" ON upskill_learners;
DROP POLICY IF EXISTS "Admins can view all profiles" ON upskill_learners;

-- Create new policies
-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON upskill_learners FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON upskill_learners FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own profile (during registration)
CREATE POLICY "Users can insert their own profile" 
ON upskill_learners FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Public/Admins might need to view profiles (optional, restrict based on needs)
-- For now allowing authenticated users to view others (e.g. peer learning) or just admins?
-- Let's stick to strict ownership for now, or maybe minimal public info.
-- Keeping strict ownership + admin access.

-- Admin access (if using service role or admin claims)
-- This assumes you have a way to identify admins, or use service role which bypasses RLS.

-- 3. Update existing data (Optional/Manual)
-- If you have existing users in upskill_learners, you need to manually map them to auth.users.
-- Since we dropped password_hash, they MUST reset their passwords or sign up again with the same email.
-- Supabase Auth will generate a new user_id.
-- A trigger could auto-link them by email if needed, but for now we assume fresh start or manual migration.

-- 4. Clean up other tables if needed based on new auth.uid() usage
-- (e.g. ensuring user_learning_progress uses auth.users id, which it likely does via upskill_learners id or similar)

-- Add checking constraint to ensure email matches auth.email? (Optional)

-- Completed
