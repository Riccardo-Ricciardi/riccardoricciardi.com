-- Slug columns already exist on navbar/theme/not-found tables.
-- This migration only enforces uniqueness on (language_id, slug) for navbar.

create unique index if not exists navbar_slug_per_language_idx
  on public.navbar (language_id, slug);
