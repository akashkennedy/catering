import { NextResponse } from "next/server";

import { resolveRequestSession } from "@/lib/authSession";

export async function GET() {
  const session = await resolveRequestSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, username: null }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    username: session.user.username,
    isAdmin: session.user.isAdmin,
  });
}
