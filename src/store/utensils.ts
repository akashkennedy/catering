import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  addUtensil: (input: UtensilInput) => string;
  updateUtensil: (id: string, input: UtensilInput) => void;
  deleteUtensil: (id: string) => void;
};

export const useUtensilsStore = create<UtensilsState>()(
  persist(
    (set) => ({
      utensils: [],
      addUtensil: (input) => {
        const id = crypto.randomUUID();
        set((state) => ({
          utensils: [...state.utensils, { id, ...input }],
        }));
        return id;
      },
      updateUtensil: (id, input) =>
        set((state) => ({
          utensils: state.utensils.map((utensil) =>
            utensil.id === id ? { ...utensil, ...input } : utensil
          ),
        })),
      deleteUtensil: (id) =>
        set((state) => ({
          utensils: state.utensils.filter((utensil) => utensil.id !== id),
        })),
    }),
    {
      name: "catering-utensils",
      storage: createJSONStorage(() => localStorage),
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