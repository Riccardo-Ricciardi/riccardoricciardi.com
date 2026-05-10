alter table public.skills
  add column if not exists icon_url text,
  add column if not exists icon_dark_url text;

alter table public.projects
  add column if not exists screenshot_url text;

comment on column public.skills.icon_url is 'Public URL for the light-mode icon. Falls back to {SUPABASE_IMAGE_URL}/{name}.png in code.';
comment on column public.skills.icon_dark_url is 'Public URL for the dark-mode icon. Used only when dark = true.';
comment on column public.projects.screenshot_url is 'Optional manual screenshot URL. Falls back to og_image (auto from GitHub) in code.';
