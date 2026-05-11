-- Admin v2: site identity singleton, social links list, about sections per-language.
-- Hero/About/Contact UI sections in /admin write to these tables for non-translatable
-- structured data; translatable text continues to live in content_blocks.

create table if not exists public.site_identity (
  id smallint primary key default 1 check (id = 1),
  name text not null default 'Riccardo Ricciardi',
  email text,
  profile_photo_url text,
  primary_cta_href text default '#projects',
  secondary_cta_href text default '#skills',
  updated_at timestamptz default now()
);

insert into public.site_identity (id) values (1)
on conflict (id) do nothing;

alter table public.site_identity enable row level security;

drop policy if exists "site_identity_public_select" on public.site_identity;
create policy "site_identity_public_select"
  on public.site_identity for select
  using (true);

comment on table public.site_identity is 'Singleton row holding non-translatable site identity (name, email, photo, CTA targets).';

create table if not exists public.social_links (
  id serial primary key,
  kind text not null,
  label text,
  url text not null,
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz default now()
);

create index if not exists social_links_position_idx
  on public.social_links (position);

alter table public.social_links enable row level security;

drop policy if exists "social_links_public_select" on public.social_links;
create policy "social_links_public_select"
  on public.social_links for select
  using (visible = true);

comment on table public.social_links is 'Public-facing social/contact links (github, linkedin, email, custom). Ordered by position.';

create table if not exists public.about_sections (
  id serial primary key,
  language_id integer not null references public.languages(id) on delete cascade,
  heading text,
  body text not null default '',
  position int not null default 0,
  updated_at timestamptz default now()
);

create index if not exists about_sections_lang_position_idx
  on public.about_sections (language_id, position);

alter table public.about_sections enable row level security;

drop policy if exists "about_sections_public_select" on public.about_sections;
create policy "about_sections_public_select"
  on public.about_sections for select
  using (true);

comment on table public.about_sections is 'Per-language About-page content blocks. Ordered list within each language_id.';
