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

-- 2) Grant select to authenticated users (device JWTs)
grant select on public.device_app_inventory_view to authenticated;

-- 3) Add RLS policy to device_app_inventory table to control access
alter table public.device_app_inventory enable row level security;

-- 4) Policy: devices can read their own inventory
create policy device_can_read_own_inventory_table
on public.device_app_inventory
for select
to authenticated
using ( device_id = jwt_device_id_text() );

-- 5) Policy: parents can read inventory for their devices  
create policy parent_can_read_device_inventory
on public.device_app_inventory
for select
to authenticated
using ( device_id::uuid IN ( 
  SELECT d.id FROM devices d WHERE d.parent_id = auth.uid() 
));