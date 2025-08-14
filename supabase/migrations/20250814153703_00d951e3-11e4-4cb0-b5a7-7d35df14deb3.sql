
-- Create notification channels table
CREATE TABLE IF NOT EXISTS public.notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('SMS', 'EMAIL')),
  destination TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, kind, destination)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('GLOBAL', 'CHILD')),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('BULLYING', 'GROOMING', 'PROFANITY', 'LOGIN', 'SYSTEM')),
  min_severity INTEGER NOT NULL DEFAULT 2 CHECK (min_severity >= 1 AND min_severity <= 5),
  channel_ids UUID[] NOT NULL DEFAULT '{}',
  digest TEXT NOT NULL DEFAULT 'NONE' CHECK (digest IN ('NONE', 'HOURLY', 'DAILY')),
  quiet_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, COALESCE(child_id, '00000000-0000-0000-0000-000000000000'::uuid), alert_type)
);

-- Create policy effective states table
CREATE TABLE IF NOT EXISTS public.policy_effective (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('GLOBAL', 'CHILD', 'DEVICE')),
  subject_id UUID,
  policy_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- Enable RLS
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_effective ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_channels
CREATE POLICY "Users can manage their notification channels" ON public.notification_channels
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for notification_preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for policy_effective
CREATE POLICY "Users can manage their policy states" ON public.policy_effective
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create RPC functions for the API
CREATE OR REPLACE FUNCTION public.rpc_get_notification_channels()
RETURNS SETOF public.notification_channels
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.notification_channels 
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.rpc_add_notification_channel(
  _kind TEXT,
  _destination TEXT
)
RETURNS public.notification_channels
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result public.notification_channels;
BEGIN
  INSERT INTO public.notification_channels (user_id, kind, destination)
  VALUES (auth.uid(), _kind, _destination)
  RETURNING * INTO _result;
  
  RETURN _result;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_notification_preferences(
  _scope TEXT DEFAULT NULL,
  _child_id UUID DEFAULT NULL
)
RETURNS SETOF public.notification_preferences
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.notification_preferences 
  WHERE user_id = auth.uid()
    AND (_scope IS NULL OR scope = _scope)
    AND (_child_id IS NULL OR child_id = _child_id)
  ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.rpc_upsert_notification_preference(
  _scope TEXT,
  _child_id UUID,
  _alert_type TEXT,
  _min_severity INTEGER,
  _channel_ids UUID[],
  _digest TEXT,
  _quiet_hours JSONB DEFAULT NULL
)
RETURNS public.notification_preferences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result public.notification_preferences;
BEGIN
  INSERT INTO public.notification_preferences (
    user_id, scope, child_id, alert_type, min_severity, channel_ids, digest, quiet_hours
  )
  VALUES (
    auth.uid(), _scope, _child_id, _alert_type, _min_severity, _channel_ids, _digest, _quiet_hours
  )
  ON CONFLICT (user_id, scope, COALESCE(child_id, '00000000-0000-0000-0000-000000000000'::uuid), alert_type)
  DO UPDATE SET
    min_severity = EXCLUDED.min_severity,
    channel_ids = EXCLUDED.channel_ids,
    digest = EXCLUDED.digest,
    quiet_hours = EXCLUDED.quiet_hours,
    updated_at = now()
  RETURNING * INTO _result;
  
  RETURN _result;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_get_policy_effective(
  _scope TEXT,
  _subject_id UUID DEFAULT NULL
)
RETURNS public.policy_effective
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.policy_effective 
  WHERE user_id = auth.uid()
    AND scope = _scope
    AND (subject_id = _subject_id OR (_subject_id IS NULL AND subject_id IS NULL))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.rpc_set_policy_effective(
  _scope TEXT,
  _policy_data JSONB,
  _subject_id UUID DEFAULT NULL
)
RETURNS public.policy_effective
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result public.policy_effective;
BEGIN
  INSERT INTO public.policy_effective (user_id, scope, subject_id, policy_data)
  VALUES (auth.uid(), _scope, _subject_id, _policy_data)
  ON CONFLICT (user_id, scope, COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid))
  DO UPDATE SET
    policy_data = EXCLUDED.policy_data,
    updated_at = now()
  RETURNING * INTO _result;
  
  RETURN _result;
END;
$$;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_channels_updated_at 
  BEFORE UPDATE ON public.notification_channels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON public.notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_effective_updated_at 
  BEFORE UPDATE ON public.policy_effective 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
