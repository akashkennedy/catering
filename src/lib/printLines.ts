/**
 * Lightweight print helpers (no @react-pdf/renderer dependency).
 * Import these for render-path use; the heavy PDF document builders in
 * `./pdf` should only ever be loaded via dynamic import on download.
 */
import type { EventIngredientLine } from "@/store/events";
import type { Ingredient } from "@/store/ingredients";
import { normalizeUnit } from "@/lib/units";
import { INGREDIENT_TAGS, isIngredientTag, type IngredientTag } from "@/lib/ingredientTags";

export type PrintLine = {
  key: string;
  nameEn: string;
  nameTa: string;
  qty: number;
  unit: string;
  price: number;
};

export function toPrintLines(
  lines: EventIngredientLine[],
  ingredients: Ingredient[]
): PrintLine[] {
  const byId = new Map(ingredients.map((item) => [item.id, item]));
  return lines.map((line) => {
    const master = byId.get(line.ingredientId);
    return {
      key: line.id,
      nameEn: master?.name || "—",
      nameTa: master?.tamilName || master?.name || "—",
      qty: line.qty,
      unit: normalizeUnit(master?.unit),
      price: line.price,
    };
  });
}

export function tagOfLine(
  line: EventIngredientLine,
  ingredients: Ingredient[]
): IngredientTag {
  const master = ingredients.find((item) => item.id === line.ingredientId);
  return master && isIngredientTag(master.tag) ? master.tag : "grocery";
}

export function presentTags(
  lines: EventIngredientLine[],
  ingredients: Ingredient[]
): IngredientTag[] {
  const seen = new Set<IngredientTag>();
  for (const line of lines) seen.add(tagOfLine(line, ingredients));
  return INGREDIENT_TAGS.filter((tag) => seen.has(tag));
}
