/**
 * @deprecated Client-side catalog seeding is disabled.
 * The ingredient catalog is seeded server-side (`npm run db:seed-catalog`)
 * with stable ids and loaded via GET. The previous implementation POSTed
 * ~192 rows on mount with random ids, which collided by name (409) on any
 * shared/branched DB that already contained the catalog. Kept as a no-op so
 * old imports don't break; new code must not call it.
 */
export function seedIngredientCatalog(): void {
  return;
}