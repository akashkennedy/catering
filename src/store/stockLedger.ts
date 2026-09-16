import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const STOCK_ENTRY_TYPES = ["purchase", "used"] as const;
export type StockEntryType = (typeof STOCK_ENTRY_TYPES)[number];

export type StockLedgerEntry = {
  id: string;
  ingredientId: string;
  type: StockEntryType;
  qty: number;
  date: string;
  eventId: string | null;
  note: string;
};

export type PurchaseEntryInput = {
  ingredientId: string;
  qty: number;
  date: string;
  note?: string;
};

export type UsedEntryInput = {
  ingredientId: string;
  qty: number;
  date: string;
  eventId: string;
  note?: string;
};

type StockLedgerState = {
  entries: StockLedgerEntry[];
  addPurchaseEntry: (input: PurchaseEntryInput) => void;
  addUsedEntry: (input: UsedEntryInput) => void;
  removeEntriesForIngredient: (ingredientId: string) => void;
};

export const useStockLedgerStore = create<StockLedgerState>()(
  persist(
    (set) => ({
      entries: [],
      addPurchaseEntry: (input) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              id: crypto.randomUUID(),
              ingredientId: input.ingredientId,
              type: "purchase",
              qty: input.qty,
              date: input.date,
              eventId: null,
              note: input.note ?? "",
            },
          ],
        })),
      addUsedEntry: (input) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              id: crypto.randomUUID(),
              ingredientId: input.ingredientId,
              type: "used",
              qty: input.qty,
              date: input.date,
              eventId: input.eventId,
              note: input.note ?? "",
            },
          ],
        })),
      removeEntriesForIngredient: (ingredientId) =>
        set((state) => ({
          entries: state.entries.filter(
            (entry) => entry.ingredientId !== ingredientId
          ),
        })),
    }),
    {
      name: "catering-stock-ledger",
      storage: createJSONStorage(() => localStorage),
    }
  )
);