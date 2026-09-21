"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Anchor,
  Autocomplete,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { Download, Plus, Salad, Users, UtensilsCrossed } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

import { EventEmployeeCards } from "./EventEmployeeCards";
import { EventEmployeeFormModal } from "./EventEmployeeFormModal";
import { EventEmployeeTable } from "./EventEmployeeTable";
import { EventIngredientCards } from "./EventIngredientCards";
import { EventIngredientTable } from "./EventIngredientTable";
import { EventUtensilCards } from "./EventUtensilCards";
import { EventUtensilFormModal } from "./EventUtensilFormModal";
import { EventUtensilTable } from "./EventUtensilTable";
import { Bilingual } from "@/components/Bilingual";
import { ListPageSkeleton } from "@/components/LoadingSkeletons";
import { ui, preferredText } from "@/lib/i18n";
import { formatIndianDate } from "@/lib/date";
import { formatINR } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import {
  useEventsStore,
  buildScaledIngredients,
  buildScaledIngredientsForGroups,
  type CateringEventInput,
  type EventMealGroup,
} from "@/store/events";
import { MealGroupsEditor } from "./MealGroupsEditor";
import { useEmployeesStore } from "@/store/employees";
import { useIngredientsStore } from "@/store/ingredients";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";
import { useTemplatesStore } from "@/store/templates";
import { useVendorSuggestionsStore } from "@/store/vendorSuggestions";
import { PrintPreviewModal } from "./PrintPreviewModal";
import { EVENT_STATUS_OPTIONS } from "./EventFormModal";
import {
  detectTransition,
  openConfirmedInvoice,
  openFeedbackRequest,
  openPaymentReceived,
} from "@/lib/statusTransitions";
import {
  eventBalance,
  eventEmployeePaid,
  eventEmployeePending,
  eventEmployeeToPay,
  eventIngredientCost,
  eventRentalCost,
} from "@/lib/eventFinances";

