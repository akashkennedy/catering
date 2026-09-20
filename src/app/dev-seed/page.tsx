"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";

import { useEmployeesStore } from "@/store/employees";
import { useEventsStore } from "@/store/events";
import { useFinanceStore } from "@/store/finance";
import { useIngredientsStore } from "@/store/ingredients";
import { useRemindersStore } from "@/store/reminders";
import { useStockLedgerStore } from "@/store/stockLedger";
import { useTemplatesStore } from "@/store/templates";
import { useUtensilsStore } from "@/store/utensils";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoTimePlusMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export default function DevSeedPage() {
  const [status, setStatus] = useState("");
  const [confirmClearOpened, setConfirmClearOpened] = useState(false);

  const loadMockData = () => {
    // Ingredients
    const addIngredient = useIngredientsStore.getState().addIngredient;
    addIngredient({ name: "Rice", tamilName: "அரிசி", tag: "grocery", unit: "kg", qty: 0, globalPrice: 65, openingStock: 50, lowStockThreshold: 10 });
    addIngredient({ name: "Chicken", tamilName: "கோழி", tag: "meat-fish", unit: "kg", qty: 0, globalPrice: 220, openingStock: 5, lowStockThreshold: 8 });
    addIngredient({ name: "Oil", tamilName: "எண்ணெய்", tag: "grocery", unit: "litre", qty: 0, globalPrice: 140, openingStock: 20, lowStockThreshold: 5 });
    addIngredient({ name: "Milk", tamilName: "பால்", tag: "grocery", unit: "litre", qty: 0, globalPrice: 60, openingStock: 10, lowStockThreshold: 4 });
    const ingredients = useIngredientsStore.getState().ingredients;
    const byName = new Map(ingredients.map((i) => [i.name, i.id]));
    const riceId = byName.get("Rice") ?? "";
    const chickenId = byName.get("Chicken") ?? "";
    const oilId = byName.get("Oil") ?? "";

    // Template
    useTemplatesStore.getState().addTemplate({
      nameEn: "Wedding lunch",
      nameTa: "திருமண மதிய உணவு",
      dishes: [
        {
          id: crypto.randomUUID(),
          nameEn: "Chicken biryani",
          nameTa: "சிக்கன் பிரியாணி",
          ingredients: [
            { ingredientId: riceId, qtyPer100: 12 },
            { ingredientId: chickenId, qtyPer100: 10 },
            { ingredientId: oilId, qtyPer100: 2 },
          ],
        },
        {
          id: crypto.randomUUID(),
          nameEn: "Payasam",
          nameTa: "பாயசம்",
          ingredients: [{ ingredientId: byName.get("Milk") ?? "", qtyPer100: 5 }],
        },
      ],
    });
    const templatesAfterAdd = useTemplatesStore.getState().templates;
    const templateId = templatesAfterAdd[templatesAfterAdd.length - 1]?.id ?? null;

    // Employees
    const addEmployee = useEmployeesStore.getState().addEmployee;
    const cookId = addEmployee({ name: "Ravi", phone: "9876543210", defaultRate: 1500 });
    const helperId = addEmployee({ name: "Mani", phone: "9876543211", defaultRate: 800 });

    // Utensils
    const addUtensil = useUtensilsStore.getState().addUtensil;
    const plateId = addUtensil({ name: "Steel plate", rentPrice: 5, openingStock: 200, lowStockThreshold: 50 });
    addUtensil({ name: "Serving bowl", rentPrice: 20, openingStock: 3, lowStockThreshold: 5 });

    // Events
    const addEvent = useEventsStore.getState().addEvent;
    addEvent({
      name: "Ravi's wedding",
      phone: "9876543210",
      venue: "Madurai function hall",
      address: "123 Main Road, Madurai",
      functionType: "Wedding",
      headcount: 300,
      date: isoPlusDays(5),
      status: "confirmed",
      templateId,
      mealGroups: templateId
        ? [{ id: crypto.randomUUID(), templateId, headcount: 300, selectedDishIds: [] }]
        : [],
      ratePerPerson: 250,
      totalAmount: 75000,
      totalAmountOverridden: false,
      advancePaid: 20000,
      ingredients: [
        { id: crypto.randomUUID(), ingredientId: riceId, qty: 36, price: 2340 },
        { id: crypto.randomUUID(), ingredientId: chickenId, qty: 30, price: 6600 },
      ],
      employees: [
        { id: crypto.randomUUID(), employeeId: cookId, name: "Ravi", phone: "9876543210", toPay: 1500, paid: 500 },
        { id: crypto.randomUUID(), employeeId: helperId, name: "Mani", phone: "9876543211", toPay: 800, paid: 800 },
      ],
      utensils: [
        { id: crypto.randomUUID(), vendorName: "", vendorPhone: "", utensilId: plateId, utensilName: "Steel plate", qty: 300, rentalPrice: 5, dateFrom: isoPlusDays(5), dateTo: isoPlusDays(6), returned: false },
      ],
    });
    addEvent({
      name: "Meena's birthday",
      phone: "9876543212",
      venue: "Home",
      address: "45 Cross Street, Madurai",
      functionType: "Birthday",
      headcount: 80,
      date: isoPlusDays(12),
      status: "enquiry",
      templateId: null,
      mealGroups: [],
      ratePerPerson: 150,
      totalAmount: 12000,
      totalAmountOverridden: false,
      advancePaid: 0,
      ingredients: [],
      employees: [],
      utensils: [],
    });
    addEvent({
      name: "Corporate lunch",
      phone: "9876543213",
      venue: "Office campus",
      address: "IT Park, Chennai",
      functionType: "Corporate",
      headcount: 150,
      date: isoPlusDays(-10),
      status: "paid",
      templateId,
      mealGroups: templateId
        ? [{ id: crypto.randomUUID(), templateId, headcount: 150, selectedDishIds: [] }]
        : [],
      ratePerPerson: 200,
      totalAmount: 30000,
      totalAmountOverridden: false,
      advancePaid: 30000,
      ingredients: [],
      employees: [],
      utensils: [],
    });

    // Finance
    const finance = useFinanceStore.getState();
    finance.addExpense({ category: "transport", amount: 2500, date: isoPlusDays(0), note: "Truck hire" });
    finance.addExpense({ category: "gas", amount: 1200, date: isoPlusDays(-2), note: "Cylinder refill" });
    finance.addOtherIncome({ amount: 5000, date: isoPlusDays(-3), note: "Vessel rental to neighbour" });

    // Reminders (follow-ups)
    useRemindersStore.getState().addReminder({
      customerName: null,
      phone: "9876543210",
      note: "Confirm final headcount",
      remindAt: isoTimePlusMinutes(30),
      eventId: null,
      dismissed: false,
      notified: false,
    });

    setStatus("Mock data loaded. Open /, /events, /finance, /follow-ups, /ingredients to test.");
  };

  const clearAllData = () => {
    const events = useEventsStore.getState();
    events.events.forEach((e) => events.deleteEvent(e.id));
    const ingredients = useIngredientsStore.getState();
    const removeIngredientEntries = useStockLedgerStore.getState().removeEntriesForIngredient;
    ingredients.ingredients.forEach((i) => {
      removeIngredientEntries(i.id);
      ingredients.deleteIngredient(i.id);
    });
    const templates = useTemplatesStore.getState();
    templates.templates.forEach((t) => templates.deleteTemplate(t.id));
    const employees = useEmployeesStore.getState();
    employees.employees.forEach((e) => employees.deleteEmployee(e.id));
    const utensils = useUtensilsStore.getState();
    const removeUtensilEntries = useVesselStockLedgerStore.getState().removeEntriesForUtensil;
    utensils.utensils.forEach((u) => {
      removeUtensilEntries(u.id);
      utensils.deleteUtensil(u.id);
    });
    const finance = useFinanceStore.getState();
    finance.expenses.forEach((e) => finance.deleteExpense(e.id));
    finance.otherIncomes.forEach((o) => finance.deleteOtherIncome(o.id));
    const reminders = useRemindersStore.getState();
    reminders.reminders.forEach((r) => reminders.removeReminder(r.id));
    void import("@/lib/outbox").then(({ clearOutbox }) => clearOutbox());
    setStatus("All data cleared.");
  };

  return (
    <Stack gap="md" p="xl">
      <Title order={2}>Demo Data</Title>
      <Text c="dimmed" size="sm">
        Load sample events, ingredients, employees, utensils, expenses and reminders to explore the app.
      </Text>
      <Group>
        <Button onClick={loadMockData}>Load demo data</Button>
        <Button variant="default" onClick={() => setConfirmClearOpened(true)}>Clear all data</Button>
      </Group>
      <Modal
        opened={confirmClearOpened}
        onClose={() => setConfirmClearOpened(false)}
        title="Clear all data"
        centered
      >
        <Stack gap="md">
          <Text size="sm">Are you sure you want to clear all data? This cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmClearOpened(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                clearAllData();
                setConfirmClearOpened(false);
              }}
            >
              Clear all data
            </Button>
          </Group>
        </Stack>
      </Modal>
      {status ? <Text size="sm">{status}</Text> : null}
    </Stack>
  );
}
