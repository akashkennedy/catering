"use client";

import { useEffect } from "react";

import { formatPhone } from "@/lib/phone";
import { dueEveReminders, duePaymentReminders } from "@/lib/autoReminders";
import { clientPendingAmount } from "@/lib/eventFinances";
import { eveNotificationText, overdueNotificationText } from "@/lib/statusTransitions";
import { useEventsStore } from "@/store/events";
import { useRemindersStore } from "@/store/reminders";

const CHECK_INTERVAL_MS = 30_000;
const AUTO_NOTIFIED_KEY = "catering-auto-notified";

function readFiredKeys(): Set<string> {
  try {
    const raw = window.localStorage.getItem(AUTO_NOTIFIED_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((k): k is string => typeof k === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function writeFiredKeys(keys: Set<string>): void {
  try {
    window.localStorage.setItem(AUTO_NOTIFIED_KEY, JSON.stringify([...keys]));
  } catch {
    // Ignore storage errors; worst case a notification repeats.
  }
}

function fireDueReminders() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const store = useRemindersStore.getState();
  const now = Date.now();

  for (const reminder of store.reminders) {
    if (reminder.dismissed || reminder.notified) continue;
    if (new Date(reminder.remindAt).getTime() > now) continue;

    const body = reminder.note?.trim() || "Time to follow up.";
    new Notification(`Reminder · ${formatPhone(reminder.phone)}`, { body });
    store.markNotified(reminder.id);
  }
}

/** One-shot browser pushes for derived event reminders (eve + overdue).
 *  Fired keys persist in localStorage so reloads don't re-push. */
function fireDueAutoReminders() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const events = useEventsStore.getState().events;
  const fired = readFiredKeys();
  let changed = false;

  const push = (key: string, title: string, body: string) => {
    if (fired.has(key)) return;
    new Notification(title, { body, tag: key });
    fired.add(key);
    changed = true;
  };

  for (const event of dueEveReminders(events)) {
    const text = eveNotificationText(event.name);
    push(`auto:eve:${event.id}`, text.title, text.body);
  }

  for (const event of duePaymentReminders(events)) {
    const text = overdueNotificationText(event.name, clientPendingAmount(event));
    push(`auto:overdue:${event.id}`, text.title, text.body);
  }

  if (changed) writeFiredKeys(fired);
}

export function ReminderNotifier() {
  useEffect(() => {
    void useEventsStore.getState().loadEvents();
    fireDueReminders();
    fireDueAutoReminders();
    const interval = window.setInterval(() => {
      fireDueReminders();
      fireDueAutoReminders();
    }, CHECK_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fireDueReminders();
        fireDueAutoReminders();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}