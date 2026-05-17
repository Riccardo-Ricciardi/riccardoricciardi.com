-- Rename Electronics to Hardware & Making
update public.skill_categories
  set label_it = 'Hardware & Making',
      label_en = 'Hardware & Making'
  where slug = 'electronics';

-- New category: AI / ML (slot before devtools)
update public.skill_categories set position = position + 1 where position >= 5;
insert into public.skill_categories (slug, label_it, label_en, icon, position)
  values ('ai-ml', 'AI / ML', 'AI / ML', 'Sparkles', 5)
  on conflict (slug) do nothing;

-- Append 24 new skills across categories.
with maxp as (select coalesce(max(position), -1) as p from public.skills)
insert into public.skills (name, percentage, position, dark, category)
select v.name, v.percentage, (select p from maxp) + v.idx, v.dark, v.category
from (values
  ('Vite',            40, false, 'frontend',         1),
  ('Three.js',        15, false, 'frontend',         2),
  ('Framer Motion',   20, false, 'frontend',         3),
  ('PostgreSQL',      70, false, 'backend',          4),
  ('Express',         45, false, 'backend',          5),
  ('Java',            30, false, 'backend',          6),
  ('Raspberry Pi',    55, false, 'electronics',      7),
  ('ESP32',           50, false, 'electronics',      8),
  ('KiCad',           30, false, 'electronics',      9),
  ('3D Printing',     65, false, 'electronics',     10),
  ('C++',             40, false, 'electronics',     11),
  ('Linux',           60, false, 'devtools',        12),
  ('Bash',            50, false, 'devtools',        13),
  ('GitHub Actions',  55, false, 'devtools',        14),
  ('Cloudflare',      50, false, 'devtools',        15),
  ('Nginx',           45, false, 'devtools',        16),
  ('Postman',         35, false, 'devtools',        17),
  ('VS Code',         80, false, 'devtools',        18),
  ('Tinkercad',       70, false, 'design-3d',       19),
  ('Fusion 360',      30, false, 'design-3d',       20),
  ('Blender',         25, false, 'design-3d',       21),
  ('Unity',           30, false, 'design-3d',       22),
  ('Claude API',      50, false, 'ai-ml',           23),
  ('Prompt Engineering', 60, false, 'ai-ml',        24)
) as v(name, percentage, dark, category, idx)
where not exists (select 1 from public.skills s where lower(s.name) = lower(v.name));
