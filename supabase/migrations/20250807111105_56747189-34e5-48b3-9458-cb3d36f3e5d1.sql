-- Create demo profile first
INSERT INTO public.profiles (id, user_id, full_name, email) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Demo Parent', 'demo@gameguardian.ai');

-- Insert demo children using the demo parent ID from profiles
INSERT INTO public.children (id, parent_id, name, age, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Ethan', 12, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Lily', 9, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Jake', 14, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jake');