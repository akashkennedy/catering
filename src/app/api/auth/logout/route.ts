import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getClearedSessionCookieHeader, SESSION_COOKIE_NAME } from "@/lib/server-auth";
import { deleteSession } from "@/lib/authDb";
import { DbNotConfiguredError } from "@/lib/db";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    // DB session ids are UUIDs (no dots); HMAC tokens have nothing to delete.
    if (token && token.split(".").length !== 3) {
      await deleteSession(token);
    }
  } catch (error) {
    if (!(error instanceof DbNotConfiguredError)) throw error;
  }
  const response = NextResponse.json({ ok: true });
  response.headers.append("Set-Cookie", getClearedSessionCookieHeader());
  return response;
}
