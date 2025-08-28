-- A) Mark stuck jobs as failed
update public.device_jobs
set status   = 'failed',
    attempts = coalesce(attempts,0) + 1
where device_id = 'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3'
  and status in ('queued','running');

-- B) Make sure VLC exists in the app catalog
insert into public.app_catalog (id, name, category, is_active, age_min, age_max, is_essential)
values ('vlc','VLC Media Player','Entertainment', true, 3, 18, false)
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    is_active = true;

-- C) Queue exactly one VLC install job
insert into public.device_jobs (device_id, type, status, payload)
values (
  'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3',
  'INSTALL_APP',
  'queued',
  jsonb_build_object('app_id','vlc')
);