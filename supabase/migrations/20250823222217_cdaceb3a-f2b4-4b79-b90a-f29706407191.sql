-- UUIDs + helpers
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- GUARDIAN DEVICES: one row per physical box
create table if not exists public.guardian_devices (
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

-- GUARDIAN DEVICE CONFIGS: effective policy/manifest per device (latest row wins by version)
create table if not exists public.guardian_device_configs (
  id                uuid primary key default gen_random_uuid(),
  device_id         text not null,
  version           integer not null,
  effective_manifest jsonb not null default '{}'::jsonb,    -- full merged manifest the agent applies
  policies          jsonb not null default '{}'::jsonb,     -- feature toggles (NextDNS, redaction, app locks)
  apps              jsonb not null default '[]'::jsonb,     -- final resolved install set
  nextdns_profile   text,                                   -- optional
  created_at        timestamptz not null default now(),
  unique (device_id, version),
  foreign key (device_id) references public.guardian_devices(device_id) on delete cascade
);

-- GUARDIAN HEARTBEATS: telemetry + alerts
create table if not exists public.guardian_device_heartbeats (
  id                bigserial primary key,
  device_id         text not null,
  ts                timestamptz not null default now(),
  agent_version     text,
  ip                inet,
  metrics           jsonb not null default '{}'::jsonb,     -- cpu%, mem%, temps, fps, etc.
  alerts            jsonb not null default '[]'::jsonb,
  foreign key (device_id) references public.guardian_devices(device_id) on delete cascade
);

-- Helpful indexes
create index if not exists idx_guardian_devices_device_id on public.guardian_devices(device_id);
create index if not exists idx_guardian_heartbeats_device_id_ts on public.guardian_device_heartbeats(device_id, ts desc);
create index if not exists idx_guardian_device_configs_device_id_version on public.guardian_device_configs(device_id, version desc);

-- RLS: Dashboard reads are user-scoped; Edge Functions write with service role
alter table public.guardian_devices enable row level security;
alter table public.guardian_device_configs enable row level security;
alter table public.guardian_device_heartbeats enable row level security;

-- Simple policies: owners can read their own devices/configs/heartbeats
drop policy if exists p_guardian_devices_select_owner on public.guardian_devices;
create policy p_guardian_devices_select_owner
  on public.guardian_devices for select
  using (owner_user = auth.uid());

drop policy if exists p_guardian_configs_select_owner on public.guardian_device_configs;
create policy p_guardian_configs_select_owner
  on public.guardian_device_configs for select
  using (exists (select 1 from public.guardian_devices d where d.device_id = guardian_device_configs.device_id and d.owner_user = auth.uid()));

drop policy if exists p_guardian_heartbeats_select_owner on public.guardian_device_heartbeats;
create policy p_guardian_heartbeats_select_owner
  on public.guardian_device_heartbeats for select
  using (exists (select 1 from public.guardian_devices d where d.device_id = guardian_device_heartbeats.device_id and d.owner_user = auth.uid()));