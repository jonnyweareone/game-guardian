-- Create demo admin user profile with email
INSERT INTO public.profiles (user_id, full_name, email, is_admin, created_at, updated_at)
VALUES 
  -- Using a fixed UUID for demo admin
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Demo Admin', 'admin@demo.guardian', true, now(), now())
ON CONFLICT (user_id) DO UPDATE SET
  is_admin = true,
  full_name = 'Demo Admin',
  email = 'admin@demo.guardian';