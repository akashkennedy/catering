"use client";

/**
 * One-time migration: reads the localStorage-backed Zustand caches and POSTs
 * every record to the new API. Idempotent — all server POSTs upsert by
 * client-generated id, so running twice never duplicates. Deletes are NOT
 * replayed (load-after-migrate converges caches to server truth anyway).
 */

import { useEmployeesStore } from "@/store/employees";
import { useEventsStore } from "@/store/events";
import { useFinanceStore } from "@/store/finance";
import { useIngredientsStore } from "@/store/ingredients";
import { useRemindersStore } from "@/store/reminders";
import { useSiteContentStore } from "@/store/siteContent";
import { useStockLedgerStore } from "@/store/stockLedger";
import { useTemplatesStore } from "@/store/templates";
import { useUtensilsStore } from "@/store/utensils";
import { useVendorSuggestionsStore } from "@/store/vendorSuggestions";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";

export type MigrationEntityReport = {
  entity: string;
  total: number;
  sent: number;
  failed: number;
};

async function postAll(
  path: string,
  records: unknown[],
  report: MigrationEntityReport
): Promise<void> {
  for (const record of records) {
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(record),
      });
      if (response.ok) report.sent += 1;
      else report.failed += 1;
    } catch {
      report.failed += 1;
    }
  }
}

function makeReport(entity: string, total: number): MigrationEntityReport {
  return { entity, total, sent: 0, failed: 0 };
}

export async function migrateLocalToServer(): Promise<MigrationEntityReport[]> {
  const reports: MigrationEntityReport[] = [];

  const employees = useEmployeesStore.getState().employees;
  const employeeReport = makeReport("Employees", employees.length);
  await postAll("/api/employees", employees, employeeReport);
  reports.push(employeeReport);

  const ingredients = useIngredientsStore.getState().ingredients;
  const ingredientReport = makeReport("Ingredients", ingredients.length);
  await postAll("/api/ingredients", ingredients, ingredientReport);
  reports.push(ingredientReport);

  const templates = useTemplatesStore.getState().templates;
  const templateReport = makeReport("Templates", templates.length);
  await postAll("/api/templates", templates, templateReport);
  reports.push(templateReport);

  const events = useEventsStore.getState().events;
  const eventReport = makeReport("Events", events.length);
  await postAll("/api/events", events, eventReport);
  reports.push(eventReport);

  const utensils = useUtensilsStore.getState().utensils;
  const utensilReport = makeReport("Utensils", utensils.length);
  await postAll("/api/utensils", utensils, utensilReport);
  reports.push(utensilReport);

  const stockEntries = useStockLedgerStore.getState().entries;
  const stockReport = makeReport("Stock entries", stockEntries.length);
  await postAll("/api/stock-entries", stockEntries, stockReport);
  reports.push(stockReport);

  const vesselEntries = useVesselStockLedgerStore.getState().entries;
  const vesselReport = makeReport("Vessel entries", vesselEntries.length);
  await postAll("/api/vessel-entries", vesselEntries, vesselReport);
  reports.push(vesselReport);

  const finance = useFinanceStore.getState();
  const expenseReport = makeReport("Expenses", finance.expenses.length);
  await postAll("/api/expenses", finance.expenses, expenseReport);
  reports.push(expenseReport);

  const incomeReport = makeReport("Other income", finance.otherIncomes.length);
  await postAll("/api/other-incomes", finance.otherIncomes, incomeReport);
  reports.push(incomeReport);

  const reminders = useRemindersStore.getState().reminders;
  const reminderReport = makeReport("Reminders", reminders.length);
  await postAll("/api/reminders", reminders, reminderReport);
  reports.push(reminderReport);

  const vendors = useVendorSuggestionsStore.getState().vendorSuggestions;
  const vendorReport = makeReport("Vendor names", vendors.length);
  for (const name of vendors) {
    try {
      const response = await fetch("/api/vendor-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name }),
      });
      if (response.ok) vendorReport.sent += 1;
      else vendorReport.failed += 1;
    } catch {
      vendorReport.failed += 1;
    }
  }
  reports.push(vendorReport);

  const site = useSiteContentStore.getState();
  const siteReport = makeReport("Website content", 1);
  try {
    const response = await fetch("/api/site-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        business: site.business,
        menus: site.menus,
        gallery: site.gallery,
        testimonials: site.testimonials,
      }),
    });
    if (response.ok) siteReport.sent = 1;
    else siteReport.failed = 1;
  } catch {
    siteReport.failed = 1;
  }
  reports.push(siteReport);

  return reports;
}
