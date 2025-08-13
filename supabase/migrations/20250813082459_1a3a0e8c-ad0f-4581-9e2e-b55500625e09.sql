
BEGIN;

-- Ensure crypto helpers are available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Extend profiles with Stripe customer id
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Make profiles.user_id unique so we can reference it safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_user_id_unique'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

-- 2) Subscriptions table: one row per user auth id
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL,
  status text NOT NULL,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Parents can view their own subscription rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'subscriptions'
      AND policyname = 'subscriptions_select_own'
  ) THEN
    CREATE POLICY subscriptions_select_own
      ON public.subscriptions
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END$$;

-- 3) Device config table (per device)
CREATE TABLE IF NOT EXISTS public.device_config (
  device_id uuid PRIMARY KEY REFERENCES public.devices(id) ON DELETE CASCADE,
  manifest_url text,
  eula_version text DEFAULT '1.0',
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  firmware_update text,
  ui_update text,
  factory_reset boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger to maintain updated_at on device_config
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_device_config_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_device_config_set_updated_at
      BEFORE UPDATE ON public.device_config
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

ALTER TABLE public.device_config ENABLE ROW LEVEL SECURITY;

-- Parents can view device config for devices they own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'device_config'
      AND policyname = 'device_config_parent_select'
  ) THEN
    CREATE POLICY device_config_parent_select
      ON public.device_config
      FOR SELECT
      USING (
        device_id IN (
          SELECT d.id FROM public.devices d
          WHERE d.parent_id = auth.uid()
        )
      );
  END IF;
END$$;

-- 4) Device activations (consent + provenance)
CREATE TABLE IF NOT EXISTS public.device_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  consent_version text NOT NULL,
  consent_ip inet,
  consent_user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_activations ENABLE ROW LEVEL SECURITY;

-- Parents can insert activations for devices they own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'device_activations'
      AND policyname = 'device_activations_insert_parent'
  ) THEN
    CREATE POLICY device_activations_insert_parent
      ON public.device_activations
      FOR INSERT
      WITH CHECK (
        user_id = auth.uid()
        AND device_id IN (SELECT d.id FROM public.devices d WHERE d.parent_id = auth.uid())
      );
  END IF;
END$$;

-- Parents can view their own device activations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'device_activations'
      AND policyname = 'device_activations_select_parent'
  ) THEN
    CREATE POLICY device_activations_select_parent
      ON public.device_activations
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END$$;

-- 5) Audit log (service role writes only)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigserial PRIMARY KEY,
  ts timestamptz NOT NULL DEFAULT now(),
  actor text,
  action text,
  target text,
  detail jsonb
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies so normal users cannot read/write; service role bypasses RLS.

-- 6) Minimal device telemetry columns
ALTER TABLE public.devices
  ADD COLUMN IF NOT EXISTS last_seen timestamptz,
  ADD COLUMN IF NOT EXISTS firmware_version text DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS ui_version text DEFAULT '1.0.0';

-- 7) Storage bucket for updates (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('updates', 'updates', false)
ON CONFLICT (id) DO NOTHING;

COMMIT;
