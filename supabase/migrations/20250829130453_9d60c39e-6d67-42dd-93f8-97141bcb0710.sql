-- Extend schema (idempotent)
ALTER TABLE app_catalog
  ADD COLUMN IF NOT EXISTS method   text CHECK (method IN ('flatpak','apt','snap','web')) DEFAULT 'flatpak',
  ADD COLUMN IF NOT EXISTS source   text DEFAULT 'flatpak',
  ADD COLUMN IF NOT EXISTS slug     text,
  ADD COLUMN IF NOT EXISTS icon_url text,
  ADD COLUMN IF NOT EXISTS tags     text[],
  ADD COLUMN IF NOT EXISTS enabled  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_tested_at timestamptz,
  ADD COLUMN IF NOT EXISTS launch_url text;

-- Fix obvious dupes/aliases - update references first
UPDATE device_jobs SET payload = payload || jsonb_build_object('app_id', 'com.mojang.Minecraft') 
WHERE payload->>'app_id' IN ('minecraft', 'Minecraft', 'Minecraft Launcher');

-- Remove duplicate Minecraft entries, keep the canonical one
DELETE FROM app_catalog WHERE id IN (
  SELECT id FROM app_catalog WHERE name ILIKE 'minecraft%' AND id NOT IN (
    SELECT id FROM app_catalog WHERE name ILIKE 'minecraft%' ORDER BY created_at LIMIT 1
  )
);

-- Canonicalize known-good Flatpak IDs

-- Games / platforms
UPDATE app_catalog SET id='com.valvesoftware.Steam', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'steam%';

UPDATE app_catalog SET id='com.mojang.Minecraft', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'minecraft%';

UPDATE app_catalog SET id='net.minetest.Minetest', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'minetest%';

UPDATE app_catalog SET id='net.lutris.Lutris', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'lutris%';

UPDATE app_catalog SET id='org.supertuxproject.SuperTux', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'supertux%';

-- Media / creation
UPDATE app_catalog SET id='org.videolan.VLC', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'vlc%';

UPDATE app_catalog SET id='org.blender.Blender', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'blender%';

UPDATE app_catalog SET id='org.gimp.GIMP', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'gimp%';

UPDATE app_catalog SET id='org.inkscape.Inkscape', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'inkscape%';

UPDATE app_catalog SET id='org.kde.kdenlive', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'kdenlive%';

UPDATE app_catalog SET id='org.kde.krita', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'krita%';

UPDATE app_catalog SET id='org.audacityteam.Audacity', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'audacity%';

UPDATE app_catalog SET id='org.freecadweb.FreeCAD', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'freecad%';

UPDATE app_catalog SET id='org.musescore.MuseScore', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'musescore%';

UPDATE app_catalog SET id='com.obsproject.Studio', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'obs%';

-- Coding
UPDATE app_catalog SET id='codeblocks.codeblocks', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'code::blocks%';

UPDATE app_catalog SET id='org.godotengine.Godot', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'godot%';

UPDATE app_catalog SET id='com.visualstudio.code', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'visual studio code%';

UPDATE app_catalog SET id='edu.mit.Scratch', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'scratch%';

-- Education
UPDATE app_catalog SET id='net.ankiweb.Anki', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'anki%';

UPDATE app_catalog SET id='org.kde.gcompris', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'gcompris%';

UPDATE app_catalog SET id='org.kde.marble', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'marble%';

UPDATE app_catalog SET id='org.stellarium.Stellarium', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'stellarium%';

UPDATE app_catalog SET id='org.geogebra.GeoGebra', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'geogebra%';

-- Social / comms
UPDATE app_catalog SET id='com.discordapp.Discord', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'discord' AND name NOT LIKE '%web%';

UPDATE app_catalog SET id='com.spotify.Client', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'spotify%';

-- Productivity
UPDATE app_catalog SET id='org.libreoffice.LibreOffice', method='flatpak', source='flatpak', enabled=true, verified=true 
WHERE LOWER(name) LIKE 'libreoffice%';

-- Mark web apps correctly
UPDATE app_catalog
SET method='web', source='web', launch_url='https://www.youtube.com/', enabled=true, verified=true
WHERE LOWER(name) IN ('youtube');

UPDATE app_catalog
SET method='web', source='web', launch_url='https://www.youtubekids.com/', enabled=true, verified=true
WHERE LOWER(name) IN ('youtube kids','youtube kids (web)');

UPDATE app_catalog
SET method='web', source='web', launch_url='https://discord.com/app', enabled=true, verified=true
WHERE LOWER(name) IN ('discord (web)');

-- Hide anything unresolved
UPDATE app_catalog
SET enabled=false, verified=false
WHERE enabled IS DISTINCT FROM true OR verified IS DISTINCT FROM true;

-- Create public view for app store
CREATE OR REPLACE VIEW app_store_public AS
SELECT id, name, method, source, slug, icon_url, tags, launch_url, category, description, age_min, age_max, pegi_rating
FROM app_catalog
WHERE enabled = true AND verified = true;