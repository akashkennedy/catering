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
    }
  )
);