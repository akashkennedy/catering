import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import type { Reminder } from "@/store/reminders";

const reminderSchema = z.object({
  id: z.string().min(1).optional(),
  customerName: z.string().nullable(),
  phone: z.string(),
  note: z.string().nullable(),
  remindAt: z.string(),
  eventId: z.string().nullable(),
  dismissed: z.boolean(),
  notified: z.boolean(),
});

type Row = Record<string, unknown>;

export function toReminder(row: Row): Reminder {
  return {
    id: String(row.id),
    customerName: typeof row.customer_name === "string" ? row.customer_name : null,
    phone: String(row.phone ?? ""),
    note: typeof row.note === "string" ? row.note : null,
    remindAt: String(row.remind_at ?? ""),
    eventId: typeof row.event_id === "string" ? row.event_id : null,
    dismissed: row.dismissed === true,
    notified: row.notified === true,
  };
}

function newId(): string {
  return `rem-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = await sql`SELECT * FROM reminders ORDER BY remind_at ASC`;
  return NextResponse.json({ reminders: (rows as Row[]).map(toReminder) });
}

/** Creates a reminder and returns the persisted record. */
export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = reminderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reminder." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId();
  const d = parsed.data;
  const inserted = (await sql`
    INSERT INTO reminders (id, customer_name, phone, note, remind_at, event_id, dismissed, notified)
    VALUES (${id}, ${d.customerName}, ${d.phone}, ${d.note}, ${d.remindAt}, ${d.eventId}, ${d.dismissed}, ${d.notified})
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `) as Row[];
  const rows =
    inserted.length > 0
      ? inserted
      : ((await sql`SELECT * FROM reminders WHERE id = ${id} LIMIT 1`) as Row[]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Could not save reminder." }, { status: 500 });
  }
  return NextResponse.json({ reminder: toReminder(rows[0] as Row) });
}
