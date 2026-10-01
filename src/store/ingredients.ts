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
  packets: number;
  updatedAt?: string;
};

export type IngredientInput = Omit<Ingredient, "id" | "updatedAt">;

type IngredientsState = {
  ingredients: Ingredient[];
  /** ISO timestamp of last successful server sync (delta cursor). */
  syncedAt: string | null;
  loaded: boolean;
  addIngredient: (input: IngredientInput) => Promise<void>;
  updateIngredient: (id: string, input: IngredientInput) => Promise<void>;
  setIngredientPrice: (id: string, globalPrice: number) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  loadIngredients: () => Promise<void>;
  refreshIngredients: () => Promise<void>;
};

function newClientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

type WriteResult = { status: number | null; body: { ingredient?: Ingredient } | null };

async function postIngredient(body: unknown): Promise<WriteResult> {
  try {
    const response = await fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    let parsed: WriteResult["body"] = null;
    try {
      parsed = (await response.json()) as WriteResult["body"];
    } catch {
      parsed = null;
    }
    return { status: response.status, body: parsed };
  } catch {
    return { status: null, body: null };
  }
}

async function patchJson(path: string, body: unknown): Promise<number | null> {
  try {
    const response = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return response.status;
  } catch {
    return null;
  }
}

async function deletePath(path: string): Promise<number | null> {
  try {
    const response = await fetch(path, {
      method: "DELETE",
      credentials: "same-origin",
    });
    return response.status;
  } catch {
    return null;
  }
}

async function shouldQueueStatus(status: number | null): Promise<boolean> {
  const { isRetryableWriteStatus } = await import("@/lib/outbox");
  return isRetryableWriteStatus(status);
}

/** Merge server rows into local cache: upsert by id, drop deleted ids. */
function mergeIntoCache(
  cached: Ingredient[],
  changed: Ingredient[],
  deletedIds: string[]
): Ingredient[] {
  const deleted = new Set(deletedIds);
  const changedById = new Map(changed.map((row) => [row.id, row]));
  const next: Ingredient[] = [];
  for (const row of cached) {
    if (deleted.has(row.id)) continue;
    next.push(changedById.get(row.id) ?? row);
    changedById.delete(row.id);
  }
  for (const row of changedById.values()) next.push(row);
  next.sort((a, b) => a.name.localeCompare(b.name));
  return next;
}

// Shared in-flight load so simultaneous mounts fire a single request.
let loadIngredientsRequest: Promise<void> | null = null;
let backgroundRefreshRequest: Promise<void> | null = null;

