-- Swap 8 icons for higher-quality / more-popular badges (user request).
-- SVG bytes uploaded by scripts/swap-skill-icons.mjs; same filenames, so bump the
-- ?v cache-buster on icon_url to force the immutable CDN/browser cache to refetch.

update skills      set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/c.svg?v=3'           where id = 4;   -- C        -> ISO-C medallion
update skills      set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/docker.svg?v=2'      where id = 6;   -- Docker   -> Moby whale
update skills      set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/gemini.svg?v=3'      where id = 53;  -- Gemini   -> square spark (simple-icons, blue)
update skills      set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/html.svg?v=2'        where id = 10;  -- HTML     -> HTML5 shield
update skills      set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/illustrator.svg?v=2' where id = 11;  -- Illustrator -> modern Ai
update skills      set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/nginx.svg?v=2'       where id = 41;  -- Nginx    -> official mark
update skills      set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/linux.svg?v=3'       where id = 37;  -- Linux    -> Wikimedia Tux
update uses_items  set icon_url = 'https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image/icons/claude-code.svg?v=2' where id = 3;   -- Claude Code -> Clawd robot
