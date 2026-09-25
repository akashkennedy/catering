import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import { fetchFullTemplate } from "../route";

const templatePatchSchema = z.object({
  nameEn: z.string(),
  nameTa: z.string(),
  dishes: z.array(
    z.object({
      id: z.string().min(1).optional(),
      courseId: z.string(),
      nameEn: z.string(),
      nameTa: z.string(),
    })
  ),
});

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Replaces a template and its dish hierarchy with the submitted data. */
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
  const parsed = templatePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }
  const sql = db();
  const existing = await sql`SELECT id FROM food_templates WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }
  await sql`
    UPDATE food_templates SET name_en = ${parsed.data.nameEn}, name_ta = ${parsed.data.nameTa}, updated_at = NOW()
    WHERE id = ${id}
  `;
  // Full replace of course links: removed dishes vanish via cascade.
  await sql`DELETE FROM template_dishes WHERE template_id = ${id}`;
  // Dish/link inserts are independent — positions/ids assigned first, then
  // fired together.
  const writes: Promise<unknown>[] = [];
  parsed.data.dishes.forEach((dish, position) => {
    const dishId = dish.id ?? newId("dish");
    writes.push(sql`
      INSERT INTO template_dishes (id, template_id, course_id, name_en, name_ta, position)
      VALUES (${dishId}, ${id}, ${dish.courseId}, ${dish.nameEn}, ${dish.nameTa}, ${position})
    `);
  });
  await Promise.all(writes);
  const full = await fetchFullTemplate(sql, id);
  return NextResponse.json({ template: full });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const sql = db();
  await sql`DELETE FROM food_templates WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
