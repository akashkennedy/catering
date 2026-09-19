import { LEGACY_INGREDIENTS, LEGACY_MEALS } from "./legacySeed";
import { normalizeUnit } from "./units";
import { useIngredientsStore } from "@/store/ingredients";
import { useTemplatesStore } from "@/store/templates";

export type LegacyImportResult = {
  ingredientsAdded: number;
  ingredientsSkipped: number;
  templatesAdded: number;
  templatesSkipped: number;
};

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `legacy-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

/**
 * One-time import of every meal + course + ingredient from the old app
 * (mampally-new.vercel.app, see `legacySeed.ts`).
 * Matches ingredients by English name (case-insensitive) so re-running is
 * safe: existing ingredients/templates are skipped, never duplicated.
 */
export function importLegacyData(): LegacyImportResult {
  const ingredientsStore = useIngredientsStore.getState();
  const knownNames = new Set(
    ingredientsStore.ingredients.map((item) => item.name.trim().toLowerCase())
  );

  let ingredientsAdded = 0;
  for (const item of LEGACY_INGREDIENTS) {
    const key = item.nameEn.trim().toLowerCase();
    if (!key || knownNames.has(key)) continue;
    knownNames.add(key);
    ingredientsStore.addIngredient({
      name: item.nameEn,
      tamilName: item.nameTa,
      tag: item.tag,
      unit: normalizeUnit(item.unit) || item.unit,
      qty: 0,
      globalPrice: item.pricePerUnit,
      openingStock: 0,
      lowStockThreshold: 0,
    });
    ingredientsAdded++;
  }

  const idByName = new Map(
    useIngredientsStore
      .getState()
      .ingredients.map((item) => [item.name.trim().toLowerCase(), item.id])
  );

  const templatesStore = useTemplatesStore.getState();
  const knownTemplates = new Set(
    templatesStore.templates.map((template) => template.nameEn.trim().toLowerCase())
  );

  let templatesAdded = 0;
  for (const meal of LEGACY_MEALS) {
    const key = meal.nameEn.trim().toLowerCase();
    if (!key || knownTemplates.has(key)) continue;
    knownTemplates.add(key);
    templatesStore.addTemplate({
      nameEn: meal.nameEn,
      nameTa: meal.nameTa,
      dishes: meal.courses
        .filter((course) => course.nameEn.trim() !== "")
        .map((course) => ({
          id: newId(),
          nameEn: course.nameEn,
          nameTa: course.nameTa,
          ingredients: course.items.flatMap((item) => {
            const ingredientId = idByName.get(item.nameEn.trim().toLowerCase());
            return ingredientId ? [{ ingredientId, qtyPer100: item.qtyPer100 }] : [];
          }),
        })),
    });
    templatesAdded++;
  }

  return {
    ingredientsAdded,
    ingredientsSkipped: LEGACY_INGREDIENTS.length - ingredientsAdded,
    templatesAdded,
    templatesSkipped: LEGACY_MEALS.length - templatesAdded,
  };
}
