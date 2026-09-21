import React from "react";
import { pdf, Font, Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { CateringEvent, EventIngredientLine } from "@/store/events";
import type { Ingredient } from "@/store/ingredients";
import { formatINR } from "@/lib/format";
import { normalizeUnit } from "@/lib/units";
import { formatIndianDate } from "@/lib/date";
import { formatPhone } from "@/lib/phone";
import { eventBalance } from "@/lib/eventFinances";
import { ui, preferredText } from "@/lib/i18n";
import { INGREDIENT_TAGS, type IngredientTag } from "@/lib/ingredientTags";
import { normalizeCustomerPhone } from "@/lib/phone";

// Re-exported so existing `@/lib/pdf` importers keep working; the
// implementation lives in the lightweight phone utility.
export { normalizeCustomerPhone };

const TAMIL_FAMILY = "NotoSansTamil";

export type PdfLang = "en" | "ta";

const BRAND_NAME = "Mampalli Cloud Kitchen and Catering";
const BRAND_ADDRESS_LINE1 = "Mampalli Vilai,";
const BRAND_ADDRESS_LINE2 = "Thiruvarampu, Kanyakumari Dist, Tamil Nadu";
const BRAND_PHONE = "9025350666";

/**
 * Unique invoice number from the event date + id slice, e.g. 20261010-A3F9C2.
 * Deterministic from stored data so reprints keep the same number.
 */
export function makeInvoiceNumber(event: { date: string; id: string }): string {
  const day = (event.date ?? "").replace(/\D/g, "").slice(0, 8) || "NODATE";
  const short =
    (event.id ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "XXXXXX";
  return `${day}-${short}`;
}

let fontRegistered = false;

function ensureFont(): void {
  if (fontRegistered) return;
  Font.register({
    family: TAMIL_FAMILY,
    src: "/fonts/NotoSansTamil-Regular.ttf",
  });
  fontRegistered = true;
}

function tagHeading(tag: IngredientTag, lang: PdfLang): string {
  const label = ui.ingredients.tags[tag] ?? ui.ingredients.tags.grocery;
  return preferredText(label, lang);
}

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: TAMIL_FAMILY },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  detail: { fontSize: 10, marginBottom: 3, textAlign: "center" },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginTop: 14, marginBottom: 6 },
  table: { width: "100%", marginBottom: 10 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ccc" },
  tableHeader: { backgroundColor: "#2980b9", padding: 6 },
  tableHeaderText: { color: "#fff", fontWeight: "bold", fontSize: 9 },
  tableCell: { padding: 6, fontSize: 9, flex: 1 },
  tableFooter: { backgroundColor: "#f0f0f0", padding: 6 },
  tableFooterText: { fontWeight: "bold", fontSize: 9, flex: 1 },
  rowEven: { backgroundColor: "#f9f9f9" },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 },
  brandTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4, textAlign: "center" },
  brandAddress: { fontSize: 10, fontWeight: "bold", marginBottom: 2, textAlign: "center" },
  brandPhone: { fontSize: 10, fontWeight: "bold", marginBottom: 2, textAlign: "center" },
  brandHeadcount: { fontSize: 11, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  brandLogo: { width: 36, height: 35 },
  thankYou: { fontSize: 13, fontWeight: "bold", textAlign: "center", marginTop: 18 },
});

export type { PrintLine } from "./printLines";
import { tagOfLine, type PrintLine } from "./printLines";

type GroupedLine = PrintLine & { serial: number };

type GroupedLines = { tag: IngredientTag; lines: GroupedLine[] }[];

function groupLines(
  lines: EventIngredientLine[],
  ingredients: Ingredient[],
  selectedTags: IngredientTag[]
): GroupedLines {
  const allowed = new Set(selectedTags);
  const buckets = new Map<IngredientTag, PrintLine[]>();
  for (const line of lines) {
    const tag = tagOfLine(line, ingredients);
    if (!allowed.has(tag)) continue;
    const bucket = buckets.get(tag) ?? [];
    const byId = ingredients.find((item) => item.id === line.ingredientId);
    bucket.push({
      key: line.id,
      nameEn: byId?.name || "—",
      nameTa: byId?.tamilName || byId?.name || "—",
      qty: line.qty,
      unit: normalizeUnit(byId?.unit),
      price: line.price,
    });
    buckets.set(tag, bucket);
  }
  let serial = 0;
  return INGREDIENT_TAGS.filter((tag) => (buckets.get(tag)?.length ?? 0) > 0).map(
    (tag) => {
      const bucket = buckets.get(tag) ?? [];
      bucket.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
      return {
        tag,
        lines: bucket.map((line) => {
          serial += 1;
          return { ...line, serial };
        }),
      };
    }
  );
}

