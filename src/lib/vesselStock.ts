import type { Utensil } from "@/store/utensils";
import type { VesselStockEntry } from "@/store/vesselStockLedger";

export type VesselStockSummary = {
  owned: number;
  rentedIn: number;
  assigned: number;
  available: number;
};

export function vesselStockSummary(
  utensil: { id: string; openingStock?: number },
  entries: VesselStockEntry[]
): VesselStockSummary {
  const owned = utensil.openingStock ?? 0;
  let rentedIn = 0;
  let assigned = 0;
  for (const entry of entries) {
    if (entry.utensilId !== utensil.id) continue;
    if (entry.type === "rentedIn") rentedIn += entry.qty;
    else assigned += entry.qty;
  }
  const available = Math.round((owned + rentedIn - assigned) * 100) / 100;
  return { owned, rentedIn, assigned, available };
}

export function vesselAvailability(
  utensil: { id: string; openingStock?: number },
  entries: VesselStockEntry[]
): number {
  return vesselStockSummary(utensil, entries).available;
}

export function assignedNeedsForEvents(
  utensilId: string,
  entries: VesselStockEntry[],
  eventIds: Set<string>
): number {
  let total = 0;
  for (const entry of entries) {
    if (entry.utensilId !== utensilId) continue;
    if (entry.type !== "assigned") continue;
    if (!entry.eventId || !eventIds.has(entry.eventId)) continue;
    total += entry.qty;
  }
  return total;
}

export function isVesselLow(
  utensil: Utensil,
  entries: VesselStockEntry[]
): boolean {
  const threshold = utensil.lowStockThreshold ?? 0;
  if (threshold <= 0) return false;
  return vesselAvailability(utensil, entries) <= threshold;
}

export function isVesselInsufficient(
  utensil: Utensil,
  entries: VesselStockEntry[],
  eventIds: Set<string>
): boolean {
  const available = vesselAvailability(utensil, entries);
  const needed = assignedNeedsForEvents(utensil.id, entries, eventIds);
  return needed > available;
}