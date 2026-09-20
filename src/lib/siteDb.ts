import { db, DbNotConfiguredError } from "./db";

/**
 * Neon (Postgres) access for the shared website content doc.
 * Server-only: DATABASE_URL must never be exposed to the browser.
 * The website project reads the same table with its own connection string.
 */

export type SiteContentRow = {
  data: unknown;
  updatedAt: string;
};

export class SiteDbNotConfiguredError extends DbNotConfiguredError {
  constructor() {
    super();
    this.name = "SiteDbNotConfiguredError";
  }
}

export function siteDb() {
  return db();
}

export async function getSiteContentRow(): Promise<SiteContentRow | null> {
  const sql = siteDb();
  const rows = await sql`
    SELECT data, updated_at AS "updatedAt"
    FROM site_content
    WHERE id = 'default'
  `;
  if (rows.length === 0) return null;
  const row = rows[0] as { data: unknown; updatedAt: Date | string };
  return {
    data: row.data,
    updatedAt:
      row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export async function publishSiteContentRow(data: unknown): Promise<string> {
  const sql = siteDb();
  const rows = await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES ('default', ${JSON.stringify(data)}, NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    RETURNING updated_at AS "updatedAt"
  `;
  const updatedAt = (rows[0] as { updatedAt: Date | string }).updatedAt;
  return updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt);
}
