import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const VESSEL_STOCK_ENTRY_TYPES = ["rentedIn", "assigned"] as const;
export type VesselStockEntryType = (typeof VESSEL_STOCK_ENTRY_TYPES)[number];

export type VesselStockEntry = {
  id: string;
  utensilId: string;
  type: VesselStockEntryType;
  qty: number;
  date: string;
  eventId: string | null;
  note: string;
};

export type RentInEntryInput = {
  utensilId: string;
  qty: number;
  date: string;
  eventId?: string;
  note?: string;
};

export type AssignedEntryInput = {
  utensilId: string;
  qty: number;
  date: string;
  eventId: string;
  note?: string;
};

type VesselStockLedgerState = {
  entries: VesselStockEntry[];
  addRentInEntry: (input: RentInEntryInput) => void;
  addAssignedEntry: (input: AssignedEntryInput) => void;
  removeEntriesForUtensil: (utensilId: string) => void;
};

export const useVesselStockLedgerStore = create<VesselStockLedgerState>()(
  persist(
    (set) => ({
      entries: [],
      addRentInEntry: (input) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              id: crypto.randomUUID(),
              utensilId: input.utensilId,
              type: "rentedIn",
              qty: input.qty,
              date: input.date,
              eventId: input.eventId ?? null,
              note: input.note ?? "",
            },
          ],
        })),
      addAssignedEntry: (input) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              id: crypto.randomUUID(),
              utensilId: input.utensilId,
              type: "assigned",
              qty: input.qty,
              date: input.date,
              eventId: input.eventId,
              note: input.note ?? "",
            },
          ],
        })),
      removeEntriesForUtensil: (utensilId) =>
        set((state) => ({
          entries: state.entries.filter(
            (entry) => entry.utensilId !== utensilId
          ),
        })),
    }),
    {
      name: "catering-vessel-stock-ledger",
      storage: createJSONStorage(() => localStorage),
    }
  )
);