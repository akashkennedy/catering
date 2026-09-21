import { NextResponse } from "next/server";

import { resolveRequestSession, type RequestSession } from "./authSession";
import type { DbPermissions } from "./authDb";
import { isDatabaseUnreachable } from "./db";

export type PermissionKey = keyof Omit<DbPermissions, "userId">;

export type Authorized = { session: RequestSession };

/**
 * Session + granular permission gate for API routes. Enforcement lives
 * here — hiding UI is not security. Returns the session on success or a
 * ready-to-return 401/403 response on failure. A dead database maps to
 * 503 (no stack/SQL leaks) instead of Next.js's default 500 page.
 */
export async function requirePermission(
  key: PermissionKey
): Promise<Authorized | { response: NextResponse }> {
  let session: RequestSession | null;
  try {
    session = await resolveRequestSession();
  } catch (error) {
    if (isDatabaseUnreachable(error)) return { response: databaseUnavailable() };
    throw error;
  }
  if (!session) {
    return { response: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }
  if (!session.permissions[key]) {
    return { response: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { session };
}

/** Session gate without a specific permission (any signed-in user). */
export async function requireSession(): Promise<Authorized | { response: NextResponse }> {
  let session: RequestSession | null;
  try {
    session = await resolveRequestSession();
  } catch (error) {
    if (isDatabaseUnreachable(error)) return { response: databaseUnavailable() };
    throw error;
  }
  if (!session) {
    return { response: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }
  return { session };
}

function databaseUnavailable(): NextResponse {
  return NextResponse.json(
    { error: "Database temporarily unavailable. Please retry." },
    { status: 503 }
  );
}
