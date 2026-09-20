-- 0001_auth: users, sessions, permissions.
-- IDs are app-generated UUID strings (TEXT) so the one-time localStorage
-- migration can preserve existing client-side ids.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  employee_id TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS permissions (
  user_id TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  can_view_finance BOOLEAN NOT NULL DEFAULT FALSE,
  can_view_other_employee_rates BOOLEAN NOT NULL DEFAULT FALSE,
  can_manage_employees BOOLEAN NOT NULL DEFAULT TRUE,
  can_manage_settings BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- employees(employee_id) FK is added in 0004_operations once that table exists.
-- NOTE: users.email uniqueness is exact-match; the app always stores
-- lowercased trimmed emails.
