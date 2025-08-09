-- Phase 1: DB objects to support the plan (safe, additive)
-- Create missing tables and RPCs with secure RLS policies

-- 1) App category policies
CREATE TABLE IF NOT EXISTS public.app_category_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL CHECK (subject_type IN ('device','child')),
  subject_id uuid NOT NULL,
  category text NOT NULL CHECK (category IN ('Game','App','Social','Education','Streaming','Messaging','Browser','Other')),
  allowed boolean NOT NULL DEFAULT true,
  daily_limit_minutes integer,
  enforced_hours text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_app_category_policy UNIQUE (subject_type, subject_id, category)
);

ALTER TABLE public.app_category_policies ENABLE ROW LEVEL SECURITY;

-- Parents can view policies for their devices/children
CREATE POLICY "Parents can view app category policies"
ON public.app_category_policies
FOR SELECT
USING (
  (
    subject_type = 'device' AND EXISTS (
      SELECT 1 FROM public.devices d
      WHERE d.id = app_category_policies.subject_id AND d.parent_id = auth.uid()
    )
  ) OR (
    subject_type = 'child' AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = app_category_policies.subject_id AND c.parent_id = auth.uid()
    )
  )
);

-- Parents can insert policies for their devices/children
CREATE POLICY "Parents can insert app category policies"
ON public.app_category_policies
FOR INSERT
WITH CHECK (
  (
    subject_type = 'device' AND EXISTS (
      SELECT 1 FROM public.devices d
      WHERE d.id = app_category_policies.subject_id AND d.parent_id = auth.uid()
    )
  ) OR (
    subject_type = 'child' AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = app_category_policies.subject_id AND c.parent_id = auth.uid()
    )
  )
);

-- Parents can update policies for their devices/children
CREATE POLICY "Parents can update app category policies"
ON public.app_category_policies
FOR UPDATE
USING (
  (
    subject_type = 'device' AND EXISTS (
      SELECT 1 FROM public.devices d
      WHERE d.id = app_category_policies.subject_id AND d.parent_id = auth.uid()
    )
  ) OR (
    subject_type = 'child' AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = app_category_policies.subject_id AND c.parent_id = auth.uid()
    )
  )
)
WITH CHECK (
  (
    subject_type = 'device' AND EXISTS (
      SELECT 1 FROM public.devices d
      WHERE d.id = app_category_policies.subject_id AND d.parent_id = auth.uid()
    )
  ) OR (
    subject_type = 'child' AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = app_category_policies.subject_id AND c.parent_id = auth.uid()
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_app_cat_policies_subject ON public.app_category_policies (subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_app_cat_policies_category ON public.app_category_policies (category);


-- 2) Child time tokens (earn/spend minutes)
CREATE TABLE IF NOT EXISTS public.child_time_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  delta_minutes integer NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.child_time_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_child_time_tokens_child ON public.child_time_tokens (child_id, created_at DESC);

-- Parents can view their children's tokens
CREATE POLICY "Parents can view their children's time tokens"
ON public.child_time_tokens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.id = child_time_tokens.child_id AND c.parent_id = auth.uid()
  )
);

-- Parents can insert tokens for their children
CREATE POLICY "Parents can insert time tokens"
ON public.child_time_tokens
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.id = child_time_tokens.child_id AND c.parent_id = auth.uid()
  )
);


-- 3) Device commands queue
CREATE TABLE IF NOT EXISTS public.device_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL,
  cmd text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued', -- queued | processing | done | failed
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE public.device_commands ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_device_commands_device ON public.device_commands (device_id, status, created_at DESC);

-- Parents can view commands for their devices
CREATE POLICY "Parents can view their device commands"
ON public.device_commands
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = device_commands.device_id AND d.parent_id = auth.uid()
  )
);

-- Parents can insert commands for their devices
CREATE POLICY "Parents can insert device commands"
ON public.device_commands
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = device_commands.device_id AND d.parent_id = auth.uid()
  )
);

-- Guardian devices can update their own command statuses (optional)
CREATE POLICY "Guardian devices update their commands"
ON public.device_commands
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = device_commands.device_id AND d.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = device_commands.device_id AND d.is_active = true
  )
);


