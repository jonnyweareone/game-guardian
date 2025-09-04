
-- 1) Create child_dns_profiles to store mapping from our children to NextDNS profiles
create table if not exists public.child_dns_profiles (
  child_id uuid primary key references public.children(id) on delete cascade,
  nextdns_profile_id text not null unique,
  profile_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Enable RLS and add policies so parents can manage only their children's data
alter table public.child_dns_profiles enable row level security;

-- View own children's profiles
create policy "Parents can view their children's DNS profiles"
  on public.child_dns_profiles
  for select
  using (public.is_parent_of_child(child_id));

-- Insert for own children
create policy "Parents can create DNS profiles for their children"
  on public.child_dns_profiles
  for insert
  with check (public.is_parent_of_child(child_id));

-- Update for own children
create policy "Parents can update DNS profiles for their children"
  on public.child_dns_profiles
  for update
  using (public.is_parent_of_child(child_id))
  with check (public.is_parent_of_child(child_id));

-- 3) Keep updated_at current on updates
drop trigger if exists trg_cdp_touch_updated_at on public.child_dns_profiles;
create trigger trg_cdp_touch_updated_at
before update on public.child_dns_profiles
for each row execute function public.update_updated_at_column();
