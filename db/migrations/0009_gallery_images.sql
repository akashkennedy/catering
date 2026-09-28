-- 0009_gallery_images: compressed landing-gallery bytes live in Postgres.
-- Gallery items in site_content.data reference rows here via imageId and are
-- served to the landing page through /api/site-gallery-images/[imageId].
-- Uploads are normalized server-side with sharp: max 1600px long edge,
-- WebP q75, EXIF stripped. Max 10 items is enforced in app code (zod .max(10)).

CREATE TABLE IF NOT EXISTS site_gallery_images (
  id TEXT PRIMARY KEY,
  data BYTEA NOT NULL,
  mime TEXT NOT NULL DEFAULT 'image/webp',
  width INT NOT NULL DEFAULT 0,
  height INT NOT NULL DEFAULT 0,
  size_bytes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_gallery_images_created_at_idx
  ON site_gallery_images (created_at);
