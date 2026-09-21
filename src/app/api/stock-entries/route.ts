import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import type { StockLedgerEntry } from "@/store/stockLedger";

const entrySchema = z.object({
  id: z.string().min(1).optional(),
  ingredientId: z.string(),
  type: z.enum(["purchase", "used"]),
  qty: z.number().finite(),
  price: z.number().finite().min(0).optional(),
  date: z.string(),
  eventId: z.string().nullable(),
  note: z.string(),
});

type Row = Record<string, unknown>;

export function toStockEntry(row: Row): StockLedgerEntry {
  return {
    id: String(row.id),
    ingredientId: String(row.ingredient_id),
    type: row.type === "used" ? "used" : "purchase",
    qty: Number(row.qty) || 0,
    price: Number(row.price) || 0,
    date: String(row.date ?? ""),
    eventId: typeof row.event_id === "string" ? row.event_id : null,
    note: String(row.note ?? ""),
  };
}

function newId(): string {
  return `stk-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT * FROM stock_ledger_entries ORDER BY date ASC, id ASC`;
  return NextResponse.json({ entries: (rows as Row[]).map(toStockEntry) });
}

/** Creates an ingredient stock entry and returns the persisted record. */
export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stock entry." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  const d = parsed.data;
  const inserted = (await sql`
    INSERT INTO stock_ledger_entries (id, ingredient_id, type, qty, price, date, event_id, note)
    VALUES (${id}, ${d.ingredientId}, ${d.type}, ${d.qty}, ${d.price ?? 0}, ${d.date}, ${d.eventId}, ${d.note})
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `) as Row[];
  const rows =
    inserted.length > 0
      ? inserted
      : ((await sql`SELECT * FROM stock_ledger_entries WHERE id = ${id} LIMIT 1`) as Row[]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save stock entry." }, { status: 500 });
  }
  return NextResponse.json({ entry: toStockEntry(rows[0] as Row) });
}

export async function DELETE(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const ingredientId = new URL(request.url).searchParams.get("ingredientId");
  if (!ingredientId) {
    return NextResponse.json({ error: "ingredientId query param is required." }, { status: 400 });
  }
  const sql = db();
  await sql`DELETE FROM stock_ledger_entries WHERE ingredient_id = ${ingredientId}`;
  return NextResponse.json({ ok: true });
}
