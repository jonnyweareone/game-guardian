
-- 1) Prereq
create extension if not exists pgcrypto;

-- 2) Extend existing books table with the new fields (keep existing columns incl. ks)
alter table public.books add column if not exists source                text;
alter table public.books add column if not exists source_id             text;
alter table public.books add column if not exists authors               text[] default '{}'::text[];
alter table public.books add column if not exists description           text;
alter table public.books add column if not exists language              text default 'en';
alter table public.books add column if not exists subjects              text[] default '{}'::text[];
alter table public.books add column if not exists is_fiction            boolean default true;
alter table public.books add column if not exists level_tags            text[] default '{KS2}'::text[];
alter table public.books add column if not exists license               text default 'Public Domain';
alter table public.books add column if not exists cover_url             text;
alter table public.books add column if not exists download_epub_url     text;
alter table public.books add column if not exists download_pdf_url      text;
alter table public.books add column if not exists read_online_url       text;
alter table public.books add column if not exists has_audio             boolean default false;
alter table public.books add column if not exists pages                 integer;
alter table public.books add column if not exists published_year        integer;

-- Unique identity for upstream sources
create unique index if not exists books_source_source_id_uidx on public.books(source, source_id);

-- 3) KS2 topics and mapping tables
create table if not exists public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  phase text not null default 'KS2',
  subject_area text not null,
  topic text not null,
  slug text not null unique,
  keywords text[] default '{}'::text[]
);

create table if not exists public.book_topics (
  book_id uuid not null references public.books(id) on delete cascade,
  topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  primary key (book_id, topic_id)
);

-- RLS for topics (public read, admin manage)
alter table public.curriculum_topics enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='curriculum_topics' and policyname='topics_select_public') then
    create policy "topics_select_public" on public.curriculum_topics for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='curriculum_topics' and policyname='topics_admin_manage') then
    create policy "topics_admin_manage" on public.curriculum_topics for all using (is_admin()) with check (is_admin());
  end if;
end$$;

alter table public.book_topics enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='book_topics' and policyname='book_topics_select_public') then
    create policy "book_topics_select_public" on public.book_topics for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='book_topics' and policyname='book_topics_admin_manage') then
    create policy "book_topics_admin_manage" on public.book_topics for all using (is_admin()) with check (is_admin());
  end if;
end$$;

-- 4) Child bookshelf table matching UI status names + timeline logging into existing table
do $$ begin
  create type public.bookshelf_status as enum ('saved','reading','finished','abandoned');
exception when duplicate_object then null; end $$;

create table if not exists public.child_bookshelf (
  child_id uuid not null,
  book_id uuid not null references public.books(id) on delete cascade,
  status public.bookshelf_status not null default 'reading',
  progress numeric(5,2) default 0.0,
  last_location jsonb,
  started_at timestamptz default now(),
  finished_at timestamptz,
  saved_offline boolean default false,
  primary key (child_id, book_id)
);

