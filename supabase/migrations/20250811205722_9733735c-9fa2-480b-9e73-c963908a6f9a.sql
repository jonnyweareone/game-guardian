
-- 1) Add device_jwt column to cache the latest minted token for polling
alter table public.devices
add column if not exists device_jwt text;

-- 2) Helpful index for fast polling by device_code
create index if not exists idx_devices_device_code on public.devices (device_code);
