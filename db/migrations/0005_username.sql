-- 0005_username: logins use username instead of email.
-- Backfills username from the stored (already lowercased/trimmed) email,
-- enforces NOT NULL + UNIQUE, then drops the email column. Existing logins
-- keep working with their previous value as the username.

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

UPDATE users SET username = email WHERE username IS NULL;

ALTER TABLE users ALTER COLUMN username SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END
$$;

ALTER TABLE users DROP COLUMN IF EXISTS email;
