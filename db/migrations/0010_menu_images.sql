-- 0010_menu_images: one compressed photo per landing menu.
-- Separate table from site_gallery_images so each publish flow sweeps only
-- its own orphans. Uploads share the gallery pipeline (max 1600px long
-- edge, WebP q75, EXIF stripped). Menus reference rows via imageId; the
-- legacy imageUrl path still works as a fallback when imageId is empty.

CREATE TABLE IF NOT EXISTS site_menu_images (
  id TEXT PRIMARY KEY,
  data BYTEA NOT NULL,
  mime TEXT NOT NULL DEFAULT 'image/webp',
  width INT NOT NULL DEFAULT 0,
  height INT NOT NULL DEFAULT 0,
  size_bytes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_menu_images_created_at_idx
  ON site_menu_images (created_at);
