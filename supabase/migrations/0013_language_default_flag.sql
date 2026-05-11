-- Add is_default flag so admin can mark the canonical fallback locale.
ALTER TABLE languages
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

UPDATE languages
SET is_default = true
WHERE code = 'en'
  AND NOT EXISTS (SELECT 1 FROM languages WHERE is_default = true);

CREATE UNIQUE INDEX IF NOT EXISTS languages_single_default_idx
  ON languages ((is_default))
  WHERE is_default = true;
