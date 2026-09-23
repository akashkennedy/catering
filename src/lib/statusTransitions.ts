import type { CateringEvent, EventStatus } from "@/store/events";
import { formatINR } from "@/lib/format";
import { formatIndianDate } from "@/lib/date";
import { eventBalance } from "@/lib/eventFinances";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore, type AlertKey } from "@/store/settings";
import {
  useTemplatesStore,
  templateDisplayName,
  dishDisplayName,
} from "@/store/templates";
import {
  buildWhatsAppMessage,
  makeInvoiceNumber,
  normalizeCustomerPhone,
  type PdfLang,
} from "@/lib/pdf";

export type StatusTransition = "enquiry" | "confirmed" | "paid" | "completed" | null;

/** Classifies an event status change. `prev: null` = brand-new event. */
export function detectTransition(
  prev: EventStatus | null,
  next: EventStatus
): StatusTransition {
  if (prev === next) return null;
  if (
    next === "enquiry" ||
    next === "confirmed" ||
    next === "paid" ||
    next === "completed"
  )
    return next;
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

function isAlertEnabled(key: AlertKey): boolean {
  return useSettingsStore.getState().alerts[key] !== false;
}

/** Menu list text for a newly enquired event. False = disabled or no valid number. */
export function openEnquiryMenus(event: CateringEvent): boolean {
  if (!isAlertEnabled("enquiryMenus")) return false;
  return openWhatsAppChat(event.phone, enquiryMenusMessage(event, docLang()));
}

function enquiryMenusMessage(event: CateringEvent, lang: PdfLang): string {
  const templates = useTemplatesStore.getState().templates;
  const lines = [
    "Mampalli Cloud Kitchen and Catering",
    preferredText(ui.autoMsg.enquiryGreeting, lang),
    `${event.name}`,
    `${preferredText(ui.common.date, lang)}: ${event.date ? formatIndianDate(event.date) : "—"}`,
    `${preferredText(ui.events.totalHeadcount, lang)}: ${event.headcount}`,
    preferredText(ui.autoMsg.enquiryMenusTitle, lang),
  ];
  const groups = event.mealGroups ?? [];
  if (groups.length > 0) {
    groups.forEach((group, index) => {
      const template = templates.find((item) => item.id === group.templateId) ?? null;
      const templateName = template ? templateDisplayName(template, lang) : "—";
      lines.push(`${preferredText(ui.events.mealNumber(index + 1), lang)}: ${templateName}`);
      const dishes = (template?.dishes ?? []).filter((dish) =>
        group.selectedDishIds.includes(dish.id)
      );
      if (dishes.length === 0) {
        lines.push(`  ${preferredText(ui.autoMsg.enquiryNoDishes, lang)}`);
      } else {
        for (const dish of dishes) {
          lines.push(`  • ${dishDisplayName(dish, lang)}`);
        }
      }
    });
  } else if (event.templateId) {
    const template = templates.find((item) => item.id === event.templateId) ?? null;
    if (template) {
      lines.push(`${templateDisplayName(template, lang)}`);
      for (const dish of template.dishes) {
        lines.push(`  • ${dishDisplayName(dish, lang)}`);
      }
    }
  }
  lines.push(preferredText(ui.events.thankYou, lang));
  return lines.join("\n");
}

/** Detailed invoice text for a newly confirmed event. False = disabled or no valid number. */
export function openConfirmedInvoice(event: CateringEvent): boolean {
  if (!isAlertEnabled("confirmInvoice")) return false;
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

/** Payment-received text for a newly paid event. False = disabled or no valid number. */
export function openPaymentReceived(event: CateringEvent): boolean {
  if (!isAlertEnabled("paymentReceived")) return false;
  return openWhatsAppChat(event.phone, paymentMessage(event, docLang()));
}

function feedbackRequestMessage(event: CateringEvent, lang: PdfLang): string {
  const lines = [
    preferredText(ui.autoMsg.feedbackThanks, lang),
    `${event.name}`,
    preferredText(ui.autoMsg.feedbackRequest, lang),
  ];
  return lines.join("\n");
}

/** Feedback-request text for a newly completed event. False = disabled or no valid number. */
export function openFeedbackRequest(event: CateringEvent): boolean {
  if (!isAlertEnabled("feedbackRequest")) return false;
  return openWhatsAppChat(event.phone, feedbackRequestMessage(event, docLang()));
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
