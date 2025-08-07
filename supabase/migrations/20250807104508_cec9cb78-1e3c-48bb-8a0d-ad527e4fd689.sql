-- Delete the incorrectly created demo user and recreate properly
DELETE FROM public.profiles WHERE email = 'demo.parent@gamegiuardian.com';
DELETE FROM auth.users WHERE email = 'demo.parent@gamegiuardian.com';