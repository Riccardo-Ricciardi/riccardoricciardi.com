-- Inbound contact-form submissions. Inserts performed by a server action
-- via the service-role client; RLS therefore only needs to deny anon access.

create table if not exists public.contact_messages (
  id serial primary key,
  name text not null,
  email text not null,
  message text not null,
  locale text,
  ip_hash text,
  user_agent text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_unread_idx
  on public.contact_messages (read_at)
  where read_at is null;

alter table public.contact_messages enable row level security;

comment on table public.contact_messages is
  'Inbound messages from the public /contact form. Service-role inserts only; no anon policies.';
