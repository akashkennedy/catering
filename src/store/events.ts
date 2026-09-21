import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Ingredient } from "./ingredients";
import type { FoodTemplate } from "./templates";

export const EVENT_STATUS_PIPELINE = [
  "enquiry",
  "confirmed",
  "preparing",
  "completed",
  "paid",
] as const;

export type EventStatus = (typeof EVENT_STATUS_PIPELINE)[number];

export type EventIngredientLine = {
  id: string;
  ingredientId: string;
  qty: number;
  price: number;
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

/**
 * One meal (template) within an event — the "course meals" model ported
 * from the old site's Plan-a-Meal (`mealGroups[]`).
 * `selectedDishIds` lists the dishes the user picked one by one — an empty
 * array means no dish is included. Nothing is ever preselected.
 */
export type EventMealGroup = {
  id: string;
  templateId: string | null;
  headcount: number;
  selectedDishIds: string[];
};

export type CateringEvent = {
  id: string;
  name: string;
  phone: string;
  venue: string;
  address: string;
  functionType: string;
  headcount: number;
  date: string;
  status: EventStatus;
  templateId: string | null;
  mealGroups: EventMealGroup[];
  ratePerPerson: number;
  totalAmount: number;
  totalAmountOverridden: boolean;
  advancePaid: number;
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
    lines.push({ id: crypto.randomUUID(), ingredientId, qty, price });
  }
  return lines;
}

