/**
 * Minimal write-ahead outbox for offline-tolerant mutations.
 * Failed API writes are appended here (localStorage) and replayed in order
 * on the next successful load. Server routes must be idempotent for replays:
 * POSTs carry client-generated ids with ON CONFLICT DO NOTHING, DELETEs are
 * naturally idempotent.
 */

export type OutboxOp = {
  id: string;
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
};

const KEY = "catering-outbox";
const MAX_OPS = 500;

function readOps(): OutboxOp[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OutboxOp[]) : [];
  } catch {
    return [];
  }
}

function writeOps(ops: OutboxOp[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ops.slice(-MAX_OPS)));
  } catch {
    // Storage full/blocked: drop the queue rather than crash the app.
  }
}

function newOpId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `op-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export function queueOp(op: Omit<OutboxOp, "id">): void {
  if (typeof window === "undefined") return;
  writeOps([...readOps(), { ...op, id: newOpId() }]);
}

export function pendingOpCount(): number {
  if (typeof window === "undefined") return 0;
  return readOps().length;
}

/** Drops all queued ops (e.g. after a full local wipe so cleared data cannot replay). */
export function clearOutbox(): void {
  if (typeof window === "undefined") return;
  writeOps([]);
}

/**
 * Replays queued ops in order. Stops at the first retryable failure (order
 * matters: a POST must precede its DELETE). Permanent client errors
 * (400/403/404/409 — e.g. a permission the user will never gain, or a
 * delete refused by server-side guards) are dropped instead of clogging
 * the queue; 401/429 and network errors are retried.
 */
export async function flushOutbox(): Promise<{ flushed: number; failed: number }> {
  if (typeof window === "undefined") return { flushed: 0, failed: 0 };
  let ops = readOps();
  let flushed = 0;
  for (const op of ops) {
    let status: number | null = null;
    try {
      const response = await fetch(op.path, {
        method: op.method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: op.body === undefined ? undefined : JSON.stringify(op.body),
      });
      status = response.status;
    } catch {
      status = null;
    }
    if (status !== null && status >= 200 && status < 300) {
      flushed += 1;
      ops = ops.filter((item) => item.id !== op.id);
      writeOps(ops);
      continue;
    }
    if (status === 400 || status === 403 || status === 404 || status === 409) {
      // 409 today means a refused course DELETE (still linked in templates):
      // retrying can never succeed, and keeping it would clog every later op.
      ops = ops.filter((item) => item.id !== op.id);
      writeOps(ops);
      continue;
    }
    break;
  }
  return { flushed, failed: readOps().length };
}
