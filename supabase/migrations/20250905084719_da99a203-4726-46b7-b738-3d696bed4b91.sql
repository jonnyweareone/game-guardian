-- Create device_bootstrap_secrets table for optional perpetual token refresh
CREATE TABLE IF NOT EXISTS public.device_bootstrap_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code text NOT NULL UNIQUE,
  refresh_secret_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

-- Enable RLS
ALTER TABLE public.device_bootstrap_secrets ENABLE ROW LEVEL SECURITY;

-- No public policies needed - this is managed by service role functions only

-- Add comment
COMMENT ON TABLE public.device_bootstrap_secrets IS 'Stores refresh secrets set by devices before activation for perpetual JWT rotation';