-- 0033: curated stack section
-- The homepage stack moved from a 43-logo wall to a curated, domain-grouped
-- logo set. Seed the group labels and align the intro copy (no longer "grouped
-- by where they run"). Idempotent: safe to re-run.

insert into public.content_blocks (slug, language_id, value)
select v.slug, l.id, v.val
from (values
  ('stack_group_languages', 'en', 'Languages'),
  ('stack_group_languages', 'it', 'Linguaggi'),
  ('stack_group_frontend',  'en', 'Frontend'),
  ('stack_group_frontend',  'it', 'Frontend'),
  ('stack_group_backend',   'en', 'Backend'),
  ('stack_group_backend',   'it', 'Backend'),
  ('stack_group_hardware',  'en', 'Embedded'),
  ('stack_group_hardware',  'it', 'Embedded'),
  ('stack_intro', 'en', 'Everything I reach for, from embedded firmware to production web.'),
  ('stack_intro', 'it', 'Tutto ciò che uso, dal firmware embedded al web in produzione.')
) as v(slug, code, val)
join public.languages l on l.code = v.code
on conflict (slug, language_id) do update set value = excluded.value;