/**
 * Brand heading — first page only. Logo aligned with the heading on one
 * row, then address (two lines), phone and total headcount — all centered
 * and bold. Renders nothing on other pages so no space is reserved there.
 */
function BrandHeader({ event, lang }: { event: CateringEvent; lang: PdfLang }) {
  const phoneLabel = `Phone: ${formatPhone(BRAND_PHONE)}`;
  const headcountLabel = `${preferredText(ui.events.totalHeadcount, lang)}: ${event.headcount}`;
  return (
    <>
      <View
        render={({ pageNumber }: { pageNumber: number }) =>
          pageNumber === 1 ? (
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <View style={styles.brandRow}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- PDF output, not HTML */}
                <Image src="/logo.png" style={styles.brandLogo} />
                <Text style={styles.brandTitle}>{BRAND_NAME}</Text>
              </View>
              <Text style={styles.brandAddress}>{BRAND_ADDRESS_LINE1}</Text>
              <Text style={styles.brandAddress}>{BRAND_ADDRESS_LINE2}</Text>
              <Text style={styles.brandPhone}>{phoneLabel}</Text>
              <Text style={styles.brandHeadcount}>{headcountLabel}</Text>
            </View>
          ) : null
        }
      />
      <Text
        style={{ fontSize: 1, marginBottom: 4 }}
        render={({ pageNumber }: { pageNumber: number }) => (pageNumber === 1 ? " " : "")}
      />
    </>
  );
}

/**
 * Thank-you footer — bottom of the last page only. `fixed` pins it to the
 * page bottom; the render condition skips every other page (including all
 * middle pages of multi-page invoices).
 */
function ThankYouFooter({ lang }: { lang: PdfLang }) {
  const label = preferredText(ui.events.thankYou, lang);
  return (
    <Text
      fixed
      style={[
        styles.thankYou,
        { position: "absolute", bottom: 30, left: 30, right: 30 },
      ]}
      render={({ pageNumber, totalPages }) =>
        pageNumber === totalPages ? label : ""
      }
    />
  );
}

/** Invoice number only, centered beneath the branded PDF header. */
function EventHeader({ event, lang }: { event: CateringEvent; lang: PdfLang }) {
  return (
    <View>
      <Text style={styles.title}>
        {preferredText(ui.events.invoiceNo, lang)}: {makeInvoiceNumber(event)}
      </Text>
    </View>
  );
}

