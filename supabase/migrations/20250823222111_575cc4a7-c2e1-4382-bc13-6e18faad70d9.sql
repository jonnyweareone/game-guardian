-- UUIDs + helpers
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- DEVICES: one row per physical box
create table if not exists public.devices (
  id                uuid primary key default gen_random_uuid(),
  device_id         text not null unique,                   -- e.g. GG-AB12-34CD
  device_code       text,                                   -- optional pairing code
  status            text not null default 'pending' check (status in ('pending','active','disabled')),
  owner_user        uuid references auth.users(id),         -- parent/household owner (filled on approval)
  labels            jsonb default '{}'::jsonb,              -- free-form tags
  hw_info           jsonb default '{}'::jsonb,              -- CPU, GPU, RAM, etc.
  activation_requested_at timestamptz default now(),
  activated_at      timestamptz,
  last_seen         timestamptz,
  config_version    integer default 0,
  notes             text
);

-- DEVICE CONFIGS: effective policy/manifest per device (latest row wins by version)
create table if not exists public.device_configs (
  id                uuid primary key default gen_random_uuid(),
  device_id         text not null,
  version           integer not null,
  effective_manifest jsonb not null default '{}'::jsonb,    -- full merged manifest the agent applies
  policies          jsonb not null default '{}'::jsonb,     -- feature toggles (NextDNS, redaction, app locks)
  apps              jsonb not null default '[]'::jsonb,     -- final resolved install set
  nextdns_profile   text,                                   -- optional
  created_at        timestamptz not null default now(),
  unique (device_id, version),
  foreign key (device_id) references public.devices(device_id) on delete cascade
);

-- HEARTBEATS: telemetry + alerts
create table if not exists public.device_heartbeats (
  id                bigserial primary key,
  device_id         text not null,
  ts                timestamptz not null default now(),
  agent_version     text,
  ip                inet,
  metrics           jsonb not null default '{}'::jsonb,     -- cpu%, mem%, temps, fps, etc.
  alerts            jsonb not null default '[]'::jsonb,
  foreign key (device_id) references public.devices(device_id) on delete cascade
);

-- Helpful indexes
create index if not exists idx_devices_device_id on public.devices(device_id);
create index if not exists idx_heartbeats_device_id_ts on public.device_heartbeats(device_id, ts desc);
create index if not exists idx_device_configs_device_id_version on public.device_configs(device_id, version desc);

-- RLS: Dashboard reads are user-scoped; Edge Functions write with service role
alter table public.devices enable row level security;
alter table public.device_configs enable row level security;
alter table public.device_heartbeats enable row level security;

-- Simple policies: owners can read their own devices/configs/heartbeats
drop policy if exists p_devices_select_owner on public.devices;
create policy p_devices_select_owner
  on public.devices for select
  using (owner_user = auth.uid());

drop policy if exists p_configs_select_owner on public.device_configs;
create policy p_configs_select_owner
  on public.device_configs for select
  using (exists (select 1 from public.devices d where d.device_id = device_configs.device_id and d.owner_user = auth.uid()));

drop policy if exists p_heartbeats_select_owner on public.device_heartbeats;
create policy p_heartbeats_select_owner
  on public.device_heartbeats for select
  using (exists (select 1 from public.devices d where d.device_id = device_heartbeats.device_id and d.owner_user = auth.uid()));