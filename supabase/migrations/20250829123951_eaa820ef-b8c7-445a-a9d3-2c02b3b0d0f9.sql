-- Add Minecraft Launcher to app catalog with explicit ID
INSERT INTO public.app_catalog (
  id,
  name, 
  description, 
  category, 
  platform,
  age_min, 
  age_max, 
  is_essential, 
  is_active
)
VALUES (
  gen_random_uuid(),
  'Minecraft Launcher',
  'Official Mojang Minecraft launcher via Flatpak',
  'Games',
  'flatpak',
  7,
  16,
  false,
  true
);