import type { CateringEvent } from "@/store/events";
import { todayLocalISO } from "@/lib/date";
import { clientPendingAmount } from "@/lib/eventFinances";

const OPEN_STATUSES = ["enquiry", "confirmed", "preparing"] as const;

function shiftISODate(iso: string, days: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Tomorrow's local date as YYYY-MM-DD. */
export function tomorrowLocalISO(today: string = todayLocalISO()): string {
  return shiftISODate(today, 1) ?? today;
}

/** Events happening tomorrow that still need preparation. */
export function dueEveReminders(
  events: CateringEvent[],
  today: string = todayLocalISO()
): CateringEvent[] {
  const tomorrow = tomorrowLocalISO(today);
  return events.filter(
    (event) =>
      event.date === tomorrow &&
      (OPEN_STATUSES as readonly string[]).includes(event.status)
  );
}

/** Completed events with money still owed, 7+ days after the event day. */
export function duePaymentReminders(
  events: CateringEvent[],
  today: string = todayLocalISO()
): CateringEvent[] {
  return events.filter((event) => {
    if (event.status !== "completed") return false;
    if (clientPendingAmount(event) <= 0) return false;
    const dueFrom = shiftISODate(event.date, 7);
    if (!dueFrom) return false;
    return today >= dueFrom;
  });
}
