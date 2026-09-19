-- 0003_events: events + per-event lines as FK child tables.
-- Line-level ingredient references stay plain TEXT (see 0002_catalog note).

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  function_type TEXT NOT NULL DEFAULT '',
  headcount INT NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'enquiry',
  template_id TEXT NULL,
  rate_per_person NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  advance_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_date_idx ON events (date);
CREATE INDEX IF NOT EXISTS events_status_idx ON events (status);

CREATE TABLE IF NOT EXISTS event_meal_groups (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  template_id TEXT NULL,
  headcount INT NOT NULL DEFAULT 0,
  selected_dish_ids JSONB NOT NULL DEFAULT '[]',
  position INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS event_meal_groups_event_id_idx ON event_meal_groups (event_id);

CREATE TABLE IF NOT EXISTS event_ingredient_lines (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS event_ingredient_lines_event_id_idx ON event_ingredient_lines (event_id);

CREATE TABLE IF NOT EXISTS event_employee_lines (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  employee_id TEXT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  to_pay NUMERIC NOT NULL DEFAULT 0,
  paid NUMERIC NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS event_employee_lines_event_id_idx ON event_employee_lines (event_id);

CREATE TABLE IF NOT EXISTS event_utensil_lines (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL DEFAULT '',
  vendor_phone TEXT NOT NULL DEFAULT '',
  utensil_id TEXT NULL,
  utensil_name TEXT NOT NULL DEFAULT '',
  qty NUMERIC NOT NULL DEFAULT 0,
  rental_price NUMERIC NOT NULL DEFAULT 0,
  date_from TEXT NOT NULL DEFAULT '',
  date_to TEXT NOT NULL DEFAULT '',
  returned BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS event_utensil_lines_event_id_idx ON event_utensil_lines (event_id);
