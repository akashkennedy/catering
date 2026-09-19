import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "catering-session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SESSION_SECRET environment variable is required");
    }
    return "dev-only-secret";
  }
  return secret;
}

function getExpectedCredentials(): { username: string; password: string } {
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;
  if (!username || !password) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_USERNAME and AUTH_PASSWORD environment variables are required");
    }
    return { username: username ?? "admin", password: password ?? "admin" };
  }
  return { username, password };
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expected = getExpectedCredentials();
  return safeEqual(username.trim(), expected.username) && safeEqual(password, expected.password);
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data, "utf8").digest("base64url");
}

export function createSessionToken(username: string): { token: string; expiresAt: number } {
  const normalized = username.trim();
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${Buffer.from(normalized, "utf8").toString("base64url")}.${expiresAt}`;
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifySessionToken(token: string): { username: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedUser, expiresAtRaw, signature] = parts;
  const payload = `${encodedUser}.${expiresAtRaw}`;
  const expectedSig = sign(payload);
  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  try {
    const username = Buffer.from(encodedUser, "base64url").toString("utf8").trim();
    if (!username) return null;
    return { username };
  } catch {
    return null;
  }
}

export function getSessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function getClearedSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function validateAuthConfig(): void {
  const missing: string[] = [];
  if (!process.env.AUTH_SESSION_SECRET) missing.push("AUTH_SESSION_SECRET");
  if (!process.env.AUTH_USERNAME) missing.push("AUTH_USERNAME");
  if (!process.env.AUTH_PASSWORD) missing.push("AUTH_PASSWORD");

  if (missing.length === 0) return;

  const msg = `Missing required auth environment variables: ${missing.join(", ")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(msg);
  }
  console.warn(`[auth] ${msg}`);
}
