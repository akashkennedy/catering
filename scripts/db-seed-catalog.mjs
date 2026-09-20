/**
 * Seeds the business catalog into Neon: ingredients, food templates
 * (meals), template dishes (courses) and dish-ingredient links.
 *
 * Sources (single source of truth, same as the app):
 * - src/lib/ingredientCatalog.ts  (INGREDIENT_CATALOG, wins on conflicts)
 * - src/lib/legacySeed.ts         (LEGACY_MEALS: Saapadu, Biriyani + courses)
 *
 * Idempotent — stable ids (`ing-<slug>`, `tpl-<slug>`, `dish-<tpl>-<nn>`)
 * with ON CONFLICT upserts, so re-running never duplicates. Dish links are
 * rebuilt per dish (delete + insert); links are not referenced elsewhere.
 *
 * Also removes the one leftover "Rice" probe row (id below) that predates
 * the seed, so the real catalog Rice seeds cleanly.
 *
 * Usage: npm run db:seed-catalog [-- --dry-run]
 * (npm script loads .env via --env-file automatically)
 */
import { neon } from "@neondatabase/serverless";

import { INGREDIENT_CATALOG } from "../src/lib/ingredientCatalog.ts";
import { LEGACY_MEALS } from "../src/lib/legacySeed.ts";
import { normalizeUnit } from "../src/lib/units.ts";

const dryRun = process.argv.includes("--dry-run");

// Leftover probe row on the server (Rice/அரிசி, unit gm, price 35).
// Deleted so the real catalog entry seeds without a name clash.
const PROBE_RICE_ID = "ac0f87bc-2d33-414d-91b4-6e3c5ea30dae";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. See .env.example.");
  process.exit(1);
}

