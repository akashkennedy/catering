import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import type { FoodTemplate, TemplateDish } from "@/store/templates";

const dishSchema = z.object({
  id: z.string().min(1).optional(),
  courseId: z.string(),
  nameEn: z.string(),
  nameTa: z.string(),
});

const templateSchema = z.object({
  id: z.string().min(1).optional(),
  nameEn: z.string(),
  nameTa: z.string(),
  dishes: z.array(dishSchema),
});

type Row = Record<string, unknown>;

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

type CourseRow = {
  id: string;
  nameEn: string;
  nameTa: string;
  ingredients: TemplateDish["ingredients"];
};

/** Loads linked courses (with ingredient lines) for the given ids. */
async function fetchLinkedCourses(
  sql: ReturnType<typeof db>,
  courseIds: string[]
): Promise<Map<string, CourseRow>> {
  const byId = new Map<string, CourseRow>();
  const unique = [...new Set(courseIds.filter(Boolean))];
  if (unique.length === 0) return byId;
  const courseRows = (await sql`
    SELECT * FROM courses WHERE id = ANY(${unique})
  `) as Row[];
  const itemRows = (await sql`
    SELECT * FROM course_ingredients WHERE course_id = ANY(${unique})
  `) as Row[];
  const itemsByCourse = new Map<string, TemplateDish["ingredients"]>();
  for (const item of itemRows) {
    const list = itemsByCourse.get(String(item.course_id)) ?? [];
    list.push({
      ingredientId: String(item.ingredient_id),
      qtyPer100: Number(item.qty_per_100) || 0,
    });
    itemsByCourse.set(String(item.course_id), list);
  }
  for (const course of courseRows) {
    byId.set(String(course.id), {
      id: String(course.id),
      nameEn: String(course.name_en ?? ""),
      nameTa: String(course.name_ta ?? ""),
      ingredients: itemsByCourse.get(String(course.id)) ?? [],
    });
  }
  return byId;
}

/** Loads a template with its linked courses resolved into dishes. */
export async function fetchFullTemplate(
  sql: ReturnType<typeof db>,
  templateId: string
): Promise<FoodTemplate | null> {
  const templates = await sql`SELECT * FROM food_templates WHERE id = ${templateId} LIMIT 1`;
  if (templates.length === 0) return null;
  const template = templates[0] as Row;
  const dishRows = (await sql`
    SELECT * FROM template_dishes WHERE template_id = ${templateId} ORDER BY position ASC, id ASC
  `) as Row[];
  const courses = await fetchLinkedCourses(
    sql,
    dishRows.map((dishRow) => String(dishRow.course_id ?? ""))
  );
  // Legacy embedded rows (pre-course era) are kept as a fallback so no
  // ingredient data is lost in transition; course lines win on conflicts.
  const legacyLists = (await Promise.all(
    dishRows.map((dishRow) =>
      sql`SELECT * FROM template_dish_ingredients WHERE dish_id = ${String(dishRow.id)}`
    )
  )) as Row[][];
  const dishes: TemplateDish[] = dishRows.map((dishRow, index) => {
    const courseId = String(dishRow.course_id ?? "");
    const course = courseId ? courses.get(courseId) : undefined;
    const seen = new Set<string>();
    const ingredients: TemplateDish["ingredients"] = [];
    for (const item of course?.ingredients ?? []) {
      seen.add(item.ingredientId);
      ingredients.push(item);
    }
    for (const item of legacyLists[index] ?? []) {
      const ingredientId = String(item.ingredient_id);
      if (seen.has(ingredientId)) continue;
      seen.add(ingredientId);
      ingredients.push({
        ingredientId,
        qtyPer100: Number(item.qty_per_100) || 0,
      });
    }
    return {
      id: String(dishRow.id),
      courseId,
      nameEn: course?.nameEn || String(dishRow.name_en ?? ""),
      nameTa: course?.nameTa || String(dishRow.name_ta ?? ""),
      ingredients,
    };
  });
  return {
    id: String(template.id),
    nameEn: String(template.name_en ?? ""),
    nameTa: String(template.name_ta ?? ""),
    dishes,
  };
}

/** Persists the template's course links (names stored as offline snapshots). */
async function writeDishes(
  sql: ReturnType<typeof db>,
  templateId: string,
  dishes: z.infer<typeof dishSchema>[]
): Promise<void> {
  // Full replace of links: removed dishes vanish via cascade.
  await sql`DELETE FROM template_dishes WHERE template_id = ${templateId}`;
  await Promise.all(
    dishes.map((dish, position) => {
      const dishId = dish.id ?? newId("dish");
      return sql`
        INSERT INTO template_dishes (id, template_id, course_id, name_en, name_ta, position)
        VALUES (${dishId}, ${templateId}, ${dish.courseId}, ${dish.nameEn}, ${dish.nameTa}, ${position})
      `;
    })
  );
}

/** Lists every template with its complete dish hierarchy. */
export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const sql = db();
  const rows = (await sql`SELECT id FROM food_templates ORDER BY name_en ASC`) as Row[];
  // Each template's reads are independent — resolve them together.
  const fullTemplates = await Promise.all(
    rows.map((row) => fetchFullTemplate(sql, String(row.id)))
  );
  const templates = fullTemplates.filter((t): t is FoodTemplate => t !== null);
  return NextResponse.json({ templates });
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
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }
  const sql = db();
  const id = parsed.data.id ?? newId("tpl");
  await sql`
    INSERT INTO food_templates (id, name_en, name_ta, updated_at)
    VALUES (${id}, ${parsed.data.nameEn}, ${parsed.data.nameTa}, NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  await writeDishes(sql, id, parsed.data.dishes);
  const full = await fetchFullTemplate(sql, id);
  if (!full) {
    return NextResponse.json({ error: "Could not save template." }, { status: 500 });
  }
  return NextResponse.json({ template: full });
}
