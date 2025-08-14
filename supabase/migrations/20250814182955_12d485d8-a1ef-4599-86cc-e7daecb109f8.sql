
-- Add verification codes table for email/SMS verification
CREATE TABLE public.notification_channel_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.notification_channels(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for verification codes
ALTER TABLE public.notification_channel_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own channel verifications"
  ON public.notification_channel_verifications
  FOR ALL
  USING (
    channel_id IN (
      SELECT id FROM public.notification_channels 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    channel_id IN (
      SELECT id FROM public.notification_channels 
      WHERE user_id = auth.uid()
    )
  );

-- Add cleanup function for expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.notification_channel_verifications
  WHERE expires_at < now();
$$;
