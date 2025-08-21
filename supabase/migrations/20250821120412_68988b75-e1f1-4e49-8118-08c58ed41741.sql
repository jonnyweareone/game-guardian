
-- 1) NOVA INSIGHTS (parents can read; inserts expected via edge/service role)
create table if not exists public.nova_insights (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  child_id uuid not null,
  scope text not null check (scope in ('chunk','session')),
  insight jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.nova_insights enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='nova_insights' and policyname='parents_select_nova_insights'
  ) then
    create policy parents_select_nova_insights
      on public.nova_insights
      for select
      using (is_parent_of_child(child_id));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='nova_insights' and policyname='admins_manage_nova_insights'
  ) then
    create policy admins_manage_nova_insights
      on public.nova_insights
      for all
      using (is_admin())
      with check (is_admin());
  end if;
end $$;

-- 2) LISTENING STATE: ensure updated_at auto-bumps
create or replace function public._bump_listen_updated()
returns trigger
language plpgsql
as $fn$
begin 
  new.updated_at = now();
  return new;
end
$fn$;

drop trigger if exists trg_bump_listen on public.child_listening_state;
create trigger trg_bump_listen
before update on public.child_listening_state
for each row execute function public._bump_listen_updated();

-- 3) NOVA GAMES TABLES (matching current frontend usage)
create table if not exists public.nova_games_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  book_id uuid not null,
  game_code text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  score int not null default 0
);

create table if not exists public.nova_games_rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.nova_games_sessions(id) on delete cascade,
  round_no int not null,
  target_word text not null,
  success boolean,
  seconds int,
  created_at timestamptz not null default now(),
  unique(session_id, round_no)
);

alter table public.nova_games_sessions enable row level security;
alter table public.nova_games_rounds enable row level security;

-- Parents manage sessions (ensuring they own the child)
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='nova_games_sessions' and policyname='parents_manage_sessions'
  ) then
    create policy parents_manage_sessions
      on public.nova_games_sessions
      for all
      using (is_parent_of_child(child_id))
      with check (is_parent_of_child(child_id));
  end if;
end $$;

-- Parents manage rounds via the session's child
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='nova_games_rounds' and policyname='parents_manage_rounds'
  ) then
    create policy parents_manage_rounds
      on public.nova_games_rounds
      for all
      using (exists (
        select 1 from public.nova_games_sessions s
        where s.id = nova_games_rounds.session_id
          and is_parent_of_child(s.child_id)
      ))
      with check (exists (
        select 1 from public.nova_games_sessions s
        where s.id = nova_games_rounds.session_id
          and is_parent_of_child(s.child_id)
      ));
  end if;
end $$;

create index if not exists idx_nova_games_sessions_child on public.nova_games_sessions(child_id);
create index if not exists idx_nova_games_rounds_session on public.nova_games_rounds(session_id);

-- 4) REWARDS + TIMELINE TRIGGERS (functions already exist; bind them)
-- Award coins on bookshelf progress and finishing
drop trigger if exists trg_award_on_bookshelf_progress on public.child_bookshelf;
create trigger trg_award_on_bookshelf_progress
after insert or update on public.child_bookshelf
for each row execute function public._award_on_bookshelf_progress();

-- Log timeline entries on bookshelf updates (start/progress/finish)
drop trigger if exists trg_log_bookshelf_to_timeline on public.child_bookshelf;
create trigger trg_log_bookshelf_to_timeline
after update on public.child_bookshelf
for each row execute function public._log_bookshelf_to_timeline();
