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

const TAMIL_FAMILY = "NotoSansTamil";

const BRAND_NAME = "Mampalli Catering";
const BRAND_PHONES = ["9025350666", "9488073555"];

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

function tagHeading(tag: IngredientTag): string {
  const label = ui.ingredients.tags[tag] ?? ui.ingredients.tags.grocery;
  return `${preferredText(label, "ta")} / ${preferredText(label, "en")}`;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: TAMIL_FAMILY },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  detail: { fontSize: 10, marginBottom: 3 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginTop: 14, marginBottom: 6 },
  table: { width: "100%", marginBottom: 10 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ccc" },
  tableHeader: { backgroundColor: "#2980b9", padding: 6 },
  tableHeaderText: { color: "#fff", fontWeight: "bold", fontSize: 9 },
  tableCell: { padding: 6, fontSize: 9, flex: 1 },
  tableFooter: { backgroundColor: "#f0f0f0", padding: 6 },
  tableFooterText: { fontWeight: "bold", fontSize: 9, flex: 1 },
  rowEven: { backgroundColor: "#f9f9f9" },
  brandTitle: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 2 },
  brandPhone: { fontSize: 11, textAlign: "center", marginBottom: 12 },
  brandLogo: { width: 64, height: 63, marginHorizontal: "auto", marginBottom: 4 },
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
 * Brand heading — first page only. Renders an empty string on every other
 * page so no space is reserved there.
 */
function BrandHeader() {
  const phones = BRAND_PHONES.map((number) => formatPhone(number)).join(" · ");
  return (
    <>
      <View
        render={({ pageNumber }: { pageNumber: number }) =>
          pageNumber === 1 ? (
            <View style={{ alignItems: "center" }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- PDF output, not HTML */}
              <Image src="/logo.png" style={styles.brandLogo} />
            </View>
          ) : null
        }
      />
      <Text
        style={styles.brandTitle}
        render={({ pageNumber }: { pageNumber: number }) =>
          pageNumber === 1 ? BRAND_NAME : ""
        }
      />
      <Text
        style={styles.brandPhone}
        render={({ pageNumber }: { pageNumber: number }) => (pageNumber === 1 ? phones : "")}
      />
    </>
  );
}

/**
 * Thank-you footer — bottom of the last page only. `fixed` pins it to the
 * page bottom; the render condition skips every other page (including all
 * middle pages of multi-page invoices).
 */
function ThankYouFooter() {
  const label = `${preferredText(ui.events.thankYou, "en")} / ${preferredText(
    ui.events.thankYou,
    "ta"
  )}`;
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

/** Renders the event metadata shown beneath the branded PDF header. */
function EventHeader({ event }: { event: CateringEvent }) {
  return (
    <View>
      <Text style={styles.title}>
        {preferredText(ui.events.invoice, "ta")} / {preferredText(ui.events.invoice, "en")}: {event.name}
      </Text>
      <Text style={styles.detail}>
        {preferredText(ui.events.invoiceNo, "ta")} / {preferredText(ui.events.invoiceNo, "en")}:{" "}
        {makeInvoiceNumber(event)}
      </Text>
      <Text style={styles.detail}>
        {preferredText(ui.common.date, "ta")} / {preferredText(ui.common.date, "en")}:{" "}
        {event.date ? formatIndianDate(event.date) : "—"}
      </Text>
    </View>
  );
}

function GroupedTable({
  groups,
  withPrice,
  event,
  subtotal,
}: {
  groups: GroupedLines;
  withPrice: boolean;
  event: CateringEvent;
  subtotal: number;
}) {
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>#</Text>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>பொருள்</Text>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Ingredient</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Unit</Text>
        {withPrice && (
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>Price ₹</Text>
        )}
      </View>
      {groups.map((group) => (
        <View key={group.tag}>
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableFooterText, { flex: 5 }]}>
              {tagHeading(group.tag)}
            </Text>
            {withPrice && <Text style={[styles.tableFooterText, { flex: 1 }]} />}
          </View>
          {group.lines.map((line, idx) => {
            const stripe = idx % 2 === 1 ? styles.rowEven : undefined;
            return (
              <View key={line.key} style={[styles.tableRow, stripe]}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{line.serial}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{line.nameTa}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{line.nameEn}</Text>
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
            <Text style={[styles.tableFooterText, { flex: 2 }]} />
            <Text style={[styles.tableFooterText, { flex: 2 }]}>
              {preferredText(ui.events.runningTotal, "ta")} /{" "}
              {preferredText(ui.events.runningTotal, "en")}
            </Text>
            <Text style={[styles.tableFooterText, { flex: 1 }]} />
            <Text style={[styles.tableFooterText, { flex: 1 }]} />
            <Text style={[styles.tableFooterText, { flex: 1, textAlign: "right" }]}>
              {formatINR(subtotal)}
            </Text>
          </View>
          <View style={[styles.tableRow]}>
            <Text style={[styles.tableCell, { flex: 4.5 }]}>
              {preferredText(ui.events.totalAmount, "ta")} /{" "}
              {preferredText(ui.events.totalAmount, "en")}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>
              {formatINR(event.totalAmount ?? 0)}
            </Text>
          </View>
          <View style={[styles.tableRow]}>
            <Text style={[styles.tableCell, { flex: 4.5 }]}>
              {preferredText(ui.events.advancePaid, "ta")} /{" "}
              {preferredText(ui.events.advancePaid, "en")}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>
              {formatINR(event.advancePaid ?? 0)}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableFooterText, { flex: 4.5 }]}>
              {preferredText(ui.events.balance, "ta")} /{" "}
              {preferredText(ui.events.balance, "en")}
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
  withPrice: boolean
): React.ReactElement {
  ensureFont();
  const groups = groupLines(lines, ingredients, selectedTags);
  const subtotal = lines
    .filter((line) => selectedTags.includes(tagOfLine(line, ingredients)))
    .reduce((sum, line) => sum + line.price, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <BrandHeader />
        <EventHeader event={event} />
        <Text style={styles.sectionTitle}>
          {preferredText(ui.templates.ingredients, "ta")} /{" "}
          {preferredText(ui.templates.ingredients, "en")}
        </Text>
        <GroupedTable groups={groups} withPrice={withPrice} event={event} subtotal={subtotal} />
        <ThankYouFooter />
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

/** Buy-list sheet: ingredient names + quantities, grouped by category, no prices. */
export async function generateBuyListPdf(
  event: CateringEvent,
  ingredients: Ingredient[],
  lines: EventIngredientLine[],
  selectedTags: IngredientTag[]
): Promise<void> {
  const element = buildDocument(event, ingredients, lines, selectedTags, false);
  await downloadDocument(element, `${makeInvoiceNumber(event)}_${fileStem(event.name)}.pdf`);
}

/** Detailed invoice: names + quantities + prices with totals, grouped by category. */
export async function generateDetailedPdf(
  event: CateringEvent,
  ingredients: Ingredient[],
  lines: EventIngredientLine[],
  selectedTags: IngredientTag[]
): Promise<void> {
  const element = buildDocument(event, ingredients, lines, selectedTags, true);
  await downloadDocument(element, `${makeInvoiceNumber(event)}_${fileStem(event.name)}.pdf`);
}
