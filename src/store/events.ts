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
  purchased: boolean;
};

export type EventEmployeeLine = {
  id: string;
  employeeId: string | null;
  name: string;
  phone: string;
  toPay: number;
  paid: number;
};

export type EventUtensilLine = {
  id: string;
  vendorName: string;
  vendorPhone: string;
  utensilId: string | null;
  utensilName: string;
  qty: number;
  rentalPrice: number;
  dateFrom: string;
  dateTo: string;
  returned: boolean;
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
  totalQuoted: number;
  ingredients: EventIngredientLine[];
  employees: EventEmployeeLine[];
  utensils: EventUtensilLine[];
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
    lines.push({ id: crypto.randomUUID(), ingredientId, qty, price, purchased: false });
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
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as {
          events?: Array<{
            ingredients?: unknown;
            employees?: unknown;
            utensils?: unknown;
            totalQuoted?: unknown;
          }> | null;
        };
        return {
          ...state,
          events: (state.events ?? []).map((event) => ({
            ...event,
            totalQuoted: typeof event.totalQuoted === "number" ? event.totalQuoted : 0,
            ingredients: ((event.ingredients ?? []) as Array<Record<string, unknown>>).map(
              (rawLine) => ({
                ...rawLine,
                purchased:
                  typeof rawLine.purchased === "boolean" ? rawLine.purchased : false,
              })
            ),
            employees: event.employees ?? [],
            utensils: ((event.utensils ?? []) as Array<Record<string, unknown>>).map((rawLine) => {
              const line = { ...rawLine };
              delete line.vendorId;
              return {
                ...line,
                vendorName:
                  typeof line.vendorName === "string" && line.vendorName.trim()
                    ? line.vendorName
                    : "Unknown vendor",
                vendorPhone: typeof line.vendorPhone === "string" ? line.vendorPhone : "",
              };
            }),
          })),
        };
      },
    }
  )
);