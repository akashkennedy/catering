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
  addTemplate: (input: FoodTemplateInput) => void;
  updateTemplate: (id: string, input: FoodTemplateInput) => void;
  deleteTemplate: (id: string) => void;
};

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (input) =>
        set((state) => ({
          templates: [...state.templates, { id: crypto.randomUUID(), ...input }],
        })),
      updateTemplate: (id, input) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...input } : template
          ),
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        })),
    }),
    {
      name: "catering-templates",
      storage: createJSONStorage(() => localStorage),
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