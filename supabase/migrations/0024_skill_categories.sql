-- Skill categories: ordered groups with bilingual labels.
create table if not exists public.skill_categories (
  slug         text primary key,
  label_it     text not null,
  label_en     text not null,
  icon         text,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.skill_categories enable row level security;

drop policy if exists skill_categories_select on public.skill_categories;
create policy skill_categories_select on public.skill_categories
  for select using (true);

create or replace function public.skill_categories_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists skill_categories_touch on public.skill_categories;
create trigger skill_categories_touch
  before update on public.skill_categories
  for each row execute function public.skill_categories_touch_updated_at();

-- Seed initial taxonomy.
insert into public.skill_categories (slug, label_it, label_en, icon, position) values
  ('frontend',    'Frontend',     'Frontend',     'Layout',     0),
  ('backend',     'Backend',      'Backend',      'Database',   1),
  ('electronics', 'Elettronica',  'Electronics',  'Cpu',        2),
  ('design-2d',   'Design 2D',    'Design 2D',    'Palette',    3),
  ('design-3d',   'Design 3D',    'Design 3D',    'Box',        4),
  ('devtools',    'DevOps & Tooling',  'DevOps & Tooling', 'Wrench', 5)
on conflict (slug) do nothing;

-- Map existing 22 skills.
update public.skills set category = 'frontend'
  where name in ('Html','Css','Sass','Tailwind','JavaScript','TypeScript','React','Nextjs');

update public.skills set category = 'backend'
  where name in ('Node','Php','Mysql','Supabase','Python');

update public.skills set category = 'devtools'
  where name in ('Vercel','Docker','Git','GitHub','Npm');

update public.skills set category = 'design-2d'
  where name in ('Figma','Illustrator');

update public.skills set category = 'electronics'
  where name in ('Arduino','C');
