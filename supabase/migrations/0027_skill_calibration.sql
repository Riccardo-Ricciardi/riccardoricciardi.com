-- Skill calibration after 1-on-1 interview with the user.
-- Removes 2 (Java never used, Cloudflare never used), renames 2 (KiCad->EasyEDA,
-- Bash->PowerShell), adds 1 (n8n already inserted in prior migration), adjusts
-- percentages to honest self-reported levels.

-- Drop never-used skills.
delete from public.skills where name in ('Java', 'Cloudflare');
delete from public.uses_items where name = 'Cloudflare';

-- Rename KiCad -> EasyEDA (what the user actually opens, low confidence).
update public.skills
  set name = 'EasyEDA',
      percentage = 30,
      icon_url = 'https://cdn.simpleicons.org/easyeda/2A6FCB',
      icon_dark_url = null,
      dark = false
  where name = 'KiCad';

-- Rename Bash -> PowerShell (Windows user with non-trivial $PROFILE).
update public.skills
  set name = 'PowerShell',
      percentage = 55,
      icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/powershell/powershell-original.svg',
      icon_dark_url = null,
      dark = false
  where name = 'Bash';

-- Calibrated percentages.
update public.skills set percentage = 88 where name = 'Css';
update public.skills set percentage = 90 where name = 'Nextjs';
update public.skills set percentage = 80 where name = 'Tailwind';
update public.skills set percentage = 50 where name = 'TypeScript';
update public.skills set percentage = 30 where name = 'Sass';
update public.skills set percentage = 32 where name = 'Vite';
update public.skills set percentage = 88 where name = 'Python';
update public.skills set percentage = 75 where name = 'Mysql';
update public.skills set percentage = 65 where name = 'PostgreSQL';
update public.skills set percentage = 60 where name = 'Php';
update public.skills set percentage = 50 where name = 'Express';
update public.skills set percentage = 65 where name = 'Supabase';
update public.skills set percentage = 85 where name = 'Npm';
update public.skills set percentage = 30 where name = 'C';
update public.skills set percentage = 22 where name = 'C++';
update public.skills set percentage = 90 where name = 'Arduino';
update public.skills set percentage = 65 where name = 'ESP32';
update public.skills set percentage = 62 where name = 'Raspberry Pi';
update public.skills set percentage = 90 where name = 'Illustrator';
update public.skills set percentage = 25 where name = 'Figma';
update public.skills set percentage = 78 where name = 'Tinkercad';
update public.skills set percentage = 18 where name = 'Fusion 360';
update public.skills set percentage = 22 where name = 'Blender';
update public.skills set percentage = 62 where name = 'Claude API';
update public.skills set percentage = 42 where name = 'Prompt Engineering';
update public.skills set percentage = 55 where name = 'n8n';
update public.skills set percentage = 60 where name = 'VS Code';
update public.skills set percentage = 55 where name = 'GitHub';
update public.skills set percentage = 50 where name = 'Vercel';
update public.skills set percentage = 35 where name = 'Docker';
update public.skills set percentage = 45 where name = 'Linux';
update public.skills set percentage = 40 where name = 'GitHub Actions';
update public.skills set percentage = 30 where name = 'Nginx';
update public.skills set percentage = 22 where name = 'Postman';
update public.skills set percentage = 38 where name = 'Git';

-- Seed /uses items (idempotent: skip rows that already exist).
insert into public.uses_items (category, name, url, icon_url, position, visible)
select v.category, v.name, v.url, v.icon_url, v.position, true
from (values
  ('Hardware',    'Bambu Lab A1', 'https://bambulab.com/en/a1',       'https://cdn.simpleicons.org/bambulab/00AE42',     0),
  ('Editor',      'VS Code',      'https://code.visualstudio.com',    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', 0),
  ('Editor',      'Claude Code',  'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code', 'https://cdn.simpleicons.org/claude/D97757', 1),
  ('AI Services', 'Claude',       'https://claude.ai',                'https://cdn.simpleicons.org/claude/D97757',       0),
  ('AI Services', 'Perplexity',   'https://www.perplexity.ai',        'https://cdn.simpleicons.org/perplexity/1FB8CD',   1),
  ('AI Services', 'Gemini',       'https://gemini.google.com',        'https://cdn.simpleicons.org/googlegemini/8E75B2', 2),
  ('AI Services', 'Groq',         'https://groq.com',                 null,                                              3),
  ('AI Services', 'Grok',         'https://x.ai',                     'https://cdn.simpleicons.org/x/000000',            4),
  ('AI Services', 'ChatGPT',      'https://chat.openai.com',          'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openai.svg', 5),
  ('Hosting',     'Vercel',       'https://vercel.com',               'https://cdn.simpleicons.org/vercel/000000',       0),
  ('Hosting',     'Supabase',     'https://supabase.com',             'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg', 1)
) as v(category, name, url, icon_url, position)
where not exists (select 1 from public.uses_items u where u.name = v.name and u.category = v.category);

-- Final reorder: category position, then percentage desc within category.
with ordered as (
  select s.id,
         row_number() over (
           order by coalesce(c.position, 999), s.percentage desc, s.name
         ) - 1 as new_pos
  from public.skills s
  left join public.skill_categories c on c.slug = s.category
)
update public.skills s set position = o.new_pos from ordered o where s.id = o.id;
