import type { CateringEvent, EventStatus } from "@/store/events";
import { formatINR } from "@/lib/format";
import { eventBalance } from "@/lib/eventFinances";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import {
  buildWhatsAppMessage,
  makeInvoiceNumber,
  normalizeCustomerPhone,
  type PdfLang,
} from "@/lib/pdf";

export type StatusTransition = "confirmed" | "paid" | "completed" | null;

/** Classifies an event status change. `prev: null` = brand-new event. */
export function detectTransition(
  prev: EventStatus | null,
  next: EventStatus
): StatusTransition {
  if (prev === next) return null;
  if (next === "confirmed" || next === "paid" || next === "completed") return next;
  return null;
}

function openWhatsAppChat(phone: string | undefined, message: string): boolean {
  const digits = normalizeCustomerPhone(phone ?? "");
  if (!digits) return false;
  window.open(`https://wa.me/91${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  return true;
}

function docLang(): PdfLang {
  const lang = useSettingsStore.getState().defaultLanguage;
  return lang === "ta" ? "ta" : "en";
}

/** Detailed invoice text for a newly confirmed event. False = no valid number. */
export function openConfirmedInvoice(event: CateringEvent): boolean {
  const subtotal = (event.ingredients ?? []).reduce((sum, line) => sum + line.price, 0);
  const message = buildWhatsAppMessage(event, subtotal, docLang(), "detailed");
  return openWhatsAppChat(event.phone, message);
}

function paymentMessage(event: CateringEvent, lang: PdfLang): string {
  const lines = [
    preferredText(ui.autoMsg.paymentThanks, lang),
    `${event.name}`,
    `${preferredText(ui.events.invoiceNo, lang)}: ${makeInvoiceNumber(event)}`,
    `${preferredText(ui.autoMsg.amountPaid, lang)}: ${formatINR(event.advancePaid ?? 0)}`,
    `${preferredText(ui.events.totalAmount, lang)}: ${formatINR(event.totalAmount ?? 0)}`,
    `${preferredText(ui.events.balance, lang)}: ${formatINR(eventBalance(event))}`,
    `${preferredText(ui.events.thankYou, lang)}`,
  ];
  return lines.join("\n");
}

/** Payment-received text for a newly paid event. False = no valid number. */
export function openPaymentReceived(event: CateringEvent): boolean {
  return openWhatsAppChat(event.phone, paymentMessage(event, docLang()));
}

/** Eve-of-event push title/body in the current UI language. */
export function eveNotificationText(name: string): { title: string; body: string } {
  const lang = useSettingsStore.getState().uiLanguage;
  return {
    title: preferredText(ui.autoRemind.eventTomorrow, lang),
    body: preferredText(ui.autoRemind.eventTomorrowDetail(name), lang),
  };
}

/** Overdue-payment push title/body in the current UI language. */
export function overdueNotificationText(name: string, pending: number): { title: string; body: string } {
  const lang = useSettingsStore.getState().uiLanguage;
  return {
    title: preferredText(ui.autoRemind.paymentOverdue, lang),
    body: preferredText(
      ui.autoRemind.paymentOverdueDetail(name, formatINR(pending)),
      lang
    ),
  };
}
