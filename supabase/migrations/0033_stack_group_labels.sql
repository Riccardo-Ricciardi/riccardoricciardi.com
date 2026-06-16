-- 0033 — StackRow: etichette gruppi (Languages / Frontend / Backend / Hardware)
-- language_id: 1 = en, 2 = it
-- Additivo: nessuna riga esistente viene toccata (do nothing).

insert into content_blocks (slug, language_id, value) values
  ('stack_group_languages', 1, 'Languages'),
  ('stack_group_languages', 2, 'Linguaggi'),
  ('stack_group_frontend', 1, 'Frontend'),
  ('stack_group_frontend', 2, 'Frontend'),
  ('stack_group_backend', 1, 'Backend & Infra'),
  ('stack_group_backend', 2, 'Backend & Infra'),
  ('stack_group_hardware', 1, 'Hardware & QA'),
  ('stack_group_hardware', 2, 'Hardware & QA')
on conflict (slug, language_id) do nothing;
