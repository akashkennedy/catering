import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/server-auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, username: null }, { status: 401 });
  }
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false, username: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: session.username });
}
