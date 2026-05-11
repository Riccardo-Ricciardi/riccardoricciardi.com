-- Add problem / solution / outcome narrative columns to projects and projects_i18n.
-- These power the redesigned ProjectCard which surfaces problem → solution → result
-- instead of relying only on the GitHub description.

alter table public.projects
  add column if not exists problem text,
  add column if not exists solution text,
  add column if not exists outcome text;

alter table public.projects_i18n
  add column if not exists problem text,
  add column if not exists solution text,
  add column if not exists outcome text;
