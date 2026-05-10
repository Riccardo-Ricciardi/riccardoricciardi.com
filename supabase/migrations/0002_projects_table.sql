create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  repo text not null unique,
  position int not null default 0,
  visible boolean not null default true,
  name text,
  description text,
  url text,
  homepage text,
  stars int default 0,
  forks int default 0,
  language text,
  topics text[] default '{}',
  og_image text,
  pushed_at timestamptz,
  synced_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists projects_visible_position_idx
  on public.projects (visible, position);

alter table public.projects enable row level security;

drop policy if exists "projects_public_select" on public.projects;
create policy "projects_public_select"
  on public.projects for select
  using (visible = true);

create table if not exists public.projects_i18n (
  project_id uuid not null references public.projects(id) on delete cascade,
  language_id integer not null references public.languages(id) on delete cascade,
  description text,
  primary key (project_id, language_id)
);

alter table public.projects_i18n enable row level security;

drop policy if exists "projects_i18n_public_select" on public.projects_i18n;
create policy "projects_i18n_public_select"
  on public.projects_i18n for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = projects_i18n.project_id and p.visible = true
    )
  );
