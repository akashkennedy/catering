import { NextResponse } from "next/server";

import { requireSession } from "@/lib/requirePermission";

export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 500;
const GOOGLE_TIMEOUT_MS = 8000;
const MYMEMORY_TIMEOUT_MS = 8000;
const CACHE_MAX = 500;

const cache = new Map<string, { tamil: string; source: string }>();

function cacheKey(text: string, from: string, to: string): string {
  return `${from}|${to}|${text.trim().toLowerCase()}`;
}

function cacheGet(key: string) {
  const hit = cache.get(key);
  if (!hit) return undefined;
  // Refresh LRU order.
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

function cacheSet(key: string, value: { tamil: string; source: string }) {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, value);
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

function containsTamilScript(value: string): boolean {
  return /[\u0B80-\u0BFF]/.test(value);
}

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

async function tryGoogle(text: string, from: string, to: string): Promise<string | null> {
  const { signal, cancel } = withTimeout(GOOGLE_TIMEOUT_MS);
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const joined = (data[0] as unknown[])
      .map((sentence) => (Array.isArray(sentence) && typeof sentence[0] === "string" ? sentence[0] : ""))
      .join("")
      .trim();
    if (!joined || joined.toLowerCase() === text.trim().toLowerCase()) return null;
    return joined;
  } catch {
    return null;
  } finally {
    cancel();
  }
}

async function tryMyMemory(text: string, from: string, to: string): Promise<string | null> {
  const { signal, cancel } = withTimeout(MYMEMORY_TIMEOUT_MS);
  try {
    const url =
      `https://api.mymemory.translated.net/get` +
      `?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
    const response = await fetch(url, { signal });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      responseData?: { translatedText?: string };
    };
    const translated = (body.responseData?.translatedText ?? "").trim();
    if (!translated) return null;
    if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(translated)) return null;
    if (translated.toLowerCase() === text.trim().toLowerCase()) return null;
    return translated;
  } catch {
    return null;
  } finally {
    cancel();
  }
}

/**
 * Free translation proxy: online Tamil with wide coverage.
 * No API key. Primary Google gtx, fallback MyMemory. Short food/template
 * names only — hard offline dictionary in the client remains the fallback.
 */
export async function GET(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { searchParams } = new URL(request.url);
  const text = (searchParams.get("text") ?? "").trim();
  const from = (searchParams.get("from") ?? "en").trim().toLowerCase() || "en";
  const to = (searchParams.get("to") ?? "ta").trim().toLowerCase() || "ta";

  if (!text) {
    return NextResponse.json({ error: "Missing text." }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Text too long." }, { status: 400 });
  }

  const key = cacheKey(text, from, to);
  const cached = cacheGet(key);
  if (cached) {
    return NextResponse.json({ tamil: cached.tamil, source: cached.source, cached: true });
  }

  const google = await tryGoogle(text, from, to);
  if (google) {
    // Tamil targets only accept Tamil-script output; anything else falls
    // through to MyMemory. Other target languages keep the non-empty check.
    const tamilTarget = to === "ta" || to.startsWith("ta-");
    if (!tamilTarget || containsTamilScript(google)) {
      const result = { tamil: google, source: "google" };
      cacheSet(key, result);
      return NextResponse.json({ ...result, cached: false });
    }
  }

  const memory = await tryMyMemory(text, from, to);
  if (memory) {
    const tamilTarget = to === "ta" || to.startsWith("ta-");
    if (!tamilTarget || containsTamilScript(memory)) {
      const result = { tamil: memory, source: "mymemory" };
      cacheSet(key, result);
      return NextResponse.json({ ...result, cached: false });
    }
  }

  return NextResponse.json({ tamil: "", source: "none" }, { status: 502 });
}
