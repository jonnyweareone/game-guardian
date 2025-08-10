-- Create enum app_role if not exists via DO block (CREATE TYPE IF NOT EXISTS not supported)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- has_role helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

-- waitlist_signups
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  full_name TEXT,
  product TEXT NOT NULL,
  intent TEXT NOT NULL DEFAULT 'waitlist',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  user_id UUID NULL,
  source TEXT NULL,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (email, product, intent)
);
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
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

-- RLS policies
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

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist_signups (created_at DESC);