-- Enable RLS on the app_store_public view
ALTER VIEW app_store_public SET (security_barrier = true);

-- Since views don't support RLS directly, let's recreate app_store_public as a security definer function instead
DROP VIEW app_store_public;

-- Create a security definer function that returns verified apps
CREATE OR REPLACE FUNCTION get_verified_apps()
RETURNS TABLE(
  id text,
  name text, 
  method text,
  source text,
  slug text,
  icon_url text,
  tags text[],
  launch_url text,
  category text,
  description text,
  age_min integer,
  age_max integer,
  pegi_rating integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ac.id, ac.name, ac.method, ac.source, ac.slug, ac.icon_url, ac.tags, ac.launch_url, 
         ac.category, ac.description, ac.age_min, ac.age_max, ac.pegi_rating
  FROM app_catalog ac
  WHERE ac.enabled = true AND ac.verified = true;
$$;