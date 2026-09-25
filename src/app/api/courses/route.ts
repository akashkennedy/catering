import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import type { Course } from "@/store/courses";

const courseIngredientSchema = z.object({
  ingredientId: z.string(),
  qtyPer100: z.number().finite().min(0),
});

const courseSchema = z.object({
  id: z.string().min(1).optional(),
  nameEn: z.string(),
  nameTa: z.string(),
  ingredients: z.array(courseIngredientSchema),
});

type Row = Record<string, unknown>;

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Loads a course with its ingredient lines. */
export async function fetchFullCourse(
  sql: ReturnType<typeof db>,
  courseId: string
): Promise<Course | null> {
  const courses = await sql`SELECT * FROM courses WHERE id = ${courseId} LIMIT 1`;
  if (courses.length === 0) return null;
  const course = courses[0] as Row;
  const itemRows = (await sql`
    SELECT * FROM course_ingredients WHERE course_id = ${courseId}
  `) as Row[];
  return {
    id: String(course.id),
    nameEn: String(course.name_en ?? ""),
    nameTa: String(course.name_ta ?? ""),
    ingredients: itemRows.map((item) => ({
      ingredientId: String(item.ingredient_id),
      qtyPer100: Number(item.qty_per_100) || 0,
    })),
  };
}

/** Lists every course with its ingredient lines. */
export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = (await sql`SELECT id FROM courses ORDER BY name_en ASC`) as Row[];
  const fullCourses = await Promise.all(
    rows.map((row) => fetchFullCourse(sql, String(row.id)))
  );
  const courses = fullCourses.filter((c): c is Course => c !== null);
  return NextResponse.json({ courses });
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
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId("course");
  // Atomic: course write + ingredient replacement commit or roll back together.
  await sql.transaction((txn) => [
    txn`
      INSERT INTO courses (id, name_en, name_ta, updated_at)
      VALUES (${id}, ${parsed.data.nameEn}, ${parsed.data.nameTa}, NOW())
      ON CONFLICT (id) DO NOTHING
    `,
    txn`DELETE FROM course_ingredients WHERE course_id = ${id}`,
    ...parsed.data.ingredients.map((item) =>
      txn`
        INSERT INTO course_ingredients (id, course_id, ingredient_id, qty_per_100)
        VALUES (${newId("ci")}, ${id}, ${item.ingredientId}, ${item.qtyPer100})
      `
    ),
  ]);
  const full = await fetchFullCourse(sql, id);
  if (!full) {
    return NextResponse.json({ error: "Could not save course." }, { status: 500 });
  }
  return NextResponse.json({ course: full });
}
