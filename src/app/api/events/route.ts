import { NextResponse } from "next/server";
import { z } from "zod";

import { db, isDatabaseUnreachable } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import { resolveRequestSession } from "@/lib/authSession";
import { EVENT_STATUS_PIPELINE, type CateringEvent } from "@/store/events";

const mealGroupSchema = z.object({
  id: z.string().min(1).optional(),
  templateId: z.string().nullable(),
  headcount: z.number().finite(),
  selectedDishIds: z.array(z.string()),
});

const ingredientLineSchema = z.object({
  id: z.string().min(1).optional(),
  ingredientId: z.string(),
  qty: z.number().finite(),
  price: z.number().finite(),
});

const employeeLineSchema = z.object({
  id: z.string().min(1).optional(),
  employeeId: z.string().nullable(),
  name: z.string(),
  phone: z.string(),
  toPay: z.number().finite(),
  paid: z.number().finite(),
});

const utensilLineSchema = z.object({
  id: z.string().min(1).optional(),
  vendorName: z.string(),
  vendorPhone: z.string(),
  utensilId: z.string().nullable(),
  utensilName: z.string(),
  qty: z.number().finite(),
  rentalPrice: z.number().finite(),
  dateFrom: z.string(),
  dateTo: z.string(),
  returned: z.boolean(),
});

export const eventSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string(),
  phone: z.string(),
  venue: z.string(),
  address: z.string(),
  functionType: z.string(),
  headcount: z.number().finite(),
  date: z.string(),
  status: z.enum(EVENT_STATUS_PIPELINE),
  templateId: z.string().nullable(),
  mealGroups: z.array(mealGroupSchema),
  ratePerPerson: z.number().finite(),
  totalAmount: z.number().finite(),
  totalAmountOverridden: z.boolean(),
  advancePaid: z.number().finite(),
  ingredients: z.array(ingredientLineSchema),
  employees: z.array(employeeLineSchema),
  utensils: z.array(utensilLineSchema),
});

type Row = Record<string, unknown>;

