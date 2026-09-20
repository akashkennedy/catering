import { cookies } from "next/headers";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "./server-auth";
import {
  FULL_PERMISSIONS,
  getSession,
  getUserById,
  resolvePermissions,
  type DbPermissions,
  type DbUser,
} from "./authDb";
import { DbNotConfiguredError } from "./db";

export type RequestSession = {
  user: DbUser | { id: string; username: string; isAdmin: true; employeeId: null };
  permissions: DbPermissions;
  /** True when authenticated via the legacy env-credential HMAC flow. */
  legacy: boolean;
};

function isHmacToken(token: string): boolean {
  return token.split(".").length === 3;
}

/**
 * Resolves the request's login session. Prefers database sessions; falls
 * back to legacy HMAC tokens when the database is not configured (or the
 * token predates migration). Returns null when unauthenticated.
 */
export async function resolveRequestSession(): Promise<RequestSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  if (isHmacToken(token)) {
    const legacy = verifySessionToken(token);
    if (!legacy) return null;
    return {
      user: { id: "legacy-admin", username: legacy.username, isAdmin: true, employeeId: null },
      permissions: { userId: "legacy-admin", ...FULL_PERMISSIONS },
      legacy: true,
    };
  }

  try {
    const session = await getSession(token);
    if (!session) return null;
    const user = await getUserById(session.userId);
    if (!user) return null;
    return { user, permissions: await resolvePermissions(user), legacy: false };
  } catch (error) {
    if (error instanceof DbNotConfiguredError) return null;
    throw error;
  }
}
