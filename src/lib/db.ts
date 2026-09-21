import { neon, NeonDbError, type NeonQueryFunction } from "@neondatabase/serverless";

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

/**
 * True when the error is a transport-level failure reaching Neon (cold
 * compute wake exceeding the driver's connect timeout, DNS/TLS blips).
 * Walks the NeonDbError → sourceError → cause chain for undici's
 * connect-timeout code. Never matches SQL/constraint errors.
 */
export function isDatabaseUnreachable(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const record = current as Record<string, unknown>;
    if (typeof record.code === "string" && record.code.startsWith("UND_ERR_")) return true;
    if (record instanceof NeonDbError) {
      current = record.sourceError;
      continue;
    }
    const cause = (record as { cause?: unknown }).cause;
    if (cause && typeof cause === "object") {
      current = cause;
      continue;
    }
    return false;
  }
  return false;
}

const RETRY_DELAYS_MS = [1500, 4000];

async function withColdStartRetry<T>(run: () => Promise<T>): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await run();
    } catch (error) {
      if (!isDatabaseUnreachable(error) || attempt >= RETRY_DELAYS_MS.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      attempt += 1;
    }
  }
}

/** Returns the cached query function, throwing when unconfigured. */
export function db(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DbNotConfiguredError();
  if (!cachedSql) {
    const sql = neon(url);
    cachedSql = new Proxy(sql, {
      apply(_target, _thisArg, args) {
        return withColdStartRetry(() => Reflect.apply(sql, undefined, args));
      },
      get(_target, prop) {
        const value = (sql as unknown as Record<string | symbol, unknown>)[prop];
        if (typeof value !== "function") return value;
        if (prop === "transaction") {
          return (...transactionArgs: unknown[]) =>
            withColdStartRetry(async () =>
              Reflect.apply(value as (...a: unknown[]) => unknown, sql, transactionArgs)
            );
        }
        return (...methodArgs: unknown[]) =>
          Reflect.apply(value as (...a: unknown[]) => unknown, sql, methodArgs);
      },
    }) as NeonQueryFunction<false, false>;
  }
  return cachedSql;
}

/** For tests/scripts that need to reset the cached client. */
export function resetDbClient(): void {
  cachedSql = null;
}
