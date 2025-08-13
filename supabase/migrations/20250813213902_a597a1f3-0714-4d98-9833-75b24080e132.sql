-- 0) Add icon column if needed
ALTER TABLE app_catalog ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Helper: quick UPSERT helper (Postgres ON CONFLICT requires a PK/UNIQUE on id)
-- If your table doesn't have PRIMARY KEY (id), add it:
-- ALTER TABLE app_catalog ADD PRIMARY KEY (id);

-- 1) Ages 5–7
INSERT INTO app_catalog (id, name, description, category, platform, version, is_essential, pegi_rating, is_active, icon_url)
VALUES
('org.kde.gcompris','GCompris','Educational activities suite','education','flatpak',NULL,false,3,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.kde.gcompris.png'),
('org.tuxpaint.Tuxpaint','Tux Paint','Drawing for young kids','creativity','flatpak',NULL,false,3,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.tuxpaint.Tuxpaint.png'),
('org.tuxfamily.Tuxtype','Tux Typing','Learn typing with games','education','flatpak',NULL,false,3,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.tuxfamily.Tuxtype.png'),
('net.sourceforge.tuxmath','Tux Math','Math practice arcade','education','apt',NULL,false,3,true,NULL),
('org.kde.ktuberling','KTuberling','Simple puzzle game','games','flatpak',NULL,false,3,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.kde.ktuberling.png'),
('edu.mit.Scratch','Scratch Desktop','Block programming for kids','coding','flatpak',NULL,false,3,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/edu.mit.Scratch.png'),
('net.sourceforge.childsplay','Childsplay','Early learning activities','education','apt',NULL,false,3,true,NULL),
('org.supertuxproject.SuperTux','SuperTux','Side‑scrolling platformer','games','flatpak',NULL,false,3,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.supertuxproject.SuperTux.png'),
('org.frozen_bubble.FrozenBubble','Frozen Bubble','Classic bubble shooter','games','flatpak',NULL,false,3,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.frozen_bubble.FrozenBubble.png'),
('org.kde.marble','Marble','Interactive globe / atlas','education','flatpak',NULL,false,3,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.kde.marble.png')
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, category=EXCLUDED.category,
  platform=EXCLUDED.platform, version=EXCLUDED.version,
  is_essential=EXCLUDED.is_essential, pegi_rating=EXCLUDED.pegi_rating,
  is_active=EXCLUDED.is_active, icon_url=EXCLUDED.icon_url;

-- 2) Ages 8–13
INSERT INTO app_catalog (id, name, description, category, platform, version, is_essential, pegi_rating, is_active, icon_url)
VALUES
('net.minetest.Minetest','Minetest','Open sandbox (Minecraft‑like)','games','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/net.minetest.Minetest.png'),
('org.libreoffice.LibreOffice','LibreOffice','Office suite for schoolwork','productivity','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.libreoffice.LibreOffice.png'),
('org.kde.krita','Krita','Digital painting studio','creativity','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.kde.krita.png'),
('org.inkscape.Inkscape','Inkscape','Vector graphics editor','creativity','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.inkscape.Inkscape.png'),
('org.audacityteam.Audacity','Audacity','Audio recording & editing','creativity','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.audacityteam.Audacity.png'),
('org.musescore.MuseScore','MuseScore','Music notation & composition','creativity','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.musescore.MuseScore.png'),
('org.stellarium.Stellarium','Stellarium','Planetarium & astronomy','education','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.stellarium.Stellarium.png'),
('org.kde.kdenlive','Kdenlive','Non‑linear video editor','creativity','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.kde.kdenlive.png'),
('org.codeblocks.codeblocks','Code::Blocks','Intro C/C++ IDE','coding','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.codeblocks.codeblocks.png'),
('net.celestia.Space','Celestia','Space exploration simulator','education','flatpak',NULL,false,7,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/net.celestia.Space.png')
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, category=EXCLUDED.category,
  platform=EXCLUDED.platform, version=EXCLUDED.version,
  is_essential=EXCLUDED.is_essential, pegi_rating=EXCLUDED.pegi_rating,
  is_active=EXCLUDED.is_active, icon_url=EXCLUDED.icon_url;

-- 3) Ages 13–17
INSERT INTO app_catalog (id, name, description, category, platform, version, is_essential, pegi_rating, is_active, icon_url)
VALUES
('com.valvesoftware.Steam','Steam','PC games platform','games','flatpak',NULL,false,16,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/com.valvesoftware.Steam.png'),
('net.lutris.Lutris','Lutris','Game launcher & manager','games','flatpak',NULL,false,16,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/net.lutris.Lutris.png'),
('com.visualstudio.code','Visual Studio Code','Popular coding IDE','coding','flatpak',NULL,false,12,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/com.visualstudio.code.png'),
('org.blender.Blender','Blender','3D creation suite','creativity','flatpak',NULL,false,12,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.blender.Blender.png'),
('org.gimp.GIMP','GIMP','Advanced image editor','creativity','flatpak',NULL,false,12,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.gimp.GIMP.png'),
('com.obsproject.Studio','OBS Studio','Streaming & recording','creativity','flatpak',NULL,false,12,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/com.obsproject.Studio.png'),
('org.freecadweb.FreeCAD','FreeCAD','Parametric 3D CAD','creativity','flatpak',NULL,false,12,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.freecadweb.FreeCAD.png'),
('org.godotengine.Godot','Godot Engine','2D/3D game engine','coding','flatpak',NULL,false,12,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.godotengine.Godot.png'),
('org.geogebra.GeoGebra','GeoGebra','Math & science suite','education','flatpak',NULL,false,12,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/org.geogebra.GeoGebra.png'),
('net.ankiweb.Anki','Anki','Spaced‑repetition flashcards','education','flatpak',NULL,false,12,true,'https://flathub.org/repo/appstream/x86_64/icons/128x128/net.ankiweb.Anki.png')
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, category=EXCLUDED.category,
  platform=EXCLUDED.platform, version=EXCLUDED.version,
  is_essential=EXCLUDED.is_essential, pegi_rating=EXCLUDED.pegi_rating,
  is_active=EXCLUDED.is_active, icon_url=EXCLUDED.icon_url;

-- 4) Optional OWAs (parents can toggle)
INSERT INTO app_catalog (id, name, description, category, platform, version, is_essential, pegi_rating, is_active, icon_url)
VALUES
('owa:youtube-kids','YouTube Kids (Web)','Curated kids videos (web app)','media','owa',NULL,false,3,true,'https://www.gstatic.com/youtube/img/branding/youtubekids/favicon_144x144.png'),
('owa:discord','Discord (Web)','Friends & communities (parent‑controlled)','social','owa',NULL,false,16,true,'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico')
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, category=EXCLUDED.category,
  platform=EXCLUDED.platform, version=EXCLUDED.version,
  is_essential=EXCLUDED.is_essential, pegi_rating=EXCLUDED.pegi_rating,
  is_active=EXCLUDED.is_active, icon_url=EXCLUDED.icon_url;