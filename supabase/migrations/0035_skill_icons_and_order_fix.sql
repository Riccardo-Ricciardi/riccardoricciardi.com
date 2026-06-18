-- Skills: correct wrong/missing icons + clean ordering.
-- Storage SVGs themselves are uploaded by scripts/fix-skill-icons.mjs; this only
-- rewrites the icon_url pointers and renumbers positions.

-- Newly self-hosted icons for skills that had none.
update skills set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/css.svg'   where id = 5;   -- CSS
update skills set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/astro.svg' where id = 57;  -- Astro
update skills set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/groq.svg'  where id = 56;  -- Groq

-- Replaced-in-place icons (C showed the C++ logo, 3D Printing showed the Bambu
-- Lab brand logo, linux.svg was a 189 KB raster). Same path, new bytes -> bump a
-- version query so the immutable 1-year CDN/browser cache fetches the new file.
update skills set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/c.svg?v=2'           where id = 4;   -- C
update skills set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/3d-printing.svg?v=2' where id = 35;  -- 3D Printing
update skills set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/linux.svg?v=2'       where id = 37;  -- Linux

-- Renumber positions 0..n by current order; resolves the Astro/TypeScript position=6 collision.
with ordered as (
  select id, (row_number() over (order by position, id) - 1) as pos from skills
)
update skills s set position = o.pos from ordered o where o.id = s.id;
