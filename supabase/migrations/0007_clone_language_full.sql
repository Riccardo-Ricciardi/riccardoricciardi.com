-- Rewrite clone_language to also seed content_blocks and projects_i18n
-- so a newly cloned locale starts with the same content as the source.
-- Previously these two newer tables were skipped; new locales had to be
-- backfilled by hand via /admin/content + /admin/projects/[id].

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

  insert into public.content_blocks (slug, value, language_id)
  select slug, value, tgt_id
  from public.content_blocks where language_id = src_id
  on conflict (slug, language_id) do nothing;

  insert into public.projects_i18n (project_id, language_id, description)
  select project_id, tgt_id, description
  from public.projects_i18n where language_id = src_id
  on conflict (project_id, language_id) do nothing;

  return tgt_id;
end;
$$;

comment on function public.clone_language(text, text, text)
  is 'Bootstrap a new locale by cloning navbar, theme, not_found, content_blocks, and projects_i18n rows from an existing source locale. Idempotent. Usage: select clone_language(''en'', ''fr'', ''Français'');';
