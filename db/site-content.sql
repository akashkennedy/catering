-- Shared website content for mampallicatering.vercel.app + catering CRM.
-- Run once in the Neon SQL editor (or psql). No extensions required.
--
-- Access model (no RLS in Neon — enforced in app code):
--   * Website project: reads with its own connection string (ideally the
--     read-only pooled role), caches aggressively, revalidates on publish ping.
--   * CRM project: writes ONLY through its /api/site-content route, which
--     requires the CRM login session. DATABASE_URL stays server-side.

CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The single live document. INSERT is idempotent.
INSERT INTO site_content (id, data)
VALUES ('default', '{"business":{"phones":[],"whatsapp":"","addressEn":"","addressTa":""},"menus":[],"gallery":[],"testimonials":[]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE site_content IS 'Single-row live website content (id=default), published from the catering CRM site manager.';
