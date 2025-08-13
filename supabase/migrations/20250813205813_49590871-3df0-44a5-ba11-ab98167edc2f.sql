-- Create app_catalog table to store master list of all available apps
CREATE TABLE public.app_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon_url TEXT,
  website TEXT,
  publisher TEXT,
  version TEXT,
  platform TEXT,
  pegi_rating INTEGER,
  pegi_descriptors TEXT[],
  age_min INTEGER DEFAULT 0,
  age_max INTEGER DEFAULT 18,
  is_essential BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_catalog ENABLE ROW LEVEL SECURITY;

-- Create policies for app catalog
CREATE POLICY "Anyone can view active apps" 
ON public.app_catalog 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage apps" 
ON public.app_catalog 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_catalog_updated_at
BEFORE UPDATE ON public.app_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial app data to replace the mock data
INSERT INTO public.app_catalog (id, name, description, category, icon_url, pegi_rating, pegi_descriptors, age_min, age_max, is_essential, platform, publisher) VALUES
('minecraft', 'Minecraft', 'Build, explore and survive in infinite worlds', 'Games', '/lovable-uploads/minecraft-icon.png', 7, ARRAY['Mild Violence']::TEXT[], 7, 18, false, 'PC', 'Mojang Studios'),
('roblox', 'Roblox', 'Imagine, create, and share experiences with friends', 'Games', '/lovable-uploads/roblox-icon.png', 7, ARRAY['Mild Violence', 'Users Interact Online']::TEXT[], 7, 18, false, 'PC', 'Roblox Corporation'),
('discord', 'Discord', 'Voice, video and text communication', 'Communication', '/lovable-uploads/discord-icon.png', 13, ARRAY['Users Interact Online']::TEXT[], 13, 18, false, 'PC', 'Discord Inc.'),
('spotify', 'Spotify', 'Music streaming service', 'Entertainment', '/lovable-uploads/spotify-icon.png', 3, ARRAY[]::TEXT[], 3, 18, false, 'PC', 'Spotify AB'),
('youtube', 'YouTube', 'Video sharing platform', 'Entertainment', '/lovable-uploads/youtube-icon.png', 13, ARRAY['Users Interact Online']::TEXT[], 13, 18, false, 'Web', 'Google'),
('chrome', 'Google Chrome', 'Web browser', 'Utilities', '/lovable-uploads/chrome-icon.png', 3, ARRAY[]::TEXT[], 3, 18, true, 'PC', 'Google'),
('settings', 'Settings', 'System configuration', 'System', '/lovable-uploads/settings-icon.png', 3, ARRAY[]::TEXT[], 3, 18, true, 'System', 'Guardian AI');

-- Create ui_themes table for managing device UI themes
CREATE TABLE public.ui_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  theme_data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ui_themes ENABLE ROW LEVEL SECURITY;

-- Create policies for ui_themes
CREATE POLICY "Admins can manage UI themes" 
ON public.ui_themes 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ui_themes_updated_at
BEFORE UPDATE ON public.ui_themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default theme
INSERT INTO public.ui_themes (name, description, theme_data, is_default) VALUES
('Default Guardian Theme', 'Standard Guardian OS theme with dark mode support', 
 '{"colors": {"primary": "210 40% 98%", "background": "224 71% 4%", "accent": "216 34% 17%"}, "layout": {"appRailPosition": "left", "maxAppsPerRow": 4}}', 
 true);