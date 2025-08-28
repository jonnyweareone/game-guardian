insert into public.app_catalog (id, name, category, package_type, package_id, is_active, warning_level)
values (
  'steam',
  'Steam',
  'Game',
  'apt',            -- use apt for Ubuntu/Pop (you could switch to flatpak: 'com.valvesoftware.Steam')
  'steam',
  true,
  1
)
on conflict (id) do update
  set name = excluded.name,
      category = excluded.category,
      package_type = excluded.package_type,
      package_id = excluded.package_id,
      is_active = true;