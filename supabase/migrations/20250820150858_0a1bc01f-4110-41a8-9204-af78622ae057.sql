-- 0) Ensure the core KS2 topics exist (skip if already created)
insert into public.curriculum_topics (phase,subject_area,topic,slug,keywords) values
('KS2','Science','Earth & Space','science-earth-space','{planets,moon,solar system}'),
('KS2','Science','Electricity','science-electricity','{circuit,battery,bulb,switch}'),
('KS2','Science','Light','science-light','{light,reflection,shadows}'),
('KS2','Science','States of Matter','science-states-of-matter','{solid,liquid,gas,evaporation,condensation}'),
('KS2','Science','Sound','science-sound','{sound,vibration,pitch,volume}'),
('KS2','Science','Animals including Humans','science-animals-humans','{animals,habitats,food chains}'),
('KS2','History','Ancient Greece','history-ancient-greece','{athens,sparta,myths,olympics}'),
('KS2','History','Romans in Britain','history-romans-britain','{romans,empire,roads,hadrians wall}'),
('KS2','History','Ancient Egypt','history-ancient-egypt','{pharaoh,pyramids,nile,mummies}'),
('KS2','History','Stone Age to Iron Age (Britain)','history-stone-to-iron','{prehistory,bronze,iron,hunter gatherer}'),
('KS2','Geography','Rivers & Mountains','geo-rivers-mountains','{river,mountain,erosion,valley}'),
('KS2','Geography','Europe & World Regions','geo-europe-world','{continents,countries,climate}')
on conflict (slug) do nothing;

