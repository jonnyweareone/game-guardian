-- Create household DNS configs table
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

-- Create child DNS profiles table  
CREATE TABLE public.child_dns_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  nextdns_profile_id text NOT NULL,
  profile_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

-- Enable RLS
ALTER TABLE public.child_dns_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Parents can manage their children's DNS profiles"
ON public.child_dns_profiles
FOR ALL
USING (is_parent_of_child(child_id))
WITH CHECK (is_parent_of_child(child_id));

-- Add trigger for updated_at
CREATE TRIGGER update_household_dns_configs_updated_at
BEFORE UPDATE ON public.household_dns_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_dns_profiles_updated_at  
BEFORE UPDATE ON public.child_dns_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();