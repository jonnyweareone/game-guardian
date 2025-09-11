-- Create table for safety guide registrations
CREATE TABLE public.safety_guide_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  parent_type TEXT,
  children_ages TEXT,
  primary_concerns TEXT,
  communication_preference TEXT DEFAULT 'email',
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.safety_guide_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for insertions (anyone can register)
CREATE POLICY "Anyone can register for safety guide" 
ON public.safety_guide_registrations 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view registrations
CREATE POLICY "Admins can view all registrations" 
ON public.safety_guide_registrations 
FOR SELECT 
USING (is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_safety_guide_registrations_updated_at
BEFORE UPDATE ON public.safety_guide_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();