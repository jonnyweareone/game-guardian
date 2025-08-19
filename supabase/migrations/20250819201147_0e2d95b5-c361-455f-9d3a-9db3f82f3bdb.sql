-- Ensure parent profile has address fields (if you don't already)
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  address_line1 text,
  address_line2 text,
  city text,
  postcode text,         -- useful for school lookup
  country text DEFAULT 'UK',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on parent_profiles
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for parent_profiles
CREATE POLICY "Users can manage their own profile" ON public.parent_profiles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fast lookup view that joins children to parent address (for UI convenience)
CREATE OR REPLACE VIEW public.v_children_with_parent AS
SELECT
  c.id as child_id,
  c.full_name,
  c.age,
  c.avatar_url,
  c.parent_user_id,
  p.postcode,
  p.city,
  p.country
FROM public.children c
LEFT JOIN public.parent_profiles p ON p.user_id = c.parent_user_id;

-- Auto‑provision an education profile when a child is created (mirrors card across pages)
CREATE OR REPLACE FUNCTION public._ensure_education_profile()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.education_profiles(child_id, key_stage, year_group)
  VALUES (NEW.id, null, null)
  ON CONFLICT (child_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_children_edu_profile ON public.children;
CREATE TRIGGER trg_children_edu_profile
AFTER INSERT ON public.children
FOR EACH ROW EXECUTE FUNCTION public._ensure_education_profile();

-- Add trigger for updating updated_at on parent_profiles
CREATE TRIGGER update_parent_profiles_updated_at
BEFORE UPDATE ON public.parent_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();