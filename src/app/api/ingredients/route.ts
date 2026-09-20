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
  };
}

function newId(): string {
  return `ing-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT * FROM ingredients ORDER BY name ASC`;
  return NextResponse.json({
    ingredients: (rows as IngredientRow[]).map(toIngredient),
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
  const parsed = ingredientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ingredient." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  const d = parsed.data;
  // Names are unique (case-insensitive): reject duplicates at creation so
  // the catalog can't accumulate same-name rows under different ids.
  const nameClash =
    (await sql`SELECT id FROM ingredients WHERE LOWER(name) = ${d.name.trim().toLowerCase()} AND id <> ${id} LIMIT 1`) as IngredientRow[];
  if (nameClash.length > 0) {
    return NextResponse.json(
      { error: "An ingredient with that name already exists." },
      { status: 409 }
    );
  }
  const inserted = (await sql`
    INSERT INTO ingredients
      (id, name, tamil_name, tag, unit, qty, global_price, opening_stock, low_stock_threshold, updated_at)
    VALUES
      (${id}, ${d.name}, ${d.tamilName}, ${d.tag}, ${d.unit}, ${d.qty}, ${d.globalPrice}, ${d.openingStock}, ${d.lowStockThreshold}, NOW())
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `) as IngredientRow[];
  const rows =
    inserted.length > 0
      ? inserted
      : ((await sql`SELECT * FROM ingredients WHERE id = ${id} LIMIT 1`) as IngredientRow[]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save ingredient." }, { status: 500 });
  }
  return NextResponse.json({ ingredient: toIngredient(rows[0] as IngredientRow) });
}
