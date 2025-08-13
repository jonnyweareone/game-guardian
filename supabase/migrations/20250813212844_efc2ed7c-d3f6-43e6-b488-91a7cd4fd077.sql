-- ─────────────────────────────────────────────────────────
-- Child app selections + view + RLS
-- ─────────────────────────────────────────────────────────
create table if not exists public.child_app_selections (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  app_id text not null references public.app_catalog(id) on delete cascade,
  selected boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (child_id, app_id)
);

create or replace view public.v_child_app_selections as
select
  cas.id,
  cas.child_id,
  ac.id as app_id,
  ac.name as app_name,
  ac.description as app_description,
  ac.category as app_category,
  coalesce(ac.is_essential, false) as app_is_essential,
  coalesce(ac.pegi_rating, 0) as app_age_rating,
  coalesce(cas.selected, false) as selected
from public.app_catalog ac
left join public.child_app_selections cas
  on cas.app_id = ac.id;

alter table public.child_app_selections enable row level security;

create or replace function public.is_parent_of_child(_child uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.children c
    where c.id = _child and c.parent_id = auth.uid()
  );
$$;

create policy "parents read their child selections"
on public.child_app_selections for select
using (public.is_parent_of_child(child_id));

create policy "parents insert their child selections"
on public.child_app_selections for insert
with check (public.is_parent_of_child(child_id));

create policy "parents update their child selections"
on public.child_app_selections for update
using (public.is_parent_of_child(child_id))
with check (public.is_parent_of_child(child_id));

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_child_app_selections_touch on public.child_app_selections;
create trigger trg_child_app_selections_touch
before update on public.child_app_selections
for each row execute function public.touch_updated_at();