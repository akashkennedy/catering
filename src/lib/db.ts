import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Shared Neon (Postgres) client. Server-only: DATABASE_URL must never be
 * exposed to the browser. Connection strings come from the server
 * environment (Neon pooled URL).
 */

export class DbNotConfiguredError extends Error {
  constructor() {
    super(
      "DATABASE_URL is not set. Add your Neon pooled connection string to the server environment."
    );
    this.name = "DbNotConfiguredError";
  }
}

let cachedSql: NeonQueryFunction<false, false> | null = null;

/** Returns the cached query function, throwing when unconfigured. */
export function db(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DbNotConfiguredError();
  if (!cachedSql) cachedSql = neon(url);
  return cachedSql;
}

/** For tests/scripts that need to reset the cached client. */
export function resetDbClient(): void {
  cachedSql = null;
}
