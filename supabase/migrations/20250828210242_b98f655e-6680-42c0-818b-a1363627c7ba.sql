INSERT INTO public.app_catalog (
  id, 
  name, 
  category, 
  description,
  publisher,
  platform,
  type,
  age_min,
  age_max,
  is_active,
  is_essential
)
VALUES (
  'steam',
  'Steam',
  'Gaming Platform',
  'Digital distribution platform for video games - Flatpak version',
  'Valve Corporation',
  'desktop',
  'platform',
  13,  -- Steam's age rating
  18,
  true,
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  publisher = EXCLUDED.publisher,
  platform = EXCLUDED.platform,
  type = EXCLUDED.type,
  is_active = true;