-- 0034 — Hide non-shippable projects + scrub their copy.
-- social-automation: still in development. map-switch: not my project.
-- language_id: 1 = en, 2 = it
-- Applied to prod via Supabase MCP on 2026-06-16.

update projects set visible = false where slug in ('social-automation', 'map-switch');

update content_blocks set value = 'One product live in production: an F24 tool that real accountants run on company credentials every day.'
  where slug = 'hero_proof_clause' and language_id = 1;
update content_blocks set value = 'Un prodotto live in produzione: un tool F24 che i commercialisti usano ogni giorno con le credenziali aziendali.'
  where slug = 'hero_proof_clause' and language_id = 2;

update content_blocks set value = 'Pick up an existing codebase, untangle the parts that hurt, ship the upgrade. I do the unglamorous work: security hardening, dead-code removal, test coverage from nothing to trustworthy, services wired together.'
  where slug = 'service_integrations-rescue_body' and language_id = 1;
update content_blocks set value = 'Prendo in mano una codebase esistente, sciolgo i nodi che fanno male, rilascio l''upgrade. Faccio il lavoro poco glamour: hardening di sicurezza, codice morto rimosso, coverage da zero ad affidabile, servizi collegati tra loro.'
  where slug = 'service_integrations-rescue_body' and language_id = 2;
