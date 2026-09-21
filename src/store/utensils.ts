import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { fetchJson, newClientId, syncOrQueue } from "@/lib/storeSync";

export type Utensil = {
  id: string;
  name: string;
  rentPrice: number;
  openingStock: number;
  lowStockThreshold: number;
};

export type UtensilInput = Omit<Utensil, "id">;

type UtensilsState = {
  utensils: Utensil[];
  loaded: boolean;
  addUtensil: (input: UtensilInput) => string;
  updateUtensil: (id: string, input: UtensilInput) => void;
  deleteUtensil: (id: string) => void;
  loadUtensils: () => Promise<void>;
};

// Shared in-flight load so simultaneous mounts fire a single request.
let loadUtensilsRequest: Promise<void> | null = null;

export const useUtensilsStore = create<UtensilsState>()(
  persist(
    /** Builds the persisted utensil store and its synchronized actions. */
    (set) => ({
      utensils: [],
      loaded: false,
      addUtensil: (input) => {
        const id = newClientId();
        set((state) => ({
          utensils: [...state.utensils, { id, ...input }],
        }));
        void syncOrQueue("POST", "/api/utensils", { id, ...input });
        return id;
      },
      updateUtensil: (id, input) => {
        set((state) => ({
          utensils: state.utensils.map((utensil) =>
            utensil.id === id ? { ...utensil, ...input } : utensil
          ),
        }));
        void syncOrQueue("PATCH", `/api/utensils/${encodeURIComponent(id)}`, input);
      },
      deleteUtensil: (id) => {
        set((state) => ({
          utensils: state.utensils.filter((utensil) => utensil.id !== id),
        }));
        void syncOrQueue("DELETE", `/api/utensils/${encodeURIComponent(id)}`);
      },
      loadUtensils: async () => {
        if (useUtensilsStore.getState().loaded) return;
        if (!loadUtensilsRequest) {
          loadUtensilsRequest = (async () => {
            const { flushOutbox } = await import("@/lib/outbox");
            await flushOutbox();
            const body = await fetchJson<{ utensils?: Utensil[] }>("/api/utensils");
            if (body && Array.isArray(body.utensils)) {
              set({ utensils: body.utensils, loaded: true });
            }
          })().finally(() => {
            loadUtensilsRequest = null;
          });
        }
        await loadUtensilsRequest;
      },
    }),
    {
      name: "catering-utensils",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ utensils: state.utensils }),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as {
          utensils?: Array<Record<string, unknown>> | null;
        };
        return {
          ...state,
          utensils: (state.utensils ?? []).map((raw) => ({
            ...raw,
            openingStock:
              typeof raw.openingStock === "number" ? raw.openingStock : 0,
            lowStockThreshold:
              typeof raw.lowStockThreshold === "number"
                ? raw.lowStockThreshold
                : 0,
          })),
        };
      },
    }
  )
);
