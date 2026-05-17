-- Revert to original brand logos: devicon-original (multicolor brand assets)
-- and simpleicons (monochrome silhouettes tinted with brand hex).
-- skillicons.dev was rejected because its rounded-tile interpretations are
-- not the actual brand identity.

-- FRONTEND
update public.skills set icon_url = 'https://cdn.simpleicons.org/html5/E34F26' where name = 'HTML';
update public.skills set icon_url = 'https://cdn.simpleicons.org/css/663399' where name = 'CSS';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' where name = 'JavaScript';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' where name = 'TypeScript';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' where name = 'React';
update public.skills set icon_url = 'https://cdn.simpleicons.org/nextdotjs/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/nextdotjs/ffffff',
       dark = true where name = 'Next.js';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' where name = 'Tailwind';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg' where name = 'Sass';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg' where name = 'Vite';
update public.skills set icon_url = 'https://cdn.simpleicons.org/threedotjs/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/threedotjs/ffffff',
       dark = true where name = 'Three.js';
update public.skills set icon_url = 'https://cdn.simpleicons.org/framer/0055FF' where name = 'Framer Motion';

-- BACKEND
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' where name = 'Node.js';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' where name = 'PostgreSQL';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' where name = 'MySQL';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' where name = 'Supabase';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' where name = 'Python';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' where name = 'PHP';
update public.skills set icon_url = 'https://cdn.simpleicons.org/express/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/express/ffffff',
       dark = true where name = 'Express';

-- HARDWARE & MAKING
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg' where name = 'Arduino';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' where name = 'C';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' where name = 'C++';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/raspberrypi/raspberrypi-original.svg' where name = 'Raspberry Pi';
update public.skills set icon_url = 'https://cdn.simpleicons.org/espressif/E32228' where name = 'ESP32';
update public.skills set icon_url = 'https://cdn.simpleicons.org/easyeda/2A6FCB' where name = 'EasyEDA';
update public.skills set icon_url = 'https://cdn.simpleicons.org/bambulab/00AE42' where name = '3D Printing';

-- DESIGN
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg' where name = 'Illustrator';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' where name = 'Figma';
update public.skills set icon_url = 'https://cdn.simpleicons.org/tinkercad/00BFFF' where name = 'Tinkercad';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg' where name = 'Blender';

-- AI / ML
update public.skills set icon_url = 'https://cdn.simpleicons.org/claude/D97757' where name = 'Claude';
update public.skills set icon_url = 'https://cdn.simpleicons.org/claude/D97757' where name = 'Claude API';
update public.skills set icon_url = 'https://cdn.simpleicons.org/perplexity/1FB8CD' where name = 'Perplexity';
update public.skills set icon_url = 'https://cdn.simpleicons.org/googlegemini/8E75B2' where name = 'Gemini';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/openai.svg' where name = 'ChatGPT';
update public.skills set icon_url = 'https://cdn.simpleicons.org/x/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/x/ffffff',
       dark = true where name = 'Grok';
update public.skills set icon_url = 'https://cdn.simpleicons.org/anthropic/D97757' where name = 'Prompt Engineering';
update public.skills set icon_url = 'https://cdn.simpleicons.org/n8n/EA4B71' where name = 'n8n';

-- DEVOPS & TOOLING
update public.skills set icon_url = 'https://cdn.simpleicons.org/vercel/000000',
       icon_dark_url = 'https://cdn.simpleicons.org/vercel/ffffff',
       dark = true where name = 'Vercel';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' where name = 'Docker';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' where name = 'Git';
update public.skills set icon_url = 'https://cdn.simpleicons.org/githubactions/2088FF' where name = 'GitHub Actions';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' where name = 'Linux';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/powershell/powershell-original.svg' where name = 'PowerShell';
update public.skills set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg' where name = 'Nginx';

-- /uses items
update public.uses_items set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' where name = 'VS Code';
update public.uses_items set icon_url = 'https://cdn.simpleicons.org/vercel/000000' where name = 'Vercel';
update public.uses_items set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' where name = 'Supabase';
update public.uses_items set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' where name = 'Postman';
update public.uses_items set icon_url = 'https://cdn.simpleicons.org/github/000000' where name = 'GitHub';
update public.uses_items set icon_url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg' where name = 'npm';
update public.uses_items set icon_url = 'https://cdn.simpleicons.org/bambulab/00AE42' where name = 'Bambu Lab A1';
update public.uses_items set icon_url = 'https://cdn.simpleicons.org/claude/D97757' where name = 'Claude Code';
