-- Create identity_verifications table to track KYC status and verified address
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  id_check_completed BOOLEAN NOT NULL DEFAULT false,
  likeness_check_completed BOOLEAN NOT NULL DEFAULT false,
  verified_address_line1 TEXT,
  verified_address_line2 TEXT,
  verified_city TEXT,
  verified_state TEXT,
  verified_postal_code TEXT,
  verified_country TEXT,
  address_lat DOUBLE PRECISION,
  address_lng DOUBLE PRECISION,
  provider TEXT,
  provider_reference TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own verification records
CREATE POLICY IF NOT EXISTS "Users can view their own verification"
ON public.identity_verifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own verification"
ON public.identity_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own verification"
ON public.identity_verifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_identity_verifications_updated_at ON public.identity_verifications;
CREATE TRIGGER trg_identity_verifications_updated_at
BEFORE UPDATE ON public.identity_verifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Optional: table to log location match checks
CREATE TABLE IF NOT EXISTS public.location_match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id UUID NOT NULL,
  matched BOOLEAN NOT NULL,
  distance_meters INTEGER,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.location_match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own location checks"
ON public.location_match_results
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own location checks"
ON public.location_match_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);
