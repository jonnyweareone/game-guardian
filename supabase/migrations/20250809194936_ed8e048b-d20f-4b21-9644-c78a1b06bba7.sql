-- Create WebAuthn credentials table
CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type TEXT,
  backed_up BOOLEAN NOT NULL DEFAULT false,
  transports TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id ON public.webauthn_credentials(user_id);

-- Enable RLS and policies
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own WebAuthn credentials"
  ON public.webauthn_credentials
  FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own WebAuthn credentials"
  ON public.webauthn_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own WebAuthn credentials"
  ON public.webauthn_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Timestamp trigger
DO $$ BEGIN
  CREATE TRIGGER update_webauthn_credentials_updated_at
  BEFORE UPDATE ON public.webauthn_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- Create WebAuthn challenges table
CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge TEXT NOT NULL,
  type TEXT NOT NULL, -- 'registration' | 'authentication'
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user_id ON public.webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user_used ON public.webauthn_challenges(user_id, used);

-- Enable RLS and policies
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own WebAuthn challenges"
  ON public.webauthn_challenges
  FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own WebAuthn challenges"
  ON public.webauthn_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own WebAuthn challenges"
  ON public.webauthn_challenges
  FOR UPDATE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- No DELETE policies to preserve auditability

-- Add helpful comments
COMMENT ON TABLE public.webauthn_credentials IS 'Passkey credentials registered by users for WebAuthn.';
COMMENT ON COLUMN public.webauthn_credentials.credential_id IS 'Base64URL-encoded credential ID (unique).';
COMMENT ON COLUMN public.webauthn_credentials.public_key IS 'Base64URL-encoded public key (COSE).';

COMMENT ON TABLE public.webauthn_challenges IS 'Ephemeral WebAuthn challenges for registration/authentication flows.';
COMMENT ON COLUMN public.webauthn_challenges.expires_at IS 'Challenge expiry; validated in edge function, not by DB constraints.';
