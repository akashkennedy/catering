import { NextResponse } from "next/server";

import { resolveRequestSession, type RequestSession } from "./authSession";
import type { DbPermissions } from "./authDb";

export type PermissionKey = keyof Omit<DbPermissions, "userId">;

export type Authorized = { session: RequestSession };

/**
 * Session + granular permission gate for API routes. Enforcement lives
 * here — hiding UI is not security. Returns the session on success or a
 * ready-to-return 401/403 response on failure.
 */
export async function requirePermission(
  key: PermissionKey
): Promise<Authorized | { response: NextResponse }> {
  const session = await resolveRequestSession();
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
  const session = await resolveRequestSession();
  if (!session) {
    return { response: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }
  return { session };
}
