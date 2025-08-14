
-- Grant admin access to jonny@weareone1.co.uk
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'jonny@weareone1.co.uk';
