-- 1) Roles enum and table
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Basic policies so users can read their own roles (optional)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view their roles' 
  ) THEN
    CREATE POLICY "Users can view their roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2) Role helper function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

-- 3) Waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  full_name TEXT,
  product TEXT NOT NULL,          -- e.g., 'os' | 'device'
  intent TEXT NOT NULL DEFAULT 'waitlist', -- 'waitlist' | 'beta'
  status TEXT NOT NULL DEFAULT 'pending',  -- admin workflow
  notes TEXT,
  user_id UUID NULL,              -- optional if logged in
  source TEXT NULL,               -- e.g., 'homepage', 'auth'
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (email, product, intent)
);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_waitlist_signups_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_waitlist_signups_set_updated_at
    BEFORE UPDATE ON public.waitlist_signups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- RLS Policies
-- Anyone (even anon) can insert a waitlist entry
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_signups' AND policyname = 'Anyone can join the waitlist' 
  ) THEN
    CREATE POLICY "Anyone can join the waitlist"
    ON public.waitlist_signups
    FOR INSERT
    TO public
    WITH CHECK (true);
  END IF;
END $$;

-- Only admins can view/update/delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_signups' AND policyname = 'Admins can view waitlist' 
  ) THEN
    CREATE POLICY "Admins can view waitlist"
    ON public.waitlist_signups
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_signups' AND policyname = 'Admins can update waitlist' 
  ) THEN
    CREATE POLICY "Admins can update waitlist"
    ON public.waitlist_signups
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_signups' AND policyname = 'Admins can delete waitlist' 
  ) THEN
    CREATE POLICY "Admins can delete waitlist"
    ON public.waitlist_signups
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist_signups (created_at DESC);