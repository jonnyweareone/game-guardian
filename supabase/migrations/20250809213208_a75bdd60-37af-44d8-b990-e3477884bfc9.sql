-- Create device_apps table
create table if not exists public.device_apps (
  id uuid primary key default gen_random_uuid(),
  device_code text not null,
  app_id text not null,
  name text not null,
  description text,
  platform text,
  icon_url text,
  category text check (category in ('Game','App')),
  pegi_rating int,
  pegi_descriptors text[],
  publisher text,
  website text,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  unique (device_code, app_id)
);

-- Create app_policies table
create table if not exists public.app_policies (
  id uuid primary key default gen_random_uuid(),
  subject_type text check (subject_type in ('device','child')) not null,
  subject_id uuid not null,
  app_id text not null,
  allowed boolean default true,
  daily_limit_minutes int,
  enforced_hours int4range[],
  updated_at timestamptz default now(),
  unique (subject_type, subject_id, app_id)
);

-- Enable Row Level Security
alter table public.device_apps enable row level security;
alter table public.app_policies enable row level security;

-- RLS Policies for device_apps
-- Parents can view apps for their own devices
create policy if not exists "Parents can view device apps"
  on public.device_apps
  for select
  using (
    exists (
      select 1 from public.devices d
      where d.device_code = device_apps.device_code
        and d.parent_id = auth.uid()
    )
  );

-- Guardian devices can insert app catalog rows (also covers upserts via service role)
create policy if not exists "Guardian devices can insert device apps"
  on public.device_apps
  for insert
  with check (
    exists (
      select 1 from public.devices d
      where d.device_code = device_apps.device_code
        and d.is_active = true
    )
  );

-- Allow updates for active devices (useful if not using service role)
create policy if not exists "Guardian devices can update device apps"
  on public.device_apps
  for update
  using (
    exists (
      select 1 from public.devices d
      where d.device_code = device_apps.device_code
        and d.is_active = true
    )
  )
  with check (
    exists (
      select 1 from public.devices d
      where d.device_code = device_apps.device_code
        and d.is_active = true
    )
  );

-- RLS Policies for app_policies
-- Parents can view their own app policies (by device or child subject)
create policy if not exists "Parents can view app policies"
  on public.app_policies
  for select
  using (
    (
      subject_type = 'device' and exists (
        select 1 from public.devices d
        where d.id = app_policies.subject_id
          and d.parent_id = auth.uid()
      )
    )
    or
    (
      subject_type = 'child' and exists (
        select 1 from public.children c
        where c.id = app_policies.subject_id
          and c.parent_id = auth.uid()
      )
    )
  );

-- Parents can insert their own app policies
create policy if not exists "Parents can insert app policies"
  on public.app_policies
  for insert
  with check (
    (
      subject_type = 'device' and exists (
        select 1 from public.devices d
        where d.id = app_policies.subject_id
          and d.parent_id = auth.uid()
      )
    )
    or
    (
      subject_type = 'child' and exists (
        select 1 from public.children c
        where c.id = app_policies.subject_id
          and c.parent_id = auth.uid()
      )
    )
  );

-- Parents can update their own app policies
create policy if not exists "Parents can update app policies"
  on public.app_policies
  for update
  using (
    (
      subject_type = 'device' and exists (
        select 1 from public.devices d
        where d.id = app_policies.subject_id
          and d.parent_id = auth.uid()
      )
    )
    or
    (
      subject_type = 'child' and exists (
        select 1 from public.children c
        where c.id = app_policies.subject_id
          and c.parent_id = auth.uid()
      )
    )
  )
  with check (
    (
      subject_type = 'device' and exists (
        select 1 from public.devices d
        where d.id = app_policies.subject_id
          and d.parent_id = auth.uid()
      )
    )
    or
    (
      subject_type = 'child' and exists (
        select 1 from public.children c
        where c.id = app_policies.subject_id
          and c.parent_id = auth.uid()
      )
    )
  );

-- Trigger to maintain updated_at on app_policies
create trigger if not exists update_app_policies_updated_at
before update on public.app_policies
for each row execute function public.update_updated_at_column();