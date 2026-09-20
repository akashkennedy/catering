-- 0002_catalog: ingredients, food templates + dishes.
-- Ingredient references are plain TEXT (no FK): the app today tolerates
-- dangling references ("Unknown ingredient") when a master row is deleted,
-- and the migration must preserve that behavior. Structural nesting uses FKs.

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tamil_name TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT 'grocery',
  unit TEXT NOT NULL DEFAULT '',
  qty NUMERIC NOT NULL DEFAULT 0,
  global_price NUMERIC NOT NULL DEFAULT 0,
  opening_stock NUMERIC NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_templates (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL DEFAULT '',
  name_ta TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_dishes (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES food_templates (id) ON DELETE CASCADE,
  name_en TEXT NOT NULL DEFAULT '',
  name_ta TEXT NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS template_dishes_template_id_idx ON template_dishes (template_id);

CREATE TABLE IF NOT EXISTS template_dish_ingredients (
  id TEXT PRIMARY KEY,
  dish_id TEXT NOT NULL REFERENCES template_dishes (id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL,
  qty_per_100 NUMERIC NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS template_dish_ingredients_dish_id_idx
  ON template_dish_ingredients (dish_id);
