alter table public.device_app_inventory
  drop constraint if exists device_app_inventory_installed_by_check;

alter table public.device_app_inventory
  add constraint device_app_inventory_installed_by_check
  check (installed_by ~ '^[a-z0-9_-]{1,24}$');