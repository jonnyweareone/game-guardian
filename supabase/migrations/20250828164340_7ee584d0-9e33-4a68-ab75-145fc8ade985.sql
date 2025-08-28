
-- 1) Add safety/guide fields to app_catalog (additive, safe)
alter table public.app_catalog
  add column if not exists rating_system text,
  add column if not exists age_rating text,
  add column if not exists has_ugc boolean default false,
  add column if not exists has_chat boolean default false,
  add column if not exists monetization text,
  add column if not exists warning_level int default 0,
  add column if not exists warning_notes text,
  add column if not exists guide_url text;

-- 2) Ensure ON CONFLICT (id) works
-- Create a unique index on (id) only if there isn't already a PK/unique on that column
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'app_catalog'
      and c.contype in ('p','u')
      and (
        select array_agg(att.attname order by att.attnum)
        from unnest(c.conkey) as k(attnum)
        join pg_attribute att on att.attrelid = c.conrelid and att.attnum = k.attnum
      ) = array['id']
  ) then
    create unique index if not exists app_catalog_id_uidx on public.app_catalog(id);
  end if;
end
$$;

-- 3) Seed/Upsert popular apps by id (non-destructive: upsert)
-- Roblox
insert into public.app_catalog (
  id, name, category, icon_url, rating_system, age_rating,
  has_ugc, has_chat, monetization, warning_level, warning_notes, guide_url, is_active
) values (
  'roblox',
  'Roblox',
  'Game',
  'https://upload.wikimedia.org/wikipedia/commons/1/1f/Roblox_logo_2022.svg',
  'PEGI',
  '7',
  true,
  true,
  'in-app purchases',
  2,
  'User-generated content; online chat may expose children to strangers',
  'https://yourdomain.com/guides/roblox-safety',
  true
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  icon_url = excluded.icon_url,
  rating_system = excluded.rating_system,
  age_rating = excluded.age_rating,
  has_ugc = excluded.has_ugc,
  has_chat = excluded.has_chat,
  monetization = excluded.monetization,
  warning_level = excluded.warning_level,
  warning_notes = excluded.warning_notes,
  guide_url = excluded.guide_url,
  is_active = true;

-- YouTube
insert into public.app_catalog (
  id, name, category, icon_url, rating_system, age_rating,
  has_ugc, has_chat, monetization, warning_level, warning_notes, guide_url, is_active
) values (
  'youtube',
  'YouTube',
  'Streaming',
  'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg',
  'PEGI',
  '12',
  true,
  false,
  'ads, recommendations',
  2,
  'Videos may include age-inappropriate content; recommendation system not child-safe',
  'https://yourdomain.com/guides/youtube-safety',
  true
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  icon_url = excluded.icon_url,
  rating_system = excluded.rating_system,
  age_rating = excluded.age_rating,
  has_ugc = excluded.has_ugc,
  has_chat = excluded.has_chat,
  monetization = excluded.monetization,
  warning_level = excluded.warning_level,
  warning_notes = excluded.warning_notes,
  guide_url = excluded.guide_url,
  is_active = true;

-- Discord
insert into public.app_catalog (
  id, name, category, icon_url, rating_system, age_rating,
  has_ugc, has_chat, monetization, warning_level, warning_notes, guide_url, is_active
) values (
  'discord',
  'Discord',
  'Social',
  'https://upload.wikimedia.org/wikipedia/commons/9/98/Discord_logo.svg',
  'PEGI',
  '12',
  true,
  true,
  'free with optional Nitro subscription',
  3,
  'Unmoderated voice/text chat; exposure to strangers and NSFW servers',
  'https://yourdomain.com/guides/discord-safety',
  true
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  icon_url = excluded.icon_url,
  rating_system = excluded.rating_system,
  age_rating = excluded.age_rating,
  has_ugc = excluded.has_ugc,
  has_chat = excluded.has_chat,
  monetization = excluded.monetization,
  warning_level = excluded.warning_level,
  warning_notes = excluded.warning_notes,
  guide_url = excluded.guide_url,
  is_active = true;

-- TikTok
insert into public.app_catalog (
  id, name, category, icon_url, rating_system, age_rating,
  has_ugc, has_chat, monetization, warning_level, warning_notes, guide_url, is_active
) values (
  'tiktok',
  'TikTok',
  'Social',
  'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
  'PEGI',
  '12',
  true,
  true,
  'ads, influencer sponsorships',
  3,
  'Short-form videos; unmoderated content can include adult themes, challenges, or harmful trends',
  'https://yourdomain.com/guides/tiktok-safety',
  true
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  icon_url = excluded.icon_url,
  rating_system = excluded.rating_system,
  age_rating = excluded.age_rating,
  has_ugc = excluded.has_ugc,
  has_chat = excluded.has_chat,
  monetization = excluded.monetization,
  warning_level = excluded.warning_level,
  warning_notes = excluded.warning_notes,
  guide_url = excluded.guide_url,
  is_active = true;

-- Fortnite
insert into public.app_catalog (
  id, name, category, icon_url, rating_system, age_rating,
  has_ugc, has_chat, monetization, warning_level, warning_notes, guide_url, is_active
) values (
  'fortnite',
  'Fortnite',
  'Game',
  'https://upload.wikimedia.org/wikipedia/commons/0/0e/FortniteLogo.svg',
  'PEGI',
  '12',
  false,
  true,
  'in-app purchases, battle passes',
  2,
  'Cartoon violence; online chat and multiplayer can expose children to strangers',
  'https://yourdomain.com/guides/fortnite-safety',
  true
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  icon_url = excluded.icon_url,
  rating_system = excluded.rating_system,
  age_rating = excluded.age_rating,
  has_ugc = excluded.has_ugc,
  has_chat = excluded.has_chat,
  monetization = excluded.monetization,
  warning_level = excluded.warning_level,
  warning_notes = excluded.warning_notes,
  guide_url = excluded.guide_url,
  is_active = true;

-- Minecraft
insert into public.app_catalog (
  id, name, category, icon_url, rating_system, age_rating,
  has_ugc, has_chat, monetization, warning_level, warning_notes, guide_url, is_active
) values (
  'minecraft',
  'Minecraft',
  'Game',
  'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',
  'PEGI',
  '7',
  true,
  true,
  'optional purchases (skins, realms)',
  2,
  'Creative and educational but includes online multiplayer and chat; user-generated servers vary in safety',
  'https://yourdomain.com/guides/minecraft-safety',
  true
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  icon_url = excluded.icon_url,
  rating_system = excluded.rating_system,
  age_rating = excluded.age_rating,
  has_ugc = excluded.has_ugc,
  has_chat = excluded.has_chat,
  monetization = excluded.monetization,
  warning_level = excluded.warning_level,
  warning_notes = excluded.warning_notes,
  guide_url = excluded.guide_url,
  is_active = true;

-- WhatsApp
insert into public.app_catalog (
  id, name, category, icon_url, rating_system, age_rating,
  has_ugc, has_chat, monetization, warning_level, warning_notes, guide_url, is_active
) values (
  'whatsapp',
  'WhatsApp',
  'Messaging',
  'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
  'PEGI',
  '12',
  true,
  true,
  'free; optional business/ads integration',
  2,
  'Encrypted chat; not designed for under 13s; risk of grooming and sharing personal images',
  'https://yourdomain.com/guides/whatsapp-safety',
  true
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  icon_url = excluded.icon_url,
  rating_system = excluded.rating_system,
  age_rating = excluded.age_rating,
  has_ugc = excluded.has_ugc,
  has_chat = excluded.has_chat,
  monetization = excluded.monetization,
  warning_level = excluded.warning_level,
  warning_notes = excluded.warning_notes,
  guide_url = excluded.guide_url,
  is_active = true;
