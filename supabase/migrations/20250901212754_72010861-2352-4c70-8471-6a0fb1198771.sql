
-- Create a view to expose usage keyed by device_code (no UUIDs in the UI/diagnostics)
create or replace view public.device_app_usage_view as
select
  d.device_code,
  u.app_id,
  u.name,
  u.started_at,
  u.ended_at,
  u.duration_s,
  u.exit_code
from public.device_app_usage u
join public.devices d
  on d.id::text = u.device_id;

-- Grant read permissions to authenticated role (RLS still enforced on underlying tables)
grant select on public.device_app_usage_view to authenticated;

-- Keep reads fast
create index if not exists idx_device_app_usage_device_time
  on public.device_app_usage (device_id, started_at desc);
