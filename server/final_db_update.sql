-- 1. Enable Video Resume Persistence
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS video_resume_url TEXT;

-- 2. Enable AI Analysis Storage (Scores & Transcript)
ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS communication_score INTEGER,
ADD COLUMN IF NOT EXISTS knowledge_score INTEGER,
ADD COLUMN IF NOT EXISTS confidence_score INTEGER,
ADD COLUMN IF NOT EXISTS transcript TEXT;
