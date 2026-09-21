import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";
import { EXPENSE_CATEGORIES, type Expense } from "@/store/finance";

const expenseSchema = z.object({
  id: z.string().min(1).optional(),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().finite().min(0),
  date: z.string(),
  note: z.string(),
});

function toExpense(row: Record<string, unknown>): Expense {
  return {
    id: String(row.id),
    category: (EXPENSE_CATEGORIES as readonly string[]).includes(String(row.category))
      ? (row.category as Expense["category"])
      : "custom",
    amount: Number(row.amount) || 0,
    date: String(row.date ?? ""),
    note: String(row.note ?? ""),
  };
}

function newId(): string {
  return `exp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET() {
  const auth = await requirePermission("canViewFinance");
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT * FROM expenses ORDER BY date DESC, id DESC`;
  return NextResponse.json({
    expenses: (rows as Record<string, unknown>[]).map(toExpense),
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
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid expense." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  const inserted = (await sql`
    INSERT INTO expenses (id, category, amount, date, note)
    VALUES (${id}, ${parsed.data.category}, ${parsed.data.amount}, ${parsed.data.date}, ${parsed.data.note})
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `) as Record<string, unknown>[];
  const rows =
    inserted.length > 0
      ? inserted
      : ((await sql`SELECT * FROM expenses WHERE id = ${id} LIMIT 1`) as Record<string, unknown>[]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save expense." }, { status: 500 });
  }
  return NextResponse.json({ expense: toExpense(rows[0] as Record<string, unknown>) });
}
