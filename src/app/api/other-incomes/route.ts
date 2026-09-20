import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";
import type { OtherIncome } from "@/store/finance";

const otherIncomeSchema = z.object({
  id: z.string().min(1).optional(),
  amount: z.number().finite().min(0),
  date: z.string(),
  note: z.string(),
});

function toOtherIncome(row: Record<string, unknown>): OtherIncome {
  return {
    id: String(row.id),
    amount: Number(row.amount) || 0,
    date: String(row.date ?? ""),
    note: String(row.note ?? ""),
  };
}

function newId(): string {
  return `inc-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET() {
  const auth = await requirePermission("canViewFinance");
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT * FROM other_income ORDER BY date DESC, id DESC`;
  return NextResponse.json({
    otherIncomes: (rows as Record<string, unknown>[]).map(toOtherIncome),
  });
}

export async function POST(request: Request) {
  const auth = await requirePermission("canViewFinance");
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = otherIncomeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid income entry." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  await sql`
    INSERT INTO other_income (id, amount, date, note)
    VALUES (${id}, ${parsed.data.amount}, ${parsed.data.date}, ${parsed.data.note})
    ON CONFLICT (id) DO NOTHING
  `;
  const rows = await sql`SELECT * FROM other_income WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save income entry." }, { status: 500 });
  }
  return NextResponse.json({ otherIncome: toOtherIncome(rows[0] as Record<string, unknown>) });
}
