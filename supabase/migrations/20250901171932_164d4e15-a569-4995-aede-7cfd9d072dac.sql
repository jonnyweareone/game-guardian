
-- 1) device_app_inventory table (idempotent)
create table if not exists public.device_app_inventory (
  device_id   text not null,
  app_id      text not null,
  name        text,
  version     text,
  source      text not null check (source in ('apt','snap','flatpak','web')),
  installed_by text not null default 'local' check (installed_by in ('web','local')),
  first_seen  timestamptz not null default now(),
  seen_at     timestamptz not null default now(),
  primary key (device_id, app_id)
);

-- Helpful index for lookups
create index if not exists idx_device_app_inventory_device on public.device_app_inventory(device_id);

-- 2) device_app_usage table (idempotent)
create table if not exists public.device_app_usage (
  id          bigserial primary key,
  device_id   text not null,
  app_id      text not null,
  name        text not null,
  started_at  timestamptz not null,
  ended_at    timestamptz not null,
  duration_s  integer not null,
  exit_code   integer,
  inserted_at timestamptz not null default now()
);

create index if not exists idx_device_app_usage_device on public.device_app_usage(device_id);
create index if not exists idx_device_app_usage_started on public.device_app_usage(started_at);

-- 3) Enable RLS
alter table public.device_app_inventory enable row level security;
alter table public.device_app_usage enable row level security;

-- 4) Parent SELECT policies (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'device_app_inventory' and policyname = 'parent_inventory_view'
  ) then
    create policy "parent_inventory_view"
      on public.device_app_inventory
      for select
      using (
        device_id in (
          select (d.id)::text from public.devices d where d.parent_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'device_app_usage' and policyname = 'parent_usage_view'
  ) then
    create policy "parent_usage_view"
      on public.device_app_usage
      for select
      using (
        device_id in (
          select (d.id)::text from public.devices d where d.parent_id = auth.uid()
        )
      );
  end if;
end $$;

-- 5) Auto-create a policy row when a new inventory row is inserted (idempotent)
-- Requires the ensure_policy_row() function, which already exists in this project.
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_inventory_ensure_policy'
  ) then
    create trigger trg_inventory_ensure_policy
      after insert on public.device_app_inventory
      for each row
      execute function public.ensure_policy_row();
  end if;
end $$;
