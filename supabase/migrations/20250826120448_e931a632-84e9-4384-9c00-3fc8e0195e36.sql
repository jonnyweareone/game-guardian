
-- 1) Inspect duplicates by device_code
select id, device_code, status, created_at
from public.devices
where device_code in (
  select device_code
  from public.devices
  group by device_code
  having count(*) > 1
)
order by device_code, created_at;

-- 2) Remove the stray row where the UUID was mistakenly stored as device_code
delete from public.devices
where device_code = '96514ce7-ff1d-4db7-afb2-239feb12e860';

-- 3) Add a unique constraint on device_code if it doesn't exist yet
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and indexname='devices_device_code_key'
  ) then
    alter table public.devices
      add constraint devices_device_code_key unique (device_code);
  end if;
end$$;
