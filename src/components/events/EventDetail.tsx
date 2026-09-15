"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Anchor,
  Button,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { Download, Plus, Salad, Users, UtensilsCrossed } from "lucide-react";

import { EventEmployeeCards } from "./EventEmployeeCards";
import { EventEmployeeFormModal } from "./EventEmployeeFormModal";
import { EventEmployeeTable } from "./EventEmployeeTable";
import { EventIngredientCards } from "./EventIngredientCards";
import { EventIngredientTable } from "./EventIngredientTable";
import { EventUtensilCards } from "./EventUtensilCards";
import { EventUtensilFormModal } from "./EventUtensilFormModal";
import { EventUtensilTable } from "./EventUtensilTable";
import { useEventsStore, buildScaledIngredients } from "@/store/events";
import { useEmployeesStore } from "@/store/employees";
import { useIngredientsStore } from "@/store/ingredients";
import { useSettingsStore } from "@/store/settings";
import { useTemplatesStore } from "@/store/templates";
import { useVendorsStore } from "@/store/vendors";
import { generateEventPdf } from "@/lib/pdf";
import { formatINR } from "@/lib/format";

export function EventDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const event = useEventsStore((state) => state.events.find((item) => item.id === id));
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const templates = useTemplatesStore((state) => state.templates);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const masterEmployees = useEmployeesStore((state) => state.employees);
  const masterVendors = useVendorsStore((state) => state.vendors);
  const defaultLanguage = useSettingsStore((state) => state.defaultLanguage);
  const [employeeFormOpened, setEmployeeFormOpened] = useState(false);
  const [utensilFormOpened, setUtensilFormOpened] = useState(false);
  const [assignValue, setAssignValue] = useState<string | null>(null);
  const [utensilVendorValue, setUtensilVendorValue] = useState<string | null>(null);
  const [pdfLang, setPdfLang] = useState<"en" | "ta">(defaultLanguage);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  if (!event) {
    return (
      <Stack gap="md">
        <Title order={1}>Event Detail</Title>
        <Text c="dimmed">Event not found.</Text>
        <Anchor component={Link} href="/events">
          Back to events
        </Anchor>
      </Stack>
    );
  }

  const templateOptions = templates.map((template) => ({
    value: template.id,
    label: template.name,
  }));

  const eventIngredients = event.ingredients ?? [];
  const eventEmployees = event.employees ?? [];
  const eventUtensils = event.utensils ?? [];

  const update = (patch: {
    headcount?: number;
    templateId?: string | null;
    ingredients?: typeof event.ingredients;
    employees?: typeof event.employees;
    utensils?: typeof event.utensils;
  }) => {
    updateEvent(event.id, {
      name: event.name,
      phone: event.phone,
      location: event.location,
      headcount: event.headcount,
      date: event.date,
      status: event.status,
      templateId: event.templateId,
      clientPaymentStatus: event.clientPaymentStatus,
      ingredients: eventIngredients,
      employees: eventEmployees,
      utensils: eventUtensils,
      ...patch,
    });
  };

  const handleHeadcountChange = (headcount: number) => {
    const template = templates.find((item) => item.id === event.templateId) ?? null;
    update({ headcount, ingredients: buildScaledIngredients(template, ingredients, headcount) });
  };

  const handleTemplateChange = (templateId: string | null) => {
    const template = templates.find((item) => item.id === templateId) ?? null;
    update({
      templateId,
      ingredients: buildScaledIngredients(template, ingredients, event.headcount),
    });
  };

  const handleLineChange = (lineId: string, patch: { qty?: number; price?: number }) => {
    update({
      ingredients: eventIngredients.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line
      ),
    });
  };

  const assignableEmployees = masterEmployees.filter(
    (employee) => !eventEmployees.some((line) => line.employeeId === employee.id)
  );

  const handleAddAssigned = (employeeId: string) => {
    const employee = masterEmployees.find((item) => item.id === employeeId);
    if (!employee) return;
    update({
      employees: [
        ...eventEmployees,
        {
          id: crypto.randomUUID(),
          employeeId: employee.id,
          name: employee.name,
          phone: employee.phone,
          toPay: employee.defaultRate,
          paid: 0,
        },
      ],
    });
  };

  const handleAddAdhoc = (input: {
    employeeId: string | null;
    name: string;
    phone: string;
    toPay: number;
  }) => {
    update({
      employees: [
        ...eventEmployees,
        {
          id: crypto.randomUUID(),
          employeeId: input.employeeId,
          name: input.name,
          phone: input.phone,
          toPay: input.toPay,
          paid: 0,
        },
      ],
    });
  };

  const handleEmployeeLineChange = (lineId: string, patch: { toPay?: number; paid?: number }) => {
    update({
      employees: eventEmployees.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line
      ),
    });
  };

  const handleEmployeeRemove = (lineId: string) => {
    update({ employees: eventEmployees.filter((line) => line.id !== lineId) });
  };

  const handleAddUtensilLine = (input: {
    utensilId: string | null;
    utensilName: string;
    qty: number;
    rentalPrice: number;
    dateFrom: string;
    dateTo: string;
  }) => {
    const vendor = masterVendors.find((v) => v.id === utensilVendorValue) ?? null;
    update({
      utensils: [
        ...eventUtensils,
        {
          id: crypto.randomUUID(),
          vendorId: vendor?.id ?? null,
          vendorName: vendor?.name ?? "Unknown vendor",
          vendorPhone: vendor?.phone ?? "",
          utensilId: input.utensilId,
          utensilName: input.utensilName,
          qty: input.qty,
          rentalPrice: input.rentalPrice,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          returned: false,
        },
      ],
    });
  };

  const handleUtensilLineChange = (
    lineId: string,
    patch: { qty?: number; rentalPrice?: number }
  ) => {
    update({
      utensils: eventUtensils.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line
      ),
    });
  };

  const handleToggleReturned = (lineId: string) => {
    update({
      utensils: eventUtensils.map((line) =>
        line.id === lineId ? { ...line, returned: !line.returned } : line
      ),
    });
  };

  const handleUtensilRemove = (lineId: string) => {
    update({ utensils: eventUtensils.filter((line) => line.id !== lineId) });
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      await generateEventPdf(event, ingredients, pdfLang);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const runningTotal = eventIngredients.reduce((sum, line) => sum + line.price, 0);
  const totalToPay = eventEmployees.reduce((sum, line) => sum + line.toPay, 0);
  const totalPaid = eventEmployees.reduce((sum, line) => sum + line.paid, 0);
  const totalPending = totalToPay - totalPaid;
  const totalUtensilCost = eventUtensils.reduce(
    (sum, line) => sum + line.qty * line.rentalPrice,
    0
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" align="baseline">
        <div>
          <Title order={1}>{event.name}</Title>
          <Text size="sm" c="dimmed">
            {event.date || "No date"} · {event.headcount} guests
          </Text>
        </div>
        <Anchor component={Link} href="/events" size="sm">
          Back to events
        </Anchor>
      </Group>

      <Paper withBorder p="md">
        <Group gap="md" align="flex-end" wrap="wrap">
          <SegmentedControl
            value={pdfLang}
            onChange={(value) => setPdfLang(value as "en" | "ta")}
            data={[
              { label: "English", value: "en" },
              { label: "தமிழ்", value: "ta" },
            ]}
          />
          <Button
            leftSection={<Download size={18} />}
            onClick={handleGeneratePdf}
            loading={generatingPdf}
          >
            Generate PDF
          </Button>
        </Group>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="md">
          <Text fw={600}>Event details</Text>
          <Group gap="md" wrap="wrap">
            <NumberInput
              label="Headcount"
              value={event.headcount}
              min={1}
              allowNegative={false}
              w={160}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
              }}
              onChange={(value) => handleHeadcountChange(typeof value === "number" ? value : 1)}
            />
            <Select
              label="Template"
              placeholder="Select a template"
              data={templateOptions}
              searchable
              clearable
              w={260}
              value={event.templateId ?? null}
              onChange={(value) => handleTemplateChange(value ?? null)}
            />
          </Group>
          <Text size="sm" c="dimmed">
            Changing the headcount or template recalculates the ingredient list below.
          </Text>
        </Stack>
      </Paper>

      <Tabs defaultValue="ingredients">
        <Tabs.List>
          <Tabs.Tab value="ingredients" leftSection={<Salad size={16} />}>
            Ingredients
          </Tabs.Tab>
          <Tabs.Tab value="employees" leftSection={<Users size={16} />}>
            Employees
          </Tabs.Tab>
          <Tabs.Tab value="utensils" leftSection={<UtensilsCrossed size={16} />}>
            Utensils
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ingredients" pt="md">
          {eventIngredients.length === 0 ? (
            <Text c="dimmed">
              No ingredients yet. Select a template and set a headcount to generate the scaled
              ingredient list.
            </Text>
          ) : (
            <Stack gap="md">
              <EventIngredientTable
                lines={eventIngredients}
                ingredients={ingredients}
                onLineChange={handleLineChange}
              />
              <EventIngredientCards
                lines={eventIngredients}
                ingredients={ingredients}
                onLineChange={handleLineChange}
              />
              <Paper withBorder p="md">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600}>Running total</Text>
                  <Text fw={700}>{formatINR(runningTotal)}</Text>
                </Group>
              </Paper>
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="employees" pt="md">
          <Stack gap="md">
            <Group gap="md" align="flex-end" wrap="wrap">
              <Select
                label="Assign existing employee"
                placeholder="Pick an employee"
                data={assignableEmployees.map((employee) => ({
                  value: employee.id,
                  label: employee.phone
                    ? `${employee.name} (${employee.phone})`
                    : employee.name,
                }))}
                searchable
                clearable
                w={280}
                value={assignValue}
                onChange={(value) => {
                  setAssignValue(null);
                  if (value) handleAddAssigned(value);
                }}
              />
              <Button
                leftSection={<Plus size={18} />}
                variant="default"
                onClick={() => setEmployeeFormOpened(true)}
              >
                Add one-off employee
              </Button>
            </Group>
            <Text size="xs" c="dimmed">
              Default rate is pre-filled from the master list and can be edited per event.
            </Text>

            {eventEmployees.length === 0 ? (
              <Text c="dimmed">
                No employees assigned yet. Assign an existing employee or add a one-off.
              </Text>
            ) : (
              <Stack gap="md">
                <EventEmployeeTable
                  lines={eventEmployees}
                  onLineChange={handleEmployeeLineChange}
                  onRemove={handleEmployeeRemove}
                />
                <EventEmployeeCards
                  lines={eventEmployees}
                  onLineChange={handleEmployeeLineChange}
                  onRemove={handleEmployeeRemove}
                />
                <Paper withBorder p="md">
                  <Stack gap={6}>
                    <Group justify="space-between" wrap="nowrap">
                      <Text fw={500}>Total to pay</Text>
                      <Text fw={600}>{formatINR(totalToPay)}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text fw={500}>Total paid</Text>
                      <Text fw={600}>{formatINR(totalPaid)}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text fw={600}>Total pending</Text>
                      <Text fw={700}>{formatINR(totalPending)}</Text>
                    </Group>
                  </Stack>
                </Paper>
              </Stack>
            )}

            <EventEmployeeFormModal
              opened={employeeFormOpened}
              onClose={() => setEmployeeFormOpened(false)}
              onAdd={handleAddAdhoc}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="utensils" pt="md">
          <Stack gap="md">
            <Group gap="md" align="flex-end" wrap="wrap">
              <Select
                label="Assign vendor"
                placeholder="Pick a vendor"
                data={masterVendors.map((vendor) => ({
                  value: vendor.id,
                  label: vendor.phone
                    ? `${vendor.name} (${vendor.phone})`
                    : vendor.name,
                }))}
                searchable
                clearable
                w={280}
                value={utensilVendorValue}
                onChange={(value) => setUtensilVendorValue(value)}
              />
              <Button
                leftSection={<Plus size={18} />}
                variant="default"
                disabled={!utensilVendorValue}
                onClick={() => setUtensilFormOpened(true)}
              >
                Add utensil
              </Button>
            </Group>
            <Text size="xs" c="dimmed">
              Select a vendor first, then add utensils with quantities and rental prices.
            </Text>

            {eventUtensils.length === 0 ? (
              <Text c="dimmed">
                No utensils assigned yet. Select a vendor and add utensils.
              </Text>
            ) : (
              <Stack gap="md">
                <EventUtensilTable
                  lines={eventUtensils}
                  onLineChange={handleUtensilLineChange}
                  onToggleReturned={handleToggleReturned}
                  onRemove={handleUtensilRemove}
                />
                <EventUtensilCards
                  lines={eventUtensils}
                  onLineChange={handleUtensilLineChange}
                  onToggleReturned={handleToggleReturned}
                  onRemove={handleUtensilRemove}
                />
                <Paper withBorder p="md">
                  <Group justify="space-between" wrap="nowrap">
                    <Text fw={600}>Total utensil cost</Text>
                    <Text fw={700}>{formatINR(totalUtensilCost)}</Text>
                  </Group>
                </Paper>
              </Stack>
            )}

            <EventUtensilFormModal
              opened={utensilFormOpened}
              onClose={() => setUtensilFormOpened(false)}
              onAdd={handleAddUtensilLine}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}