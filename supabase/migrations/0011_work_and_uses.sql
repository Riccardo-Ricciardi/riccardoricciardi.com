-- /work timeline (per-language headlines + descriptions) + /uses stack list.

create table if not exists public.work_experience (
  id serial primary key,
  company text not null,
  role text not null,
  url text,
  location text,
  started_at date not null,
  ended_at date,
  is_current boolean not null default false,
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists work_experience_position_idx
  on public.work_experience (position);

alter table public.work_experience enable row level security;

drop policy if exists "work_experience_public_select" on public.work_experience;
create policy "work_experience_public_select"
  on public.work_experience for select
  using (true);

comment on table public.work_experience is
  'Career timeline shown on /[locale]/work. Translated bullet points live in work_experience_i18n.';

create table if not exists public.work_experience_i18n (
  experience_id integer not null references public.work_experience(id) on delete cascade,
  language_id integer not null references public.languages(id) on delete cascade,
  summary text,
  bullets text[] not null default '{}',
  primary key (experience_id, language_id)
);

alter table public.work_experience_i18n enable row level security;

drop policy if exists "work_experience_i18n_public_select" on public.work_experience_i18n;
create policy "work_experience_i18n_public_select"
  on public.work_experience_i18n for select
  using (true);

comment on table public.work_experience_i18n is
  'Per-locale summary and bulleted achievements for each work_experience row.';

create table if not exists public.uses_items (
  id serial primary key,
  category text not null,
  name text not null,
  url text,
  icon_url text,
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz default now()
);

create index if not exists uses_items_category_position_idx
  on public.uses_items (category, position);

alter table public.uses_items enable row level security;

drop policy if exists "uses_items_public_select" on public.uses_items;
create policy "uses_items_public_select"
  on public.uses_items for select
  using (visible = true);

comment on table public.uses_items is
  'Items shown on /[locale]/uses page. category is a freeform label (Editor, Hardware, etc.).';

create table if not exists public.uses_items_i18n (
  item_id integer not null references public.uses_items(id) on delete cascade,
  language_id integer not null references public.languages(id) on delete cascade,
  description text,
  primary key (item_id, language_id)
);

alter table public.uses_items_i18n enable row level security;

drop policy if exists "uses_items_i18n_public_select" on public.uses_items_i18n;
create policy "uses_items_i18n_public_select"
  on public.uses_items_i18n for select
  using (true);

comment on table public.uses_items_i18n is
  'Per-locale short description for each /uses item.';
