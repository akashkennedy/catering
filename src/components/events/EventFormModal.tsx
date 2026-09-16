"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { useTemplatesStore } from "@/store/templates";
import { useIngredientsStore } from "@/store/ingredients";
import { validatePhone, formatPhone } from "@/lib/phone";
import { ui, labelText, type Label } from "@/lib/i18n";
import { todayLocalISO as todayISO } from "@/lib/date";
import { Bilingual } from "@/components/Bilingual";
import {
  buildScaledIngredients,
  useEventsStore,
  type CateringEvent,
  type CateringEventInput,
  type ClientPaymentStatus,
  type EventStatus,
} from "@/store/events";

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: Label }[] = [
  { value: "planned", label: ui.events.statusPlanned },
  { value: "confirmed", label: ui.events.statusConfirmed },
  { value: "completed", label: ui.events.statusCompleted },
  { value: "cancelled", label: ui.events.statusCancelled },
];

export const CLIENT_PAYMENT_OPTIONS: { value: ClientPaymentStatus; label: Label }[] = [
  { value: "pending", label: ui.events.paymentPending },
  { value: "partial", label: ui.events.paymentPartial },
  { value: "paid", label: ui.events.paymentPaid },
];

function buildEventSchema(isNew: boolean, currentDate?: string) {
  return z.object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().refine(
      (val) => val === "" || validatePhone(val),
      "Enter a valid 10-digit Indian mobile number"
    ),
    location: z.string().trim(),
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
    status: z.enum(["planned", "confirmed", "completed", "cancelled"]),
    templateId: z.string().nullable(),
    clientPaymentStatus: z.enum(["pending", "partial", "paid"]),
    totalQuoted: z.coerce.number().min(0, "Total quoted must be 0 or more"),
  });
}

const STATUS_DATA = EVENT_STATUS_OPTIONS.map((o) => ({
  value: o.value,
  label: labelText(o.label),
}));

const PAYMENT_DATA = CLIENT_PAYMENT_OPTIONS.map((o) => ({
  value: o.value,
  label: labelText(o.label),
}));

type EventFormValues = {
  name: string;
  phone: string;
  location: string;
  headcount: number;
  date: string;
  status: EventStatus;
  templateId: string | null;
  clientPaymentStatus: ClientPaymentStatus;
  totalQuoted: number;
};

type EventFormModalProps = {
  opened: boolean;
  event: CateringEvent | null;
  onClose: () => void;
  createPrefill?: Partial<EventFormValues>;
};

export function EventFormModal({ opened, event, onClose, createPrefill }: EventFormModalProps) {
  const addEvent = useEventsStore((state) => state.addEvent);
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const templates = useTemplatesStore((state) => state.templates);
  const ingredients = useIngredientsStore((state) => state.ingredients);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(buildEventSchema(!event, event?.date)),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      headcount: 100,
      date: "",
      status: "planned",
      templateId: null,
      clientPaymentStatus: "pending",
      totalQuoted: 0,
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: event?.name ?? createPrefill?.name ?? "",
      phone: event?.phone ?? createPrefill?.phone ?? "",
      location: event?.location ?? createPrefill?.location ?? "",
      headcount: event?.headcount ?? createPrefill?.headcount ?? 100,
      date: event?.date ?? createPrefill?.date ?? "",
      status: event?.status ?? createPrefill?.status ?? "planned",
      templateId: event?.templateId ?? createPrefill?.templateId ?? null,
      clientPaymentStatus:
        event?.clientPaymentStatus ?? createPrefill?.clientPaymentStatus ?? "pending",
      totalQuoted: event?.totalQuoted ?? createPrefill?.totalQuoted ?? 0,
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
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.common.name} />}
            placeholder={labelText(ui.events.namePlaceholder)}
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label={<Bilingual label={ui.common.phone} />}
            placeholder={labelText(ui.events.phonePlaceholder)}
            {...register("phone")}
            error={errors.phone?.message}
          />
          <TextInput
            label={<Bilingual label={ui.common.location} />}
            placeholder={labelText(ui.events.locationPlaceholder)}
            {...register("location")}
            error={errors.location?.message}
          />
          <Controller
            name="headcount"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.common.headcount} />}
                placeholder={labelText(ui.events.headcountPlaceholder)}
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
                data={STATUS_DATA}
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
                placeholder={labelText(ui.events.selectTemplate)}
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
            name="totalQuoted"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.events.totalQuoted} />}
                placeholder="0"
                min={0}
                allowNegative={false}
                decimalScale={2}
                leftSection="₹"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.totalQuoted?.message}
              />
            )}
          />
          <Controller
            name="clientPaymentStatus"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.events.clientPaymentStatus} />}
                data={PAYMENT_DATA}
                withAsterisk
                {...field}
              />
            )}
          />
          <Group justify="flex-end" mt="md">
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
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}