-- Create a demo user account with correct email using proper UUID
-- This bypasses email validation issues by creating the user directly

-- Insert demo user into auth.users with a valid UUID
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_sent_at
) VALUES (
  'f47b3c1e-90ee-4c8a-b3f9-1a2b3c4d5e6f',
  '00000000-0000-0000-0000-000000000000',
  'demo.parent@gamegiuardian.com',
  '$2a$10$rBKnbS4z4RqN1mLj0o2.dOzJQhW/0qA8KJ8jQ.H8M4yLKj5pJ6rGq',
  now(),
  now(),
  now(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Demo Parent"}',
  false,
  'authenticated',
  'authenticated',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding profile for the demo user
INSERT INTO public.profiles (
  id,
  user_id,
  full_name,
  email,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'f47b3c1e-90ee-4c8a-b3f9-1a2b3c4d5e6f',
  'Demo Parent',
  'demo.parent@gamegiuardian.com',
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;