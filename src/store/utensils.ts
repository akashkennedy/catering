import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Utensil = {
  id: string;
  name: string;
  rentPrice: number;
};

export type UtensilInput = Omit<Utensil, "id">;

type UtensilsState = {
  utensils: Utensil[];
  addUtensil: (input: UtensilInput) => void;
  updateUtensil: (id: string, input: UtensilInput) => void;
  deleteUtensil: (id: string) => void;
};

export const useUtensilsStore = create<UtensilsState>()(
  persist(
    (set) => ({
      utensils: [],
      addUtensil: (input) =>
        set((state) => ({
          utensils: [...state.utensils, { id: crypto.randomUUID(), ...input }],
        })),
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
    }
  )
);