-- 0011_ingredients_sync: local-first delta sync + silent upsert support.
-- Soft-delete tombstones let ?since= clients learn about deletes without a full refetch.

ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

UPDATE ingredients SET updated_at = NOW() WHERE updated_at IS NULL;

-- Merge pre-existing same-name duplicates (keeps latest updated_at, repoints
-- plain-text references, soft-deletes losers) so the unique index below can
-- be created on catalogs that already contain dupes.
UPDATE template_dish_ingredients t SET ingredient_id = w.winner FROM (SELECT LOWER(name) AS n, (ARRAY_AGG(id ORDER BY updated_at DESC))[1] AS winner FROM ingredients GROUP BY 1 HAVING COUNT(*) > 1) w JOIN ingredients l ON LOWER(l.name) = w.n AND l.id <> w.winner WHERE t.ingredient_id = l.id;

UPDATE event_ingredient_lines e SET ingredient_id = w.winner FROM (SELECT LOWER(name) AS n, (ARRAY_AGG(id ORDER BY updated_at DESC))[1] AS winner FROM ingredients GROUP BY 1 HAVING COUNT(*) > 1) w JOIN ingredients l ON LOWER(l.name) = w.n AND l.id <> w.winner WHERE e.ingredient_id = l.id;

UPDATE stock_ledger_entries s SET ingredient_id = w.winner FROM (SELECT LOWER(name) AS n, (ARRAY_AGG(id ORDER BY updated_at DESC))[1] AS winner FROM ingredients GROUP BY 1 HAVING COUNT(*) > 1) w JOIN ingredients l ON LOWER(l.name) = w.n AND l.id <> w.winner WHERE s.ingredient_id = l.id;

UPDATE course_ingredients c SET ingredient_id = w.winner FROM (SELECT LOWER(name) AS n, (ARRAY_AGG(id ORDER BY updated_at DESC))[1] AS winner FROM ingredients GROUP BY 1 HAVING COUNT(*) > 1) w JOIN ingredients l ON LOWER(l.name) = w.n AND l.id <> w.winner WHERE c.ingredient_id = l.id;

UPDATE ingredients l SET deleted_at = NOW(), updated_at = NOW() FROM (SELECT LOWER(name) AS n, (ARRAY_AGG(id ORDER BY updated_at DESC))[1] AS winner FROM ingredients GROUP BY 1 HAVING COUNT(*) > 1) w WHERE LOWER(l.name) = w.n AND l.id <> w.winner AND l.deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ingredients_lower_name_idx
  ON ingredients (LOWER(name)) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ingredients_updated_at_idx
  ON ingredients (updated_at);
