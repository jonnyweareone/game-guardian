-- Complete Admin OTA Management System Migration (Fixed)
BEGIN;

-- Add admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Enrich devices for admin readouts
ALTER TABLE public.devices
  ADD COLUMN IF NOT EXISTS build_id text,
  ADD COLUMN IF NOT EXISTS os_version text,
  ADD COLUMN IF NOT EXISTS kernel_version text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS location jsonb DEFAULT null,
  ADD COLUMN IF NOT EXISTS last_ip inet;

-- Ensure device_config has all needed fields
ALTER TABLE public.device_config
  ADD COLUMN IF NOT EXISTS ui_update text,
  ADD COLUMN IF NOT EXISTS firmware_update text,
  ADD COLUMN IF NOT EXISTS factory_reset boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{}'::jsonb;

-- Create storage bucket for updates (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('updates', 'updates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for admin access to updates bucket
DROP POLICY IF EXISTS "Admins can upload to updates bucket" ON storage.objects;
CREATE POLICY "Admins can upload to updates bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'updates' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

DROP POLICY IF EXISTS "Admins can view updates bucket" ON storage.objects;
CREATE POLICY "Admins can view updates bucket" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'updates' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Admin view for device management
CREATE OR REPLACE VIEW public.vw_admin_devices AS
SELECT
  d.*,
  p.email as parent_email,
  p.full_name as parent_name,
  a.child_id as active_child_id,
  c.name as child_name,
  s.status as subscription_status,
  s.plan as subscription_plan,
  s.trial_ends_at,
  s.current_period_end,
  CASE 
    WHEN d.last_seen > NOW() - INTERVAL '5 minutes' THEN 'online'
    WHEN d.last_seen > NOW() - INTERVAL '1 hour' THEN 'idle'
    ELSE 'offline'
  END as status
FROM public.devices d
LEFT JOIN public.profiles p ON p.id = d.parent_id
LEFT JOIN public.device_child_assignments a ON a.device_id = d.id AND a.is_active = true
LEFT JOIN public.children c ON c.id = a.child_id
LEFT JOIN public.subscriptions s ON s.user_id = p.user_id;

-- Grant access to admin view
GRANT SELECT ON public.vw_admin_devices TO authenticated;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = _user_id AND is_admin = true
  );
$$;

COMMIT;