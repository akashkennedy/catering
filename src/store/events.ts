import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type EventStatus = "planned" | "confirmed" | "completed" | "cancelled";

export type ClientPaymentStatus = "pending" | "partial" | "paid";

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
};

export type CateringEventInput = Omit<CateringEvent, "id">;

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