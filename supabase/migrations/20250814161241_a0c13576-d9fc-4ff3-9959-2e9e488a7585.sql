
-- Create notification channels table
CREATE TABLE public.notification_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('SMS', 'EMAIL')),
  destination TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('GLOBAL', 'CHILD')),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('BULLYING', 'GROOMING', 'PROFANITY', 'LOGIN', 'SYSTEM')),
  min_severity INTEGER NOT NULL DEFAULT 2 CHECK (min_severity >= 1 AND min_severity <= 10),
  channel_ids TEXT[] NOT NULL DEFAULT '{}',
  digest TEXT NOT NULL DEFAULT 'NONE' CHECK (digest IN ('NONE', 'HOURLY', 'DAILY')),
  quiet_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, child_id, alert_type)
);

-- Create policy effective states table
CREATE TABLE public.policy_effective (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('GLOBAL', 'CHILD', 'DEVICE')),
  subject_id UUID,
  policy_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, subject_id)
);

-- Enable Row Level Security
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_effective ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_channels
CREATE POLICY "Users can manage their own notification channels" 
  ON public.notification_channels 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" 
  ON public.notification_preferences 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Additional policy for child-scoped preferences
CREATE POLICY "Users can manage child notification preferences" 
  ON public.notification_preferences 
  FOR ALL 
  USING (
    auth.uid() = user_id AND 
    (scope = 'GLOBAL' OR 
     (scope = 'CHILD' AND child_id IN (
       SELECT id FROM public.children WHERE parent_id = auth.uid()
     )))
  )
  WITH CHECK (
    auth.uid() = user_id AND 
    (scope = 'GLOBAL' OR 
     (scope = 'CHILD' AND child_id IN (
       SELECT id FROM public.children WHERE parent_id = auth.uid()
     )))
  );

-- RLS Policies for policy_effective
CREATE POLICY "Users can manage their own policy states" 
  ON public.policy_effective 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Additional policy for child/device scoped policies
CREATE POLICY "Users can manage child and device policies" 
  ON public.policy_effective 
  FOR ALL 
  USING (
    auth.uid() = user_id AND 
    (scope = 'GLOBAL' OR 
     (scope = 'CHILD' AND subject_id IN (
       SELECT id FROM public.children WHERE parent_id = auth.uid()
     )) OR
     (scope = 'DEVICE' AND subject_id IN (
       SELECT id FROM public.devices WHERE parent_id = auth.uid()
     )))
  )
  WITH CHECK (
    auth.uid() = user_id AND 
    (scope = 'GLOBAL' OR 
     (scope = 'CHILD' AND subject_id IN (
       SELECT id FROM public.children WHERE parent_id = auth.uid()
     )) OR
     (scope = 'DEVICE' AND subject_id IN (
       SELECT id FROM public.devices WHERE parent_id = auth.uid()
     )))
  );

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

-- Add indexes for performance
CREATE INDEX idx_notification_channels_user_id ON public.notification_channels(user_id);
CREATE INDEX idx_notification_preferences_user_scope ON public.notification_preferences(user_id, scope);
CREATE INDEX idx_notification_preferences_child_id ON public.notification_preferences(child_id) WHERE child_id IS NOT NULL;
CREATE INDEX idx_policy_effective_user_scope ON public.policy_effective(user_id, scope);
CREATE INDEX idx_policy_effective_subject_id ON public.policy_effective(subject_id) WHERE subject_id IS NOT NULL;
