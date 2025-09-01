-- 1) View that joins inventory to device_code (no UUIDs leaked)
create or replace view public.device_app_inventory_view as
select
  d.device_code,
  i.app_id,
  i.name,
  i.version,
  i.source,
  i.installed_by,
  i.first_seen,
  i.seen_at
from public.device_app_inventory i
join public.devices d on d.id = i.device_id::uuid;

-- 2) Lock it down with RLS
alter table public.device_app_inventory_view enable row level security;

-- 3) Policy: a device can only see its own rows (jwt.sub = device_code)
create policy device_can_read_own_inventory
on public.device_app_inventory_view
for select
to authenticated
using ( current_setting('request.jwt.claims', true)::jsonb->>'sub' = device_code );

-- 4) Grant select to authenticated users (device JWTs)
grant select on public.device_app_inventory_view to authenticated;