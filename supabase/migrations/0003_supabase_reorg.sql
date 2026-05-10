alter table if exists public."not-found" rename to not_found;

create index if not exists navbar_lang_position_idx
  on public.navbar (language_id, position);
create index if not exists theme_lang_position_idx
  on public.theme (language_id, position);
create index if not exists not_found_lang_position_idx
  on public.not_found (language_id, position);
create index if not exists skills_position_idx
  on public.skills (position);

alter table public.skills add column if not exists category text;
create index if not exists skills_category_idx
  on public.skills (category);

comment on table public.languages is 'Supported languages. Add row + use clone_language() to bootstrap translations.';
comment on table public.navbar  is 'Navbar items per language (slug + label).';
comment on table public.theme   is 'Theme picker labels per language.';
comment on table public.not_found is '404 page strings per language.';
comment on table public.skills  is 'Tech skills with proficiency. category (nullable) groups in UI.';
comment on table public.projects is 'GitHub projects shown on homepage. Sync via sync-github edge function.';
comment on table public.projects_i18n is 'Per-locale description override for projects.';

create or replace function public.clone_language(
  source_code text,
  target_code text,
  target_name text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  src_id integer;
  tgt_id integer;
  inserted integer := 0;
begin
  select id into src_id from public.languages where code = source_code;
  if src_id is null then
    raise exception 'Source language code % not found', source_code;
  end if;

  insert into public.languages (code, name)
  values (target_code, target_name)
  on conflict (code) do update set name = excluded.name
  returning id into tgt_id;

  insert into public.navbar (slug, value, language_id, position)
  select slug, value, tgt_id, position
  from public.navbar where language_id = src_id
  on conflict do nothing;

  insert into public.theme (slug, value, language_id, position)
  select slug, value, tgt_id, position
  from public.theme where language_id = src_id
  on conflict do nothing;

  insert into public.not_found (slug, value, language_id, position)
  select slug, value, tgt_id, position
  from public.not_found where language_id = src_id
  on conflict do nothing;

  get diagnostics inserted = row_count;
  return tgt_id;
end;
$$;

comment on function public.clone_language(text, text, text)
  is 'Bootstrap a new language by cloning all translations from an existing one. Usage: select clone_language(''en'', ''fr'', ''Français'');';

create or replace function public.upsert_navbar_item(
  lang_code text,
  item_slug text,
  item_value text,
  item_position int default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  lang_id integer;
begin
  select id into lang_id from public.languages where code = lang_code;
  if lang_id is null then
    raise exception 'Language code % not found', lang_code;
  end if;

  insert into public.navbar (slug, value, language_id, position)
  values (item_slug, item_value, lang_id, item_position);
end;
$$;

comment on function public.upsert_navbar_item(text, text, text, int)
  is 'Insert a navbar item for a specific language. Run for each language to add a new menu entry.';
