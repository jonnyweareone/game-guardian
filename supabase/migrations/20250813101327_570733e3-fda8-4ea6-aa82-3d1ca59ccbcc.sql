
-- Create a secure RPC to assign a child to a device without duplicate-key errors
-- and with clear ownership checks and idempotent behavior.

create or replace function public.rpc_assign_child_to_device(
  _device uuid,
  _child uuid,
  _is_active boolean default false
)
returns public.device_child_assignments
language plpgsql
security definer
set search_path to ''
as $function$
declare
  _p uuid;
  _result public.device_child_assignments;
begin
  -- Verify the caller owns the device
  select parent_id into _p from public.devices where id = _device;
  if _p is null or _p <> auth.uid() then
    raise exception 'not allowed';
  end if;

  -- Verify the child belongs to the same parent
  if not exists (
    select 1 from public.children c
    where c.id = _child and c.parent_id = _p
  ) then
    raise exception 'child not found or not owned by parent';
  end if;

  -- Upsert assignment (idempotent). If it exists, update is_active and updated_at.
  insert into public.device_child_assignments (device_id, child_id, is_active)
  values (_device, _child, coalesce(_is_active, false))
  on conflict (device_id, child_id)
  do update set
    is_active = excluded.is_active,
    updated_at = now()
  returning * into _result;

  return _result;
end;
$function$;
