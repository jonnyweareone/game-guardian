-- 1) Helper to read jwt claims
create or replace function public.jwt_sub() returns text
language sql stable as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'sub','')
$$;

-- 2) Inventory RPC: device_code + rows[] -> upsert by (device_id, app_id)
create or replace function public.upsert_device_app_inventory(
  device_code text,
  rows jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id uuid;
  v_now timestamptz := now();
begin
  -- SECURITY: ensure caller's JWT matches the device_code being written
  if jwt_sub() is distinct from device_code then
    raise exception 'jwt sub does not match device_code' using errcode = '28000';
  end if;

  select id into v_device_id from public.devices where devices.device_code = upsert_device_app_inventory.device_code;
  if v_device_id is null then
    raise exception 'device not found for code %', device_code using errcode = '22000';
  end if;

  insert into public.device_app_inventory
    (device_id, app_id, name, version, source, installed_by, first_seen, seen_at)
  select
    v_device_id,
    r->>'app_id',
    r->>'name',
    nullif(r->>'version',''),
    case lower(r->>'source')
      when 'apt' then 'apt'
      when 'snap' then 'snap'
      when 'flatpak' then 'flatpak'
      when 'desktop' then 'desktop'
      when 'appimage' then 'appimage'
      else 'desktop'
    end,
    left(coalesce(r->>'installed_by','agent'), 24),
    coalesce((r->>'first_seen')::timestamptz, v_now),
    coalesce((r->>'seen_at')::timestamptz, v_now)
  from jsonb_array_elements(rows) as r
  where (r->>'app_id') is not null and (r->>'name') is not null
  on conflict (device_id, app_id) do update
    set name         = excluded.name,
        version      = excluded.version,
        source       = excluded.source,
        installed_by = excluded.installed_by,
        seen_at      = excluded.seen_at;
end $$;

-- 3) Usage RPC: device_code + rows[] -> insert usage rows
create or replace function public.insert_device_app_usage(
  device_code text,
  rows jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id uuid;
begin
  if jwt_sub() is distinct from device_code then
    raise exception 'jwt sub does not match device_code' using errcode = '28000';
  end if;

  select id into v_device_id from public.devices where devices.device_code = insert_device_app_usage.device_code;
  if v_device_id is null then
    raise exception 'device not found for code %', device_code using errcode = '22000';
  end if;

  insert into public.device_app_usage
    (device_id, app_id, name, started_at, ended_at, duration_s, exit_code)
  select
    v_device_id,
    r->>'app_id',
    r->>'name',
    (r->>'started_at')::timestamptz,
    (r->>'ended_at')::timestamptz,
    (r->>'duration_s')::int,
    nullif(r->>'exit_code','')::int
  from jsonb_array_elements(rows) as r
  where (r->>'app_id') is not null and (r->>'name') is not null
    and (r->>'started_at') is not null and (r->>'ended_at') is not null;
end $$;

-- 4) Allow device JWTs (authenticated role) to call only these RPCs
grant execute on function public.upsert_device_app_inventory(text,jsonb) to authenticated;
grant execute on function public.insert_device_app_usage(text,jsonb) to authenticated;