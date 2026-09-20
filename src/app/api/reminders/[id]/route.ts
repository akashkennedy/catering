import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import { toReminder } from "../route";

const reminderPatchSchema = z
  .object({
    customerName: z.string().nullable().optional(),
    phone: z.string().optional(),
    note: z.string().nullable().optional(),
    remindAt: z.string().optional(),
    eventId: z.string().nullable().optional(),
    dismissed: z.boolean().optional(),
    notified: z.boolean().optional(),
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
  const parsed = reminderPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reminder patch." }, { status: 400 });
  }
  const sql = db();
  const existing = await sql`SELECT * FROM reminders WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
  }
  const merged = { ...toReminder(existing[0] as Record<string, unknown>), ...parsed.data };
  await sql`
    UPDATE reminders SET
      customer_name = ${merged.customerName},
      phone = ${merged.phone},
      note = ${merged.note},
      remind_at = ${merged.remindAt},
      event_id = ${merged.eventId},
      dismissed = ${merged.dismissed},
      notified = ${merged.notified}
    WHERE id = ${id}
  `;
  return NextResponse.json({ reminder: merged });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const sql = db();
  await sql`DELETE FROM reminders WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