export const useIngredientsStore = create<IngredientsState>()(
  persist(
    /** Builds the persisted ingredient store and its synchronized actions. */
    (set, get) => ({
      ingredients: [],
      syncedAt: null,
      loaded: false,
      addIngredient: async (input) => {
        // Client-side dedupe: same normalized name converges instead of 409.
        const existing = get().ingredients.find(
          (row) => normalizeName(row.name) === normalizeName(input.name)
        );
        if (existing) {
          await get().updateIngredient(existing.id, input);
          return;
        }
        const ingredient: Ingredient = { id: newClientId(), ...input };
        set((state) => ({ ingredients: [...state.ingredients, ingredient] }));
        const { status, body } = await postIngredient(ingredient);
        if (body?.ingredient && body.ingredient.id !== ingredient.id) {
          // Server merged onto an existing id (or assigned canonical row):
          // swap the optimistic row for the canonical one, dedupe by name.
          set((state) => {
            const rest = state.ingredients.filter((row) => row.id !== ingredient.id);
            const canonical = body.ingredient as Ingredient;
            const deduped = rest.filter(
              (row) =>
                row.id === canonical.id ||
                normalizeName(row.name) !== normalizeName(canonical.name)
            );
            const idx = deduped.findIndex((row) => row.id === canonical.id);
            if (idx >= 0) {
              const next = [...deduped];
              next[idx] = canonical;
              return { ingredients: next };
            }
            return { ingredients: [...deduped, canonical] };
          });
          return;
        }
        if (body?.ingredient && body.ingredient.id === ingredient.id) {
          set((state) => ({
            ingredients: state.ingredients.map((row) =>
              row.id === ingredient.id ? (body.ingredient as Ingredient) : row
            ),
          }));
          return;
        }
        // Legacy 409 from a server without the upsert change: drop the ghost
        // row so the catalog can't show same-name duplicates under two ids.
        if (status === 409) {
          set((state) => ({
            ingredients: state.ingredients.filter((row) => row.id !== ingredient.id),
          }));
          return;
        }
        if (await shouldQueueStatus(status)) {
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
        const status = await patchJson(`/api/ingredients/${encodeURIComponent(id)}`, input);
        if (await shouldQueueStatus(status)) {
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
        const status = await patchJson(`/api/ingredients/${encodeURIComponent(id)}`, { globalPrice });
        if (await shouldQueueStatus(status)) {
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
        const status = await deletePath(`/api/ingredients/${encodeURIComponent(id)}`);
        if (await shouldQueueStatus(status)) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "DELETE", path: `/api/ingredients/${encodeURIComponent(id)}` });
        }
      },
      refreshIngredients: async () => {
        if (backgroundRefreshRequest) {
          await backgroundRefreshRequest;
          return;
        }
        backgroundRefreshRequest = (async () => {
          try {
            const { syncedAt } = get();
            if (syncedAt) {
              try {
                const metaRes = await fetch("/api/ingredients?meta=1", {
                  credentials: "same-origin",
                });
                if (metaRes.ok) {
                  const meta = (await metaRes.json()) as {
                    maxUpdatedAt?: string | null;
                  };
                  if (
                    meta.maxUpdatedAt &&
                    meta.maxUpdatedAt <= syncedAt
                  ) {
                    return;
                  }
                }
              } catch {
                return;
              }
              try {
                const res = await fetch(
                  `/api/ingredients?since=${encodeURIComponent(syncedAt)}`,
                  { credentials: "same-origin" }
                );
                if (res.ok) {
                  const body = (await res.json()) as {
                    ingredients?: Ingredient[];
                    deletedIds?: string[];
                    serverTime?: string;
                  };
                  set((state) => ({
                    ingredients: mergeIntoCache(
                      state.ingredients,
                      Array.isArray(body.ingredients) ? body.ingredients : [],
                      Array.isArray(body.deletedIds) ? body.deletedIds : []
                    ),
                    syncedAt:
                      typeof body.serverTime === "string" ? body.serverTime : state.syncedAt,
                  }));
                  return;
                }
              } catch {
                return;
              }
            }
            const response = await fetch("/api/ingredients", { credentials: "same-origin" });
            if (response.ok) {
              const body = (await response.json()) as {
                ingredients?: Ingredient[];
                serverTime?: string;
              };
              if (Array.isArray(body.ingredients)) {
                set({
                  ingredients: body.ingredients,
                  syncedAt:
                    typeof body.serverTime === "string"
                      ? body.serverTime
                      : new Date().toISOString(),
                });
              }
            }
          } catch {
            // Offline: keep the localStorage cache as the read source.
          }
        })().finally(() => {
          backgroundRefreshRequest = null;
        });
        await backgroundRefreshRequest;
      },
      loadIngredients: async () => {
        if (useIngredientsStore.getState().loaded) {
          // Cache-then-background: never block a mounted page on revalidation.
          void get().refreshIngredients();
          return;
        }
        if (!loadIngredientsRequest) {
          loadIngredientsRequest = (async () => {
            const cached = get().ingredients;
            if (cached.length > 0) {
              // Paint local instantly; revalidate without blocking callers.
              set({ loaded: true });
              void get().refreshIngredients();
              return;
            }
            // Cold start with empty cache: one blocking sync, outbox in bg.
            const { scheduleOutboxFlush } = await import("@/lib/outbox");
            scheduleOutboxFlush();
            await get().refreshIngredients();
            set({ loaded: true });
          })().finally(() => {
            loadIngredientsRequest = null;
          });
        }
        await loadIngredientsRequest;
      },
    }),
    {
      name: "catering-ingredients",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ingredients: state.ingredients, syncedAt: state.syncedAt }),
      version: 4,
      migrate: (persistedState) => {
        const state = persistedState as {
          ingredients?: Array<Record<string, unknown>> | null;
          syncedAt?: string | null;
        };
        return {
          ...state,
          syncedAt: typeof state.syncedAt === "string" ? state.syncedAt : null,
          ingredients: (state.ingredients ?? []).map((raw) => ({
            ...raw,
            tag: isIngredientTag(raw.tag) ? raw.tag : "grocery",
            openingStock:
              typeof raw.openingStock === "number" ? raw.openingStock : 0,
            lowStockThreshold:
              typeof raw.lowStockThreshold === "number" ? raw.lowStockThreshold : 0,
            packets: typeof raw.packets === "number" ? raw.packets : 0,
          })),
        };
      },
    }
  )
);
