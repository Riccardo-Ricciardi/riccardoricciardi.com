-- Reset icons before reassigning to keep state deterministic.
update public.skills set icon_url = null, icon_dark_url = null, dark = false;

-- FRONTEND
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' where name = 'Html';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' where name = 'Css';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' where name = 'JavaScript';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' where name = 'TypeScript';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' where name = 'React';
update public.skills set icon_url = 'https://cdn.simpleicons.org/nextdotjs/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/nextdotjs/ffffff',
       dark = true where name = 'Nextjs';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' where name = 'Tailwind';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg' where name = 'Sass';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg' where name = 'Vite';
update public.skills set icon_url = 'https://cdn.simpleicons.org/threedotjs/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/threedotjs/ffffff',
       dark = true where name = 'Three.js';
update public.skills set icon_url = 'https://cdn.simpleicons.org/framer/0055FF' where name = 'Framer Motion';

-- BACKEND
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' where name = 'Node';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' where name = 'PostgreSQL';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' where name = 'Mysql';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' where name = 'Python';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' where name = 'Php';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' where name = 'Supabase';
update public.skills set icon_url = 'https://cdn.simpleicons.org/express/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/express/ffffff',
       dark = true where name = 'Express';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' where name = 'Java';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg' where name = 'Npm';

-- HARDWARE & MAKING (electronics slug)
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg' where name = 'Arduino';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/raspberrypi/raspberrypi-original.svg' where name = 'Raspberry Pi';
update public.skills set icon_url = 'https://cdn.simpleicons.org/espressif/E32228' where name = 'ESP32';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' where name = 'C';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' where name = 'C++';
update public.skills set icon_url = 'https://cdn.simpleicons.org/printables/FA6831' where name = '3D Printing';
update public.skills set icon_url = 'https://cdn.simpleicons.org/kicad/314CB0' where name = 'KiCad';

-- DESIGN 2D
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' where name = 'Figma';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg' where name = 'Illustrator';

-- DESIGN 3D
update public.skills set icon_url = 'https://cdn.simpleicons.org/tinkercad/00BFFF' where name = 'Tinkercad';
update public.skills set icon_url = 'https://cdn.simpleicons.org/autodesk/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/autodesk/ffffff',
       dark = true where name = 'Fusion 360';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg' where name = 'Blender';
update public.skills set icon_url = 'https://cdn.simpleicons.org/unity/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/unity/ffffff',
       dark = true where name = 'Unity';

-- AI / ML
update public.skills set icon_url = 'https://cdn.simpleicons.org/claude/D97757' where name = 'Claude API';
update public.skills set icon_url = 'https://cdn.simpleicons.org/anthropic/D97757' where name = 'Prompt Engineering';

-- DEVOPS & TOOLING
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' where name = 'VS Code';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' where name = 'Docker';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' where name = 'Git';
update public.skills set icon_url = 'https://cdn.simpleicons.org/github/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/github/ffffff',
       dark = true where name = 'GitHub';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' where name = 'Linux';
update public.skills set icon_url = 'https://cdn.simpleicons.org/vercel/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/vercel/ffffff',
       dark = true where name = 'Vercel';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg' where name = 'Bash';
update public.skills set icon_url = 'https://cdn.simpleicons.org/githubactions/2088FF' where name = 'GitHub Actions';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg' where name = 'Cloudflare';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg' where name = 'Nginx';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' where name = 'Postman';

-- Reorder positions globally: by category position, then percentage desc within category.
with ordered as (
  select s.id,
         row_number() over (
           order by coalesce(c.position, 999), s.percentage desc, s.name
         ) - 1 as new_pos
  from public.skills s
  left join public.skill_categories c on c.slug = s.category
)
update public.skills s set position = o.new_pos
from ordered o where s.id = o.id;
