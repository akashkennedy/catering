import { NextResponse } from "next/server";

import {
  createSessionToken,
  getSessionCookieHeader,
  verifyCredentials,
} from "@/lib/server-auth";
import { DbNotConfiguredError } from "@/lib/db";
import {
  createSession as createDbSession,
  getUserByUsername,
  normalizeUsername,
} from "@/lib/authDb";
import { verifyPassword } from "@/lib/password";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username, password } =
    (body as { username?: unknown; password?: unknown }) ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  // Preferred path: database users (username + bcrypt hash).
  try {
    const user = await getUserByUsername(username);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    attempts.delete(ip);
    const session = await createDbSession(user.id);
    const response = NextResponse.json({ username: user.username, isAdmin: user.isAdmin });
    response.headers.append("Set-Cookie", getSessionCookieHeader(session.id));
    return response;
  } catch (error) {
    // No database configured yet: fall back to the legacy env-credential
    // flow so the app keeps working pre-migration. Any other DB error is real.
    if (!(error instanceof DbNotConfiguredError)) {
      return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
    }
  }

  // Legacy path: env credentials + stateless HMAC session. Removed once the
  // database is the source of truth (see Step 7).
  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  attempts.delete(ip);

  const normalized = normalizeUsername(username);
  const { token } = createSessionToken(normalized);
  const response = NextResponse.json({ username: normalized, isAdmin: true });
  response.headers.append("Set-Cookie", getSessionCookieHeader(token));
  return response;
}
