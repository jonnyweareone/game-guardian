-- Create activation_codes table for device activation flow
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_token text UNIQUE NOT NULL,
  code text NOT NULL,
  device_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  device_jwt text,
  profile_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes to speed up lookups
CREATE INDEX IF NOT EXISTS idx_activation_codes_code_status_created_at
  ON public.activation_codes (code, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activation_codes_token
  ON public.activation_codes (activation_token);
CREATE INDEX IF NOT EXISTS idx_activation_codes_device_id
  ON public.activation_codes (device_id);

-- Enable RLS (edge functions use service role to access this table)
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- UI manifests keyed by child profile (children.id)
CREATE TABLE IF NOT EXISTS public.ui_manifests (
  profile_id uuid PRIMARY KEY REFERENCES public.children(id) ON DELETE CASCADE,
  manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ui_manifests ENABLE ROW LEVEL SECURITY;

-- Parents can manage UI manifests for their children
CREATE POLICY "Parents can view ui manifests for their children"
  ON public.ui_manifests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = ui_manifests.profile_id AND c.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert ui manifests for their children"
  ON public.ui_manifests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = ui_manifests.profile_id AND c.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update ui manifests for their children"
  ON public.ui_manifests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = ui_manifests.profile_id AND c.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = ui_manifests.profile_id AND c.parent_id = auth.uid()
    )
  );

-- Keep updated_at fresh
CREATE TRIGGER update_ui_manifests_updated_at
BEFORE UPDATE ON public.ui_manifests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();