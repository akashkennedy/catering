import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { fetchJson, newClientId, syncOrQueue } from "@/lib/storeSync";

export const STOCK_ENTRY_TYPES = ["purchase", "used"] as const;
export type StockEntryType = (typeof STOCK_ENTRY_TYPES)[number];

export type StockLedgerEntry = {
  id: string;
  ingredientId: string;
  type: StockEntryType;
  qty: number;
  /** Unit price paid (0 for rows logged before price tracking). */
  price: number;
  date: string;
  eventId: string | null;
  note: string;
};

export type PurchaseEntryInput = {
  ingredientId: string;
  qty: number;
  price: number;
  date: string;
  note?: string;
};

type StockLedgerState = {
  entries: StockLedgerEntry[];
  loaded: boolean;
  addPurchaseEntry: (input: PurchaseEntryInput) => void;
  removeEntriesForIngredient: (ingredientId: string) => void;
  loadStockLedger: () => Promise<void>;
};

function toRecord(entry: StockLedgerEntry) {
  return {
    id: entry.id,
    ingredientId: entry.ingredientId,
    type: entry.type,
    qty: entry.qty,
    price: entry.price,
    date: entry.date,
    eventId: entry.eventId,
    note: entry.note,
  };
}

// Shared in-flight load so simultaneous mounts fire a single request.
let loadStockLedgerRequest: Promise<void> | null = null;

export const useStockLedgerStore = create<StockLedgerState>()(
  persist(
    /** Builds the persisted ingredient stock ledger and its synchronized actions. */
    (set) => ({
      entries: [],
      loaded: false,
      addPurchaseEntry: (input) => {
        const entry: StockLedgerEntry = {
          id: newClientId(),
          ingredientId: input.ingredientId,
          type: "purchase",
          qty: input.qty,
          price: input.price,
          date: input.date,
          eventId: null,
          note: input.note ?? "",
        };
        set((state) => ({ entries: [...state.entries, entry] }));
        void syncOrQueue("POST", "/api/stock-entries", toRecord(entry));
      },
      removeEntriesForIngredient: (ingredientId) => {
        set((state) => ({
          entries: state.entries.filter(
            (entry) => entry.ingredientId !== ingredientId
          ),
        }));
        void syncOrQueue(
          "DELETE",
          `/api/stock-entries?ingredientId=${encodeURIComponent(ingredientId)}`
        );
      },
      loadStockLedger: async () => {
        if (useStockLedgerStore.getState().loaded) return;
        if (!loadStockLedgerRequest) {
          loadStockLedgerRequest = (async () => {
            const { flushOutbox } = await import("@/lib/outbox");
            await flushOutbox();
            const body = await fetchJson<{ entries?: StockLedgerEntry[] }>("/api/stock-entries");
            if (body && Array.isArray(body.entries)) {
              set({ entries: body.entries, loaded: true });
            }
          })().finally(() => {
            loadStockLedgerRequest = null;
          });
        }
        await loadStockLedgerRequest;
      },
    }),
    {
      name: "catering-stock-ledger",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
