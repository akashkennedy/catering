import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import type { Utensil } from "@/store/utensils";

const utensilSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string(),
  rentPrice: z.number().finite().min(0),
  openingStock: z.number().finite(),
  lowStockThreshold: z.number().finite(),
});

type Row = Record<string, unknown>;

export function toUtensil(row: Row): Utensil {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    rentPrice: Number(row.rent_price) || 0,
    openingStock: Number(row.opening_stock) || 0,
    lowStockThreshold: Number(row.low_stock_threshold) || 0,
  };
}

function newId(): string {
  return `utn-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT * FROM utensils ORDER BY name ASC`;
  return NextResponse.json({ utensils: (rows as Row[]).map(toUtensil) });
}

/** Creates a utensil and returns the persisted record. */
export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = utensilSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid utensil." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  const inserted = (await sql`
    INSERT INTO utensils (id, name, rent_price, opening_stock, low_stock_threshold, updated_at)
    VALUES (${id}, ${parsed.data.name}, ${parsed.data.rentPrice}, ${parsed.data.openingStock}, ${parsed.data.lowStockThreshold}, NOW())
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `) as Row[];
  const rows =
    inserted.length > 0
      ? inserted
      : ((await sql`SELECT * FROM utensils WHERE id = ${id} LIMIT 1`) as Row[]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save utensil." }, { status: 500 });
  }
  return NextResponse.json({ utensil: toUtensil(rows[0] as Row) });
}
