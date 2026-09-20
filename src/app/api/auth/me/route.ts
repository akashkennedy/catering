import { NextResponse } from "next/server";

import { resolveRequestSession } from "@/lib/authSession";

export async function GET() {
  const session = await resolveRequestSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      isAdmin: session.user.isAdmin,
      employeeId: session.user.employeeId,
    },
    permissions: session.permissions,
  });
}
