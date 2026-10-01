import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import { INGREDIENT_TAGS } from "@/lib/ingredientTags";
import type { Ingredient } from "@/store/ingredients";

const ingredientSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string(),
  tamilName: z.string(),
  tag: z.enum(INGREDIENT_TAGS),
  unit: z.string(),
  qty: z.number().finite(),
  globalPrice: z.number().finite().min(0),
  openingStock: z.number().finite(),
  lowStockThreshold: z.number().finite(),
});

type IngredientRow = Record<string, unknown>;

export function toIngredient(row: IngredientRow): Ingredient {
  const rawUpdatedAt = row.updated_at;
  let updatedAt: string | undefined;
  if (rawUpdatedAt instanceof Date) updatedAt = rawUpdatedAt.toISOString();
  else if (typeof rawUpdatedAt === "string" && rawUpdatedAt) updatedAt = rawUpdatedAt;
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    tamilName: String(row.tamil_name ?? ""),
    tag: (INGREDIENT_TAGS as readonly string[]).includes(String(row.tag))
      ? (row.tag as Ingredient["tag"])
      : "grocery",
    unit: String(row.unit ?? ""),
    qty: Number(row.qty) || 0,
    globalPrice: Number(row.global_price) || 0,
    openingStock: Number(row.opening_stock) || 0,
    lowStockThreshold: Number(row.low_stock_threshold) || 0,
    ...(updatedAt ? { updatedAt } : {}),
  };
}

function newId(): string {
  return `ing-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const url = new URL(request.url);
  const sinceRaw = url.searchParams.get("since");
  const metaOnly = url.searchParams.get("meta") === "1";

  if (metaOnly) {
    const meta = (await sql`
      SELECT COUNT(*)::int AS count, MAX(updated_at) AS max_updated_at
      FROM ingredients WHERE deleted_at IS NULL
    `) as Array<{ count: number; max_updated_at: Date | string | null }>;
    const max = meta[0]?.max_updated_at;
    return NextResponse.json({
      count: meta[0]?.count ?? 0,
      maxUpdatedAt: max instanceof Date ? max.toISOString() : (max ?? null),
    });
  }

  if (sinceRaw) {
    const since = new Date(sinceRaw);
    if (Number.isNaN(since.getTime())) {
      return NextResponse.json({ error: "Invalid since timestamp." }, { status: 400 });
    }
    const changed = (await sql`
      SELECT * FROM ingredients
      WHERE updated_at > ${since.toISOString()} AND deleted_at IS NULL
      ORDER BY name ASC
    `) as IngredientRow[];
    const deleted = (await sql`
      SELECT id FROM ingredients
      WHERE updated_at > ${since.toISOString()} AND deleted_at IS NOT NULL
    `) as IngredientRow[];
    const now = (await sql`SELECT NOW() AS now`) as Array<{ now: Date }>;
    return NextResponse.json({
      ingredients: changed.map(toIngredient),
      deletedIds: deleted.map((row) => String(row.id)),
      serverTime: (now[0]?.now instanceof Date ? now[0].now.toISOString() : new Date().toISOString()),
    });
  }

  const rows = await sql`SELECT * FROM ingredients WHERE deleted_at IS NULL ORDER BY name ASC`;
  return NextResponse.json({
    ingredients: (rows as IngredientRow[]).map(toIngredient),
  });
}

/** Creates an ingredient, silently merging on duplicate normalized name (upsert). */
export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = ingredientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ingredient." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  const d = parsed.data;
  const normalizedName = d.name.trim().toLowerCase();
  // Silent merge: same normalized name converges onto one row instead of 409.
  const clash =
    (await sql`SELECT * FROM ingredients WHERE LOWER(name) = ${normalizedName} AND id <> ${id} LIMIT 1`) as IngredientRow[];
  if (clash.length > 0 && !clash[0].deleted_at) {
    const existingId = String(clash[0].id);
    const mergedRows = (await sql`
      UPDATE ingredients SET
        name = ${d.name},
        tamil_name = ${d.tamilName},
        tag = ${d.tag},
        unit = ${d.unit},
        global_price = ${d.globalPrice},
        updated_at = NOW(),
        deleted_at = NULL
      WHERE id = ${existingId}
      RETURNING *
    `) as IngredientRow[];
    if (mergedRows.length > 0) {
      return NextResponse.json({ ingredient: toIngredient(mergedRows[0]), merged: true });
    }
  }
  // Resurrect a soft-deleted row with the same name under the existing id.
  if (clash.length > 0 && clash[0].deleted_at) {
    const existingId = String(clash[0].id);
    const revived = (await sql`
      UPDATE ingredients SET
        name = ${d.name},
        tamil_name = ${d.tamilName},
        tag = ${d.tag},
        unit = ${d.unit},
        qty = ${d.qty},
        global_price = ${d.globalPrice},
        opening_stock = ${d.openingStock},
        low_stock_threshold = ${d.lowStockThreshold},
        updated_at = NOW(),
        deleted_at = NULL
      WHERE id = ${existingId}
      RETURNING *
    `) as IngredientRow[];
    if (revived.length > 0) {
      return NextResponse.json({ ingredient: toIngredient(revived[0]), merged: true });
    }
  }
  const inserted = (await sql`
    INSERT INTO ingredients
      (id, name, tamil_name, tag, unit, qty, global_price, opening_stock, low_stock_threshold, updated_at, deleted_at)
    VALUES
      (${id}, ${d.name}, ${d.tamilName}, ${d.tag}, ${d.unit}, ${d.qty}, ${d.globalPrice}, ${d.openingStock}, ${d.lowStockThreshold}, NOW(), NULL)
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `) as IngredientRow[];
  const rows =
    inserted.length > 0
      ? inserted
      : ((await sql`SELECT * FROM ingredients WHERE id = ${id} AND deleted_at IS NULL LIMIT 1`) as IngredientRow[]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save ingredient." }, { status: 500 });
  }
  return NextResponse.json({ ingredient: toIngredient(rows[0] as IngredientRow) });
}
