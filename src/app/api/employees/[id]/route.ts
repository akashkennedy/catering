import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";
import { toEmployee } from "../route";

const employeePatchSchema = z.object({
  name: z.string(),
  phone: z.string(),
  defaultRate: z.number().finite().min(0),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("canManageEmployees");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = employeePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid employee." }, { status: 400 });
  }
  const sql = db();
  const existing = await sql`SELECT id FROM employees WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }
  await sql`
    UPDATE employees SET
      name = ${parsed.data.name},
      phone = ${parsed.data.phone},
      default_rate = ${parsed.data.defaultRate},
      updated_at = NOW()
    WHERE id = ${id}
  `;
  const rows = await sql`SELECT * FROM employees WHERE id = ${id} LIMIT 1`;
  return NextResponse.json({ employee: toEmployee(rows[0] as Record<string, unknown>) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("canManageEmployees");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const sql = db();
  await sql`DELETE FROM employees WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
