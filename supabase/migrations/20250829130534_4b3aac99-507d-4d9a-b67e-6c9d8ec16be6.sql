-- Step 1: Add new columns (idempotent)
ALTER TABLE app_catalog
  ADD COLUMN IF NOT EXISTS method   text CHECK (method IN ('flatpak','apt','snap','web')) DEFAULT 'flatpak',
  ADD COLUMN IF NOT EXISTS source   text DEFAULT 'flatpak',
  ADD COLUMN IF NOT EXISTS slug     text,
  ADD COLUMN IF NOT EXISTS tags     text[],
  ADD COLUMN IF NOT EXISTS enabled  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_tested_at timestamptz,
  ADD COLUMN IF NOT EXISTS launch_url text;

-- Step 2: Update existing Flatpak app records (by matching existing IDs)
UPDATE app_catalog SET method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE id IN (
  'com.valvesoftware.Steam', 'com.mojang.Minecraft', 'net.minetest.Minetest', 'net.lutris.Lutris',
  'org.supertuxproject.SuperTux', 'org.videolan.VLC', 'org.blender.Blender', 'org.gimp.GIMP',
  'org.inkscape.Inkscape', 'org.kde.kdenlive', 'org.kde.krita', 'org.audacityteam.Audacity',
  'org.freecadweb.FreeCAD', 'org.musescore.MuseScore', 'com.obsproject.Studio',
  'org.codeblocks.codeblocks', 'org.godotengine.Godot', 'com.visualstudio.code',
  'edu.mit.Scratch', 'net.ankiweb.Anki', 'org.kde.gcompris', 'org.kde.marble',
  'org.stellarium.Stellarium', 'org.geogebra.GeoGebra', 'com.discordapp.Discord',
  'com.spotify.Client', 'org.libreoffice.LibreOffice'
);

-- Step 3: Handle legacy IDs by updating their properties without changing ID
UPDATE app_catalog SET method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'steam%' AND id != 'com.valvesoftware.Steam';

UPDATE app_catalog SET method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'minecraft%' AND id != 'com.mojang.Minecraft';

UPDATE app_catalog SET method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'vlc%' AND id != 'org.videolan.VLC';

UPDATE app_catalog SET method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'discord' AND name NOT LIKE '%web%' AND id != 'com.discordapp.Discord';

-- Step 4: Mark web apps correctly
UPDATE app_catalog
SET method='web', source='web', launch_url='https://www.youtube.com/', enabled=true, verified=true
WHERE LOWER(name) IN ('youtube');

UPDATE app_catalog
SET method='web', source='web', launch_url='https://www.youtubekids.com/', enabled=true, verified=true
WHERE LOWER(name) IN ('youtube kids','youtube kids (web)');

UPDATE app_catalog
SET method='web', source='web', launch_url='https://discord.com/app', enabled=true, verified=true
WHERE LOWER(name) IN ('discord (web)');

-- Step 5: Clean up device_jobs references to use proper Flatpak IDs
UPDATE device_jobs SET payload = jsonb_set(payload, '{app_id}', '"com.mojang.Minecraft"'::jsonb)
WHERE payload->>'app_id' IN ('minecraft', 'Minecraft', 'Minecraft Launcher');

-- Step 6: Create public view for verified apps
CREATE OR REPLACE VIEW app_store_public AS
SELECT id, name, method, source, slug, icon_url, tags, launch_url, category, description, age_min, age_max, pegi_rating
FROM app_catalog
WHERE enabled = true AND verified = true;