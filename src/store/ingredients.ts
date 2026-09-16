import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Ingredient = {
  id: string;
  name: string;
  tamilName: string;
  unit: string;
  qty: number;
  globalPrice: number;
  openingStock: number;
  lowStockThreshold: number;
};

export type IngredientInput = Omit<Ingredient, "id">;

type IngredientsState = {
  ingredients: Ingredient[];
  addIngredient: (input: IngredientInput) => void;
  updateIngredient: (id: string, input: IngredientInput) => void;
  setIngredientPrice: (id: string, globalPrice: number) => void;
  deleteIngredient: (id: string) => void;
};

export const useIngredientsStore = create<IngredientsState>()(
  persist(
    (set) => ({
      ingredients: [],
      addIngredient: (input) =>
        set((state) => ({
          ingredients: [...state.ingredients, { id: crypto.randomUUID(), ...input }],
        })),
      updateIngredient: (id, input) =>
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) =>
            ingredient.id === id ? { ...ingredient, ...input } : ingredient
          ),
        })),
      setIngredientPrice: (id, globalPrice) =>
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) =>
            ingredient.id === id ? { ...ingredient, globalPrice } : ingredient
          ),
        })),
      deleteIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((ingredient) => ingredient.id !== id),
        })),
    }),
    {
      name: "catering-ingredients",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as {
          ingredients?: Array<Record<string, unknown>> | null;
        };
        return {
          ...state,
          ingredients: (state.ingredients ?? []).map((raw) => ({
            ...raw,
            openingStock:
              typeof raw.openingStock === "number" ? raw.openingStock : 0,
            lowStockThreshold:
              typeof raw.lowStockThreshold === "number" ? raw.lowStockThreshold : 0,
          })),
        };
      },
    }
  )
);