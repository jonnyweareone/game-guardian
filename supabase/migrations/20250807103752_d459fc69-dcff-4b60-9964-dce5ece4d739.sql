-- Create a demo user account in the auth.users table
-- This bypasses email validation issues by creating the user directly

-- Insert demo user into auth.users
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
  'demo-user-12345678-1234-1234-1234-123456789012',
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com',
  '$2a$10$rBKnbS4z4RqN1mLj0o2.dOzJQhW/0qA8KJ8jQ.H8M4yLKj5pJ6rGq', -- bcrypt hash for 'demopassword123'
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
  'demo-user-12345678-1234-1234-1234-123456789012',
  'Demo Parent',
  'demo@example.com',
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;