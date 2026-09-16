import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  addReminder: (input: ReminderInput) => string;
  dismissReminder: (id: string) => void;
  markNotified: (id: string) => void;
  removeReminder: (id: string) => void;
};

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set) => ({
      reminders: [],
      addReminder: (input) => {
        const id = crypto.randomUUID();
        set((state) => ({
          reminders: [...state.reminders, { id, ...input }],
        }));
        return id;
      },
      dismissReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, dismissed: true } : reminder
          ),
        })),
      markNotified: (id) =>
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, notified: true } : reminder
          ),
        })),
      removeReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        })),
    }),
    {
      name: "catering-reminders",
      storage: createJSONStorage(() => localStorage),
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