function num(value: unknown): number {
  return Number(value) || 0;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Loads an event and assembles its related meal, ingredient, employee, and utensil rows. */
export async function fetchFullEvent(
  sql: ReturnType<typeof db>,
  eventId: string
): Promise<CateringEvent | null> {
  const events = await sql`SELECT * FROM events WHERE id = ${eventId} LIMIT 1`;
  if (events.length === 0) return null;
  const event = events[0] as Row;

  // The four child queries are independent — fire them together.
  const [groupRows, ingredientRows, employeeRows, utensilRows] = (await Promise.all([
    sql`SELECT * FROM event_meal_groups WHERE event_id = ${eventId} ORDER BY position ASC, id ASC`,
    sql`SELECT * FROM event_ingredient_lines WHERE event_id = ${eventId}`,
    sql`SELECT * FROM event_employee_lines WHERE event_id = ${eventId}`,
    sql`SELECT * FROM event_utensil_lines WHERE event_id = ${eventId}`,
  ])) as Row[][];

  return {
    id: String(event.id),
    name: String(event.name ?? ""),
    phone: String(event.phone ?? ""),
    venue: String(event.venue ?? ""),
    address: String(event.address ?? ""),
    functionType: String(event.function_type ?? ""),
    headcount: num(event.headcount),
    date: String(event.date ?? ""),
    status: (EVENT_STATUS_PIPELINE as readonly string[]).includes(String(event.status))
      ? (event.status as CateringEvent["status"])
      : "enquiry",
    templateId: typeof event.template_id === "string" ? event.template_id : null,
    mealGroups: groupRows.map((row) => ({
      id: String(row.id),
      templateId: typeof row.template_id === "string" ? row.template_id : null,
      headcount: num(row.headcount),
      selectedDishIds: Array.isArray(row.selected_dish_ids)
        ? (row.selected_dish_ids as unknown[]).filter(
            (id): id is string => typeof id === "string"
          )
        : [],
    })),
    ratePerPerson: num(event.rate_per_person),
    totalAmount: num(event.total_amount),
    totalAmountOverridden: event.total_amount_overridden === true,
    advancePaid: num(event.advance_paid),
    ingredients: ingredientRows.map((row) => ({
      id: String(row.id),
      ingredientId: String(row.ingredient_id),
      qty: num(row.qty),
      price: num(row.price),
    })),
    employees: employeeRows.map((row) => ({
      id: String(row.id),
      employeeId: typeof row.employee_id === "string" ? row.employee_id : null,
      name: String(row.name ?? ""),
      phone: String(row.phone ?? ""),
      toPay: num(row.to_pay),
      paid: num(row.paid),
    })),
    utensils: utensilRows.map((row) => ({
      id: String(row.id),
      vendorName: String(row.vendor_name ?? ""),
      vendorPhone: String(row.vendor_phone ?? ""),
      utensilId: typeof row.utensil_id === "string" ? row.utensil_id : null,
      utensilName: String(row.utensil_name ?? ""),
      qty: num(row.qty),
      rentalPrice: num(row.rental_price),
      dateFrom: String(row.date_from ?? ""),
      dateTo: String(row.date_to ?? ""),
      returned: row.returned === true,
    })),
  };
}

/** Persists all child collections belonging to an event. */
export async function writeEventChildren(
  sql: ReturnType<typeof db>,
  eventId: string,
  data: z.infer<typeof eventSchema>
): Promise<void> {
  // Line writes are independent of each other — fire them together.
  // Positions/ids are assigned synchronously first so ordering is stable.
  const writes: Promise<unknown>[] = [];
  data.mealGroups.forEach((group, position) => {
    const groupId = group.id ?? newId("grp");
    writes.push(sql`
      INSERT INTO event_meal_groups (id, event_id, template_id, headcount, selected_dish_ids, position)
      VALUES (${groupId}, ${eventId}, ${group.templateId}, ${group.headcount}, ${JSON.stringify(group.selectedDishIds)}, ${position})
      ON CONFLICT (id) DO UPDATE SET
        event_id = EXCLUDED.event_id,
        template_id = EXCLUDED.template_id,
        headcount = EXCLUDED.headcount,
        selected_dish_ids = EXCLUDED.selected_dish_ids,
        position = EXCLUDED.position
    `);
  });
  for (const line of data.ingredients) {
    const lineId = line.id ?? newId("eil");
    writes.push(sql`
      INSERT INTO event_ingredient_lines (id, event_id, ingredient_id, qty, price)
      VALUES (${lineId}, ${eventId}, ${line.ingredientId}, ${line.qty}, ${line.price})
      ON CONFLICT (id) DO UPDATE SET
        event_id = EXCLUDED.event_id,
        ingredient_id = EXCLUDED.ingredient_id,
        qty = EXCLUDED.qty,
        price = EXCLUDED.price
    `);
  }
  for (const line of data.employees) {
    const lineId = line.id ?? newId("eel");
    writes.push(sql`
      INSERT INTO event_employee_lines (id, event_id, employee_id, name, phone, to_pay, paid)
      VALUES (${lineId}, ${eventId}, ${line.employeeId}, ${line.name}, ${line.phone}, ${line.toPay}, ${line.paid})
      ON CONFLICT (id) DO UPDATE SET
        event_id = EXCLUDED.event_id,
        employee_id = EXCLUDED.employee_id,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        to_pay = EXCLUDED.to_pay,
        paid = EXCLUDED.paid
    `);
  }
  for (const line of data.utensils) {
    const lineId = line.id ?? newId("eul");
    writes.push(sql`
      INSERT INTO event_utensil_lines
        (id, event_id, vendor_name, vendor_phone, utensil_id, utensil_name, qty, rental_price, date_from, date_to, returned)
      VALUES
        (${lineId}, ${eventId}, ${line.vendorName}, ${line.vendorPhone}, ${line.utensilId}, ${line.utensilName}, ${line.qty}, ${line.rentalPrice}, ${line.dateFrom}, ${line.dateTo}, ${line.returned})
      ON CONFLICT (id) DO UPDATE SET
        event_id = EXCLUDED.event_id,
        vendor_name = EXCLUDED.vendor_name,
        vendor_phone = EXCLUDED.vendor_phone,
        utensil_id = EXCLUDED.utensil_id,
        utensil_name = EXCLUDED.utensil_name,
        qty = EXCLUDED.qty,
        rental_price = EXCLUDED.rental_price,
        date_from = EXCLUDED.date_from,
        date_to = EXCLUDED.date_to,
        returned = EXCLUDED.returned
    `);
  }
  await Promise.all(writes);
}

/** Lists every event with its related child records. */
export async function GET() {
  let session;
  try {
    session = await resolveRequestSession();
  } catch (error) {
    if (isDatabaseUnreachable(error)) {
      return NextResponse.json(
        { error: "Database temporarily unavailable. Please retry." },
        { status: 503 }
      );
    }
    throw error;
  }
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  // Pay visibility: without canViewOtherEmployeeRates, other people's
  // toPay/paid are masked to zero (own linked lines stay visible).
  const maskOthers =
    !session.user.isAdmin && !session.permissions.canViewOtherEmployeeRates;
  const ownEmployeeId = session.user.employeeId;
  const sql = db();
  const rows = (await sql`SELECT id FROM events ORDER BY created_at ASC`) as Row[];
  // Each event's reads are independent — resolve them together.
  const fullEvents = await Promise.all(
    rows.map((row) => fetchFullEvent(sql, String(row.id)))
  );
  const events: CateringEvent[] = [];
  for (const full of fullEvents) {
    if (!full) continue;
    if (maskOthers) {
      full.employees = full.employees.map((line) =>
        line.employeeId && line.employeeId === ownEmployeeId
          ? line
          : { ...line, toPay: 0, paid: 0 }
      );
    }
    events.push(full);
  }
  return NextResponse.json({ events });
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
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }
  const sql = db();
  const data = parsed.data;
  const id = data.id ?? newId("evt");
  await sql`
    INSERT INTO events
      (id, name, phone, venue, address, function_type, headcount, date, status, template_id,
       rate_per_person, total_amount, total_amount_overridden, advance_paid, updated_at)
    VALUES
      (${id}, ${data.name}, ${data.phone}, ${data.venue}, ${data.address}, ${data.functionType},
       ${data.headcount}, ${data.date}, ${data.status}, ${data.templateId},
       ${data.ratePerPerson}, ${data.totalAmount}, ${data.totalAmountOverridden}, ${data.advancePaid}, NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  await writeEventChildren(sql, id, data);
  const full = await fetchFullEvent(sql, id);
  if (!full) {
    return NextResponse.json({ error: "Could not save event." }, { status: 500 });
  }
  return NextResponse.json({ event: full });
}
