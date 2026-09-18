import { NextResponse } from "next/server";

import { getClearedSessionCookieHeader } from "@/lib/server-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.append("Set-Cookie", getClearedSessionCookieHeader());
  return response;
}
