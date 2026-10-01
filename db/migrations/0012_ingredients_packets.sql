-- 0012_ingredients_packets: packet count on the ingredient master.
-- Plain numeric stock-style field (like qty/opening_stock): no math changes,
-- displayed alongside qty/unit in master lists, costing hints and stock flows.

ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS packets NUMERIC NOT NULL DEFAULT 0;
