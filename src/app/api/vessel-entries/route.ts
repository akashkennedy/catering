import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import type { VesselStockEntry } from "@/store/vesselStockLedger";

const entrySchema = z.object({
  id: z.string().min(1).optional(),
  utensilId: z.string(),
  type: z.enum(["rentedIn", "assigned"]),
  qty: z.number().finite(),
  date: z.string(),
  eventId: z.string().nullable(),
  note: z.string(),
});

type Row = Record<string, unknown>;

export function toVesselEntry(row: Row): VesselStockEntry {
  return {
    id: String(row.id),
    utensilId: String(row.utensil_id),
    type: row.type === "assigned" ? "assigned" : "rentedIn",
    qty: Number(row.qty) || 0,
    date: String(row.date ?? ""),
    eventId: typeof row.event_id === "string" ? row.event_id : null,
    note: String(row.note ?? ""),
  };
}

function newId(): string {
  return `vsl-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT * FROM vessel_stock_entries ORDER BY date ASC, id ASC`;
  return NextResponse.json({ entries: (rows as Row[]).map(toVesselEntry) });
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
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vessel entry." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  const d = parsed.data;
  await sql`
    INSERT INTO vessel_stock_entries (id, utensil_id, type, qty, date, event_id, note)
    VALUES (${id}, ${d.utensilId}, ${d.type}, ${d.qty}, ${d.date}, ${d.eventId}, ${d.note})
    ON CONFLICT (id) DO NOTHING
  `;
  const rows = await sql`SELECT * FROM vessel_stock_entries WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save vessel entry." }, { status: 500 });
  }
  return NextResponse.json({ entry: toVesselEntry(rows[0] as Row) });
}

export async function DELETE(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const utensilId = new URL(request.url).searchParams.get("utensilId");
  if (!utensilId) {
    return NextResponse.json({ error: "utensilId query param is required." }, { status: 400 });
  }
  const sql = db();
  await sql`DELETE FROM vessel_stock_entries WHERE utensil_id = ${utensilId}`;
  return NextResponse.json({ ok: true });
}
