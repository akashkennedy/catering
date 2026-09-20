import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("canViewFinance");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const sql = db();
  await sql`DELETE FROM expenses WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
