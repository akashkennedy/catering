import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TemplateIngredient = {
  ingredientId: string;
  qtyPer100: number;
};

export type TemplateDish = {
  id: string;
  name: string;
  ingredients: TemplateIngredient[];
};

export type FoodTemplate = {
  id: string;
  name: string;
  dishes: TemplateDish[];
};

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
    }
  )
);