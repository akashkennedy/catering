/**
 * Connection probe: writes and reads back a single scratch row.
 * Idempotent and harmless to run any time.
 *
 * Usage: DATABASE_URL=... node scripts/db-check.mjs
 * (npm run db:check loads .env via --env-file automatically)
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. See .env.example.");
  process.exit(1);
}

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS db_probe (
    id TEXT PRIMARY KEY,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const stamp = new Date().toISOString();
await sql`
  INSERT INTO db_probe (id, checked_at)
  VALUES ('check', ${stamp}::timestamptz)
  ON CONFLICT (id) DO UPDATE SET checked_at = EXCLUDED.checked_at
`;
const rows = await sql`SELECT checked_at FROM db_probe WHERE id = 'check'`;
const back = rows[0]?.checked_at;
const backIso = back instanceof Date ? back.toISOString() : String(back);

if (backIso === stamp) {
  console.log(`OK: round-trip succeeded at ${backIso}`);
} else {
  console.error(`MISMATCH: wrote ${stamp}, read back ${backIso}`);
  process.exit(1);
}
