import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { fetchJson, newClientId, syncOrQueue } from "@/lib/storeSync";

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
  loaded: boolean;
  addRentInEntry: (input: RentInEntryInput) => void;
  addAssignedEntry: (input: AssignedEntryInput) => void;
  removeEntriesForUtensil: (utensilId: string) => void;
  loadVesselLedger: () => Promise<void>;
};

function toRecord(entry: VesselStockEntry) {
  return {
    id: entry.id,
    utensilId: entry.utensilId,
    type: entry.type,
    qty: entry.qty,
    date: entry.date,
    eventId: entry.eventId,
    note: entry.note,
  };
}

export const useVesselStockLedgerStore = create<VesselStockLedgerState>()(
  persist(
    (set) => ({
      entries: [],
      loaded: false,
      addRentInEntry: (input) => {
        const entry: VesselStockEntry = {
          id: newClientId(),
          utensilId: input.utensilId,
          type: "rentedIn",
          qty: input.qty,
          date: input.date,
          eventId: input.eventId ?? null,
          note: input.note ?? "",
        };
        set((state) => ({ entries: [...state.entries, entry] }));
        void syncOrQueue("POST", "/api/vessel-entries", toRecord(entry));
      },
      addAssignedEntry: (input) => {
        const entry: VesselStockEntry = {
          id: newClientId(),
          utensilId: input.utensilId,
          type: "assigned",
          qty: input.qty,
          date: input.date,
          eventId: input.eventId,
          note: input.note ?? "",
        };
        set((state) => ({ entries: [...state.entries, entry] }));
        void syncOrQueue("POST", "/api/vessel-entries", toRecord(entry));
      },
      removeEntriesForUtensil: (utensilId) => {
        set((state) => ({
          entries: state.entries.filter(
            (entry) => entry.utensilId !== utensilId
          ),
        }));
        void syncOrQueue(
          "DELETE",
          `/api/vessel-entries?utensilId=${encodeURIComponent(utensilId)}`
        );
      },
      loadVesselLedger: async () => {
        const { flushOutbox } = await import("@/lib/outbox");
        await flushOutbox();
        const body = await fetchJson<{ entries?: VesselStockEntry[] }>("/api/vessel-entries");
        if (body && Array.isArray(body.entries)) {
          set({ entries: body.entries, loaded: true });
        }
      },
    }),
    {
      name: "catering-vessel-stock-ledger",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);