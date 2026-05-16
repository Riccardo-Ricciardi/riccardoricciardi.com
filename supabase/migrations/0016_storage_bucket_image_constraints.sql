-- Harden the 'image' storage bucket with MIME and size constraints.
--
-- The bucket is public-read (see 0015). Writes go through the service-role
-- client used by /admin actions, which bypasses RLS — but file_size_limit
-- and allowed_mime_types are enforced by Supabase Storage *before* the upload
-- hits storage.objects, so they apply to service-role inserts too.
--
-- Limits:
--   - MIME: image/png, image/jpeg, image/webp, image/avif, image/gif, image/svg+xml
--   - Size: 5 MB per object
--
-- Idempotent.

update storage.buckets
set
  file_size_limit = 5 * 1024 * 1024,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml'
  ]
where id = 'image';

-- Belt-and-suspenders: also forbid public insert/update/delete via RLS,
-- in case the bucket is ever toggled off "public-write" defaults later.
-- The service-role key bypasses these by design.
do $$
declare p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in (
        'image_block_anon_insert',
        'image_block_anon_update',
        'image_block_anon_delete'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;

create policy "image_block_anon_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id <> 'image');

create policy "image_block_anon_update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id <> 'image')
  with check (bucket_id <> 'image');

create policy "image_block_anon_delete"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id <> 'image');
