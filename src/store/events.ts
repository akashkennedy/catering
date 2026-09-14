import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Ingredient } from "./ingredients";
import type { FoodTemplate } from "./templates";

export type EventStatus = "planned" | "confirmed" | "completed" | "cancelled";

export type ClientPaymentStatus = "pending" | "partial" | "paid";

export type EventIngredientLine = {
  id: string;
  ingredientId: string;
  qty: number;
  price: number;
};

export type CateringEvent = {
  id: string;
  name: string;
  phone: string;
  location: string;
  headcount: number;
  date: string;
  status: EventStatus;
  templateId: string | null;
  clientPaymentStatus: ClientPaymentStatus;
  ingredients: EventIngredientLine[];
};

export type CateringEventInput = Omit<CateringEvent, "id">;

export function buildScaledIngredients(
  template: FoodTemplate | null,
  ingredients: Ingredient[],
  headcount: number
): EventIngredientLine[] {
  if (!template) return [];

  const globalPrices = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient.globalPrice]));
  const qtyPer100ByIngredient = new Map<string, number>();
  for (const dish of template.dishes) {
    for (const templateIngredient of dish.ingredients) {
      qtyPer100ByIngredient.set(
        templateIngredient.ingredientId,
        (qtyPer100ByIngredient.get(templateIngredient.ingredientId) ?? 0) +
          templateIngredient.qtyPer100
      );
    }
  }

  const factor = headcount / 100;
  const lines: EventIngredientLine[] = [];
  for (const [ingredientId, qtyPer100] of qtyPer100ByIngredient) {
    const qty = Math.round(qtyPer100 * factor * 100) / 100;
    const price = Math.round(qty * (globalPrices.get(ingredientId) ?? 0) * 100) / 100;
    lines.push({ id: crypto.randomUUID(), ingredientId, qty, price });
  }
  return lines;
}

type EventsState = {
  events: CateringEvent[];
  addEvent: (input: CateringEventInput) => void;
  updateEvent: (id: string, input: CateringEventInput) => void;
  deleteEvent: (id: string) => void;
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (input) =>
        set((state) => ({
          events: [...state.events, { id: crypto.randomUUID(), ...input }],
        })),
      updateEvent: (id, input) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...input } : event
          ),
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        })),
    }),
    {
      name: "catering-events",
      storage: createJSONStorage(() => localStorage),
    }
  )
);