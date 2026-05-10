create table if not exists public.theme_settings (
  key text primary key,
  value_light text not null,
  value_dark text,
  type text not null check (type in ('color','length','text','number')),
  group_name text not null default 'general',
  description text,
  position int default 0,
  updated_at timestamptz default now()
);

alter table public.theme_settings enable row level security;

drop policy if exists "theme_settings_public_select" on public.theme_settings;
create policy "theme_settings_public_select"
  on public.theme_settings for select
  using (true);

comment on table public.theme_settings is 'Design tokens overridable from /admin/theme. value_light is required, value_dark optional (falls back to value_light).';

create table if not exists public.content_blocks (
  id serial primary key,
  slug text not null,
  value text not null,
  language_id integer not null references public.languages(id) on delete cascade,
  unique (slug, language_id),
  updated_at timestamptz default now()
);

create index if not exists content_blocks_slug_idx on public.content_blocks (slug);

alter table public.content_blocks enable row level security;

drop policy if exists "content_blocks_public_select" on public.content_blocks;
create policy "content_blocks_public_select"
  on public.content_blocks for select
  using (true);

comment on table public.content_blocks is 'Per-locale content strings (hero, headings, CTAs). Edit from /admin/content.';
