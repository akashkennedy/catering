"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Button,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import { useTemplatesStore } from "@/store/templates";
import { useIngredientsStore } from "@/store/ingredients";
import { validatePhone, formatPhone } from "@/lib/phone";
import { ui, preferredText, type Label } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { todayLocalISO as todayISO } from "@/lib/date";
import { formatINR } from "@/lib/format";
import { Bilingual } from "@/components/Bilingual";
import {
  buildScaledIngredients,
  buildScaledIngredientsForGroups,
  EVENT_STATUS_PIPELINE,
  useEventsStore,
  type CateringEvent,
  type CateringEventInput,
  type EventMealGroup,
  type EventStatus,
} from "@/store/events";
import { newClientId } from "@/lib/storeSync";
import {
  detectTransition,
  openConfirmedInvoice,
  openEnquiryMenus,
  openFeedbackRequest,
  openPaymentReceived,
} from "@/lib/statusTransitions";
import { emptyMealGroup, MealGroupsEditor } from "./MealGroupsEditor";

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: Label }[] = [
  { value: "enquiry", label: ui.events.statusEnquiry },
  { value: "confirmed", label: ui.events.statusConfirmed },
  { value: "preparing", label: ui.events.statusPreparing },
  { value: "completed", label: ui.events.statusCompleted },
  { value: "paid", label: ui.events.statusPaid },
];

const FUNCTION_TYPE_OPTIONS = [
  "Wedding",
  "Reception",
  "Birthday",
  "Naming ceremony",
  "Housewarming",
  "Corporate",
  "Festival",
  "Other",
];

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function asNumber(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  return Number(value) || 0;
}

/** Builds event validation rules for either a new or existing event. */
function buildEventSchema(isNew: boolean, currentDate?: string) {
  return z.object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().refine(
      (val) => val === "" || validatePhone(val),
      "Enter a valid 10-digit phone number"
    ),
    venue: z.string().trim(),
    address: z.string().trim(),
    functionType: z.string().trim(),
    headcount: z.coerce.number().min(1, "Headcount must be 1 or more"),
    date: z
      .string()
      .min(1, "Date is required")
      .refine(
        (val) =>
          !isNew
            ? val >= todayISO() || val === currentDate
            : val >= todayISO(),
        "Cannot select a date in the past"
      ),
    status: z.enum(EVENT_STATUS_PIPELINE),
    templateId: z.string().nullable(),
    ratePerPerson: z.coerce.number().min(0, "Rate per person must be 0 or more"),
    totalAmount: z.coerce.number().min(0, "Total amount must be 0 or more"),
    advancePaid: z.coerce.number().min(0, "Advance must be 0 or more"),
  });
}

type EventFormValues = {
  name: string;
  phone: string;
  venue: string;
  address: string;
  functionType: string;
  headcount: number;
  date: string;
  status: EventStatus;
  templateId: string | null;
  ratePerPerson: number;
  totalAmount: number;
  advancePaid: number;
};

type EventFormModalProps = {
  opened: boolean;
  event: CateringEvent | null;
  onClose: () => void;
};

