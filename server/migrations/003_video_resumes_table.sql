-- Create video_resumes table for storing analysis results
CREATE TABLE IF NOT EXISTS public.video_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    transcript TEXT,
    analysis_json JSONB,
    overall_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.video_resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own resumes
CREATE POLICY "Users can upload their own video resumes" 
ON public.video_resumes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own resumes
CREATE POLICY "Users can view their own video resumes" 
ON public.video_resumes FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins can view all resumes
-- (Assuming admins have a specific role or claimed via service_role)
-- For simplicity, we'll stick to user ownership for now.
