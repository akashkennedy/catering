"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Button,
  Group,
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
  EVENT_STATUS_PIPELINE,
  useEventsStore,
  type CateringEvent,
  type CateringEventInput,
  type EventStatus,
} from "@/store/events";

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

function buildEventSchema(isNew: boolean, currentDate?: string) {
  return z.object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().refine(
      (val) => val === "" || validatePhone(val),
      "Enter a valid 10-digit Indian mobile number"
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
  createPrefill?: Partial<EventFormValues>;
};

export function EventFormModal({ opened, event, onClose, createPrefill }: EventFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("full", "lg");
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
    formState: { errors },
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
    setAmountOverridden(
      event?.totalAmountOverridden ?? (createPrefill?.totalAmount ? true : false)
    );
    reset({
      name: event?.name ?? createPrefill?.name ?? "",
      phone: event?.phone ?? createPrefill?.phone ?? "",
      venue: event?.venue ?? createPrefill?.venue ?? "",
      address: event?.address ?? createPrefill?.address ?? "",
      functionType: event?.functionType ?? createPrefill?.functionType ?? "",
      headcount: event?.headcount ?? createPrefill?.headcount ?? 100,
      date: event?.date ?? createPrefill?.date ?? "",
      status: event?.status ?? createPrefill?.status ?? "enquiry",
      templateId: event?.templateId ?? createPrefill?.templateId ?? null,
      ratePerPerson: event?.ratePerPerson ?? createPrefill?.ratePerPerson ?? 0,
      totalAmount: event?.totalAmount ?? createPrefill?.totalAmount ?? 0,
      advancePaid: event?.advancePaid ?? createPrefill?.advancePaid ?? 0,
    });
  }, [opened, event, createPrefill, reset]);

  const templateOptions = templates.map((template) => ({
    value: template.id,
    label: template.name,
  }));

  const onSubmit = (values: EventFormValues) => {
    const selectedTemplate = templates.find((template) => template.id === values.templateId) ?? null;
    const scaledIngredients = buildScaledIngredients(
      selectedTemplate,
      ingredients,
      values.headcount
    );
    const input: CateringEventInput = {
      ...values,
      phone: formatPhone(values.phone),
      totalAmount: roundMoney(values.totalAmount),
      totalAmountOverridden: amountOverridden,
      ingredients: scaledIngredients,
      employees: [],
      utensils: [],
    };
    if (event) {
      const templateChanged = event.templateId !== values.templateId;
      const headcountChanged = event.headcount !== values.headcount;
      updateEvent(event.id, {
        ...input,
        employees: event.employees ?? [],
        utensils: event.utensils ?? [],
        ingredients:
          templateChanged || headcountChanged
            ? scaledIngredients
            : event.ingredients ?? [],
      });
    } else {
      addEvent(input);
    }
    onClose();
  };

  return (
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
                <Controller
                  name="templateId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={<Bilingual label={ui.common.template} />}
                      placeholder={preferredText(ui.events.selectTemplate, uiLanguage)}
                      data={templateOptions}
                      searchable
                      clearable
                      {...field}
                      value={field.value ?? null}
                      onChange={(value) => field.onChange(value ?? null)}
                    />
                  )}
                />
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
          <Button type="submit">
            {event ? (
              <Bilingual label={ui.common.save} />
            ) : (
              <Bilingual label={ui.common.add} />
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}