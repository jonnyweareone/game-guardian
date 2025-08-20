
-- 1) Extend book_pages with front-matter and chapter metadata, plus illustration placement
alter table public.book_pages
  add column if not exists is_front_matter boolean not null default false,
  add column if not exists chapter_index int,
  add column if not exists chapter_title text,
  add column if not exists illustration_caption text,
  add column if not exists illustration_inline_at int;

-- Helpful indexes for chapter navigation and filtering
create index if not exists idx_book_pages_book_chapter
  on public.book_pages (book_id, chapter_index);

create index if not exists idx_book_pages_book_front
  on public.book_pages (book_id, is_front_matter);
