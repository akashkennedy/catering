"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Select, Stack, Text, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { todayLocalISO } from "@/lib/date";
import { vesselStockSummary } from "@/lib/vesselStock";
import {
  useUtensilsStore,
  type Utensil,
} from "@/store/utensils";
import { useVesselStockLedgerStore } from "@/store/vesselStockLedger";
import { useEventsStore } from "@/store/events";

const assignSchema = z.object({
  eventId: z.string().min(1, "Pick an event"),
  qty: z.coerce.number().min(1, "Qty must be 1 or more"),
  date: z.string().min(1, "Date is required"),
  note: z.string().trim(),
});

type AssignFormValues = z.infer<typeof assignSchema>;

type AssignToEventModalProps = {
  opened: boolean;
  utensil: Utensil | null;
  onClose: () => void;
};

export function AssignToEventModal({ opened, utensil, onClose }: AssignToEventModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const addAssignedEntry = useVesselStockLedgerStore((state) => state.addAssignedEntry);
  const ledgerEntries = useVesselStockLedgerStore((state) => state.entries);
  const utensils = useUtensilsStore((state) => state.utensils);
  const events = useEventsStore((state) => state.events);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      eventId: "",
      qty: 0,
      date: todayLocalISO(),
      note: "",
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      eventId: "",
      qty: 0,
      date: todayLocalISO(),
      note: "",
    });
  }, [opened, reset]);

  const currentUtensil = utensil
    ? (utensils.find((item) => item.id === utensil.id) ?? utensil)
    : null;

  const summary = currentUtensil
    ? vesselStockSummary(currentUtensil, ledgerEntries)
    : null;

  const eventOptions = events.map((event) => ({
    value: event.id,
    label: event.name,
  }));

  const onSubmit = (values: AssignFormValues) => {
    if (!utensil || !values.eventId) return;
    addAssignedEntry({
      utensilId: utensil.id,
      qty: values.qty,
      date: values.date,
      eventId: values.eventId,
      note: values.note,
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.utensils.assignTitle} />}
      {...sheet}
    >
      {currentUtensil ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Text fw={600}>{currentUtensil.name}</Text>
            <Text size="sm">
              <Bilingual label={ui.utensils.available} /> {summary?.available ?? 0}
              {summary ? (
                <Text span size="xs" c="dimmed">
                  {" "}
                  · <Bilingual label={ui.utensils.stockBreakdownPrefix} />{" "}
                  {summary.owned} + <Bilingual label={ui.utensils.stockRentedInPrefix} />{" "}
                  {summary.rentedIn} − <Bilingual label={ui.utensils.stockAssignedPrefix} />{" "}
                  {summary.assigned}
                </Text>
              ) : null}
            </Text>
            <Controller
              name="eventId"
              control={control}
              render={({ field }) => (
                <Select
                  label={<Bilingual label={ui.utensils.assignEvent} />}
                  placeholder={preferredText(ui.utensils.assignEventPlaceholder, uiLanguage)}
                  description={<Bilingual label={ui.utensils.assignNote} />}
                  data={eventOptions}
                  searchable
                  clearable
                  withAsterisk
                  {...field}
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? "")}
                  error={errors.eventId?.message}
                />
              )}
            />
            <Controller
              name="qty"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.utensils.assignQty} />}
                  placeholder={preferredText(ui.utensils.openingStockPlaceholder, uiLanguage)}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  withAsterisk
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  error={errors.qty?.message}
                />
              )}
            />
            <TextInput
              label={<Bilingual label={ui.common.date} />}
              type="date"
              withAsterisk
              {...register("date")}
              error={errors.date?.message}
            />
            <TextInput
              label={<Bilingual label={ui.ingredients.note} />}
              placeholder={preferredText(ui.ingredients.notePlaceholder, uiLanguage)}
              {...register("note")}
              error={errors.note?.message}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                <Bilingual label={ui.common.cancel} />
              </Button>
              <Button type="submit">
                <Bilingual label={ui.utensils.assignToEvent} />
              </Button>
            </Group>
          </Stack>
        </form>
      ) : null}
    </Modal>
  );
}