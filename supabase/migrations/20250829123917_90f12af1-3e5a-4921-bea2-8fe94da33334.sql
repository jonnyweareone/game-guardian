-- Add Minecraft Launcher to app catalog
INSERT INTO public.app_catalog (
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
  'Minecraft Launcher',
  'Official Mojang Minecraft launcher via Flatpak',
  'Games',
  'flatpak',
  7,
  16,
  false,
  true
);