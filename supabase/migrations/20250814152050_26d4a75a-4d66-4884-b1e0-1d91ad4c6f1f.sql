
-- Create notification channels table
CREATE TABLE IF NOT EXISTS public.notification_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('SMS', 'EMAIL')),
  destination text NOT NULL,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, kind, destination)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('GLOBAL', 'CHILD')),
  child_id uuid REFERENCES public.children(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('BULLYING', 'GROOMING', 'PROFANITY', 'LOGIN', 'SYSTEM')),
  min_severity integer NOT NULL DEFAULT 2 CHECK (min_severity BETWEEN 1 AND 4),
  channel_ids text[] NOT NULL DEFAULT '{}',
  digest text NOT NULL DEFAULT 'NONE' CHECK (digest IN ('NONE', 'HOURLY', 'DAILY')),
  quiet_hours jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, COALESCE(child_id, '00000000-0000-0000-0000-000000000000'::uuid), alert_type)
);

-- Create policy effective states table for caching
CREATE TABLE IF NOT EXISTS public.policy_effective (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('GLOBAL', 'CHILD', 'DEVICE')),
  subject_id uuid,
  policy_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- Enable RLS on new tables
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_effective ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_channels
CREATE POLICY "Users can manage their own notification channels"
  ON public.notification_channels
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for policy_effective
CREATE POLICY "Users can manage their own policy states"
  ON public.policy_effective
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE OR REPLACE TRIGGER notification_channels_updated_at
  BEFORE UPDATE ON public.notification_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER policy_effective_updated_at
  BEFORE UPDATE ON public.policy_effective
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
