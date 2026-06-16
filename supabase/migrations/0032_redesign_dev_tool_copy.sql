-- 0032 — Redesign dev-tool: scrub copy geografica/personale + seed sezioni prodotto
-- language_id: 1 = en, 2 = it

-- ── scrub geografia dal posizionamento (no Napoli / luogo) ─────────
update content_blocks set value = 'RICCARDO RICCIARDI · SOFTWARE & AUTOMATION'
  where slug = 'hero_wordmark_line' and language_id = 1;
update content_blocks set value = 'RICCARDO RICCIARDI · SOFTWARE & AUTOMAZIONE'
  where slug = 'hero_wordmark_line' and language_id = 2;

update content_blocks set value = 'Full-stack developer. React, Next.js, Supabase. I ship what I promise.'
  where slug = 'hero_subtitle' and language_id = 1;
update content_blocks set value = 'Full-stack developer. React, Next.js, Supabase. Consegno quello che prometto.'
  where slug = 'hero_subtitle' and language_id = 2;

update content_blocks set value = 'Available for new work'
  where slug = 'hero_availability' and language_id = 1;
update content_blocks set value = 'Disponibile per nuovi progetti'
  where slug = 'hero_availability' and language_id = 2;

update content_blocks set value = 'Remote / async'
  where slug = 'about_facts_location' and language_id = 1;
update content_blocks set value = 'Da remoto / async'
  where slug = 'about_facts_location' and language_id = 2;

-- ── seed nuove sezioni prodotto (CodeShowcase + StackRow) ──────────
insert into content_blocks (slug, language_id, value) values
  ('code_eyebrow', 1, 'How I build'),
  ('code_eyebrow', 2, 'Come lavoro'),
  ('code_heading', 1, 'Automation that ships itself'),
  ('code_heading', 2, 'Automazioni che si spediscono da sole'),
  ('code_intro', 1, 'Pipelines, integrations and internal tools that run unattended — typed end to end, deployed with zero downtime.'),
  ('code_intro', 2, 'Pipeline, integrazioni e tool interni che girano da soli — tipizzati end-to-end, in produzione con zero downtime.'),
  ('stack_eyebrow', 1, 'Stack'),
  ('stack_eyebrow', 2, 'Stack'),
  ('stack_heading', 1, 'One toolchain, end to end'),
  ('stack_heading', 2, 'Un solo toolchain, end to end'),
  ('stack_intro', 1, 'From embedded devices to production web — a coherent set of tools I trust in production.'),
  ('stack_intro', 2, 'Dai dispositivi embedded al web in produzione — un set di strumenti coerente di cui mi fido in produzione.')
on conflict (slug, language_id) do update set value = excluded.value;
