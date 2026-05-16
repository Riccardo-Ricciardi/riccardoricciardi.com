-- Lock down the 'image' storage bucket: public can SELECT (read) only.
-- Writes (insert/update/delete) go exclusively through the service-role
-- client used by /admin actions. Without explicit policies, Supabase may
-- inherit permissive defaults.
--
-- Idempotent.

-- Ensure bucket exists and is configured as public-read.
insert into storage.buckets (id, name, public)
values ('image', 'image', true)
on conflict (id) do update set public = excluded.public;

-- Drop any prior policies on the bucket so we re-create with the minimal set.
do $$
declare p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in (
        'image_public_select',
        'image_anon_insert',
        'image_anon_update',
        'image_anon_delete'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;

-- Public read of objects in the 'image' bucket.
create policy "image_public_select"
  on storage.objects for select
  using (bucket_id = 'image');

-- Explicitly: no anon insert/update/delete. The service-role client
-- bypasses RLS by design, so admin-side uploads/deletes continue to work.
