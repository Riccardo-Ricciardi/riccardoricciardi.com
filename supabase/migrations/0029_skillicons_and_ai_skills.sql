-- Remove Unity (game engine, not Design) and Fusion 360 (never used).
delete from public.skills where name in ('Unity', 'Fusion 360');

-- Promote daily-use AI services from /uses to actual skills under AI/ML.
delete from public.uses_items where name in ('Claude', 'Perplexity', 'Gemini', 'Groq', 'Grok', 'ChatGPT');

with maxp as (select coalesce(max(position), -1) as p from public.skills)
insert into public.skills (name, percentage, position, dark, category, icon_url)
select v.name, v.percentage, (select p from maxp) + v.idx, false, 'ai-ml', v.icon_url
from (values
  ('Claude',     80, 'https://cdn.simpleicons.org/claude/D97757',                              1),
  ('Perplexity', 60, 'https://cdn.simpleicons.org/perplexity/1FB8CD',                          2),
  ('Gemini',     55, 'https://cdn.simpleicons.org/googlegemini/8E75B2',                        3),
  ('ChatGPT',    50, 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/openai.svg',         4),
  ('Grok',       45, 'https://cdn.simpleicons.org/x/000000',                                   5),
  ('Groq',       45, null,                                                                     6)
) as v(name, percentage, icon_url, idx)
where not exists (select 1 from public.skills s where lower(s.name) = lower(v.name));

-- ICON UPGRADE: skillicons.dev tiles where slug exists (consistent rounded-rect aesthetic).
update public.skills set icon_url = 'https://skillicons.dev/icons?i=html',          icon_dark_url = null, dark = false where name = 'HTML';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=css',           icon_dark_url = null, dark = false where name = 'CSS';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=js',            icon_dark_url = null, dark = false where name = 'JavaScript';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=ts',            icon_dark_url = null, dark = false where name = 'TypeScript';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=react',         icon_dark_url = null, dark = false where name = 'React';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=nextjs',        icon_dark_url = null, dark = false where name = 'Next.js';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=tailwind',      icon_dark_url = null, dark = false where name = 'Tailwind';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=sass',          icon_dark_url = null, dark = false where name = 'Sass';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=vite',          icon_dark_url = null, dark = false where name = 'Vite';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=threejs',       icon_dark_url = null, dark = false where name = 'Three.js';

update public.skills set icon_url = 'https://skillicons.dev/icons?i=nodejs',        icon_dark_url = null, dark = false where name = 'Node.js';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=postgresql',    icon_dark_url = null, dark = false where name = 'PostgreSQL';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=mysql',         icon_dark_url = null, dark = false where name = 'MySQL';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=supabase',      icon_dark_url = null, dark = false where name = 'Supabase';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=python',        icon_dark_url = null, dark = false where name = 'Python';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=php',           icon_dark_url = null, dark = false where name = 'PHP';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=express',       icon_dark_url = null, dark = false where name = 'Express';

update public.skills set icon_url = 'https://skillicons.dev/icons?i=arduino',       icon_dark_url = null, dark = false where name = 'Arduino';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=c',             icon_dark_url = null, dark = false where name = 'C';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=cpp',           icon_dark_url = null, dark = false where name = 'C++';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=raspberrypi',   icon_dark_url = null, dark = false where name = 'Raspberry Pi';

update public.skills set icon_url = 'https://skillicons.dev/icons?i=ai',            icon_dark_url = null, dark = false where name = 'Illustrator';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=figma',         icon_dark_url = null, dark = false where name = 'Figma';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=blender',       icon_dark_url = null, dark = false where name = 'Blender';

update public.skills set icon_url = 'https://skillicons.dev/icons?i=vercel',        icon_dark_url = null, dark = false where name = 'Vercel';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=docker',        icon_dark_url = null, dark = false where name = 'Docker';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=git',           icon_dark_url = null, dark = false where name = 'Git';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=githubactions', icon_dark_url = null, dark = false where name = 'GitHub Actions';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=linux',         icon_dark_url = null, dark = false where name = 'Linux';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=powershell',    icon_dark_url = null, dark = false where name = 'PowerShell';
update public.skills set icon_url = 'https://skillicons.dev/icons?i=nginx',         icon_dark_url = null, dark = false where name = 'Nginx';

-- /uses items get skillicons tiles where slug exists.
update public.uses_items set icon_url = 'https://skillicons.dev/icons?i=vscode'   where name = 'VS Code';
update public.uses_items set icon_url = 'https://skillicons.dev/icons?i=vercel'   where name = 'Vercel';
update public.uses_items set icon_url = 'https://skillicons.dev/icons?i=supabase' where name = 'Supabase';
update public.uses_items set icon_url = 'https://skillicons.dev/icons?i=postman'  where name = 'Postman';
update public.uses_items set icon_url = 'https://skillicons.dev/icons?i=github'   where name = 'GitHub';
update public.uses_items set icon_url = 'https://skillicons.dev/icons?i=npm'      where name = 'npm';

-- Reorder positions: category, then percentage desc within category.
with ordered as (
  select s.id,
         row_number() over (
           order by coalesce(c.position, 999), s.percentage desc, s.name
         ) - 1 as new_pos
  from public.skills s
  left join public.skill_categories c on c.slug = s.category
)
update public.skills s set position = o.new_pos from ordered o where s.id = o.id;
