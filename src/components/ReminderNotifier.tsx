"use client";

import { useEffect } from "react";

import { formatPhone } from "@/lib/phone";
import { useRemindersStore } from "@/store/reminders";

const CHECK_INTERVAL_MS = 30_000;

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

export function ReminderNotifier() {
  useEffect(() => {
    fireDueReminders();
    const interval = window.setInterval(fireDueReminders, CHECK_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fireDueReminders();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}