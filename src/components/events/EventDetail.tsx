"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Anchor,
  Autocomplete,
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
import { Bilingual } from "@/components/Bilingual";
import { ui, labelText } from "@/lib/i18n";
import { formatIndianDate } from "@/lib/date";
import { formatINR } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { useEventsStore, buildScaledIngredients, type CateringEventInput } from "@/store/events";
import { useEmployeesStore } from "@/store/employees";
import { useIngredientsStore } from "@/store/ingredients";
import { useSettingsStore } from "@/store/settings";
import { useTemplatesStore } from "@/store/templates";
import { useVendorSuggestionsStore } from "@/store/vendorSuggestions";
import { generateEventPdf } from "@/lib/pdf";
import { EVENT_STATUS_OPTIONS } from "./EventFormModal";
import {
  eventBalance,
  eventEmployeePaid,
  eventEmployeePending,
  eventEmployeeToPay,
  eventIngredientCost,
  eventRentalCost,
} from "@/lib/eventFinances";

export function EventDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const event = useEventsStore((state) => state.events.find((item) => item.id === id));
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const templates = useTemplatesStore((state) => state.templates);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const masterEmployees = useEmployeesStore((state) => state.employees);
  const vendorSuggestions = useVendorSuggestionsStore((state) => state.vendorSuggestions);
  const addVendorSuggestion = useVendorSuggestionsStore((state) => state.addVendorSuggestion);
  const defaultLanguage = useSettingsStore((state) => state.defaultLanguage);
  const [employeeFormOpened, setEmployeeFormOpened] = useState(false);
  const [utensilFormOpened, setUtensilFormOpened] = useState(false);
  const [assignValue, setAssignValue] = useState<string | null>(null);
  const [utensilVendorName, setUtensilVendorName] = useState("");
  const [pdfLang, setPdfLang] = useState<"en" | "ta">(defaultLanguage);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  if (!event) {
    return (
      <Stack gap="md">
        <Title order={1}>Event Detail</Title>
        <Text c="dimmed">Event not found.</Text>
        <Anchor component={Link} href="/events">
          <Bilingual label={{ en: "Back to events", ta: "நிகழ்வுகளுக்குத் திரும்பு" }} />
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

  const update = (patch: Partial<CateringEventInput>) => {
    updateEvent(event.id, {
      name: event.name,
      phone: event.phone,
      venue: event.venue,
      address: event.address,
      functionType: event.functionType,
      headcount: event.headcount,
      date: event.date,
      status: event.status,
      templateId: event.templateId,
      ratePerPerson: event.ratePerPerson,
      totalAmount: event.totalAmount,
      totalAmountOverridden: event.totalAmountOverridden,
      advancePaid: event.advancePaid,
      ingredients: eventIngredients,
      employees: eventEmployees,
      utensils: eventUtensils,
      ...patch,
    });
  };

  const roundMoney = (value: number) => Math.round(value * 100) / 100;

  const handleHeadcountChange = (headcount: number) => {
    const template = templates.find((item) => item.id === event.templateId) ?? null;
    const patch: Partial<CateringEventInput> = {
      headcount,
      ingredients: buildScaledIngredients(template, ingredients, headcount),
    };
    if (!event.totalAmountOverridden) {
      patch.totalAmount = roundMoney(event.ratePerPerson * headcount);
    }
    update(patch);
  };

  const handleTemplateChange = (templateId: string | null) => {
    const template = templates.find((item) => item.id === templateId) ?? null;
    update({
      templateId,
      ingredients: buildScaledIngredients(template, ingredients, event.headcount),
    });
  };

  const handleStatusChange = (status: CateringEventInput["status"]) => {
    update({ status });
  };

  const handleRateChange = (value: number | string) => {
    const rate = typeof value === "number" && Number.isFinite(value) ? value : 0;
    const patch: Partial<CateringEventInput> = { ratePerPerson: rate };
    if (!event.totalAmountOverridden) {
      patch.totalAmount = roundMoney(rate * event.headcount);
    }
    update(patch);
  };

  const handleTotalAmountChange = (value: number | string) => {
    const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
    update({ totalAmount: roundMoney(amount), totalAmountOverridden: true });
  };

  const handleAdvanceChange = (value: number | string) => {
    const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
    update({ advancePaid: roundMoney(amount) });
  };

  const handleLineChange = (
    lineId: string,
    patch: { qty?: number; price?: number; purchased?: boolean }
  ) => {
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
    const vendorName = utensilVendorName.trim() || "Unknown vendor";
    addVendorSuggestion(vendorName);
    update({
      utensils: [
        ...eventUtensils,
        {
          id: crypto.randomUUID(),
          vendorName,
          vendorPhone: "",
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

  const runningTotal = eventIngredientCost(event);
  const totalToPay = eventEmployeeToPay(event);
  const totalPaid = eventEmployeePaid(event);
  const totalPending = eventEmployeePending(event);
  const totalUtensilCost = eventRentalCost(event);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="baseline">
        <div>
          <Title order={1}>{event.name}</Title>
          <Text size="sm" c="dimmed">
            {event.date ? formatIndianDate(event.date) : <Bilingual label={ui.common.noDate} />} ·{" "}
            <Bilingual label={ui.guests(event.headcount)} />
          </Text>
        </div>
        <Anchor component={Link} href="/events" size="sm">
          <Bilingual
            label={{ en: "Back to events", ta: "நிகழ்வுகளுக்குத் திரும்பு" }}
          />
        </Anchor>
      </Group>

      <Paper withBorder p="md">
        <Group gap="md" align="flex-end" wrap="wrap">
          <SegmentedControl
            value={pdfLang}
            onChange={(value) => setPdfLang(value as "en" | "ta")}
            data={[
              { label: <Bilingual label={ui.settings.english} />, value: "en" },
              { label: <Bilingual label={ui.settings.tamil} />, value: "ta" },
            ]}
          />
          <Button
            leftSection={<Download size={18} />}
            onClick={handleGeneratePdf}
            loading={generatingPdf}
          >
            <Bilingual label={ui.events.generatePdf} />
          </Button>
        </Group>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="md">
          <Text fw={600}>
            <Bilingual label={ui.events.eventDetails} />
          </Text>
          <Group gap="md" wrap="wrap">
            <NumberInput
              label={<Bilingual label={ui.common.headcount} />}
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
              label={<Bilingual label={ui.common.template} />}
              placeholder={labelText(ui.events.selectTemplate)}
              data={templateOptions}
              searchable
              clearable
              w={260}
              value={event.templateId ?? null}
              onChange={(value) => handleTemplateChange(value ?? null)}
            />
            <Select
              label={<Bilingual label={ui.common.status} />}
              data={EVENT_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: labelText(option.label),
              }))}
              w={180}
              value={event.status}
              onChange={(value) => handleStatusChange((value ?? "enquiry") as CateringEventInput["status"])}
            />
          </Group>
          <Text size="sm" c="dimmed">
            <Bilingual label={ui.events.headcountNote} />
          </Text>
          <Group gap="md" wrap="wrap">
            <NumberInput
              label={<Bilingual label={ui.events.ratePerPerson} />}
              value={event.ratePerPerson}
              min={0}
              allowNegative={false}
              decimalScale={2}
              leftSection="₹"
              w={160}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
              }}
              onChange={handleRateChange}
            />
            <NumberInput
              label={<Bilingual label={ui.events.totalAmount} />}
              value={event.totalAmount}
              min={0}
              allowNegative={false}
              decimalScale={2}
              leftSection="₹"
              w={180}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
              }}
              onChange={handleTotalAmountChange}
            />
            <NumberInput
              label={<Bilingual label={ui.events.advancePaid} />}
              value={event.advancePaid}
              min={0}
              allowNegative={false}
              decimalScale={2}
              leftSection="₹"
              w={180}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
              }}
              onChange={handleAdvanceChange}
            />
            <Group gap={6}>
              <Text fw={600}>
                <Bilingual label={ui.events.balance} />
              </Text>
              <Text fw={700}>{formatINR(eventBalance(event))}</Text>
            </Group>
          </Group>
          {event.venue || event.address ? (
            <Text size="sm" c="dimmed">
              {[event.venue, event.address].filter(Boolean).join(" · ")}
            </Text>
          ) : null}
        </Stack>
      </Paper>

      <Tabs defaultValue="ingredients">
        <Tabs.List>
          <Tabs.Tab value="ingredients" leftSection={<Salad size={16} />}>
            <Bilingual label={ui.events.tabIngredients} />
          </Tabs.Tab>
          <Tabs.Tab value="employees" leftSection={<Users size={16} />}>
            <Bilingual label={ui.events.tabEmployees} />
          </Tabs.Tab>
          <Tabs.Tab value="utensils" leftSection={<UtensilsCrossed size={16} />}>
            <Bilingual label={ui.events.tabRental} />
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ingredients" pt="md">
          {eventIngredients.length === 0 ? (
            <Text c="dimmed">
              <Bilingual label={ui.events.noIngredients} />
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
                  <Text fw={600}>
                    <Bilingual label={ui.events.runningTotal} />
                  </Text>
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
                label={<Bilingual label={ui.events.assignExistingEmployee} />}
                placeholder={labelText(ui.events.pickEmployee)}
                data={assignableEmployees.map((employee) => ({
                  value: employee.id,
                  label: employee.phone
                    ? `${employee.name} (${formatPhone(employee.phone)})`
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
                <Bilingual label={ui.events.addOneOffEmployee} />
              </Button>
            </Group>
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.events.defaultRateNote} />
            </Text>

            {eventEmployees.length === 0 ? (
              <Text c="dimmed">
                <Bilingual label={ui.events.noEmployees} />
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
                      <Text fw={500}>
                        <Bilingual label={ui.events.totalToPay} />
                      </Text>
                      <Text fw={600}>{formatINR(totalToPay)}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text fw={500}>
                        <Bilingual label={ui.events.totalPaid} />
                      </Text>
                      <Text fw={600}>{formatINR(totalPaid)}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text fw={600}>
                        <Bilingual label={ui.events.totalPending} />
                      </Text>
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
              <Autocomplete
                label={<Bilingual label={ui.events.vendor} />}
                placeholder={labelText(ui.events.vendorPlaceholder)}
                data={vendorSuggestions}
                w={280}
                value={utensilVendorName}
                onChange={(value) => setUtensilVendorName(value)}
              />
              <Button
                leftSection={<Plus size={18} />}
                variant="default"
                disabled={!utensilVendorName.trim()}
                onClick={() => setUtensilFormOpened(true)}
              >
                <Bilingual label={ui.events.addUtensil} />
              </Button>
            </Group>
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.events.vendorNote} />
            </Text>

            {eventUtensils.length === 0 ? (
              <Text c="dimmed">
                <Bilingual label={ui.events.noUtensils} />
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
                    <Text fw={600}>
                      <Bilingual label={ui.events.totalRentalCost} />
                    </Text>
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