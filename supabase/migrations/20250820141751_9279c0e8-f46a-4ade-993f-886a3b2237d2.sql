
-- 1) Update Harry Bean's DOB under the specified parent account
WITH parent AS (
  SELECT user_id
  FROM public.profiles
  WHERE lower(email) = lower('jonnyrobinson3107@yahoo.co.uk')
  LIMIT 1
), target_child AS (
  SELECT c.id
  FROM public.children c
  JOIN parent p ON c.parent_id = p.user_id
  WHERE c.name = 'Harry Bean'
  ORDER BY c.created_at ASC
  LIMIT 1
)
UPDATE public.children
SET dob = DATE '2017-05-20',
    updated_at = now()
WHERE id IN (SELECT id FROM target_child);

-- 2) Update academic rollover to Aug 1 (promote at end of July)
CREATE OR REPLACE FUNCTION public.uk_year_and_key_stage(p_dob date, p_ref date DEFAULT (now())::date)
RETURNS TABLE(year_group text, key_stage text)
LANGUAGE plpgsql
AS $function$
declare
  ref_year int := extract(year from p_ref);
  rollover date := make_date(ref_year, 8, 1); -- promotion happens Aug 1 (end of July)
  academic_ref date := case when p_ref >= rollover then rollover else make_date(ref_year - 1, 8, 1) end;
  age_on_rollover int := case when p_dob is null then null else (date_part('year', age(academic_ref, p_dob)))::int end;
  y int;
begin
  if p_dob is null then
    return query select null::text, null::text;
    return;
  end if;

  y := age_on_rollover - 4;

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
    return query select ('Year ' || y)::text, 
      (case when y between 7 and 9 then 'KS3'
            when y >= 10 then 'KS4'
            else null end)::text;
  end if;
end
$function$;

-- 3) Create triggers to keep education_profiles in sync with children.dob

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_children_ensure_edu_profile') THEN
    CREATE TRIGGER trg_children_ensure_edu_profile
    AFTER INSERT ON public.children
    FOR EACH ROW EXECUTE FUNCTION public._ensure_education_profile();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_children_sync_edu_from_dob') THEN
    CREATE TRIGGER trg_children_sync_edu_from_dob
    AFTER INSERT OR UPDATE OF dob ON public.children
    FOR EACH ROW EXECUTE FUNCTION public._sync_education_profile_from_dob();
  END IF;
END $$;

-- 4) Backfill/refresh education_profiles for all children using the new rollover logic
INSERT INTO public.education_profiles(child_id, year_group, key_stage)
SELECT c.id,
       t.year_group,
       t.key_stage
FROM public.children c
CROSS JOIN LATERAL public.uk_year_and_key_stage(c.dob, now()::date) AS t(year_group, key_stage)
ON CONFLICT (child_id) DO UPDATE
  SET year_group = EXCLUDED.year_group,
      key_stage = EXCLUDED.key_stage,
      updated_at = now();

-- Optional: quick check for Harry's computed values
-- SELECT c.name, c.dob, e.year_group, e.key_stage
-- FROM public.children c
-- JOIN public.education_profiles e ON e.child_id = c.id
-- WHERE c.name = 'Harry Bean'
--   AND c.parent_id = (SELECT user_id FROM public.profiles WHERE lower(email)=lower('jonnyrobinson3107@yahoo.co.uk') LIMIT 1);