/** Renders and coordinates the editable details of the selected event. */
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
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const [employeeFormOpened, setEmployeeFormOpened] = useState(false);
  const [utensilFormOpened, setUtensilFormOpened] = useState(false);
  const [assignValue, setAssignValue] = useState<string | null>(null);
  const [utensilVendorName, setUtensilVendorName] = useState("");
  const [printOpened, setPrintOpened] = useState(false);
  const canViewAllPay = useAuthStore(
    (state) => state.isAdmin || state.permissions.canViewOtherEmployeeRates
  );
  const ownEmployeeId = useAuthStore((state) => state.employeeId);
  // Null = full pay visibility; otherwise only the viewer's own linked lines.
  const visiblePayFor =
    canViewAllPay || !ownEmployeeId ? null : new Set<string>([ownEmployeeId]);
  const loadEvents = useEventsStore((state) => state.loadEvents);
  const eventsLoaded = useEventsStore((state) => state.loaded);
  // Render only the matching list variant (table xor cards) instead of
  // mounting both and hiding one with CSS.
  const isMobile = useMediaQuery("(max-width: 639px)");
  const loadTemplates = useTemplatesStore((state) => state.loadTemplates);
  const loadIngredients = useIngredientsStore((state) => state.loadIngredients);
  const loadVesselLedger = useVesselStockLedgerStore((state) => state.loadVesselLedger);
  const loadVendorSuggestions = useVendorSuggestionsStore(
    (state) => state.loadVendorSuggestions
  );

  useEffect(() => {
    void loadEvents();
    void loadTemplates();
    void loadIngredients();
    void loadVesselLedger();
    void loadVendorSuggestions();
  }, [loadEvents, loadTemplates, loadIngredients, loadVesselLedger, loadVendorSuggestions]);

  if (!event) {
    if (!eventsLoaded) {
      return <ListPageSkeleton />;
    }
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

  const eventIngredients = event.ingredients ?? [];
  const eventEmployees = event.employees ?? [];
  const eventUtensils = event.utensils ?? [];
  const mealGroups = event.mealGroups ?? [];

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
      mealGroups,
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

  const rescaleForGroups = (groups: EventMealGroup[]) =>
    buildScaledIngredientsForGroups(groups, templates, ingredients);

  const handleHeadcountChange = (headcount: number) => {
    const patch: Partial<CateringEventInput> = { headcount };
    if (mealGroups.length === 0) {
      const template = templates.find((item) => item.id === event.templateId) ?? null;
      patch.ingredients = buildScaledIngredients(template, ingredients, headcount);
    }
    if (!event.totalAmountOverridden) {
      patch.totalAmount = roundMoney(event.ratePerPerson * headcount);
    }
    update(patch);
  };

  const handleGroupsChange = (groups: EventMealGroup[]) => {
    update({
      mealGroups: groups,
      templateId: groups[0]?.templateId ?? null,
      ingredients: rescaleForGroups(groups),
    });
  };

  const handleStatusChange = (status: CateringEventInput["status"]) => {
    const transition = detectTransition(event.status, status);
    update({ status });
    if (transition === "confirmed") {
      openConfirmedInvoice({ ...event, status });
    } else if (transition === "paid") {
      openPaymentReceived({ ...event, status });
    } else if (transition === "completed") {
      openFeedbackRequest({ ...event, status });
    }
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
    patch: { qty?: number; price?: number }
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
          <Button leftSection={<Download size={18} />} onClick={() => setPrintOpened(true)}>
            <Bilingual label={ui.events.invoice} />
          </Button>
        </Group>
      </Paper>

      <PrintPreviewModal
        opened={printOpened}
        event={event}
        ingredients={ingredients}
        onLineChange={handleLineChange}
        onClose={() => setPrintOpened(false)}
      />

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
              w={{ base: "100%", sm: 160 }}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
              }}
              onChange={(value) => handleHeadcountChange(typeof value === "number" ? value : 1)}
            />
            <div style={{ flex: "1 1 100%" }}>
              <Text fw={500} size="sm" mb={4}>
                <Bilingual label={ui.events.meals} />
              </Text>
              <MealGroupsEditor
                groups={mealGroups}
                templates={templates}
                defaultHeadcount={event.headcount}
                onChange={handleGroupsChange}
              />
            </div>
            <Select
              label={<Bilingual label={ui.common.status} />}
              data={EVENT_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: preferredText(option.label, uiLanguage),
              }))}
              w={{ base: "100%", sm: 180 }}
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
              w={{ base: "100%", sm: 160 }}
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
              w={{ base: "100%", sm: 180 }}
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
              w={{ base: "100%", sm: 180 }}
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
              {isMobile ? (
                <EventIngredientCards
                  lines={eventIngredients}
                  ingredients={ingredients}
                  onLineChange={handleLineChange}
                />
              ) : (
                <EventIngredientTable
                  lines={eventIngredients}
                  ingredients={ingredients}
                  onLineChange={handleLineChange}
                />
              )}
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
                placeholder={preferredText(ui.events.pickEmployee, uiLanguage)}
                data={assignableEmployees.map((employee) => ({
                  value: employee.id,
                  label: employee.phone
                    ? `${employee.name} (${formatPhone(employee.phone)})`
                    : employee.name,
                }))}
                searchable
                clearable
                w={{ base: "100%", sm: 280 }}
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
              {isMobile ? (
                <EventEmployeeCards
                  lines={eventEmployees}
                  onLineChange={handleEmployeeLineChange}
                  onRemove={handleEmployeeRemove}
                  visiblePayFor={visiblePayFor}
                />
              ) : (
                <EventEmployeeTable
                  lines={eventEmployees}
                  onLineChange={handleEmployeeLineChange}
                  onRemove={handleEmployeeRemove}
                  visiblePayFor={visiblePayFor}
                />
              )}
                {canViewAllPay && (
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
                )}
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
                placeholder={preferredText(ui.events.vendorPlaceholder, uiLanguage)}
                data={vendorSuggestions}
                w={{ base: "100%", sm: 280 }}
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
              {isMobile ? (
                <EventUtensilCards
                  lines={eventUtensils}
                  onLineChange={handleUtensilLineChange}
                  onToggleReturned={handleToggleReturned}
                  onRemove={handleUtensilRemove}
                />
              ) : (
                <EventUtensilTable
                  lines={eventUtensils}
                  onLineChange={handleUtensilLineChange}
                  onToggleReturned={handleToggleReturned}
                  onRemove={handleUtensilRemove}
                />
              )}
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
