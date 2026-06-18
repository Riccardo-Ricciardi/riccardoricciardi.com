-- 0034: content pass
-- - meta_role (NEW slug, used in [locale]/layout title)
-- - positive hero proof clause (was defensive "…not demos")
-- - real meta description (was "official website of …")
-- - ESP32 surface line reworded (was an own-goal "nothing shipped yet")
-- Idempotent. (F24 case-study copy is admin-managed and lives in projects_i18n,
-- not seeded here.)

insert into public.content_blocks (slug, language_id, value)
select v.slug, l.id, v.val
from (values
  ('meta_role', 'en', 'Full-stack & automation developer'),
  ('meta_role', 'it', 'Sviluppatore full-stack e automazioni'),
  ('hero_proof_clause', 'en', 'Real software in production — used every day, on real company credentials.'),
  ('hero_proof_clause', 'it', 'Software vero in produzione — usato ogni giorno, su credenziali aziendali reali.'),
  ('meta_home_description', 'en', 'Riccardo Ricciardi — full-stack & automation developer. I build web products and desktop tools that run in production, from first commit to signed release.'),
  ('meta_home_description', 'it', 'Riccardo Ricciardi — sviluppatore full-stack e automazioni. Costruisco prodotti web e tool desktop che girano in produzione, dal primo commit al rilascio firmato.'),
  ('surface_embedded-esp32_line', 'en', 'Where current meets code — ESP32 and Arduino on the bench: hardware experiments, wired and flashed.'),
  ('surface_embedded-esp32_line', 'it', 'Dove la corrente incontra il codice — ESP32 e Arduino sul banco: esperimenti hardware, cablati e flashati.')
) as v(slug, code, val)
join public.languages l on l.code = v.code
on conflict (slug, language_id) do update set value = excluded.value;
