-- Disambiguate the two "theme" tables.
-- public.theme         = i18n labels for the theme picker (Light/Dark/System) per locale.
-- public.theme_settings = design tokens (colors, dimensions, etc) edited from /admin/theme.
-- These are unrelated; the naming collision is historical.

comment on table public.theme is
  'I18n labels for the theme picker (e.g. Light/Dark/System) per locale. NOT design tokens — those live in public.theme_settings.';

comment on table public.theme_settings is
  'Design tokens (color, length, text, number) editable from /admin/theme. value_light required, value_dark optional (falls back to value_light). NOT i18n labels — those live in public.theme.';

comment on table public.not_found is
  'I18n strings for the 404 page per locale. Read by utils/i18n/dictionary.ts. No admin UI yet — edit via SQL or future /admin/translations/404.';
