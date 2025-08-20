-- Create Nova insights table for AI coaching data
CREATE TABLE public.nova_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  child_id UUID NOT NULL,
  book_id UUID NOT NULL,
  scope TEXT NOT NULL DEFAULT 'chunk', -- 'chunk', 'chapter', 'session'
  ai_summary TEXT NOT NULL,
  difficulty_level TEXT, -- 'easy', 'medium', 'challenging'
  key_points TEXT[], -- Array of key learning points
  comprehension_questions TEXT[], -- Array of questions to test understanding
  emotional_tone TEXT, -- 'positive', 'neutral', 'concerned'
  reading_level_assessment TEXT, -- Assessment of reading level
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Problem Words table for phonetics support
CREATE TABLE public.nova_problem_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  child_id UUID NOT NULL,
  word TEXT NOT NULL,
  phonetics TEXT, -- IPA pronunciation
  syllables TEXT[], -- Array of syllables 
  sounds TEXT[], -- Array of phonetic sounds
  difficulty_reason TEXT, -- Why this word was flagged as difficult
  hints TEXT[], -- Array of pronunciation hints
  definition TEXT, -- Simple definition for the child
  count INTEGER DEFAULT 1, -- How many times encountered
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Reading Progress table for rewards tracking
CREATE TABLE public.nova_reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  child_id UUID NOT NULL,
  book_id UUID NOT NULL,
  pages_read INTEGER DEFAULT 0,
  total_pages INTEGER,
  reading_time_minutes INTEGER DEFAULT 0,
  words_read INTEGER DEFAULT 0,
  comprehension_score DECIMAL(3,2), -- 0.00 to 1.00
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.nova_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_problem_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_reading_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for nova_insights
CREATE POLICY "Parents can view their children's insights" 
ON public.nova_insights 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.children 
  WHERE children.id = nova_insights.child_id 
  AND children.parent_id = auth.uid()
));

CREATE POLICY "Edge functions can insert insights" 
ON public.nova_insights 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for nova_problem_words
CREATE POLICY "Parents can view their children's problem words" 
ON public.nova_problem_words 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.children 
  WHERE children.id = nova_problem_words.child_id 
  AND children.parent_id = auth.uid()
));

CREATE POLICY "Edge functions can insert problem words" 
ON public.nova_problem_words 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for nova_reading_progress
CREATE POLICY "Parents can view their children's reading progress" 
ON public.nova_reading_progress 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.children 
  WHERE children.id = nova_reading_progress.child_id 
  AND children.parent_id = auth.uid()
));

CREATE POLICY "Parents can insert reading progress" 
ON public.nova_reading_progress 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.children 
  WHERE children.id = nova_reading_progress.child_id 
  AND children.parent_id = auth.uid()
));

CREATE POLICY "Parents can update reading progress" 
ON public.nova_reading_progress 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.children 
  WHERE children.id = nova_reading_progress.child_id 
  AND children.parent_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_nova_insights_session_id ON public.nova_insights(session_id);
CREATE INDEX idx_nova_insights_child_id ON public.nova_insights(child_id);
CREATE INDEX idx_nova_problem_words_session_id ON public.nova_problem_words(session_id);
CREATE INDEX idx_nova_problem_words_child_id ON public.nova_problem_words(child_id);
CREATE INDEX idx_nova_reading_progress_child_id ON public.nova_reading_progress(child_id);

-- Create trigger for updated_at
CREATE TRIGGER update_nova_reading_progress_updated_at
  BEFORE UPDATE ON public.nova_reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();