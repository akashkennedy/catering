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
import {
  buildScaledIngredients,
  useEventsStore,
  type CateringEvent,
  type CateringEventInput,
  type ClientPaymentStatus,
  type EventStatus,
} from "@/store/events";

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const CLIENT_PAYMENT_OPTIONS: { value: ClientPaymentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

const eventSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim(),
  location: z.string().trim(),
  headcount: z.coerce.number().min(1, "Headcount must be 1 or more"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["planned", "confirmed", "completed", "cancelled"]),
  templateId: z.string().nullable(),
  clientPaymentStatus: z.enum(["pending", "partial", "paid"]),
});

type EventFormValues = z.infer<typeof eventSchema>;

type EventFormModalProps = {
  opened: boolean;
  event: CateringEvent | null;
  onClose: () => void;
};

export function EventFormModal({ opened, event, onClose }: EventFormModalProps) {
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
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      headcount: 100,
      date: "",
      status: "planned",
      templateId: null,
      clientPaymentStatus: "pending",
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: event?.name ?? "",
      phone: event?.phone ?? "",
      location: event?.location ?? "",
      headcount: event?.headcount ?? 100,
      date: event?.date ?? "",
      status: event?.status ?? "planned",
      templateId: event?.templateId ?? null,
      clientPaymentStatus: event?.clientPaymentStatus ?? "pending",
    });
  }, [opened, event, reset]);

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
    const input: CateringEventInput = { ...values, ingredients: scaledIngredients };
    if (event) {
      const templateChanged = event.templateId !== values.templateId;
      const headcountChanged = event.headcount !== values.headcount;
      updateEvent(event.id, {
        ...input,
        ingredients:
          templateChanged || headcountChanged ? scaledIngredients : event.ingredients,
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
      title={event ? "Edit Event" : "Add Event"}
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Ravi's wedding"
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label="Phone"
            placeholder="e.g. 9876543210"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <TextInput
            label="Location"
            placeholder="e.g. Madurai function hall"
            {...register("location")}
            error={errors.location?.message}
          />
          <Controller
            name="headcount"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Headcount"
                placeholder="e.g. 300"
                min={1}
                allowNegative={false}
                withAsterisk
                {...field}
                error={errors.headcount?.message}
              />
            )}
          />
          <TextInput
            label="Date"
            type="date"
            withAsterisk
            {...register("date")}
            error={errors.date?.message}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                data={EVENT_STATUS_OPTIONS}
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
                label="Template"
                placeholder="Select a template"
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
            name="clientPaymentStatus"
            control={control}
            render={({ field }) => (
              <Select
                label="Client payment status"
                data={CLIENT_PAYMENT_OPTIONS}
                withAsterisk
                {...field}
              />
            )}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{event ? "Save" : "Add"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}