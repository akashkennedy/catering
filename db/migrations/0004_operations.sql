-- 0004_operations: employees, utensils, ledgers, finance, reminders,
-- vendor suggestions, and the shared website doc (idempotent with V9 SQL).

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  default_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Back-reference for staff logins (added here so the table exists first).
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_employee_id_fkey'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_employee_id_fkey
      FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS utensils (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  rent_price NUMERIC NOT NULL DEFAULT 0,
  opening_stock NUMERIC NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_ledger_entries (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'used')),
  qty NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  event_id TEXT NULL,
  note TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS stock_ledger_entries_ingredient_id_idx
  ON stock_ledger_entries (ingredient_id);

CREATE TABLE IF NOT EXISTS vessel_stock_entries (
  id TEXT PRIMARY KEY,
  utensil_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rentedIn', 'assigned')),
  qty NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  event_id TEXT NULL,
  note TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS vessel_stock_entries_utensil_id_idx
  ON vessel_stock_entries (utensil_id);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'custom',
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS other_income (
  id TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NULL,
  phone TEXT NOT NULL DEFAULT '',
  note TEXT NULL,
  remind_at TEXT NOT NULL DEFAULT '',
  event_id TEXT NULL,
  dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reminders_remind_at_idx ON reminders (remind_at);

CREATE TABLE IF NOT EXISTS vendor_names (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_content (id, data)
VALUES ('default', '{"business":{"phones":[],"whatsapp":"","addressEn":"","addressTa":""},"menus":[],"gallery":[],"testimonials":[]}'::jsonb)
ON CONFLICT (id) DO NOTHING;