function slug(text) {
  const s = String(text ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "item";
}

const sql = neon(url);
const stats = {
  ingredientsUpserted: 0,
  ingredientsSkippedDuplicate: 0,
  templatesUpserted: 0,
  dishesUpserted: 0,
  linksWritten: 0,
  probeRowsDeleted: 0,
};
const warnings = [];

// --- Ingredients (catalog wins; first occurrence of a name wins) ---
const seenNames = new Set();
const ingredients = [];
for (const item of INGREDIENT_CATALOG) {
  const key = String(item.name ?? "").trim().toLowerCase();
  if (!key) continue;
  if (seenNames.has(key)) {
    stats.ingredientsSkippedDuplicate += 1;
    warnings.push(`Duplicate catalog name skipped: "${item.name}"`);
    continue;
  }
  seenNames.add(key);
  ingredients.push({
    id: `ing-${slug(item.name)}`,
    name: String(item.name).trim(),
    tamilName: String(item.tamilName ?? "").trim(),
    tag: String(item.tag ?? "grocery").trim() || "grocery",
    unit: normalizeUnit(item.unit) || String(item.unit ?? "").trim(),
    globalPrice: Number(item.globalPrice) || 0,
  });
}

const ingredientIdByName = new Map(
  ingredients.map((ing) => [ing.name.trim().toLowerCase(), ing.id])
);

// --- Templates + dishes + links ---
const templates = [];
for (const meal of LEGACY_MEALS) {
  const templateId = `tpl-${slug(meal.nameEn)}`;
  const dishes = [];
  let position = 0;
  for (const course of meal.courses ?? []) {
    if (!String(course.nameEn ?? "").trim()) continue;
    const dishId = `dish-${slug(meal.nameEn)}-${String(position).padStart(2, "0")}`;
    const links = [];
    for (const item of course.items ?? []) {
      const ingredientId = ingredientIdByName.get(
        String(item.nameEn ?? "").trim().toLowerCase()
      );
      if (!ingredientId) {
        warnings.push(
          `No ingredient match for "${item.nameEn}" in ${meal.nameEn} > ${course.nameEn} — skipped`
        );
        continue;
      }
      links.push({
        id: `tdi-${slug(course.nameEn)}-${slug(item.nameEn)}`,
        ingredientId,
        qtyPer100: Number(item.qtyPer100) || 0,
      });
    }
    dishes.push({
      id: dishId,
      nameEn: String(course.nameEn).trim(),
      nameTa: String(course.nameTa ?? "").trim(),
      position,
      links,
    });
    position += 1;
  }
  templates.push({
    id: templateId,
    nameEn: String(meal.nameEn).trim(),
    nameTa: String(meal.nameTa ?? "").trim(),
    dishes,
  });
}

if (dryRun) {
  console.log("DRY RUN — no writes.");
  console.log(`Ingredients to upsert: ${ingredients.length} (${stats.ingredientsSkippedDuplicate} duplicates skipped)`);
  console.log(`Templates to upsert: ${templates.length}`);
  console.log(
    `Dishes to upsert: ${templates.reduce((n, t) => n + t.dishes.length, 0)}`
  );
  console.log(
    `Dish links to write: ${templates.reduce(
      (n, t) => n + t.dishes.reduce((m, d) => m + d.links.length, 0),
      0
    )}`
  );
  console.log(`Probe rows to delete: 1 (${PROBE_RICE_ID})`);
  console.log("Sample ingredient:", JSON.stringify(ingredients[0]));
  console.log("Sample template:", JSON.stringify(templates[0]?.nameEn));
  for (const w of warnings) console.log(`WARN: ${w}`);
  process.exit(0);
}

// --- Write: probe row first so the real Rice seeds cleanly ---
const probe = await sql`SELECT id FROM ingredients WHERE id = ${PROBE_RICE_ID} LIMIT 1`;
if (probe.length > 0) {
  await sql`DELETE FROM ingredients WHERE id = ${PROBE_RICE_ID}`;
  stats.probeRowsDeleted = 1;
  console.log(`Deleted probe row ${PROBE_RICE_ID}.`);
}

for (const ing of ingredients) {
  await sql`
    INSERT INTO ingredients
      (id, name, tamil_name, tag, unit, qty, global_price, opening_stock, low_stock_threshold, updated_at)
    VALUES
      (${ing.id}, ${ing.name}, ${ing.tamilName}, ${ing.tag}, ${ing.unit}, 0, ${ing.globalPrice}, 0, 0, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      tamil_name = EXCLUDED.tamil_name,
      tag = EXCLUDED.tag,
      unit = EXCLUDED.unit,
      global_price = EXCLUDED.global_price,
      updated_at = NOW()
  `;
  stats.ingredientsUpserted += 1;
}

for (const template of templates) {
  await sql`
    INSERT INTO food_templates (id, name_en, name_ta, updated_at)
    VALUES (${template.id}, ${template.nameEn}, ${template.nameTa}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name_en = EXCLUDED.name_en,
      name_ta = EXCLUDED.name_ta,
      updated_at = NOW()
  `;
  stats.templatesUpserted += 1;
  for (const dish of template.dishes) {
    await sql`
      INSERT INTO template_dishes (id, template_id, name_en, name_ta, position)
      VALUES (${dish.id}, ${template.id}, ${dish.nameEn}, ${dish.nameTa}, ${dish.position})
      ON CONFLICT (id) DO UPDATE SET
        template_id = EXCLUDED.template_id,
        name_en = EXCLUDED.name_en,
        name_ta = EXCLUDED.name_ta,
        position = EXCLUDED.position
    `;
    stats.dishesUpserted += 1;
    await sql`DELETE FROM template_dish_ingredients WHERE dish_id = ${dish.id}`;
    for (const link of dish.links) {
      await sql`
        INSERT INTO template_dish_ingredients (id, dish_id, ingredient_id, qty_per_100)
        VALUES (${link.id}, ${dish.id}, ${link.ingredientId}, ${link.qtyPer100})
        ON CONFLICT (id) DO UPDATE SET
          ingredient_id = EXCLUDED.ingredient_id,
          qty_per_100 = EXCLUDED.qty_per_100
      `;
      stats.linksWritten += 1;
    }
  }
}

console.log(
  `Done: ${stats.ingredientsUpserted} ingredients, ${stats.templatesUpserted} templates, ` +
    `${stats.dishesUpserted} dishes, ${stats.linksWritten} dish links ` +
    `(${stats.probeRowsDeleted} probe row deleted, ${stats.ingredientsSkippedDuplicate} duplicates skipped).`
);
for (const w of warnings) console.log(`WARN: ${w}`);
