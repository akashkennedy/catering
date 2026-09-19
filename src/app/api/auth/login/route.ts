import { NextResponse } from "next/server";

import {
  createSessionToken,
  getSessionCookieHeader,
  verifyCredentials,
} from "@/lib/server-auth";

export async function POST(request: Request) {
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

  // Credentials are validated server-side only; never compare secrets on the client.
  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const normalized = username.trim();
  const { token } = createSessionToken(normalized);
  const response = NextResponse.json({ username: normalized });
  response.headers.append("Set-Cookie", getSessionCookieHeader(token));
  return response;
}
