-- Create missing education-related tables

-- Education profiles table
CREATE TABLE IF NOT EXISTS public.education_profiles (
  child_id UUID PRIMARY KEY REFERENCES public.children(id) ON DELETE CASCADE,
  key_stage TEXT,
  year_group TEXT,
  school_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  age_range_min INTEGER,
  age_range_max INTEGER,
  school_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interests catalog table
CREATE TABLE IF NOT EXISTS public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Child interests table
CREATE TABLE IF NOT EXISTS public.child_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, interest_id)
);

-- Child homework links table
CREATE TABLE IF NOT EXISTS public.child_homework_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  subject TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.education_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_homework_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for education_profiles
CREATE POLICY "Parents can view their children's education profiles" ON public.education_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = education_profiles.child_id 
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert their children's education profiles" ON public.education_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = education_profiles.child_id 
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their children's education profiles" ON public.education_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = education_profiles.child_id 
      AND children.parent_id = auth.uid()
    )
  );

-- RLS policies for schools (public access)
CREATE POLICY "Schools are publicly viewable" ON public.schools
  FOR SELECT USING (true);

-- RLS policies for interests (public access)
CREATE POLICY "Interests are publicly viewable" ON public.interests
  FOR SELECT USING (true);

-- RLS policies for child_interests
CREATE POLICY "Parents can view their children's interests" ON public.child_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = child_interests.child_id 
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage their children's interests" ON public.child_interests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = child_interests.child_id 
      AND children.parent_id = auth.uid()
    )
  );

-- RLS policies for child_homework_links
CREATE POLICY "Parents can view their children's homework" ON public.child_homework_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = child_homework_links.child_id 
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage their children's homework" ON public.child_homework_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = child_homework_links.child_id 
      AND children.parent_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_education_profiles_updated_at
  BEFORE UPDATE ON public.education_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_homework_links_updated_at
  BEFORE UPDATE ON public.child_homework_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();