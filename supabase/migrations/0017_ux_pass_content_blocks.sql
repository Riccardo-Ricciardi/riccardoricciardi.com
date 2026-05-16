-- UX pass: seed all content_blocks slugs used by the new UX/empty-state/form-error pipeline.
-- This migration is idempotent. Adjust copy from /admin/content if you want different wording.
-- All slugs are referenced from app code in this commit; the fallbacks in code mirror these values.

with lang as (
  select id, code from public.languages where code in ('en', 'it')
),
seed(slug, en, it) as (
  values
    -- About: empty + CTA pair
    ('about_empty_title',           'Still writing this page.',                                                'Pagina in scrittura.'),
    ('about_empty_cta',              'Get in touch',                                                            'Scrivimi'),
    ('about_cta_primary_label',      'Let''s talk',                                                              'Vediamoci'),
    ('about_cta_primary_href',       '/en/contact',                                                             '/it/contact'),
    ('about_cta_secondary_label',    'See the work',                                                            'Vedi i lavori'),
    ('about_cta_secondary_href',     '/en/work',                                                                '/it/work'),

    -- Uses: empty CTA
    ('uses_empty_title',             'Still curating.',                                                         'In allestimento.'),
    ('uses_empty_cta',               'Ask what I use',                                                          'Chiedi cosa uso'),

    -- Skills: empty
    ('skills_empty_title',           'Stack coming soon.',                                                      'Stack in arrivo.'),
    ('skills_empty_body',            'I''m curating the list of tools I actually use.',                          'Sto curando la lista degli strumenti che uso davvero.'),

    -- Projects: narrative labels
    ('projects_narrative_problem',   'Problem',                                                                  'Problema'),
    ('projects_narrative_solution',  'Solution',                                                                 'Soluzione'),
    ('projects_narrative_outcome',   'Result',                                                                   'Risultato'),

    -- Navigation aria + mobile menu
    ('aria_menu_close',              'Close menu',                                                               'Chiudi menu'),
    ('aria_menu_title',              'Menu',                                                                     'Menu'),

    -- Contact: form section + labels
    ('contact_form_section_label',   'Contact form',                                                             'Modulo di contatto'),
    ('contact_form_name',            'Name',                                                                     'Nome'),
    ('contact_form_email',           'Email',                                                                    'Email'),
    ('contact_form_message',         'Message',                                                                  'Messaggio'),
    ('contact_form_submit',          'Send message',                                                             'Invia messaggio'),
    ('contact_form_sending',         'Sending…',                                                                 'Invio…'),
    ('contact_form_success_title',   'Message sent',                                                             'Messaggio inviato'),
    ('contact_form_success_body',    'I''ll get back to you as soon as possible.',                               'Ti risponderò appena possibile.'),
    ('contact_form_name_placeholder',    'Your name',                                                            'Come ti chiami?'),
    ('contact_form_email_placeholder',   'you@email.com',                                                        'tua@email.com'),
    ('contact_form_message_placeholder', 'Tell me about your project or idea…',                                  'Raccontami il progetto o l''idea…'),

    -- Booking: section + accordion
    ('booking_section_label',        'Book a call',                                                              'Prenota una chiamata'),
    ('booking_alternative_eyebrow',  'Alternative',                                                              'Alternativa'),
    ('booking_alternative_title',    'Prefer to pick a time slot?',                                              'Preferisci scegliere un orario?'),

    -- Booking: widget labels
    ('booking_heading',              'Book a call',                                                              'Prenota una chiamata'),
    ('booking_description',          '30-minute video call, free. Pick the day and time that works.',            '30 minuti in video, gratuiti. Scegli giorno e ora che ti vanno.'),
    ('booking_loading',              'Loading slots…',                                                           'Carico gli slot…'),
    ('booking_no_slots',             'No slots available on this day.',                                          'Nessuno slot disponibile in questo giorno.'),
    ('booking_no_slots_hint',        'Don''t see a time that works? Send me a message above instead.',           'Non vedi orari disponibili? Scrivimi direttamente qui sopra.'),
    ('booking_pick_day',             'Pick a day',                                                               'Scegli un giorno'),
    ('booking_pick_slot',            'Pick a time',                                                              'Scegli un orario'),
    ('booking_pick_event',           'Call type',                                                                'Tipo di chiamata'),
    ('booking_weekdays',             'Mon,Tue,Wed,Thu,Fri,Sat,Sun',                                              'Lun,Mar,Mer,Gio,Ven,Sab,Dom'),
    ('booking_confirm_title',        'Confirm booking',                                                          'Conferma prenotazione'),
    ('booking_confirm_subtitle',     'Enter your details and I''ll book the slot.',                              'Inserisci i tuoi dati e prenoto subito.'),
    ('booking_name',                 'Name',                                                                     'Nome'),
    ('booking_email',                'Email',                                                                    'Email'),
    ('booking_notes',                'Notes',                                                                    'Note'),
    ('booking_name_placeholder',     'Your name',                                                                'Come ti chiami?'),
    ('booking_email_placeholder',    'you@email.com',                                                            'tua@email.com'),
    ('booking_notes_placeholder',    'What would you like to discuss?',                                          'Cosa vorresti discutere?'),
    ('booking_submit',               'Confirm',                                                                  'Conferma'),
    ('booking_submitting',           'Booking…',                                                                 'Prenoto…'),
    ('booking_cancel',               'Cancel',                                                                   'Annulla'),
    ('booking_success_title',        'Booking confirmed',                                                        'Prenotazione confermata'),
    ('booking_success_body',         'See you {when}. A confirmation email is on its way.',                      'Ti aspetto {when}. Riceverai un''email di conferma a breve.'),
    ('booking_error',                'Something went wrong, please try again.',                                  'Qualcosa è andato storto, riprova.'),
    ('booking_prev_month',           'Previous month',                                                           'Mese precedente'),
    ('booking_next_month',           'Next month',                                                               'Mese successivo'),
    ('booking_duration_unit',        'min',                                                                      'min'),
    ('booking_timezone_label',       'TZ',                                                                       'Fuso')
)
insert into public.content_blocks (slug, value, language_id)
select s.slug, case l.code when 'it' then s.it else s.en end, l.id
from seed s
cross join lang l
on conflict (slug, language_id) do nothing;
