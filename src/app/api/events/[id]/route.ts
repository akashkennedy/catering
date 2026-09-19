import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import { resolveRequestSession } from "@/lib/authSession";
import { eventSchema, fetchFullEvent, writeEventChildren } from "../route";

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
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }
  const sql = db();
  const existing = await sql`SELECT id FROM events WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  const data = parsed.data;
  await sql`
    UPDATE events SET
      name = ${data.name},
      phone = ${data.phone},
      venue = ${data.venue},
      address = ${data.address},
      function_type = ${data.functionType},
      headcount = ${data.headcount},
      date = ${data.date},
      status = ${data.status},
      template_id = ${data.templateId},
      rate_per_person = ${data.ratePerPerson},
      total_amount = ${data.totalAmount},
      total_amount_overridden = ${data.totalAmountOverridden},
      advance_paid = ${data.advancePaid},
      updated_at = NOW()
    WHERE id = ${id}
  `;
  // Pay preservation: a user who cannot see others' pay must not be able
  // to overwrite it with masked zeros. Incoming toPay/paid are accepted
  // only for the user's own linked lines and brand-new lines.
  const session = await resolveRequestSession();
  let employees = data.employees;
  if (
    session &&
    !session.user.isAdmin &&
    !session.permissions.canViewOtherEmployeeRates
  ) {
    const before = await fetchFullEvent(sql, id);
    const previous = new Map(
      (before?.employees ?? []).map((line) => [line.id, line] as const)
    );
    employees = data.employees.map((line) => {
      const old = previous.get(line.id ?? "");
      if (!old) return line;
      if (old.employeeId && old.employeeId === session.user.employeeId) return line;
      return { ...line, toPay: old.toPay, paid: old.paid };
    });
  }
  // Full child replace: stale groups/lines vanish via deletes.
  await sql`DELETE FROM event_meal_groups WHERE event_id = ${id}`;
  await sql`DELETE FROM event_ingredient_lines WHERE event_id = ${id}`;
  await sql`DELETE FROM event_employee_lines WHERE event_id = ${id}`;
  await sql`DELETE FROM event_utensil_lines WHERE event_id = ${id}`;
  await writeEventChildren(sql, id, { ...data, employees, id });
  const full = await fetchFullEvent(sql, id);
  return NextResponse.json({ event: full });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const sql = db();
  await sql`DELETE FROM events WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
