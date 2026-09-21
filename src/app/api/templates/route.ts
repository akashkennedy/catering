import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/requirePermission";
import type { FoodTemplate, TemplateDish } from "@/store/templates";

const dishIngredientSchema = z.object({
  ingredientId: z.string(),
  qtyPer100: z.number().finite().min(0),
});

const dishSchema = z.object({
  id: z.string().min(1).optional(),
  nameEn: z.string(),
  nameTa: z.string(),
  ingredients: z.array(dishIngredientSchema),
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

/** Loads a template with its ordered dishes and ingredient rows. */
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
  // Per-dish ingredient reads are independent — fire them together.
  const ingredientLists = (await Promise.all(
    dishRows.map((dishRow) =>
      sql`SELECT * FROM template_dish_ingredients WHERE dish_id = ${String(dishRow.id)}`
    )
  )) as Row[][];
  const dishes: TemplateDish[] = dishRows.map((dishRow, index) => {
    const ingredientRows = ingredientLists[index] ?? [];
    return {
      id: String(dishRow.id),
      nameEn: String(dishRow.name_en ?? ""),
      nameTa: String(dishRow.name_ta ?? ""),
      ingredients: ingredientRows.map((item) => ({
        ingredientId: String(item.ingredient_id),
        qtyPer100: Number(item.qty_per_100) || 0,
      })),
    };
  });
  return {
    id: String(template.id),
    nameEn: String(template.name_en ?? ""),
    nameTa: String(template.name_ta ?? ""),
    dishes,
  };
}

/** Persists the complete dish and ingredient hierarchy for a template. */
async function writeDishes(
  sql: ReturnType<typeof db>,
  templateId: string,
  dishes: z.infer<typeof dishSchema>[]
): Promise<void> {
  // NOTE: link rows must be deleted before re-inserting (stale links would
  // linger), so each dish needs delete-then-insert ordering. Dishes run in
  // parallel; within a dish the statements stay sequential.
  await Promise.all(
    dishes.map(async (dish, position) => {
      const dishId = dish.id ?? newId("dish");
      await sql`
        INSERT INTO template_dishes (id, template_id, name_en, name_ta, position)
        VALUES (${dishId}, ${templateId}, ${dish.nameEn}, ${dish.nameTa}, ${position})
        ON CONFLICT (id) DO UPDATE SET
          template_id = EXCLUDED.template_id,
          name_en = EXCLUDED.name_en,
          name_ta = EXCLUDED.name_ta,
          position = EXCLUDED.position
      `;
      await sql`DELETE FROM template_dish_ingredients WHERE dish_id = ${dishId}`;
      await Promise.all(
        dish.ingredients.map((item) =>
          sql`
            INSERT INTO template_dish_ingredients (id, dish_id, ingredient_id, qty_per_100)
            VALUES (${newId("tdi")}, ${dishId}, ${item.ingredientId}, ${item.qtyPer100})
          `
        )
      );
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
