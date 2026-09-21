import type { StockLedgerEntry } from "@/store/stockLedger";
import { todayLocalISO } from "@/lib/date";

export type DateRange = { from: string; to: string };

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Monday–Sunday span containing today (local time). */
export function thisWeekRange(today: string = todayLocalISO()): DateRange {
  const base = parseISODate(today) ?? new Date();
  const day = (base.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(base);
  monday.setDate(base.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toISODate(monday), to: toISODate(sunday) };
}

/** First–last day of the current local month. */
export function thisMonthRange(today: string = todayLocalISO()): DateRange {
  const base = parseISODate(today) ?? new Date();
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const last = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return { from: toISODate(first), to: toISODate(last) };
}

/** Purchase-type entries whose YYYY-MM-DD date falls inside [from, to]. */
export function filterPurchasesByRange(
  entries: StockLedgerEntry[],
  range: DateRange
): StockLedgerEntry[] {
  return entries
    .filter(
      (entry) =>
        entry.type === "purchase" &&
        entry.date >= range.from &&
        entry.date <= range.to
    )
    .sort((a, b) =>
      a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)
    );
}

export type IngredientSubtotal = {
  ingredientId: string;
  qty: number;
  cost: number;
};

export type PurchaseSummary = {
  totalSpent: number;
  count: number;
  byIngredient: IngredientSubtotal[];
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Spend totals for a filtered purchase list. Cost = qty × stored price. */
export function summarizePurchases(entries: StockLedgerEntry[]): PurchaseSummary {
  const byId = new Map<string, IngredientSubtotal>();
  let totalSpent = 0;
  for (const entry of entries) {
    const price = entry.price ?? 0;
    const cost = roundMoney(entry.qty * price);
    totalSpent = roundMoney(totalSpent + cost);
    const current = byId.get(entry.ingredientId) ?? {
      ingredientId: entry.ingredientId,
      qty: 0,
      cost: 0,
    };
    current.qty = roundMoney(current.qty + entry.qty);
    current.cost = roundMoney(current.cost + cost);
    byId.set(entry.ingredientId, current);
  }
  const byIngredient = [...byId.values()].sort((a, b) => b.cost - a.cost);
  return { totalSpent, count: entries.length, byIngredient };
}
