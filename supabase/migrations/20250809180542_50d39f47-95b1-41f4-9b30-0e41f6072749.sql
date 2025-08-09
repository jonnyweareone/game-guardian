-- Enable RLS on app_groups and add a public SELECT policy
ALTER TABLE public.app_groups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_groups' AND policyname = 'App groups are viewable by everyone'
  ) THEN
    CREATE POLICY "App groups are viewable by everyone"
    ON public.app_groups
    FOR SELECT
    USING (true);
  END IF;
END $$;