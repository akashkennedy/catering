import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { fetchJson, newClientId, syncOrQueue } from "@/lib/storeSync";

export type Reminder = {
  id: string;
  customerName: string | null;
  phone: string;
  note: string | null;
  remindAt: string;
  eventId: string | null;
  dismissed: boolean;
  notified: boolean;
};

export type ReminderInput = Omit<Reminder, "id">;

type RemindersState = {
  reminders: Reminder[];
  loaded: boolean;
  addReminder: (input: ReminderInput) => string;
  dismissReminder: (id: string) => void;
  dismissAll: () => void;
  markNotified: (id: string) => void;
  removeReminder: (id: string) => void;
  loadReminders: () => Promise<void>;
};

// Shared in-flight load so simultaneous mounts fire a single request.
let loadRemindersRequest: Promise<void> | null = null;

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set) => ({
      reminders: [],
      loaded: false,
      addReminder: (input) => {
        const id = newClientId();
        set((state) => ({
          reminders: [...state.reminders, { id, ...input }],
        }));
        void syncOrQueue("POST", "/api/reminders", { id, ...input });
        return id;
      },
      dismissReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, dismissed: true } : reminder
          ),
        }));
        void syncOrQueue("PATCH", `/api/reminders/${encodeURIComponent(id)}`, {
          dismissed: true,
        });
      },
      dismissAll: () => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.dismissed ? reminder : { ...reminder, dismissed: true }
          ),
        }));
        void syncOrQueue("POST", "/api/reminders/dismiss-all", {});
      },
      markNotified: (id) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, notified: true } : reminder
          ),
        }));
        void syncOrQueue("PATCH", `/api/reminders/${encodeURIComponent(id)}`, {
          notified: true,
        });
      },
      removeReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        }));
        void syncOrQueue("DELETE", `/api/reminders/${encodeURIComponent(id)}`);
      },
      loadReminders: async () => {
        if (useRemindersStore.getState().loaded) return;
        if (!loadRemindersRequest) {
          loadRemindersRequest = (async () => {
            const { flushOutbox } = await import("@/lib/outbox");
            await flushOutbox();
            const body = await fetchJson<{ reminders?: Reminder[] }>("/api/reminders");
            if (body && Array.isArray(body.reminders)) {
              set({ reminders: body.reminders, loaded: true });
            }
          })().finally(() => {
            loadRemindersRequest = null;
          });
        }
        await loadRemindersRequest;
      },
    }),
    {
      name: "catering-reminders",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ reminders: state.reminders }),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as {
          reminders?: Array<{
            customerName?: unknown;
            phone?: unknown;
            note?: unknown;
            remindAt?: unknown;
            eventId?: unknown;
            dismissed?: unknown;
            notified?: unknown;
          }> | null;
        };
        return {
          ...state,
          reminders: (state.reminders ?? []).map((reminder) => ({
            ...reminder,
            customerName:
              typeof reminder.customerName === "string" ? reminder.customerName : null,
            phone: typeof reminder.phone === "string" ? reminder.phone : "",
            note: typeof reminder.note === "string" ? reminder.note : null,
            remindAt:
              typeof reminder.remindAt === "string" ? reminder.remindAt : new Date().toISOString(),
            eventId: typeof reminder.eventId === "string" ? reminder.eventId : null,
            dismissed:
              typeof reminder.dismissed === "boolean" ? reminder.dismissed : false,
            notified:
              typeof reminder.notified === "boolean" ? reminder.notified : false,
          })),
        };
      },
    }
  )
);
