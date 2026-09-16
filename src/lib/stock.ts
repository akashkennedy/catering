import type { Ingredient } from "@/store/ingredients";
import type { StockLedgerEntry } from "@/store/stockLedger";
import { normalizeUnit } from "@/lib/units";

export function remainingStock(
  ingredient: { id: string; openingStock?: number },
  entries: StockLedgerEntry[]
): number {
  const opening = ingredient.openingStock ?? 0;
  let net = 0;
  for (const entry of entries) {
    if (entry.ingredientId !== ingredient.id) continue;
    net += entry.type === "purchase" ? entry.qty : -entry.qty;
  }
  return Math.round((opening + net) * 100) / 100;
}

export function isLowStock(
  ingredient: Ingredient,
  entries: StockLedgerEntry[]
): boolean {
  const threshold = ingredient.lowStockThreshold ?? 0;
  if (threshold <= 0) return false;
  return remainingStock(ingredient, entries) <= threshold;
}

export function formatStock(
  qty: number,
  unit: string | null | undefined
): string {
  const u = normalizeUnit(unit);
  return `${qty} ${u}`.trim();
}