export const INGREDIENT_TAGS = [
  "grocery",
  "vegetables",
  "masala-spices",
  "vessel",
  "meat-fish",
  "fuel",
] as const;

export type IngredientTag = (typeof INGREDIENT_TAGS)[number];

export function isIngredientTag(value: unknown): value is IngredientTag {
  return (
    typeof value === "string" &&
    (INGREDIENT_TAGS as readonly string[]).includes(value)
  );
}