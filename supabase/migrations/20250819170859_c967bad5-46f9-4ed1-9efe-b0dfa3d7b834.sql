
-- 20250819_gn_seed.sql
-- Topics
insert into public.topics(name, tags, global) values
  ('RMS Titanic', array['history','local_history','beyond_living_memory'], false),
  ('Great Fire of London', array['history','local_history'], false),
  ('Romans in Britain', array['history','romans'], true),
  ('Ancient Egypt', array['history','egypt'], true),
  ('Solar System', array['science','space'], true),
  ('Forces & Magnets', array['science','forces'], true),
  ('Plants & Pollination', array['science','biology'], true),
  ('Times Tables', array['maths','arithmetic'], true),
  ('Fractions & Shapes', array['maths','geometry'], true),
  ('Geometry Hunt', array['maths','geometry'], true)
on conflict do nothing;

-- Demo schools (Belfast + London)
insert into public.schools(name,nation,la_name,urn_or_seed,postcode,lat,lng) values
  ('Demo Primary Belfast','Northern Ireland','Belfast EA','NI-DEMO','BT1 5GS',54.597,-5.93),
  ('Demo Primary London','England','City of London','ENG-DEMO','EC2V 7HH',51.514,-0.094)
on conflict do nothing;

-- Local topics (geo-suggest)
with t as (select id from public.topics where name='RMS Titanic' limit 1)
insert into public.local_topics(jurisdiction, la_name, topic_id, lat, lng, radius_m)
select 'Northern Ireland','Belfast EA', t.id, 54.608, -5.912, 30000 from t
on conflict do nothing;

with t as (select id from public.topics where name='Great Fire of London' limit 1)
insert into public.local_topics(jurisdiction, la_name, topic_id, lat, lng, radius_m)
select 'England','City of London', t.id, 51.513, -0.091, 20000 from t
on conflict do nothing;

-- Store items (cosmetics)
insert into public.items(type,name,rarity,cost_coins,meta) values
  ('outfit','Explorer Outfit','common',0,'{}'),
  ('hat','Titanic Crew Cap','rare',0,'{}'),
  ('backpack','Rocket Backpack','rare',0,'{}'),
  ('pet','Scarab Pet','epic',0,'{}'),
  ('emote','Nova Dance','rare',0,'{}'),
  ('outfit','Time Traveller Suit','legendary',0,'{}')
on conflict do nothing;

-- Challenge templates (KS2 MVP examples)
insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'core','Times Tables arcade (x2,x3,x4)',7,10,50,20,0, t.id,'{"scene":"Maths_Arcade","mode":"tables_2_4"}'::jsonb
from public.topics t where t.name='Times Tables';

insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'core','Roman Fort build: roads & walls',7,15,60,20,0, t.id,'{"scene":"Romans_Fort","pieces":12}'::jsonb
from public.topics t where t.name='Romans in Britain';

insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'core','Egypt Dig Site: find 3 artifacts',7,15,60,20,0, t.id,'{"scene":"Egypt_Dig","artifacts":3}'::jsonb
from public.topics t where t.name='Ancient Egypt';

insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'core','Space Tour: planets quiz (part 1)',7,12,60,20,0, t.id,'{"scene":"Space_Outpost","quiz":"planets_1"}'::jsonb
from public.topics t where t.name='Solar System';

insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'core','Titanic Shipyard scavenger hunt',7,15,60,20,0, t.id,'{"scene":"Titanic_Yard","find":6}'::jsonb
from public.topics t where t.name='RMS Titanic';

insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'core','Forces Lab: pulleys & levers',7,12,60,20,0, t.id,'{"scene":"Forces_Lab","stations":3}'::jsonb
from public.topics t where t.name='Forces & Magnets';

insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'core','Fractions marketplace (halves/quarters)',7,10,50,20,0, t.id,'{"scene":"Fractions_Market","set":"basic"}'::jsonb
from public.topics t where t.name='Fractions & Shapes';

insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'core','Plants & Pollination game',7,10,50,20,0, t.id,'{"scene":"Greenhouse","bees":5}'::jsonb
from public.topics t where t.name='Plants & Pollination';

-- Discovery example
insert into public.challenge_templates(type, learning_goal, min_age, est_minutes, xp, coins, ep, topic_id, template)
select 'discovery','Space Free-Roam: find constellations',7,10,40,15,1, t.id,'{"scene":"Space_Outpost","mode":"constellations"}'::jsonb
from public.topics t where t.name='Solar System';
