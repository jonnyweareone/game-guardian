-- Create household DNS configs table (the child_dns_profiles table already exists)
CREATE TABLE public.household_dns_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nextdns_config_id text NOT NULL,
  config_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id)
);

-- Enable RLS
ALTER TABLE public.household_dns_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own DNS config"
ON public.household_dns_configs
FOR ALL
USING (auth.uid() = parent_user_id)
WITH CHECK (auth.uid() = parent_user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_household_dns_configs_updated_at
BEFORE UPDATE ON public.household_dns_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();