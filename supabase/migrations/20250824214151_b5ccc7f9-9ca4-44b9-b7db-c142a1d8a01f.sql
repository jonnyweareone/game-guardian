-- Create child_dns_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.child_dns_profiles (
  child_id uuid NOT NULL PRIMARY KEY REFERENCES public.children(id) ON DELETE CASCADE,
  nextdns_config text NOT NULL,
  bypass_reason text,
  school_hours_enabled boolean NOT NULL DEFAULT false,
  bypass_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.child_dns_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for parents to manage their children's DNS profiles
CREATE POLICY "Parents can view their children's dns profiles" 
ON public.child_dns_profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.children c 
  WHERE c.id = child_dns_profiles.child_id AND c.parent_id = auth.uid()
));

CREATE POLICY "Parents can insert their children's dns profiles" 
ON public.child_dns_profiles 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.children c 
  WHERE c.id = child_dns_profiles.child_id AND c.parent_id = auth.uid()
));

CREATE POLICY "Parents can update their children's dns profiles" 
ON public.child_dns_profiles 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.children c 
  WHERE c.id = child_dns_profiles.child_id AND c.parent_id = auth.uid()
));

-- Add updated_at trigger
CREATE TRIGGER update_child_dns_profiles_updated_at
  BEFORE UPDATE ON public.child_dns_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();