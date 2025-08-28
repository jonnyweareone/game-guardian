-- Enable Row Level Security on app_catalog table
ALTER TABLE public.app_catalog ENABLE ROW LEVEL SECURITY;

-- Allow public read access to app catalog (needed for the app store UI)
CREATE POLICY "Public read access to app catalog" 
ON public.app_catalog 
FOR SELECT 
USING (true);

-- Only admins can manage app catalog entries
CREATE POLICY "Admins can manage app catalog" 
ON public.app_catalog 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());