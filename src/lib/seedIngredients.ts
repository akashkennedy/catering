import { INGREDIENT_CATALOG } from "./ingredientCatalog";
import { useIngredientsStore } from "@/store/ingredients";

const SEED_KEY = "catering-ingredients-seeded";

/**
 * One-time load of the business's ingredient catalog into localStorage.
 * Skips items already present under the same English + Tamil name so seeding
 * never wipes or duplicates user-entered ingredients.
 */
export function seedIngredientCatalog(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(SEED_KEY)) return;
    const store = useIngredientsStore.getState();
    const existing = new Set(
      store.ingredients.map((i) => `${i.name}::${i.tamilName}`.toLowerCase())
    );
    for (const item of INGREDIENT_CATALOG) {
      const key = `${item.name}::${item.tamilName}`.toLowerCase();
      if (existing.has(key)) continue;
      store.addIngredient(item);
      existing.add(key);
    }
    localStorage.setItem(SEED_KEY, "1");
  } catch {
    // Non-fatal — the app still works if seeding is blocked.
  }
}