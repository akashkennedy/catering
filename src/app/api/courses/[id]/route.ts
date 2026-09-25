import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import { fetchFullCourse } from "../route";

const courseIngredientSchema = z.object({
  ingredientId: z.string(),
  qtyPer100: z.number().finite().min(0),
});

const coursePatchSchema = z.object({
  nameEn: z.string(),
  nameTa: z.string(),
  ingredients: z.array(courseIngredientSchema),
});

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Replaces a course and its ingredient lines with the submitted data. */
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
  const parsed = coursePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course." }, { status: 400 });
  }
  const sql = db();
  const existing = await sql`SELECT id FROM courses WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }
  await sql`
    UPDATE courses SET name_en = ${parsed.data.nameEn}, name_ta = ${parsed.data.nameTa}, updated_at = NOW()
    WHERE id = ${id}
  `;
  await sql`DELETE FROM course_ingredients WHERE course_id = ${id}`;
  await Promise.all(
    parsed.data.ingredients.map((item) =>
      sql`
        INSERT INTO course_ingredients (id, course_id, ingredient_id, qty_per_100)
        VALUES (${newId("ci")}, ${id}, ${item.ingredientId}, ${item.qtyPer100})
      `
    )
  );
  const full = await fetchFullCourse(sql, id);
  return NextResponse.json({ course: full });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const sql = db();
  const usage = (await sql`
    SELECT COUNT(*)::int AS n FROM template_dishes WHERE course_id = ${id}
  `) as { n: number }[];
  const usedBy = Number(usage[0]?.n ?? 0);
  if (usedBy > 0) {
    return NextResponse.json(
      { error: "Course is used in templates.", usedBy },
      { status: 409 }
    );
  }
  await sql`DELETE FROM courses WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
