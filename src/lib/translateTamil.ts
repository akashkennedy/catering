/**
 * Online-first Tamil translation helper.
 * Calls the same-origin `/api/translate` proxy (Google gtx -> MyMemory),
 * with an in-memory + localStorage cache. Returns null offline or on failure
 * so callers fall back to the hardcoded offline dictionary.
 */

export type OnlineTamilResult = {
  tamil: string;
  source: string;
};

const STORAGE_KEY = "catering-tamil-cache-v1";
const MEMORY_MAX = 500;

const memoryCache = new Map<string, OnlineTamilResult>();
const inflight = new Map<string, Promise<OnlineTamilResult | null>>();

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function readStorage(): Record<string, OnlineTamilResult> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, OnlineTamilResult>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(key: string, value: OnlineTamilResult) {
  try {
    const store = readStorage();
    store[key] = value;
    const keys = Object.keys(store);
    if (keys.length > MEMORY_MAX) {
      for (const oldest of keys.slice(0, keys.length - MEMORY_MAX)) {
        delete store[oldest];
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable — memory cache still works.
  }
}

function remember(key: string, value: OnlineTamilResult) {
  if (memoryCache.has(key)) memoryCache.delete(key);
  memoryCache.set(key, value);
  while (memoryCache.size > MEMORY_MAX) {
    const oldest = memoryCache.keys().next().value;
    if (oldest === undefined) break;
    memoryCache.delete(oldest);
  }
  writeStorage(key, value);
}

/** Synchronous cache read for instant paint before the network resolves. */
export function getCachedOnlineTamil(englishName: string): OnlineTamilResult | undefined {
  const key = normalize(englishName);
  if (!key) return undefined;
  const hit = memoryCache.get(key);
  if (hit) return hit;
  try {
    const stored = readStorage()[key];
    if (stored?.tamil) {
      memoryCache.set(key, stored);
      return stored;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

async function requestOnlineTamil(englishName: string, signal?: AbortSignal): Promise<OnlineTamilResult | null> {
  const response = await fetch(`/api/translate?text=${encodeURIComponent(englishName.trim())}&from=en&to=ta`, {
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { tamil?: string; source?: string };
  const tamil = (body.tamil ?? "").trim();
  if (!tamil) return null;
  return { tamil, source: body.source ?? "online" };
}

/**
 * Preferred online translation. Wide coverage, no hardcoded list needed.
 * Null when offline, aborted, rate-limited, or failed — caller keeps offline dict value.
 */
export function fetchOnlineTamil(englishName: string, signal?: AbortSignal): Promise<OnlineTamilResult | null> {
  const key = normalize(englishName);
  if (!key) return Promise.resolve(null);
  if (typeof navigator !== "undefined" && !navigator.onLine) return Promise.resolve(null);

  const cached = getCachedOnlineTamil(englishName);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(key);
  if (pending) return pending;

  const task = requestOnlineTamil(englishName, signal)
    .then((result) => {
      if (result) remember(key, result);
      return result;
    })
    .catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") return null;
      return null;
    })
    .finally(() => {
      if (inflight.get(key) === task) inflight.delete(key);
    });
  inflight.set(key, task);
  return task;
}
