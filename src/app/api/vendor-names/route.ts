import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";

const vendorSchema = z.object({ name: z.string().trim().min(1) });

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT name FROM vendor_names ORDER BY name ASC`;
  return NextResponse.json({
    vendorNames: (rows as { name: unknown }[]).map((row) => String(row.name)),
  });
}

export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = vendorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vendor name." }, { status: 400 });
  }
  const sql = db();
  await sql`INSERT INTO vendor_names (name) VALUES (${parsed.data.name}) ON CONFLICT (name) DO NOTHING`;
  return NextResponse.json({ ok: true });
}
