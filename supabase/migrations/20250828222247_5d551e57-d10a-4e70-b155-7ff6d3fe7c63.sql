-- A) Cancel anything lingering (queued/running) for this device
update public.device_jobs
set status   = 'canceled',
    attempts = coalesce(attempts,0) + 1
where device_id = 'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3'
  and status in ('queued','running');

-- B) Make sure VLC exists in the app catalog (flatpak)
insert into public.app_catalog (id, name, category, package_type, package_id, is_active, warning_level)
values ('vlc','VLC','App','flatpak','org.videolan.VLC', true, 0)
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    package_type = excluded.package_type,
    package_id = excluded.package_id,
    is_active = true;

-- C) Queue exactly one VLC install job
insert into public.device_jobs (device_id, type, status, payload)
values (
  'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3',
  'INSTALL_APP',
  'queued',
  jsonb_build_object('app_id','vlc')
);