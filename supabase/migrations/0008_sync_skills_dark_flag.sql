-- Backfill the skills.dark boolean from icon_dark_url presence.
-- The two columns were drifting: an admin could upload a dark icon
-- (icon_dark_url set) without ever flipping the boolean, so the public
-- site never picked up the dark variant.
-- Going forward the upload + clear actions keep them in sync; this
-- migration corrects existing rows.

update public.skills
set dark = true
where icon_dark_url is not null
  and (dark is null or dark = false);
