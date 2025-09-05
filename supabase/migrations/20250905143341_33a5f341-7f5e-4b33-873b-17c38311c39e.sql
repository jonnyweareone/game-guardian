-- Create demo admin user profile
-- First ensure we have a demo user in auth.users if not already exists
-- We'll create a profile entry for easy demo login

INSERT INTO public.profiles (user_id, full_name, is_admin, created_at, updated_at)
VALUES 
  -- Using a fixed UUID for demo admin
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Demo Admin', true, now(), now())
ON CONFLICT (user_id) DO UPDATE SET
  is_admin = true,
  full_name = 'Demo Admin';

-- Create a simple demo admin auth function for easy access
CREATE OR REPLACE FUNCTION public.demo_admin_login()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return the demo admin user ID for easy reference
  RETURN '00000000-0000-0000-0000-000000000001';
END;
$$;

GRANT EXECUTE ON FUNCTION public.demo_admin_login() TO anon, authenticated;