-- 1) Seed KS2 NON‑FICTION (Public Domain; covers + EPUB/read links)
insert into public.books
(source,source_id,title,authors,description,language,subjects,category,is_fiction,level_tags,age_min,age_max,license,cover_url,download_epub_url,download_pdf_url,read_online_url,has_audio,pages,published_year)
values
-- SCIENCE
('gutenberg','5726','The Fairy‑Land of Science','{Arabella B. Buckley}',
 'Wonder‑based science talks covering light, heat, sound, forces and more.',
 'en','{Science,Light,Forces,States of Matter,KS2}','Science',false,'{KS2}',8,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/5726/pg5726.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/5726.epub.images', null, 'https://www.gutenberg.org/ebooks/5726', false, null, 1879),

('gutenberg','47021','The Story of the Solar System','{George F. Chambers}',
 'Accessible tour of the Sun, planets and comets for general readers.',
 'en','{Science,Astronomy,Planets,KS2}','Science',false,'{KS2}',8,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/47021/pg47021.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/47021.epub.images', null, 'https://www.gutenberg.org/ebooks/47021', false, null, 1901),

('gutenberg','22766','Electricity for Boys','{James Slough Zerbe}',
 'Hands‑on basics of electricity with simple apparatus and explanations.',
 'en','{Science,Electricity,Circuits,KS2}','Science',false,'{KS2,Upper KS2}',9,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/22766/pg22766.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/22766.epub.images', null, 'https://www.gutenberg.org/ebooks/22766', false, null, 1914),

('gutenberg','45331','Electricity and Its Everyday Uses','{John F. Woodhull}',
 'Everyday applications of electricity explained for young learners.',
 'en','{Science,Electricity,Everyday Science,KS2}','Science',false,'{KS2,Upper KS2}',9,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/45331/pg45331.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/45331.epub.images', null, 'https://www.gutenberg.org/ebooks/45331', false, null, 1911),

-- HISTORY
('gutenberg','23495','The Story of the Greeks','{H. A. Guerber}',
 'Short narrative chapters introducing Ancient Greek history for children.',
 'en','{History,Ancient Greece,KS2}','History',false,'{KS2}',8,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/23495/pg23495.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/23495.epub.images', null, 'https://www.gutenberg.org/ebooks/23495', false, null, 1896),

('gutenberg','66147','The Story of Rome (Told to Boys and Girls)','{Mary MacGregor}',
 'Readable introduction to Rome from founding to empire, child‑friendly.',
 'en','{History,Rome,KS2}','History',false,'{KS2}',8,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/66147/pg66147.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/66147.epub.images', null, 'https://www.gutenberg.org/ebooks/66147', false, null, 1911),

('archive','ourislandstoryhi00marsuoft','Our Island Story: A History of England for Boys and Girls','{H. E. Marshall}',
 'Story‑based survey of British history; teacher‑guided extracts suit KS2.',
 'en','{History,Britain,UK Regions,KS2}','History',false,'{KS2}',8,11,'Public Domain',
 'https://archive.org/services/img/ourislandstoryhi00marsuoft',
 null, null, 'https://archive.org/details/ourislandstoryhi00marsuoft', false, null, 1905),

('gutenberg','15663','Ancient Egypt','{George Rawlinson,Arthur Gilman}',
 'Overview of Ancient Egyptian civilization, geography and culture.',
 'en','{History,Ancient Egypt,KS2}','History',false,'{KS2,Upper KS2}',9,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/15663/pg15663.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/15663.epub.images', null, 'https://www.gutenberg.org/ebooks/15663', false, null, 1886),

-- GEOGRAPHY
('gutenberg','22799','Ancient Egypt (Peeps at Many Lands)','{James Baikie}',
 'Richly illustrated "Peeps" volume touching Nile, pyramids, child‑life.',
 'en','{Geography,Egypt,Ancient Egypt,KS2}','Geography',false,'{KS2}',8,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/22799/pg22799.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/22799.epub.images', null, 'https://www.gutenberg.org/ebooks/22799', false, null, 1910),

('gutenberg','24676','Peeps at Many Lands: Norway','{A. F. Mockler‑Ferryman}',
 'Landforms, fjords, culture; good tie‑in to Vikings & mountains.',
 'en','{Geography,Norway,Mountains,Fjords,KS2}','Geography',false,'{KS2}',8,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/24676/pg24676.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/24676.epub.images', null, 'https://www.gutenberg.org/ebooks/24676', false, null, 1905),

('gutenberg','30064','Peeps at Many Lands: Burma','{R. Talbot Kelly}',
 'Physical geography (rivers), regions and people; atlas‑friendly extracts.',
 'en','{Geography,Rivers,Asia,KS2}','Geography',false,'{KS2}',8,11,'Public Domain',
 'https://www.gutenberg.org/cache/epub/30064/pg30064.cover.medium.jpg',
 'https://www.gutenberg.org/ebooks/30064.epub.images', null, 'https://www.gutenberg.org/ebooks/30064', false, null, 1908)
on conflict (source,source_id) do nothing;

-- 2) Map books → KS2 topics
with b as (select id, source_id from public.books where source in ('gutenberg','archive')),
     t as (select id, slug from public.curriculum_topics)

-- Science mappings
insert into public.book_topics (book_id, topic_id)
select b.id, t.id from b join t on t.slug='science-light'           where b.source_id='5726'
union all
select b.id, t.id from b join t on t.slug='science-states-of-matter' where b.source_id='5726'
union all
select b.id, t.id from b join t on t.slug='science-earth-space'      where b.source_id='47021'
union all
select b.id, t.id from b join t on t.slug='science-electricity'      where b.source_id in ('22766','45331')
on conflict do nothing;

-- History mappings
insert into public.book_topics (book_id, topic_id)
select b.id, t.id from b join t on t.slug='history-ancient-greece'   where b.source_id='23495'
union all
select b.id, t.id from b join t on t.slug='history-romans-britain'   where b.source_id='66147'
union all
select b.id, t.id from b join t on t.slug='history-ancient-egypt'    where b.source_id in ('15663','22799')
union all
select b.id, t.id from b join t on t.slug='history-stone-to-iron'    where b.source_id='ourislandstoryhi00marsuoft'
on conflict do nothing;

-- Geography mappings
insert into public.book_topics (book_id, topic_id)
select b.id, t.id from b join t on t.slug='geo-rivers-mountains'     where b.source_id in ('24676','30064')
union all
select b.id, t.id from b join t on t.slug='geo-europe-world'         where b.source_id in ('24676','30064','22799')
on conflict do nothing;