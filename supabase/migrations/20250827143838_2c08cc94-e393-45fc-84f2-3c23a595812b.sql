
-- 1) Feedback table
create table if not exists public.livestream_feedback (
  id uuid primary key default gen_random_uuid(),
  speaker_slug text not null,
  comfortable boolean not null,
  notes text,
  preferred_intro text,
  headshot_path text,
  tech_notes text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Helpful index for filtering/admin views
create index if not exists livestream_feedback_speaker_slug_idx
  on public.livestream_feedback (speaker_slug);

-- Enable RLS; do not allow public writes directly
alter table public.livestream_feedback enable row level security;

-- Admins can read feedback
drop policy if exists "Admins can view livestream feedback" on public.livestream_feedback;
create policy "Admins can view livestream feedback"
  on public.livestream_feedback
  for select
  using (is_admin());

-- Note: We intentionally do NOT create an INSERT policy.
-- Inserts will be performed by a Supabase Edge Function using the service role key,
-- which bypasses RLS securely.

-- 2) Private storage bucket for uploaded headshots
insert into storage.buckets (id, name, public)
values ('livestream-headshots', 'livestream-headshots', false)
on conflict (id) do nothing;