function newGroupId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `g-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export function normalizeMealGroups(raw: unknown, fallbackHeadcount: number): EventMealGroup[] {
  if (!Array.isArray(raw)) return [];
  const groups: EventMealGroup[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const headcount =
      typeof record.headcount === "number" && Number.isFinite(record.headcount) && record.headcount > 0
        ? Math.floor(record.headcount)
        : fallbackHeadcount > 0
          ? fallbackHeadcount
          : 100;
    groups.push({
      id: typeof record.id === "string" && record.id ? record.id : newGroupId(),
      templateId: typeof record.templateId === "string" ? record.templateId : null,
      headcount,
      selectedDishIds: Array.isArray(record.selectedDishIds)
        ? (record.selectedDishIds as unknown[]).filter(
            (id): id is string => typeof id === "string" && id.length > 0
          )
        : [],
    });
  }
  return groups;
}

export function resolveGroupDishes(
  template: FoodTemplate | null,
  selectedDishIds: string[]
): FoodTemplate["dishes"] {
  if (!template) return [];
  if (selectedDishIds.length === 0) return [];
  const selected = new Set(selectedDishIds);
  return template.dishes.filter((dish) => selected.has(dish.id));
}

/**
 * Group-aware scaling: each meal group scales its (selected) dishes by its
 * own headcount; duplicates across groups/courses are summed — mirroring the
 * old site's Plan-a-Meal totals.
 */
export function buildScaledIngredientsForGroups(
  groups: EventMealGroup[],
  templates: FoodTemplate[],
  ingredients: Ingredient[]
): EventIngredientLine[] {
  const globalPrices = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient.globalPrice]));
  const templatesById = new Map(templates.map((template) => [template.id, template]));
  const qtyPer100ByIngredient = new Map<string, number>();

  for (const group of groups) {
    if (!group.templateId) continue;
    const template = templatesById.get(group.templateId);
    if (!template) continue;
    const dishes = resolveGroupDishes(template, group.selectedDishIds);
    const factor = (group.headcount > 0 ? group.headcount : 0) / 100;
    if (factor <= 0) continue;
    for (const dish of dishes) {
      for (const templateIngredient of dish.ingredients) {
        qtyPer100ByIngredient.set(
          templateIngredient.ingredientId,
          (qtyPer100ByIngredient.get(templateIngredient.ingredientId) ?? 0) +
            templateIngredient.qtyPer100 * factor
        );
      }
    }
  }

  const lines: EventIngredientLine[] = [];
  for (const [ingredientId, qty] of qtyPer100ByIngredient) {
    const roundedQty = Math.round(qty * 100) / 100;
    const price = Math.round(roundedQty * (globalPrices.get(ingredientId) ?? 0) * 100) / 100;
    lines.push({ id: newGroupId(), ingredientId, qty: roundedQty, price });
  }
  return lines;
}

type EventsState = {
  events: CateringEvent[];
  loaded: boolean;
  addEvent: (input: CateringEventInput) => Promise<void>;
  updateEvent: (id: string, input: CateringEventInput) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  loadEvents: () => Promise<void>;
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

// Shared in-flight load so simultaneous mounts fire a single request.
let loadEventsRequest: Promise<void> | null = null;

export const useEventsStore = create<EventsState>()(
  persist(
    /** Builds the persisted event store and its synchronized actions. */
    (set) => ({
      events: [],
      loaded: false,
      addEvent: async (input) => {
        const event: CateringEvent = { id: newClientId(), ...input };
        set((state) => ({ events: [...state.events, event] }));
        const ok = await sendJson("/api/events", "POST", event);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "POST", path: "/api/events", body: event });
        }
      },
      updateEvent: async (id, input) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...input } : event
          ),
        }));
        const ok = await sendJson(`/api/events/${encodeURIComponent(id)}`, "PATCH", input);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "PATCH", path: `/api/events/${encodeURIComponent(id)}`, body: input });
        }
      },
      deleteEvent: async (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
        const ok = await sendDelete(`/api/events/${encodeURIComponent(id)}`);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "DELETE", path: `/api/events/${encodeURIComponent(id)}` });
        }
      },
      loadEvents: async () => {
        if (useEventsStore.getState().loaded) return;
        if (!loadEventsRequest) {
          loadEventsRequest = (async () => {
            const { flushOutbox } = await import("@/lib/outbox");
            await flushOutbox();
            try {
              const response = await fetch("/api/events", { credentials: "same-origin" });
              if (!response.ok) return;
              const body = (await response.json()) as { events?: CateringEvent[] };
              if (Array.isArray(body.events)) {
                set({ events: body.events, loaded: true });
              }
            } catch {
              // Offline: keep the localStorage cache as the read source.
            }
          })().finally(() => {
            loadEventsRequest = null;
          });
        }
        await loadEventsRequest;
      },
    }),
    {
      name: "catering-events",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ events: state.events }),
      version: 6,
      migrate: (persistedState) => {
        const state = persistedState as {
          events?: Array<Record<string, unknown>> | null;
        };
        return {
          ...state,
          events: (state.events ?? []).map((raw) => {
            const event = { ...raw };

            const rawStatus = String(event.status ?? "");
            let status: EventStatus = "enquiry";
            if (EVENT_STATUS_PIPELINE.includes(rawStatus as EventStatus)) {
              status = rawStatus as EventStatus;
            } else if (rawStatus === "planned") {
              status = "enquiry";
            } else if (rawStatus === "completed") {
              status = "completed";
            } else if (rawStatus === "cancelled") {
              status = "completed";
            }
            if (event.clientPaymentStatus === "paid") status = "paid";

            const headcount =
              typeof event.headcount === "number" ? event.headcount : 0;
            const ratePerPerson =
              typeof event.ratePerPerson === "number" ? event.ratePerPerson : 0;
            const rawTotalAmount = event.totalAmount;
            const rawTotalQuoted = event.totalQuoted;
            let totalAmount: number;
            let totalAmountOverridden: boolean;
            if (typeof rawTotalAmount === "number") {
              totalAmount = rawTotalAmount;
              totalAmountOverridden =
                typeof event.totalAmountOverridden === "boolean"
                  ? event.totalAmountOverridden
                  : false;
            } else if (typeof rawTotalQuoted === "number") {
              totalAmount = rawTotalQuoted;
              totalAmountOverridden = true;
            } else {
              totalAmount = Math.round(ratePerPerson * headcount * 100) / 100;
              totalAmountOverridden = false;
            }

            const legacyLocation =
              typeof event.location === "string" ? event.location : "";
            const venue =
              typeof event.venue === "string" && event.venue.trim()
                ? event.venue
                : legacyLocation;

            delete event.status;
            delete event.clientPaymentStatus;
            delete event.totalQuoted;
            delete event.location;
            delete event.totalAmount;
            delete event.totalAmountOverridden;

            const mealGroups = normalizeMealGroups(event.mealGroups, headcount);
            if (
              mealGroups.length === 0 &&
              typeof event.templateId === "string" &&
              event.templateId
            ) {
              mealGroups.push({
                id: newGroupId(),
                templateId: event.templateId,
                headcount,
                selectedDishIds: [],
              });
            }

            return {
              ...event,
              status,
              venue,
              address: typeof event.address === "string" ? event.address : "",
              functionType:
                typeof event.functionType === "string" ? event.functionType : "",
              mealGroups,
              ratePerPerson,
              totalAmount,
              totalAmountOverridden,
              advancePaid: typeof event.advancePaid === "number" ? event.advancePaid : 0,
              ingredients: ((event.ingredients ?? []) as Array<Record<string, unknown>>).map(
                (rawLine) => {
                  const line = { ...rawLine };
                  delete line.purchased;
                  return line;
                }
              ),
              employees: event.employees ?? [],
              utensils: ((event.utensils ?? []) as Array<Record<string, unknown>>).map(
                (rawLine) => {
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
                }
              ),
            };
          }),
        };
      },
    }
  )
);
