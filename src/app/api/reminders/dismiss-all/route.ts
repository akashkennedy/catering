import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";

export async function POST() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  await sql`UPDATE reminders SET dismissed = TRUE WHERE dismissed = FALSE`;
  return NextResponse.json({ ok: true });
}
