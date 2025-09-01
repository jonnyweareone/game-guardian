-- Create livestream_feedback table for speaker feedback submissions
CREATE TABLE public.livestream_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  speaker_slug TEXT NOT NULL,
  comfortable BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  preferred_intro TEXT,
  headshot_path TEXT,
  tech_notes TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.livestream_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to access feedback
CREATE POLICY "Admins can view all livestream feedback" 
ON public.livestream_feedback 
FOR SELECT 
USING (is_admin());

-- Create policy for service role to insert feedback (from edge function)
CREATE POLICY "Service role can insert livestream feedback" 
ON public.livestream_feedback 
FOR INSERT 
WITH CHECK (true);