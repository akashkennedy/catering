import { useEmployeesStore } from "@/store/employees";
import { useEventsStore } from "@/store/events";
import { useFinanceStore } from "@/store/finance";
import { useIngredientsStore } from "@/store/ingredients";
import { useRemindersStore } from "@/store/reminders";
import { useStockLedgerStore } from "@/store/stockLedger";
import { useTemplatesStore } from "@/store/templates";
import { useUtensilsStore } from "@/store/utensils";
import { useVendorSuggestionsStore } from "@/store/vendorSuggestions";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";

export type ExcelExportSummary = {
  sheets: number;
  rows: number;
};

function fileStamp(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

/**
 * Exports the whole database (as currently loaded in the stores) to a
 * multi-sheet .xlsx file and triggers a browser download. Data only —
 * users, sessions and permissions are never exported.
 *
 * Async because the xlsx engine loads on demand (kept out of page bundles).
 */
export async function exportDatabaseToExcel(): Promise<ExcelExportSummary> {
  const XLSX = await import("xlsx");
  const ingredients = useIngredientsStore.getState().ingredients;
  const templates = useTemplatesStore.getState().templates;
  const events = useEventsStore.getState().events;
  const employees = useEmployeesStore.getState().employees;
  const utensils = useUtensilsStore.getState().utensils;
  const finance = useFinanceStore.getState();
  const reminders = useRemindersStore.getState().reminders;
  const stockEntries = useStockLedgerStore.getState().entries;
  const vesselEntries = useVesselStockLedgerStore.getState().entries;
  const vendorNames = useVendorSuggestionsStore.getState().vendorSuggestions;

  const ingredientName = new Map(ingredients.map((i) => [i.id, i.name]));
  const templateName = new Map(templates.map((t) => [t.id, t.nameEn]));
  const employeeName = new Map(employees.map((e) => [e.id, e.name]));
  const utensilName = new Map(utensils.map((u) => [u.id, u.name]));
  const eventName = new Map(events.map((e) => [e.id, e.name]));

  const workbook = XLSX.utils.book_new();
  let rows = 0;
  const addSheet = (name: string, data: Record<string, unknown>[]) => {
    const sheet = XLSX.utils.json_to_sheet(data);
    sheet["!cols"] = Object.keys(data[0] ?? { "": "" }).map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(workbook, sheet, name);
    rows += data.length;
  };

  addSheet(
    "Ingredients",
    ingredients.map((i) => ({
      Name: i.name,
      TamilName: i.tamilName,
      Tag: i.tag,
      Unit: i.unit,
      Price: i.globalPrice,
      Stock: i.qty,
      OpeningStock: i.openingStock,
      LowStockAt: i.lowStockThreshold,
    }))
  );

  addSheet(
    "Templates",
    templates.flatMap((t) =>
      t.dishes.map((d) => ({
        Template: t.nameEn,
        TemplateTamil: t.nameTa,
        Dish: d.nameEn,
        DishTamil: d.nameTa,
        Ingredients: d.ingredients
          .map(
            (line) =>
              `${ingredientName.get(line.ingredientId) ?? "?"} (${line.qtyPer100}/100)`
          )
          .join("; "),
      }))
    )
  );

  addSheet(
    "Events",
    events.map((e) => ({
      Name: e.name,
      Phone: e.phone,
      Date: e.date,
      Venue: e.venue,
      Function: e.functionType,
      Headcount: e.headcount,
      Status: e.status,
      RatePerPerson: e.ratePerPerson,
      TotalAmount: e.totalAmount,
      AdvancePaid: e.advancePaid,
      Balance: Math.round((e.totalAmount - e.advancePaid) * 100) / 100,
      Template: e.templateId ? (templateName.get(e.templateId) ?? "") : "",
    }))
  );

  addSheet(
    "EventIngredients",
    events.flatMap((e) =>
      e.ingredients.map((line) => ({
        Event: e.name,
        EventDate: e.date,
        Ingredient: ingredientName.get(line.ingredientId) ?? line.ingredientId,
        Qty: line.qty,
        Price: line.price,
      }))
    )
  );

  addSheet(
    "EventStaff",
    events.flatMap((e) =>
      e.employees.map((line) => ({
        Event: e.name,
        EventDate: e.date,
        Employee:
          (line.employeeId ? employeeName.get(line.employeeId) : null) ?? line.name,
        Phone: line.phone,
        ToPay: line.toPay,
        Paid: line.paid,
      }))
    )
  );

  addSheet(
    "EventUtensils",
    events.flatMap((e) =>
      e.utensils.map((line) => ({
        Event: e.name,
        EventDate: e.date,
        Utensil:
          (line.utensilId ? utensilName.get(line.utensilId) : null) ?? line.utensilName,
        Qty: line.qty,
        RentalPrice: line.rentalPrice,
        Vendor: line.vendorName,
        VendorPhone: line.vendorPhone,
        Returned: line.returned ? "Yes" : "No",
      }))
    )
  );

  addSheet(
    "Employees",
    employees.map((e) => ({ Name: e.name, Phone: e.phone, DefaultRate: e.defaultRate }))
  );

  addSheet(
    "Utensils",
    utensils.map((u) => ({
      Name: u.name,
      RentPrice: u.rentPrice,
      OpeningStock: u.openingStock,
      LowStockAt: u.lowStockThreshold,
    }))
  );

  addSheet(
    "Expenses",
    finance.expenses.map((e) => ({
      Date: e.date,
      Category: e.category,
      Amount: e.amount,
      Note: e.note,
    }))
  );

  addSheet(
    "OtherIncome",
    finance.otherIncomes.map((o) => ({ Date: o.date, Amount: o.amount, Note: o.note }))
  );

  addSheet(
    "Reminders",
    reminders.map((r) => ({
      Customer: r.customerName ?? "",
      Phone: r.phone,
      Note: r.note ?? "",
      RemindAt: r.remindAt,
      Event: r.eventId ? (eventName.get(r.eventId) ?? "") : "",
      Dismissed: r.dismissed ? "Yes" : "No",
    }))
  );

  addSheet(
    "StockEntries",
    stockEntries.map((s) => ({
      Date: s.date,
      Ingredient: ingredientName.get(s.ingredientId) ?? s.ingredientId,
      Type: s.type,
      Qty: s.qty,
      Price: s.price ?? 0,
      Event: s.eventId ? (eventName.get(s.eventId) ?? "") : "",
      Note: s.note,
    }))
  );

  addSheet(
    "VesselEntries",
    vesselEntries.map((v) => ({
      Date: v.date,
      Utensil: utensilName.get(v.utensilId) ?? v.utensilId,
      Type: v.type,
      Qty: v.qty,
      Event: v.eventId ? (eventName.get(v.eventId) ?? "") : "",
      Note: v.note,
    }))
  );

  addSheet("VendorNames", vendorNames.map((name) => ({ Name: name })));

  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `catering-export-${fileStamp()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);

  return { sheets: workbook.SheetNames.length, rows };
}