/** Creates or updates an event through the responsive event form. */
export function EventFormModal({ opened, event, onClose }: EventFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("full", "xl");
  const statusData = EVENT_STATUS_OPTIONS.map((o) => ({
    value: o.value,
    label: preferredText(o.label, uiLanguage),
  }));
  const addEvent = useEventsStore((state) => state.addEvent);
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const templates = useTemplatesStore((state) => state.templates);
  const ingredients = useIngredientsStore((state) => state.ingredients);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(buildEventSchema(!event, event?.date)),
    defaultValues: {
      name: "",
      phone: "",
      venue: "",
      address: "",
      functionType: "",
      headcount: 100,
      date: "",
      status: "enquiry",
      templateId: null,
      ratePerPerson: 0,
      totalAmount: 0,
      advancePaid: 0,
    },
  });

  const headcount = watch("headcount");
  const ratePerPerson = watch("ratePerPerson");
  const totalAmount = watch("totalAmount");
  const advancePaid = watch("advancePaid");
  const [amountOverridden, setAmountOverridden] = useState(false);
  const [mealGroups, setMealGroups] = useState<EventMealGroup[]>([]);
  const balance = roundMoney(asNumber(totalAmount) - asNumber(advancePaid));

  useEffect(() => {
    if (amountOverridden) return;
    const computed = roundMoney(asNumber(ratePerPerson) * asNumber(headcount));
    if (asNumber(totalAmount) !== computed) {
      setValue("totalAmount", computed, { shouldValidate: false });
    }
  }, [headcount, ratePerPerson, amountOverridden, totalAmount, setValue]);

  useEffect(() => {
    if (!opened) return;
    setAmountOverridden(event?.totalAmountOverridden ?? false);
    const initialHeadcount = event?.headcount ?? 100;
    const initialTemplateId = event?.templateId ?? null;
    const initialGroups =
      event?.mealGroups && event.mealGroups.length > 0
        ? event.mealGroups
        : initialTemplateId
          ? [
              {
                ...emptyMealGroup(initialHeadcount),
                templateId: initialTemplateId,
                selectedDishIds: [],
              },
            ]
          : [{ ...emptyMealGroup(initialHeadcount), templateId: null }];
    setMealGroups(initialGroups);
    reset({
      name: event?.name ?? "",
      phone: event?.phone ?? "",
      venue: event?.venue ?? "",
      address: event?.address ?? "",
      functionType: event?.functionType ?? "",
      headcount: initialHeadcount,
      date: event?.date ?? "",
      status: event?.status ?? "enquiry",
      templateId: initialTemplateId,
      ratePerPerson: event?.ratePerPerson ?? 0,
      totalAmount: event?.totalAmount ?? 0,
      advancePaid: event?.advancePaid ?? 0,
    });
  }, [opened, event, reset]);

  const handleGroupsChange = (groups: EventMealGroup[]) => {
    setMealGroups(groups);
    setValue("templateId", groups[0]?.templateId ?? null, { shouldValidate: false });
  };

  const onSubmit = (values: EventFormValues) => {
    const groups = mealGroups;
    const hasGroupTemplate = groups.some((group) => group.templateId);
    const selectedTemplate = templates.find((template) => template.id === values.templateId) ?? null;
    const scaledIngredients = hasGroupTemplate
      ? buildScaledIngredientsForGroups(groups, templates, ingredients)
      : buildScaledIngredients(selectedTemplate, ingredients, values.headcount);
    const resolvedTemplateId = hasGroupTemplate
      ? (groups[0]?.templateId ?? null)
      : values.templateId;
    const input: CateringEventInput = {
      ...values,
      templateId: resolvedTemplateId,
      mealGroups: groups,
      phone: formatPhone(values.phone),
      totalAmount: roundMoney(values.totalAmount),
      totalAmountOverridden: amountOverridden,
      ingredients: scaledIngredients,
      employees: [],
      utensils: [],
    };
    if (event) {
      const templateChanged = event.templateId !== resolvedTemplateId;
      const headcountChanged = event.headcount !== values.headcount;
      const groupsChanged =
        JSON.stringify(event.mealGroups ?? []) !== JSON.stringify(groups);
      const nextIngredients =
        templateChanged || headcountChanged || groupsChanged
          ? scaledIngredients
          : event.ingredients ?? [];
      const transition = detectTransition(event.status, values.status);
      const nextEvent: CateringEvent = {
        ...event,
        ...input,
        employees: event.employees ?? [],
        utensils: event.utensils ?? [],
        ingredients: nextIngredients,
      };
      updateEvent(event.id, {
        ...input,
        employees: event.employees ?? [],
        utensils: event.utensils ?? [],
        ingredients: nextIngredients,
      });
      if (transition === "enquiry") {
        openEnquiryMenus(nextEvent);
      } else if (transition === "confirmed") {
        openConfirmedInvoice(nextEvent);
      } else if (transition === "paid") {
        openPaymentReceived(nextEvent);
      } else if (transition === "completed") {
        openFeedbackRequest(nextEvent);
      }
    } else {
      const id = newClientId();
      const created: CateringEvent = { id, ...input };
      const transition = detectTransition(null, values.status);
      if (transition === "enquiry") {
        openEnquiryMenus(created);
      } else if (transition === "confirmed") {
        openConfirmedInvoice(created);
      } else if (transition === "paid") {
        openPaymentReceived(created);
      }
      if (transition === "completed") {
        openFeedbackRequest(created);
      }
      void addEvent({ ...input, id });
    }
    onClose();
  };

  return (
    <>
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        event ? (
          <Bilingual label={ui.events.editEvent} />
        ) : (
          <Bilingual label={ui.events.addEvent} />
        )
      }
      {...sheet}
      styles={{
        body: { padding: 0, overflowY: "auto" },
        content: { overflow: "auto" },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-two-col">
          <div className="form-two-col__left">
            <div className="form-section">
              <h4 className="form-section__title">
                <Bilingual label={ui.events.eventDetails} />
              </h4>
              <div className="form-two-col__grid">
                <TextInput
                  label={<Bilingual label={ui.common.name} />}
                  placeholder={preferredText(ui.events.namePlaceholder, uiLanguage)}
                  withAsterisk
                  {...register("name")}
                  error={errors.name?.message}
                />
                <Controller
                  name="functionType"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      label={<Bilingual label={ui.events.functionType} />}
                      placeholder={preferredText({
                        en: "e.g. Wedding",
                        ta: "எ.கா. திருமணம்",
                      }, uiLanguage)}
                      data={FUNCTION_TYPE_OPTIONS}
                      {...field}
                      value={field.value ?? ""}
                      error={errors.functionType?.message}
                    />
                  )}
                />
                <TextInput
                  label={<Bilingual label={ui.common.date} />}
                  type="date"
                  withAsterisk
                  {...register("date")}
                  min={!event ? todayISO() : undefined}
                  error={errors.date?.message}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={<Bilingual label={ui.common.status} />}
                      data={statusData}
                      withAsterisk
                      {...field}
                    />
                  )}
                />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Text fw={500} size="sm" mb={4}>
                    <Bilingual label={ui.events.meals} />
                  </Text>
                  <MealGroupsEditor
                    groups={mealGroups}
                    templates={templates}
                    defaultHeadcount={typeof headcount === "number" ? headcount : 100}
                    onChange={handleGroupsChange}
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    <Bilingual label={ui.events.headcountNote} />
                  </Text>
                </div>
                <Controller
                  name="headcount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label={<Bilingual label={ui.common.headcount} />}
                      placeholder={preferredText(ui.events.headcountPlaceholder, uiLanguage)}
                      min={1}
                      allowNegative={false}
                      withAsterisk
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                      }}
                      error={errors.headcount?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section__title">
                <Bilingual label={ui.events.customerDetails} />
              </h4>
              <div className="form-two-col__grid">
                <TextInput
                  label={<Bilingual label={ui.common.phone} />}
                  placeholder={preferredText(ui.events.phonePlaceholder, uiLanguage)}
                  {...register("phone")}
                  error={errors.phone?.message}
                />
                <TextInput
                  label={<Bilingual label={ui.events.venue} />}
                  placeholder={preferredText(ui.events.venuePlaceholder, uiLanguage)}
                  {...register("venue")}
                  error={errors.venue?.message}
                />
                <TextInput
                  label={<Bilingual label={ui.events.address} />}
                  placeholder={preferredText(ui.events.addressPlaceholder, uiLanguage)}
                  style={{ gridColumn: "1 / -1" }}
                  {...register("address")}
                  error={errors.address?.message}
                />
              </div>
            </div>
          </div>

          <div className="form-two-col__right">
            <div className="form-section">
              <h4 className="form-section__title">
                <Bilingual label={ui.events.pricing} />
              </h4>
              <Stack gap="md">
                <Controller
                  name="ratePerPerson"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label={<Bilingual label={ui.events.ratePerPerson} />}
                      placeholder="0"
                      min={0}
                      allowNegative={false}
                      decimalScale={2}
                      leftSection="₹"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                      }}
                      error={errors.ratePerPerson?.message}
                    />
                  )}
                />
                <Controller
                  name="totalAmount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label={<Bilingual label={ui.events.totalAmount} />}
                      description={<Bilingual label={ui.events.totalAmountHint} />}
                      placeholder="0"
                      min={0}
                      allowNegative={false}
                      decimalScale={2}
                      leftSection="₹"
                      {...field}
                      onChange={(value) => {
                        field.onChange(value);
                        setAmountOverridden(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                      }}
                      error={errors.totalAmount?.message}
                    />
                  )}
                />
                <Controller
                  name="advancePaid"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      label={<Bilingual label={ui.events.advancePaid} />}
                      placeholder="0"
                      min={0}
                      allowNegative={false}
                      decimalScale={2}
                      leftSection="₹"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                      }}
                      error={errors.advancePaid?.message}
                    />
                  )}
                />
                <div className="form-balance">
                  <Text fw={600} size="sm">
                    <Bilingual label={ui.events.balance} />
                  </Text>
                  <Text fw={700} size="lg">{formatINR(balance)}</Text>
                </div>
              </Stack>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button variant="default" onClick={onClose}>
            <Bilingual label={ui.common.cancel} />
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {event ? (
              <Bilingual label={ui.common.save} />
            ) : (
              <Bilingual label={ui.common.add} />
            )}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
}