-- RLS for bookshelf (parent-scoped)
alter table public.child_bookshelf enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='child_bookshelf' and policyname='parents_select_bookshelf') then
    create policy "parents_select_bookshelf" on public.child_bookshelf for select using (is_parent_of_child(child_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='child_bookshelf' and policyname='parents_insert_bookshelf') then
    create policy "parents_insert_bookshelf" on public.child_bookshelf for insert with check (is_parent_of_child(child_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='child_bookshelf' and policyname='parents_update_bookshelf') then
    create policy "parents_update_bookshelf" on public.child_bookshelf for update using (is_parent_of_child(child_id)) with check (is_parent_of_child(child_id));
  end if;
end$$;

-- Trigger to log to existing child_reading_timeline table
create or replace function public._log_bookshelf_to_timeline()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'UPDATE' then
    -- Status transitions
    if NEW.status is distinct from OLD.status then
      if NEW.status = 'reading' then
        insert into public.child_reading_timeline(child_id, book_id, event_type) values (NEW.child_id, NEW.book_id, 'started');
      elsif NEW.status = 'finished' then
        insert into public.child_reading_timeline(child_id, book_id, event_type) values (NEW.child_id, NEW.book_id, 'finished');
      end if;
    end if;

    -- Progress milestone (>= 5% delta)
    if coalesce(NEW.progress,0) - coalesce(OLD.progress,0) >= 5 then
      insert into public.child_reading_timeline(child_id, book_id, event_type) values (NEW.child_id, NEW.book_id, 'progress');
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_bookshelf_timeline on public.child_bookshelf;
create trigger trg_bookshelf_timeline
after update on public.child_bookshelf
for each row execute function public._log_bookshelf_to_timeline();

-- 5) Seed KS2 topics
insert into public.curriculum_topics (phase,subject_area,topic,slug,keywords) values
('KS2','English','Victorian/Edwardian Children''s Classics','english-victorian-edwardian','{victorian,edwardian,classics}'),
('KS2','English','Myths & Legends (Ancient Greece)','english-myths-ancient-greece','{myths,gods,heroes,olympus,greece}'),
('KS2','Science','Animals including Humans','science-animals-humans','{animals,habitats,food chains}'),
('KS2','Science','Earth & Space','science-earth-space','{planets,moon,solar system}'),
('KS2','History','Ancient Greece','history-ancient-greece','{athens,sparta,myths,olympics}'),
('KS2','History','Romans in Britain','history-romans-britain','{romans,empire,roads,hadrians wall}'),
('KS2','Geography','Rivers & Mountains','geo-rivers-mountains','{river,mountain,erosion,valley}')
on conflict (slug) do nothing;

-- 6) Seed KS2 books (category='fiction' so the Fiction rail populates; use ks='KS2')
insert into public.books
(source,source_id,title,author,authors,description,language,subjects,category,is_fiction,ks,age_min,age_max,level_tags,license,cover_url,download_epub_url,download_pdf_url,read_online_url,has_audio,pages,published_year)
values
('gutenberg','120','Alice''s Adventures in Wonderland','Lewis Carroll','{Lewis Carroll}','Alice falls into a fantastical world.','en','{Fantasy,Adventure,Logic,KS2}','fiction',true,'KS2',8,11,'{KS2,Year 4,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/120/pg120.cover.medium.jpg','https://www.gutenberg.org/ebooks/120.epub.images',null,'https://www.gutenberg.org/ebooks/120',false,200,1865),
('gutenberg','12','Through the Looking-Glass','Lewis Carroll','{Lewis Carroll}','Alice enters a mirror-world of puzzles and wordplay.','en','{Fantasy,Logic,KS2}','fiction',true,'KS2',8,11,'{KS2,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/12/pg12.cover.medium.jpg','https://www.gutenberg.org/ebooks/12.epub.images',null,'https://www.gutenberg.org/ebooks/12',false,220,1871),
('gutenberg','16','Peter Pan','J. M. Barrie','{J. M. Barrie}','The boy who wouldn’t grow up leads adventures in Neverland.','en','{Fantasy,Adventure,KS2}','fiction',true,'KS2',8,11,'{KS2,Year 4,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/16/pg16.cover.medium.jpg','https://www.gutenberg.org/ebooks/16.epub.images',null,'https://www.gutenberg.org/ebooks/16',false,200,1911),
('gutenberg','113','The Secret Garden','Frances Hodgson Burnett','{Frances Hodgson Burnett}','Mary discovers a hidden garden and helps revive it.','en','{Friendship,Nature,Victorians,KS2}','fiction',true,'KS2',8,11,'{KS2,Year 5,Year 6}','Public Domain','https://www.gutenberg.org/cache/epub/113/pg113.cover.medium.jpg','https://www.gutenberg.org/ebooks/113.epub.images',null,'https://www.gutenberg.org/ebooks/113',false,250,1911),
('gutenberg','1874','The Railway Children','E. Nesbit','{E. Nesbit}','Three siblings befriend railway workers and solve a family mystery.','en','{Family,Adventure,Edwardian,KS2}','fiction',true,'KS2',8,11,'{KS2,Year 4,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/1874/pg1874.cover.medium.jpg','https://www.gutenberg.org/ebooks/1874.epub.images',null,'https://www.gutenberg.org/ebooks/1874',false,240,1906),
('gutenberg','289','The Wind in the Willows','Kenneth Grahame','{Kenneth Grahame}','Riverbank adventures with Mole, Rat, Toad, and Badger.','en','{Animals,Friendship,Adventure,KS2}','fiction',true,'KS2',7,10,'{KS2,Year 3,Year 4}','Public Domain','https://www.gutenberg.org/cache/epub/289/pg289.cover.medium.jpg','https://www.gutenberg.org/ebooks/289.epub.images',null,'https://www.gutenberg.org/ebooks/289',false,220,1908),
('gutenberg','35997','The Jungle Book','Rudyard Kipling','{Rudyard Kipling}','Mowgli’s adventures among the animals of the Indian jungle.','en','{Animals,Adventure,India,KS2}','fiction',true,'KS2',8,11,'{KS2,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/35997/pg35997.cover.medium.jpg','https://www.gutenberg.org/ebooks/35997.epub.images',null,'https://www.gutenberg.org/ebooks/35997',false,200,1894),
('gutenberg','271','Black Beauty','Anna Sewell','{Anna Sewell}','A horse’s life told in his own voice—empathy and kindness.','en','{Animals,Empathy,Victorian,KS2}','fiction',true,'KS2',8,11,'{KS2,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/271/pg271.cover.medium.jpg','https://www.gutenberg.org/ebooks/271.epub.images',null,'https://www.gutenberg.org/ebooks/271',false,220,1877),
('gutenberg','45','Anne of Green Gables','L. M. Montgomery','{L. M. Montgomery}','Anne’s adventures in Avonlea—imagination and resilience.','en','{Family,Coming-of-age,KS2}','fiction',true,'KS2',9,11,'{KS2,Year 6}','Public Domain','https://www.gutenberg.org/cache/epub/45/pg45.cover.medium.jpg','https://www.gutenberg.org/ebooks/45.epub.images',null,'https://www.gutenberg.org/ebooks/45',false,320,1908),
('gutenberg','55','The Wonderful Wizard of Oz','L. Frank Baum','{L. Frank Baum}','Dorothy journeys to Oz; courage, friendship, and home.','en','{Fantasy,Adventure,KS2}','fiction',true,'KS2',8,11,'{KS2,Year 4,Year 5}','Public Domain','https://www.gutenberg.org/cache/epub/55/pg55.cover.medium.jpg','https://www.gutenberg.org/ebooks/55.epub.images',null,'https://www.gutenberg.org/ebooks/55',false,160,1900)
on conflict (source, source_id) do nothing;

-- 7) Map books to topics
with
b as (select id, source_id from public.books where source='gutenberg'),
t as (select id, slug from public.curriculum_topics)
insert into public.book_topics (book_id, topic_id)
select b1.id, t1.id
from b b1, t t1
where b1.source_id in ('113','1874','289','35997','271','45','16','55','120','12')
  and t1.slug = 'english-victorian-edwardian'
on conflict do nothing;

insert into public.book_topics (book_id, topic_id)
select b1.id, t1.id
from public.books b1
join public.curriculum_topics t1 on t1.slug='science-animals-humans'
where b1.source='gutenberg' and b1.source_id in ('35997','289','271')
on conflict do nothing;
