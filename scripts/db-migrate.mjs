/**
 * Applies db/migrations/*.sql in filename order, tracking state in
 * schema_migrations. Idempotent — already-applied files are skipped.
 *
 * Usage: DATABASE_URL=... node scripts/db-migrate.mjs
 * (npm run db:migrate loads .env via --env-file automatically)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "db", "migrations");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. See .env.example.");
  process.exit(1);
}

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const applied = new Set(
  (await sql`SELECT filename FROM schema_migrations`).map((row) => row.filename)
);

const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

let ran = 0;
for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip  ${file} (already applied)`);
    continue;
  }
  const contents = readFileSync(join(migrationsDir, file), "utf8");
  // The neon http driver doesn't support multi-statement strings, so split
  // on semicolons outside of DO blocks. Migration files avoid stray
  // semicolons except statement terminators and the DO $$ body below.
  await applyStatements(sql, contents);
  await sql`INSERT INTO schema_migrations (filename) VALUES (${file})`;
  console.log(`apply ${file}`);
  ran += 1;
}

console.log(ran === 0 ? "Nothing to apply — database is up to date." : `Applied ${ran} migration(s).`);

/**
 * Splits SQL text into statements, keeping dollar-quoted (DO $$ ... $$)
 * bodies intact.
 */
async function applyStatements(sqlFn, text) {
  const statements = [];
  let current = "";
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("$$", i)) {
      const end = text.indexOf("$$", i + 2);
      const stop = end === -1 ? text.length : end + 2;
      current += text.slice(i, stop);
      i = stop;
      continue;
    }
    if (text[i] === "-" && text[i + 1] === "-") {
      const end = text.indexOf("\n", i);
      i = end === -1 ? text.length : end;
      continue;
    }
    current += text[i];
    if (text[i] === ";") {
      statements.push(current);
      current = "";
    }
    i += 1;
  }
  if (current.trim() !== "") statements.push(current);
  for (const statement of statements) {
    if (statement.trim() === "" || statement.trim() === ";") continue;
    // Raw DDL strings (no parameters) must go through .query() — the
    // neon http driver only accepts tagged-template calls via sql``.
    await sqlFn.query(statement);
  }
}