function GroupedTable({
  groups,
  withPrice,
  event,
  subtotal,
  lang,
}: {
  groups: GroupedLines;
  withPrice: boolean;
  event: CateringEvent;
  subtotal: number;
  lang: PdfLang;
}) {
  const nameHeader = lang === "ta" ? "பொருள்" : "Ingredient";
  const qtyHeader = preferredText(ui.common.qty, lang);
  const unitHeader = preferredText(ui.common.unit, lang);
  const priceHeader = lang === "ta" ? "விலை ₹" : "Price ₹";
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>#</Text>
        <Text style={[styles.tableHeaderText, { flex: 4 }]}>{nameHeader}</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>{qtyHeader}</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>{unitHeader}</Text>
        {withPrice && (
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>{priceHeader}</Text>
        )}
      </View>
      {groups.map((group) => (
        <View key={group.tag}>
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableFooterText, { flex: 5 }]}>
              {tagHeading(group.tag, lang)}
            </Text>
            {withPrice && <Text style={[styles.tableFooterText, { flex: 1 }]} />}
          </View>
          {group.lines.map((line, idx) => {
            const stripe = idx % 2 === 1 ? styles.rowEven : undefined;
            return (
              <View key={line.key} style={[styles.tableRow, stripe]}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{line.serial}</Text>
                <Text style={[styles.tableCell, { flex: 4 }]}>
                  {lang === "ta" ? line.nameTa : line.nameEn}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{String(line.qty)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{line.unit || "—"}</Text>
                {withPrice && (
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                    {formatINR(line.price)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
      {withPrice && (
        <>
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableFooterText, { flex: 0.5 }]} />
            <Text style={[styles.tableFooterText, { flex: 4 }]}>
              {preferredText(ui.events.runningTotal, lang)}
            </Text>
            <Text style={[styles.tableFooterText, { flex: 1 }]} />
            <Text style={[styles.tableFooterText, { flex: 1 }]} />
            <Text style={[styles.tableFooterText, { flex: 1, textAlign: "right" }]}>
              {formatINR(subtotal)}
            </Text>
          </View>
          <View style={[styles.tableRow]}>
            <Text style={[styles.tableCell, { flex: 4.5 }]}>
              {preferredText(ui.events.totalAmount, lang)}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>
              {formatINR(event.totalAmount ?? 0)}
            </Text>
          </View>
          <View style={[styles.tableRow]}>
            <Text style={[styles.tableCell, { flex: 4.5 }]}>
              {preferredText(ui.events.advancePaid, lang)}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>
              {formatINR(event.advancePaid ?? 0)}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableFooterText, { flex: 4.5 }]}>
              {preferredText(ui.events.balance, lang)}
            </Text>
            <Text style={[styles.tableFooterText, { flex: 1.5, textAlign: "right" }]}>
              {formatINR(eventBalance(event))}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

/** Builds a branded event PDF document from printable ingredient lines. */
export function buildDocument(
  event: CateringEvent,
  ingredients: Ingredient[],
  lines: EventIngredientLine[],
  selectedTags: IngredientTag[],
  withPrice: boolean,
  lang: PdfLang = "en"
): React.ReactElement {
  ensureFont();
  const groups = groupLines(lines, ingredients, selectedTags);
  const subtotal = lines
    .filter((line) => selectedTags.includes(tagOfLine(line, ingredients)))
    .reduce((sum, line) => sum + line.price, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <BrandHeader event={event} lang={lang} />
        <EventHeader event={event} lang={lang} />
        <Text style={styles.sectionTitle}>
          {preferredText(ui.templates.ingredients, lang)}
        </Text>
        <GroupedTable groups={groups} withPrice={withPrice} event={event} subtotal={subtotal} lang={lang} />
        <ThankYouFooter lang={lang} />
      </Page>
    </Document>
  );
}

async function downloadDocument(element: React.ReactElement, filename: string): Promise<void> {
  const blob = await pdf(element as React.ReactElement<DocumentProps>).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fileStem(eventName: string): string {
  const stem = eventName.replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "_").slice(0, 60);
  return stem || "event";
}

/** WhatsApp invoice summary in the requested language. */
export function buildWhatsAppMessage(
  event: CateringEvent,
  subtotal: number,
  lang: PdfLang,
  kind: "buy" | "detailed"
): string {
  const lines = [
    BRAND_NAME,
    `${preferredText(ui.events.invoiceNo, lang)}: ${makeInvoiceNumber(event)}`,
    `${event.name}`,
    `${preferredText(ui.common.date, lang)}: ${event.date ? formatIndianDate(event.date) : "—"}`,
    `${preferredText(ui.events.totalHeadcount, lang)}: ${event.headcount}`,
  ];
  if (kind === "detailed") {
    lines.push(
      `${preferredText(ui.events.runningTotal, lang)}: ${formatINR(subtotal)}`,
      `${preferredText(ui.events.totalAmount, lang)}: ${formatINR(event.totalAmount ?? 0)}`,
      `${preferredText(ui.events.advancePaid, lang)}: ${formatINR(event.advancePaid ?? 0)}`,
      `${preferredText(ui.events.balance, lang)}: ${formatINR(eventBalance(event))}`,
      preferredText(ui.events.thankYou, lang)
    );
  } else {
    lines.push(preferredText(ui.events.thankYou, lang));
  }
  return lines.join("\n");
}

/** wa.me URL for the event customer, or null when the phone is invalid. */
export function buildCustomerWhatsAppUrl(
  event: CateringEvent,
  subtotal: number,
  lang: PdfLang,
  kind: "buy" | "detailed"
): string | null {
  const digits = normalizeCustomerPhone(event.phone ?? "");
  if (!digits) return null;
  const message = buildWhatsAppMessage(event, subtotal, lang, kind);
  return `https://wa.me/91${digits}?text=${encodeURIComponent(message)}`;
}

/** Buy-list sheet: ingredient names + quantities, grouped by category, no prices. */
export async function generateBuyListPdf(
  event: CateringEvent,
  ingredients: Ingredient[],
  lines: EventIngredientLine[],
  selectedTags: IngredientTag[],
  lang: PdfLang = "en"
): Promise<void> {
  const element = buildDocument(event, ingredients, lines, selectedTags, false, lang);
  await downloadDocument(element, `${makeInvoiceNumber(event)}_${fileStem(event.name)}_buy-list_${lang}.pdf`);
}

/** Detailed invoice: names + quantities + prices with totals, grouped by category. */
export async function generateDetailedPdf(
  event: CateringEvent,
  ingredients: Ingredient[],
  lines: EventIngredientLine[],
  selectedTags: IngredientTag[],
  lang: PdfLang = "en"
): Promise<void> {
  const element = buildDocument(event, ingredients, lines, selectedTags, true, lang);
  await downloadDocument(element, `${makeInvoiceNumber(event)}_${fileStem(event.name)}_detailed_${lang}.pdf`);
}
