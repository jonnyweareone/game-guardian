-- 20250819_children_dob_and_edu_autofill.sql

-- 1) Add DOB + a generated "birthday today" flag
alter table public.children
  add column if not exists dob date,
  add column if not exists birthday_today boolean generated always as
    ((extract(month from now()) = extract(month from dob) and extract(day from now()) = extract(day from dob))) stored;

create index if not exists idx_children_dob on public.children(dob);

-- 2) Helper function: compute UK Year Group + Key Stage from DOB and a reference date
create or replace function public.uk_year_and_key_stage(p_dob date, p_ref date default now()::date)
returns table (year_group text, key_stage text)
language plpgsql
as $$
declare
  -- academic year starts on Sep 1 (England/Wales). Adjust if you add region rules later.
  ref_year int := extract(year from p_ref);
  sep1 date := make_date(ref_year, 9, 1);
  academic_ref date := case when p_ref >= sep1 then sep1 else make_date(ref_year - 1, 9, 1) end;
  age_on_sep1 int := case when p_dob is null then null else (date_part('year', age(academic_ref, p_dob)))::int end;
  y int;
begin
  if p_dob is null then
    return query select null::text, null::text;
    return;
  end if;

  -- Reception=4, Y1=5, Y2=6, Y3=7, Y4=8, Y5=9, Y6=10 (age on Sep 1)
  y := age_on_sep1 - 4;
  if y < 0 then
    return query select 'Pre‑school'::text, null::text;
  elsif y = 0 then
    return query select 'Reception'::text, 'KS1'::text;
  elsif y between 1 and 6 then
    return query select ('Year ' || y)::text,
      (case when y in (1,2) then 'KS1'
            when y in (3,4,5,6) then 'KS2'
            else null end)::text;
  else
    -- beyond Y6—future KS3/KS4 handling can be added later
    return query select ('Year ' || y)::text, (case when y between 7 and 9 then 'KS3' when y >= 10 then 'KS4' else null end)::text;
  end if;
end $$;

-- 3) Trigger: when a child's DOB is set/changed, (up)date education_profiles.year_group/key_stage
create or replace function public._sync_education_profile_from_dob()
returns trigger language plpgsql as $$
declare yg text; ks text;
begin
  if (new.dob is distinct from old.dob) or (old is null and new.dob is not null) then
    select year_group, key_stage into yg, ks from public.uk_year_and_key_stage(new.dob, now()::date);
    insert into public.education_profiles(child_id, year_group, key_stage)
      values (new.id, yg, ks)
    on conflict (child_id) do update set year_group = excluded.year_group, key_stage = excluded.key_stage, updated_at = now();
  end if;
  return new;
end $$;

drop trigger if exists trg_children_sync_edu on public.children;
create trigger trg_children_sync_edu
after insert or update of dob on public.children
for each row execute function public._sync_education_profile_from_dob();