-- 4) Device heartbeats
CREATE TABLE IF NOT EXISTS public.device_heartbeats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL,
  child_id uuid,
  battery integer,
  ip_address text,
  ssid text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_heartbeats ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_device_heartbeats_device ON public.device_heartbeats (device_id, created_at DESC);

-- Guardian devices can insert heartbeats
CREATE POLICY "Guardian devices can insert heartbeats"
ON public.device_heartbeats
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = device_heartbeats.device_id AND d.is_active = true
  )
);

-- Parents can view heartbeats for their devices
CREATE POLICY "Parents can view heartbeats"
ON public.device_heartbeats
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = device_heartbeats.device_id AND d.parent_id = auth.uid()
  )
);


-- 5) App activity sessions
CREATE TABLE IF NOT EXISTS public.app_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL,
  child_id uuid,
  app_id text NOT NULL,
  session_start timestamptz NOT NULL DEFAULT now(),
  session_end timestamptz,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_activity ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_app_activity_device ON public.app_activity (device_id, session_start DESC);
CREATE INDEX IF NOT EXISTS idx_app_activity_child ON public.app_activity (child_id, session_start DESC);
CREATE INDEX IF NOT EXISTS idx_app_activity_app ON public.app_activity (app_id, session_start DESC);

-- Guardian devices can insert/update their app activity
CREATE POLICY "Guardian devices can insert app activity"
ON public.app_activity
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = app_activity.device_id AND d.is_active = true
  )
);

CREATE POLICY "Guardian devices can update app activity"
ON public.app_activity
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = app_activity.device_id AND d.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = app_activity.device_id AND d.is_active = true
  )
);

-- Parents can view app activity for their devices/children
CREATE POLICY "Parents can view app activity"
ON public.app_activity
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.devices d
    WHERE d.id = app_activity.device_id AND d.parent_id = auth.uid()
  )
);


-- 6) Optional: extend device_apps with extra metadata (non-breaking)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'device_apps' AND column_name = 'source'
  ) THEN
    ALTER TABLE public.device_apps ADD COLUMN source text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'device_apps' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.device_apps ADD COLUMN version text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'device_apps' AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE public.device_apps ADD COLUMN last_used_at timestamptz;
  END IF;
END $$;


-- 7) RPCs
-- Set active child for a device (secure)
CREATE OR REPLACE FUNCTION public.rpc_set_active_child(
  _device uuid,
  _child uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _p uuid;
BEGIN
  -- Verify the caller owns the device
  SELECT parent_id INTO _p FROM public.devices WHERE id = _device;
  IF _p IS NULL OR _p <> auth.uid() THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  -- Verify the child also belongs to the same parent
  IF NOT EXISTS (
    SELECT 1 FROM public.children c WHERE c.id = _child AND c.parent_id = _p
  ) THEN
    RAISE EXCEPTION 'child not found or not owned by parent';
  END IF;

  -- Set as active on devices table
  UPDATE public.devices
  SET child_id = _child, updated_at = now()
  WHERE id = _device;

  -- Update assignments to reflect active child
  UPDATE public.device_child_assignments a
  SET is_active = (a.child_id = _child), updated_at = now()
  WHERE a.device_id = _device;

  RETURN true;
END;
$$;

-- Issue a command to a device (queues a command)
CREATE OR REPLACE FUNCTION public.rpc_issue_command(
  _device uuid,
  _cmd text,
  _payload jsonb DEFAULT '{}'::jsonb
) RETURNS public.device_commands
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _p uuid;
  inserted public.device_commands;
BEGIN
  -- Verify the caller owns the device
  SELECT parent_id INTO _p FROM public.devices WHERE id = _device;
  IF _p IS NULL OR _p <> auth.uid() THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  INSERT INTO public.device_commands (device_id, cmd, payload)
  VALUES (_device, _cmd, COALESCE(_payload, '{}'::jsonb))
  RETURNING * INTO inserted;

  RETURN inserted;
END;
$$;