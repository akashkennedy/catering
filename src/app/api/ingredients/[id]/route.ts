import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import { INGREDIENT_TAGS } from "@/lib/ingredientTags";
import { toIngredient } from "../route";

const ingredientPatchSchema = z
  .object({
    name: z.string().optional(),
    tamilName: z.string().optional(),
    tag: z.enum(INGREDIENT_TAGS).optional(),
    unit: z.string().optional(),
    qty: z.number().finite().optional(),
    globalPrice: z.number().finite().min(0).optional(),
    openingStock: z.number().finite().optional(),
    lowStockThreshold: z.number().finite().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Empty patch." });

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
  const parsed = ingredientPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ingredient patch." }, { status: 400 });
  }
  const sql = db();
  const existing = await sql`SELECT * FROM ingredients WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Ingredient not found." }, { status: 404 });
  }
  const merged = { ...toIngredient(existing[0] as Record<string, unknown>), ...parsed.data };
  await sql`
    UPDATE ingredients SET
      name = ${merged.name},
      tamil_name = ${merged.tamilName},
      tag = ${merged.tag},
      unit = ${merged.unit},
      qty = ${merged.qty},
      global_price = ${merged.globalPrice},
      opening_stock = ${merged.openingStock},
      low_stock_threshold = ${merged.lowStockThreshold},
      updated_at = NOW()
    WHERE id = ${id}
  `;
  return NextResponse.json({ ingredient: merged });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const sql = db();
  await sql`DELETE FROM ingredients WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
