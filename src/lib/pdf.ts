import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CateringEvent, ClientPaymentStatus } from "@/store/events";
import type { Ingredient } from "@/store/ingredients";
import type { DefaultLanguage } from "@/store/settings";

const TAMIL_FONT_NAME = "NotoSansTamil";

let tamilFontLoaded = false;

async function ensureTamilFont(doc: jsPDF): Promise<void> {
  if (tamilFontLoaded) return;
  const response = await fetch("/fonts/NotoSansTamil-Regular.ttf");
  const buffer = await response.arrayBuffer();
  const binary = new Uint8Array(buffer);
  let binaryString = "";
  for (let i = 0; i < binary.length; i++) {
    binaryString += String.fromCharCode(binary[i]);
  }
  const base64 = btoa(binaryString);
  doc.addFileToVFS(`${TAMIL_FONT_NAME}.ttf`, base64);
  doc.addFont(`${TAMIL_FONT_NAME}.ttf`, TAMIL_FONT_NAME, "normal");
  tamilFontLoaded = true;
}

function setFontForLang(doc: jsPDF, lang: DefaultLanguage): void {
  if (lang === "ta") {
    doc.setFont(TAMIL_FONT_NAME, "normal");
  } else {
    doc.setFont("helvetica", "normal");
  }
}

function setFontBoldForLang(doc: jsPDF, lang: DefaultLanguage): void {
  if (lang === "ta") {
    doc.setFont(TAMIL_FONT_NAME, "normal");
  } else {
    doc.setFont("helvetica", "bold");
  }
}

type PdfLabels = {
  title: string;
  date: string;
  location: string;
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
  employeePaymentSummary: string;
  employee: string;
  toPay: string;
  paidAmt: string;
  pendingAmt: string;
  grandTotalToPay: string;
  grandTotalPaid: string;
  grandTotalPending: string;
};

const labels: Record<DefaultLanguage, PdfLabels> = {
  en: {
    title: "Catering Event",
    date: "Date",
    location: "Location",
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
    employeePaymentSummary: "Employee Payment Summary",
    employee: "Employee",
    toPay: "To Pay",
    paidAmt: "Paid",
    pendingAmt: "Pending",
    grandTotalToPay: "Total to Pay",
    grandTotalPaid: "Total Paid",
    grandTotalPending: "Total Pending",
  },
  ta: {
    title: "விருந்து நிகழ்வு",
    date: "தேதி",
    location: "இடம்",
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
    employeePaymentSummary: "ஊழியர் கட்டண சுருக்கம்",
    employee: "ஊழியர்",
    toPay: "செலுத்த வேண்டியது",
    paidAmt: "செலுத்தியது",
    pendingAmt: "நிலுவை",
    grandTotalToPay: "மொத்தம் செலுத்த வேண்டியது",
    grandTotalPaid: "மொத்தம் செலுத்தியது",
    grandTotalPending: "மொத்தம் நிலுவை",
  },
};

function paymentStatusLabel(status: ClientPaymentStatus, lang: DefaultLanguage): string {
  return labels[lang][status];
}

export async function generateEventPdf(
  event: CateringEvent,
  ingredients: Ingredient[],
  lang: DefaultLanguage
): Promise<void> {
  const doc = new jsPDF();
  await ensureTamilFont(doc);

  const l = labels[lang];
  const margin = 14;
  let y = margin;

  function checkPage(needed: number): void {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  // Title
  setFontBoldForLang(doc, lang);
  doc.setFontSize(18);
  doc.text(`${l.title}: ${event.name}`, margin, y);
  y += 10;

  // Event details
  setFontForLang(doc, lang);
  doc.setFontSize(10);
  doc.text(`${l.date}: ${event.date || "—"}`, margin, y);
  y += 5;
  doc.text(`${l.location}: ${event.location || "—"}`, margin, y);
  y += 5;
  doc.text(`${l.headcount}: ${event.headcount}`, margin, y);
  y += 5;
  doc.text(`${l.clientPaymentStatus}: ${paymentStatusLabel(event.clientPaymentStatus, lang)}`, margin, y);
  y += 10;

  // Ingredients table
  if (event.ingredients.length > 0) {
    checkPage(40);
    setFontBoldForLang(doc, lang);
    doc.setFontSize(13);
    doc.text(l.ingredientList, margin, y);
    y += 4;

    const ingredientRows = event.ingredients.map((line) => {
      const master = ingredients.find((i) => i.id === line.ingredientId);
      const name = lang === "ta" ? (master?.tamilName || master?.name || "—") : (master?.name || "—");
      const unit = master?.unit || "";
      return [name, String(line.qty), unit, `₹${line.price.toFixed(2)}`];
    });

    const ingredientTotal = event.ingredients.reduce((sum, line) => sum + line.price, 0);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [[l.ingredientName, l.qty, l.unit, l.price]],
      body: ingredientRows,
      foot: [["", "", l.total, `₹${ingredientTotal.toFixed(2)}`]],
      theme: "striped",
      styles: {
        font: lang === "ta" ? TAMIL_FONT_NAME : "helvetica",
        fontSize: 9,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        font: lang === "ta" ? TAMIL_FONT_NAME : "helvetica",
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [240, 240, 240],
        fontStyle: "bold",
        font: lang === "ta" ? TAMIL_FONT_NAME : "helvetica",
      },
    });

    const getter = (doc as unknown as { getLastAutoTable?: () => { finalY?: number } | null }).getLastAutoTable;
    const tableData = getter?.call(doc);
    y = (tableData?.finalY ?? y) + 10;
  }

  // Employee payment summary
  if (event.employees.length > 0) {
    checkPage(40);
    setFontBoldForLang(doc, lang);
    doc.setFontSize(13);
    doc.text(l.employeePaymentSummary, margin, y);
    y += 4;

    const employeeRows = event.employees.map((line) => [
      line.name,
      `₹${line.toPay.toFixed(2)}`,
      `₹${line.paid.toFixed(2)}`,
      `₹${(line.toPay - line.paid).toFixed(2)}`,
    ]);

    const totalToPay = event.employees.reduce((sum, line) => sum + line.toPay, 0);
    const totalPaid = event.employees.reduce((sum, line) => sum + line.paid, 0);
    const totalPending = totalToPay - totalPaid;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [[l.employee, l.toPay, l.paidAmt, l.pendingAmt]],
      body: employeeRows,
      foot: [
        [
          l.grandTotalToPay,
          `₹${totalToPay.toFixed(2)}`,
          `₹${totalPaid.toFixed(2)}`,
          `₹${totalPending.toFixed(2)}`,
        ],
      ],
      theme: "striped",
      styles: {
        font: lang === "ta" ? TAMIL_FONT_NAME : "helvetica",
        fontSize: 9,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        font: lang === "ta" ? TAMIL_FONT_NAME : "helvetica",
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [240, 240, 240],
        fontStyle: "bold",
        font: lang === "ta" ? TAMIL_FONT_NAME : "helvetica",
      },
    });
  }

  const filename = `${event.name.replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "_")}_${lang}.pdf`;
  doc.save(filename);
}
