import React from "react";
import { pdf, Font, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { CateringEvent } from "@/store/events";
import type { Ingredient } from "@/store/ingredients";
import type { DefaultLanguage } from "@/store/settings";
import { formatINR } from "@/lib/format";
import { normalizeUnit } from "@/lib/units";
import { formatIndianDate } from "@/lib/date";

const TAMIL_FAMILY = "NotoSansTamil";

let fontRegistered = false;

function ensureFont(): void {
  if (fontRegistered) return;
  Font.register({
    family: TAMIL_FAMILY,
    src: "/fonts/NotoSansTamil-Regular.ttf",
  });
  fontRegistered = true;
}

type PdfLabels = {
  title: string;
  date: string;
  headcount: string;
  ingredientList: string;
  ingredientName: string;
  qty: string;
  unit: string;
  price: string;
  total: string;
  clientPaymentStatus: string;
  pending: string;
  partial: string;
  paid: string;
};

const labels: Record<DefaultLanguage, PdfLabels> = {
  en: {
    title: "Catering Event",
    date: "Date",
    headcount: "Headcount",
    ingredientList: "Ingredient List",
    ingredientName: "Ingredient",
    qty: "Qty",
    unit: "Unit",
    price: "Price (INR)",
    total: "Total",
    clientPaymentStatus: "Client Payment Status",
    pending: "Pending",
    partial: "Partial",
    paid: "Paid",
  },
  ta: {
    title: "விருந்து நிகழ்வு",
    date: "தேதி",
    headcount: "நபர்கள்",
    ingredientList: "பொருள் பட்டியல்",
    ingredientName: "பொருள்",
    qty: "அளவு",
    unit: "அலகு",
    price: "விலை (ரூ)",
    total: "மொத்தம்",
    clientPaymentStatus: "வாடிக்கையாளர் கட்டண நிலை",
    pending: "நிலுவை",
    partial: "பகுதி",
    paid: "செலுத்தப்பட்டது",
  },
};

function fontFamilyForLang(lang: DefaultLanguage): string {
  return lang === "ta" ? TAMIL_FAMILY : "Helvetica";
}

function paymentStatusLabel(status: string, lang: DefaultLanguage): string {
  const l = labels[lang];
  if (status === "paid") return l.paid;
  if (status === "partial") return l.partial;
  return l.pending;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
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
});

function buildDocument(
  event: CateringEvent,
  ingredients: Ingredient[],
  lang: DefaultLanguage
): React.ReactElement {
  ensureFont();
  const l = labels[lang];
  const ff = fontFamilyForLang(lang);
  const ingredientTotal = event.ingredients.reduce((sum, line) => sum + line.price, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={[styles.title, { fontFamily: ff }]}>{l.title}: {event.name}</Text>
        <Text style={[styles.detail, { fontFamily: ff }]}>
          {l.date}: {event.date ? formatIndianDate(event.date) : "\u2014"}
        </Text>
        <Text style={[styles.detail, { fontFamily: ff }]}>
          {l.headcount}: {event.headcount}
        </Text>
        <Text style={[styles.detail, { fontFamily: ff }]}>
          {l.clientPaymentStatus}: {paymentStatusLabel(event.clientPaymentStatus, lang)}
        </Text>

        <Text style={[styles.sectionTitle, { fontFamily: ff }]}>{l.ingredientList}</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableHeaderText, { flex: 2, fontFamily: ff }]}>{l.ingredientName}</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, fontFamily: ff }]}>{l.qty}</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, fontFamily: ff }]}>{l.unit}</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, fontFamily: ff, textAlign: "right" }]}>{l.price}</Text>
          </View>
          {event.ingredients.map((line, idx) => {
            const master = ingredients.find((i) => i.id === line.ingredientId);
            const name = lang === "ta"
              ? (master?.tamilName || master?.name || "\u2014")
              : (master?.name || "\u2014");
            const unit = normalizeUnit(master?.unit);
            return (
              <View
                key={line.id}
                style={[styles.tableRow, idx % 2 === 1 ? styles.rowEven : undefined]}
              >
                <Text style={[styles.tableCell, { flex: 2, fontFamily: ff }]}>{name}</Text>
                <Text style={[styles.tableCell, { flex: 1, fontFamily: ff }]}>{String(line.qty)}</Text>
                <Text style={[styles.tableCell, { flex: 1, fontFamily: ff }]}>{unit}</Text>
                <Text style={[styles.tableCell, { flex: 1, fontFamily: ff, textAlign: "right" }]}>
                  {formatINR(line.price)}
                </Text>
              </View>
            );
          })}
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableFooterText, { flex: 2, fontFamily: ff }]} />
            <Text style={[styles.tableFooterText, { flex: 1, fontFamily: ff }]} />
            <Text style={[styles.tableFooterText, { flex: 1, fontFamily: ff }]}>{l.total}</Text>
            <Text style={[styles.tableFooterText, { flex: 1, fontFamily: ff, textAlign: "right" }]}>
              {formatINR(ingredientTotal)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateEventPdf(
  event: CateringEvent,
  ingredients: Ingredient[],
  lang: DefaultLanguage
): Promise<void> {
  const element = buildDocument(event, ingredients, lang) as React.ReactElement<DocumentProps>;
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.name.replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "_")}_${lang}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
