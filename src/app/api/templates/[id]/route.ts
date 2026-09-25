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
      courseId: z.string().min(1),
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
  // In-place sync: matching rows are updated (existing ids and their legacy
  // fallback ingredient rows survive), only dishes omitted from the save are
  // deleted. One transaction so the link set never halves on failure.
  const dishIds = parsed.data.dishes.map((dish) => dish.id ?? newId("dish"));
  await sql.transaction((txn) => [
    txn`
      UPDATE food_templates SET name_en = ${parsed.data.nameEn}, name_ta = ${parsed.data.nameTa}, updated_at = NOW()
      WHERE id = ${id}
    `,
    ...parsed.data.dishes.map((dish, position) =>
      txn`
        INSERT INTO template_dishes (id, template_id, course_id, name_en, name_ta, position)
        VALUES (${dishIds[position]}, ${id}, ${dish.courseId}, ${dish.nameEn}, ${dish.nameTa}, ${position})
        ON CONFLICT (id) DO UPDATE SET
          template_id = EXCLUDED.template_id,
          course_id = EXCLUDED.course_id,
          name_en = EXCLUDED.name_en,
          name_ta = EXCLUDED.name_ta,
          position = EXCLUDED.position
      `
    ),
    txn`
      DELETE FROM template_dishes
      WHERE template_id = ${id} AND NOT (id = ANY(${dishIds}))
    `,
  ]);
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
