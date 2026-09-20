/**
 * Shared client for API-first Zustand stores. Mutations apply to the local
 * cache synchronously (offline reads keep working) and sync in the
 * background; failures land in the outbox for ordered replay on next load.
 */

export function newClientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

type WriteMethod = "POST" | "PATCH" | "DELETE";

async function request(path: string, method: WriteMethod, body?: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Fire-and-forget sync: attempts the request, queues it on failure. */
export async function syncOrQueue(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<void> {
  const ok = await request(path, method, body);
  if (!ok) {
    const { queueOp } = await import("./outbox");
    queueOp({ method, path, body });
  }
}

/** GET helper returning parsed JSON or null on any failure/offline. */
export async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path, { credentials: "same-origin" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
