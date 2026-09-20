import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import { toUtensil } from "../route";

const utensilPatchSchema = z.object({
  name: z.string(),
  rentPrice: z.number().finite().min(0),
  openingStock: z.number().finite(),
  lowStockThreshold: z.number().finite(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = utensilPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid utensil." }, { status: 400 });
  }
  const sql = db();
  const existing = await sql`SELECT id FROM utensils WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Utensil not found." }, { status: 404 });
  }
  const rows = (await sql`
    UPDATE utensils SET
      name = ${parsed.data.name},
      rent_price = ${parsed.data.rentPrice},
      opening_stock = ${parsed.data.openingStock},
      low_stock_threshold = ${parsed.data.lowStockThreshold},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as Record<string, unknown>[];
  return NextResponse.json({ utensil: toUtensil(rows[0] as Record<string, unknown>) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const sql = db();
  await sql`DELETE FROM utensils WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
