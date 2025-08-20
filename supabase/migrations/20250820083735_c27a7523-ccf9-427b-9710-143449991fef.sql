
-- 1) Enum for redemption status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'reward_status') then
    create type reward_status as enum ('requested','approved','rejected','fulfilled');
  end if;
end$$;

-- 2) Wallets table: one wallet per child
create table if not exists public.wallets (
  child_id uuid primary key references public.children(id) on delete cascade,
  coins int not null default 0,
  updated_at timestamptz default now()
);

-- Keep updated_at fresh
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_wallets_updated_at'
  ) then
    create trigger set_wallets_updated_at
    before update on public.wallets
    for each row execute function public.update_updated_at_column();
  end if;
end$$;

-- 3) Parent rewards catalog (per parent)
create table if not exists public.parent_rewards (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null,
  name text not null,
  description text,
  coin_cost int not null check (coin_cost >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4) Reward redemptions
create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.parent_rewards(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  status reward_status not null default 'requested',
  note text,
  coins_spent int,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid
);

create index if not exists idx_reward_redemptions_child_created_at
  on public.reward_redemptions(child_id, created_at desc);

-- 5) RLS enablement
alter table public.wallets enable row level security;
alter table public.parent_rewards enable row level security;
alter table public.reward_redemptions enable row level security;

-- Policies:
-- wallets: parents can view/update wallets of their children
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'wallets' and policyname = 'wallets_parent_select') then
    create policy wallets_parent_select on public.wallets
      for select using (exists (
        select 1 from public.children c
        where c.id = wallets.child_id and c.parent_id = auth.uid()
      ));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'wallets' and policyname = 'wallets_parent_update') then
    create policy wallets_parent_update on public.wallets
      for update using (exists (
        select 1 from public.children c
        where c.id = wallets.child_id and c.parent_id = auth.uid()
      ));
  end if;

  -- No INSERT policy on wallets (created via SECURITY DEFINER function)
end$$;

-- parent_rewards: only owner can CRUD
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'parent_rewards' and policyname = 'parent_rewards_owner_select') then
    create policy parent_rewards_owner_select on public.parent_rewards
      for select using (auth.uid() = parent_user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'parent_rewards' and policyname = 'parent_rewards_owner_insert') then
    create policy parent_rewards_owner_insert on public.parent_rewards
      for insert with check (auth.uid() = parent_user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'parent_rewards' and policyname = 'parent_rewards_owner_update') then
    create policy parent_rewards_owner_update on public.parent_rewards
      for update using (auth.uid() = parent_user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'parent_rewards' and policyname = 'parent_rewards_owner_delete') then
    create policy parent_rewards_owner_delete on public.parent_rewards
      for delete using (auth.uid() = parent_user_id);
  end if;
end$$;

-- reward_redemptions: parents can read/manage where they own the child or the reward
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'reward_redemptions' and policyname = 'redemptions_parent_select') then
    create policy redemptions_parent_select on public.reward_redemptions
      for select using (
        exists (select 1 from public.children c where c.id = reward_redemptions.child_id and c.parent_id = auth.uid())
        or
        exists (select 1 from public.parent_rewards pr where pr.id = reward_redemptions.reward_id and pr.parent_user_id = auth.uid())
      );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'reward_redemptions' and policyname = 'redemptions_parent_insert') then
    create policy redemptions_parent_insert on public.reward_redemptions
      for insert with check (
        exists (select 1 from public.children c where c.id = reward_redemptions.child_id and c.parent_id = auth.uid())
        and
        exists (select 1 from public.parent_rewards pr where pr.id = reward_redemptions.reward_id and pr.parent_user_id = auth.uid())
      );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'reward_redemptions' and policyname = 'redemptions_parent_update') then
    create policy redemptions_parent_update on public.reward_redemptions
      for update using (
        exists (select 1 from public.children c where c.id = reward_redemptions.child_id and c.parent_id = auth.uid())
        or
        exists (select 1 from public.parent_rewards pr where pr.id = reward_redemptions.reward_id and pr.parent_user_id = auth.uid())
      );
  end if;

  -- No DELETE policy initially
end$$;

-- 6) Helper + RPCs (SECURITY DEFINER with explicit schema refs)
create or replace function public.ensure_wallet(p_child uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.wallets(child_id, coins)
  values (p_child, 0)
  on conflict (child_id) do nothing;
end$$;

-- Parent requests a reward for their child
create or replace function public.request_reward(p_child uuid, p_reward uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_id uuid;
begin
  -- Caller must be parent of the child
  if not exists (
    select 1 from public.children c
    where c.id = p_child and c.parent_id = auth.uid()
  ) then
    raise exception 'not allowed';
  end if;

  -- Reward must be active and owned by caller
  if not exists (
    select 1 from public.parent_rewards pr
    where pr.id = p_reward and pr.parent_user_id = auth.uid() and pr.active = true
  ) then
    raise exception 'reward inactive or not found';
  end if;

  perform public.ensure_wallet(p_child);

  insert into public.reward_redemptions(reward_id, child_id, status, note)
  values (p_reward, p_child, 'requested', p_note)
  returning id into v_id;

  return v_id;
end$$;

-- Parent decides on a redemption and deducts coins if approved
create or replace function public.decide_reward(p_redemption uuid, p_approve boolean, p_decided_by uuid, p_note text default null)
returns table(ok boolean, coins_left int)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_child uuid;
  v_reward uuid;
  v_cost int;
begin
  select rr.child_id, rr.reward_id
  into v_child, v_reward
  from public.reward_redemptions rr
  where rr.id = p_redemption
  for update;

  if v_child is null then
    return query select false, null;
  end if;

  -- Caller must own the child or the reward
  if not (
    exists (select 1 from public.children c where c.id = v_child and c.parent_id = auth.uid())
    or
    exists (select 1 from public.parent_rewards pr where pr.id = v_reward and pr.parent_user_id = auth.uid())
  ) then
    raise exception 'not allowed';
  end if;

  if not p_approve then
    update public.reward_redemptions
      set status = 'rejected',
          decided_at = now(),
          decided_by = p_decided_by,
          note = coalesce(p_note, note)
    where id = p_redemption;

    return query select true, (select coins from public.wallets where child_id = v_child);
  end if;

  select pr.coin_cost into v_cost
  from public.parent_rewards pr
  where pr.id = v_reward and pr.active = true;

  if v_cost is null then
    return query select false, (select coins from public.wallets where child_id = v_child);
  end if;

  perform public.ensure_wallet(v_child);

  update public.wallets
    set coins = coins - v_cost, updated_at = now()
    where child_id = v_child and coins >= v_cost;

  if not found then
    -- insufficient funds
    return query select false, (select coins from public.wallets where child_id = v_child);
  end if;

  update public.reward_redemptions
    set status = 'approved',
        coins_spent = v_cost,
        decided_at = now(),
        decided_by = p_decided_by,
        note = coalesce(p_note, note)
    where id = p_redemption;

  return query select true, (select coins from public.wallets where child_id = v_child);
end$$;
