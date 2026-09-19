import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TemplateIngredient = {
  ingredientId: string;
  qtyPer100: number;
};

export type TemplateDish = {
  id: string;
  nameEn: string;
  nameTa: string;
  ingredients: TemplateIngredient[];
};

export type FoodTemplate = {
  id: string;
  nameEn: string;
  nameTa: string;
  dishes: TemplateDish[];
};

export function templateDisplayName(
  template: Pick<FoodTemplate, "nameEn" | "nameTa">,
  lang: "en" | "ta"
): string {
  if (lang === "ta") return template.nameTa.trim() || template.nameEn;
  return template.nameEn;
}

export function dishDisplayName(
  dish: Pick<TemplateDish, "nameEn" | "nameTa">,
  lang: "en" | "ta"
): string {
  if (lang === "ta") return dish.nameTa.trim() || dish.nameEn;
  return dish.nameEn;
}

export function templateMatchesQuery(
  template: FoodTemplate,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (template.nameEn.toLowerCase().includes(q)) return true;
  if (template.nameTa.includes(query.trim())) return true;
  return template.dishes.some(
    (dish) =>
      dish.nameEn.toLowerCase().includes(q) ||
      dish.nameTa.includes(query.trim())
  );
}

export type FoodTemplateInput = Omit<FoodTemplate, "id">;

type TemplatesState = {
  templates: FoodTemplate[];
  loaded: boolean;
  addTemplate: (input: FoodTemplateInput) => Promise<void>;
  updateTemplate: (id: string, input: FoodTemplateInput) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  loadTemplates: () => Promise<void>;
};

function newClientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

async function sendJson(path: string, method: "POST" | "PATCH", body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function sendDelete(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: "DELETE", credentials: "same-origin" });
    return response.ok;
  } catch {
    return false;
  }
}

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      templates: [],
      loaded: false,
      addTemplate: async (input) => {
        const template: FoodTemplate = {
          id: newClientId(),
          ...input,
          dishes: input.dishes.map((dish) => ({ ...dish, id: dish.id || newClientId() })),
        };
        set((state) => ({ templates: [...state.templates, template] }));
        const ok = await sendJson("/api/templates", "POST", template);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "POST", path: "/api/templates", body: template });
        }
      },
      updateTemplate: async (id, input) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...input } : template
          ),
        }));
        const ok = await sendJson(`/api/templates/${encodeURIComponent(id)}`, "PATCH", input);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "PATCH", path: `/api/templates/${encodeURIComponent(id)}`, body: input });
        }
      },
      deleteTemplate: async (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }));
        const ok = await sendDelete(`/api/templates/${encodeURIComponent(id)}`);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "DELETE", path: `/api/templates/${encodeURIComponent(id)}` });
        }
      },
      loadTemplates: async () => {
        const { flushOutbox } = await import("@/lib/outbox");
        await flushOutbox();
        try {
          const response = await fetch("/api/templates", { credentials: "same-origin" });
          if (!response.ok) return;
          const body = (await response.json()) as { templates?: FoodTemplate[] };
          if (Array.isArray(body.templates)) {
            set({ templates: body.templates, loaded: true });
          }
        } catch {
          // Offline: keep the localStorage cache as the read source.
        }
      },
    }),
    {
      name: "catering-templates",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ templates: state.templates }),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as {
          templates?: Array<Record<string, unknown>> | null;
        };
        return {
          ...state,
          templates: (state.templates ?? []).map((raw) => {
            const template = { ...raw } as Record<string, unknown> & {
              dishes?: Array<Record<string, unknown>>;
            };
            const legacyName =
              typeof template.name === "string" ? template.name : "";
            const nameEn =
              typeof template.nameEn === "string" && template.nameEn.trim()
                ? (template.nameEn as string)
                : legacyName;
            const nameTa =
              typeof template.nameTa === "string" ? (template.nameTa as string) : "";
            const dishes = (template.dishes ?? []).map((rawDish) => {
              const dish = { ...rawDish };
              const legacyDishName =
                typeof dish.name === "string" ? (dish.name as string) : "";
              const dishNameEn =
                typeof dish.nameEn === "string" && (dish.nameEn as string).trim()
                  ? (dish.nameEn as string)
                  : legacyDishName;
              const dishNameTa =
                typeof dish.nameTa === "string" ? (dish.nameTa as string) : "";
              delete dish.name;
              return { ...dish, nameEn: dishNameEn, nameTa: dishNameTa };
            });
            delete template.name;
            return { ...template, nameEn, nameTa, dishes };
          }),
        };
      },
    }
  )
);