-- Defensive migration: ensure every public table has RLS enabled and a
-- read-only public SELECT policy. The original tables (languages, skills,
-- navbar, theme, not_found) predate the tracked migrations and may not
-- have RLS turned on. Without RLS the anon key (shipped to the browser)
-- could be used to write directly to these tables.
--
-- These statements are idempotent.

alter table if exists public.languages enable row level security;
alter table if exists public.skills enable row level security;
alter table if exists public.navbar enable row level security;
alter table if exists public.theme enable row level security;
alter table if exists public.not_found enable row level security;

drop policy if exists "languages_public_select" on public.languages;
create policy "languages_public_select"
  on public.languages for select
  using (true);

drop policy if exists "skills_public_select" on public.skills;
create policy "skills_public_select"
  on public.skills for select
  using (true);

drop policy if exists "navbar_public_select" on public.navbar;
create policy "navbar_public_select"
  on public.navbar for select
  using (true);

drop policy if exists "theme_public_select" on public.theme;
create policy "theme_public_select"
  on public.theme for select
  using (true);

drop policy if exists "not_found_public_select" on public.not_found;
create policy "not_found_public_select"
  on public.not_found for select
  using (true);

-- contact_messages: RLS is already enabled by 0010 but no policies exist,
-- which under PostgREST means anon has no access (correct). Make this
-- explicit so it cannot regress if a permissive policy is added later.
comment on table public.contact_messages is
  'Inbound messages from the public /contact form. Service-role inserts only; anon has zero access. Do NOT add a SELECT policy without restricting to auth.uid().';
