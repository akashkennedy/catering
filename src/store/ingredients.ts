import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  isIngredientTag,
  type IngredientTag,
} from "@/lib/ingredientTags";

export type Ingredient = {
  id: string;
  name: string;
  tamilName: string;
  tag: IngredientTag;
  unit: string;
  qty: number;
  globalPrice: number;
  openingStock: number;
  lowStockThreshold: number;
};

export type IngredientInput = Omit<Ingredient, "id">;

type IngredientsState = {
  ingredients: Ingredient[];
  loaded: boolean;
  addIngredient: (input: IngredientInput) => Promise<void>;
  updateIngredient: (id: string, input: IngredientInput) => Promise<void>;
  setIngredientPrice: (id: string, globalPrice: number) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  loadIngredients: () => Promise<void>;
};

function newClientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

async function postJson(path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function patchJson(path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function deletePath(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method: "DELETE",
      credentials: "same-origin",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export const useIngredientsStore = create<IngredientsState>()(
  persist(
    (set) => ({
      ingredients: [],
      loaded: false,
      addIngredient: async (input) => {
        const ingredient: Ingredient = { id: newClientId(), ...input };
        set((state) => ({ ingredients: [...state.ingredients, ingredient] }));
        const ok = await postJson("/api/ingredients", ingredient);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "POST", path: "/api/ingredients", body: ingredient });
        }
      },
      updateIngredient: async (id, input) => {
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) =>
            ingredient.id === id ? { ...ingredient, ...input } : ingredient
          ),
        }));
        const ok = await patchJson(`/api/ingredients/${encodeURIComponent(id)}`, input);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "PATCH", path: `/api/ingredients/${encodeURIComponent(id)}`, body: input });
        }
      },
      setIngredientPrice: async (id, globalPrice) => {
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) =>
            ingredient.id === id ? { ...ingredient, globalPrice } : ingredient
          ),
        }));
        const ok = await patchJson(`/api/ingredients/${encodeURIComponent(id)}`, { globalPrice });
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({
            method: "PATCH",
            path: `/api/ingredients/${encodeURIComponent(id)}`,
            body: { globalPrice },
          });
        }
      },
      deleteIngredient: async (id) => {
        set((state) => ({
          ingredients: state.ingredients.filter((ingredient) => ingredient.id !== id),
        }));
        const ok = await deletePath(`/api/ingredients/${encodeURIComponent(id)}`);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "DELETE", path: `/api/ingredients/${encodeURIComponent(id)}` });
        }
      },
      loadIngredients: async () => {
        const { flushOutbox } = await import("@/lib/outbox");
        await flushOutbox();
        try {
          const response = await fetch("/api/ingredients", { credentials: "same-origin" });
          if (!response.ok) return;
          const body = (await response.json()) as { ingredients?: Ingredient[] };
          if (Array.isArray(body.ingredients)) {
            set({ ingredients: body.ingredients, loaded: true });
          }
        } catch {
          // Offline: keep the localStorage cache as the read source.
        }
      },
    }),
    {
      name: "catering-ingredients",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ingredients: state.ingredients }),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as {
          ingredients?: Array<Record<string, unknown>> | null;
        };
        return {
          ...state,
          ingredients: (state.ingredients ?? []).map((raw) => ({
            ...raw,
            tag: isIngredientTag(raw.tag) ? raw.tag : "grocery",
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