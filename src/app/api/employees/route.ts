import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";
import type { Employee } from "@/store/employees";

const employeeSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string(),
  phone: z.string(),
  defaultRate: z.number().finite().min(0),
});

type Row = Record<string, unknown>;

export function toEmployee(row: Row): Employee {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    defaultRate: Number(row.default_rate) || 0,
  };
}

function newId(): string {
  return `emp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET() {
  const auth = await requirePermission("canViewEmployees");
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT * FROM employees ORDER BY name ASC`;
  return NextResponse.json({ employees: (rows as Row[]).map(toEmployee) });
}

/** Creates an employee and returns the persisted record. */
export async function POST(request: Request) {
  const auth = await requirePermission("canManageEmployees");
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid employee." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  // RETURNING collapses the write+read into one round-trip; the SELECT
  // fallback only runs on id conflict (replay) to return the existing row.
  const inserted = (await sql`
    INSERT INTO employees (id, name, phone, default_rate, updated_at)
    VALUES (${id}, ${parsed.data.name}, ${parsed.data.phone}, ${parsed.data.defaultRate}, NOW())
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `) as Row[];
  const rows =
    inserted.length > 0
      ? inserted
      : ((await sql`SELECT * FROM employees WHERE id = ${id} LIMIT 1`) as Row[]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save employee." }, { status: 500 });
  }
  return NextResponse.json({ employee: toEmployee(rows[0] as Row) });
}
