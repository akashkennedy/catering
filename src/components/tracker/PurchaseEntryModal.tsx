"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Bilingual } from "@/components/Bilingual";
import { preferredText, ui } from "@/lib/i18n";
import { formatIndianDate, todayLocalISO } from "@/lib/date";
import { useEventsStore } from "@/store/events";
import { useIngredientsStore } from "@/store/ingredients";
import { useStockLedgerStore } from "@/store/stockLedger";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";

const purchaseSchema = z.object({
  ingredientId: z.string().min(1),
  qty: z.coerce.number().gt(0),
  price: z.coerce.number().min(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim(),
  eventId: z.string(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

type PurchaseEntryModalProps = {
  opened: boolean;
  onClose: () => void;
};

/**
 * Logs a purchase to the stock ledger via the shared `addPurchaseEntry`
 * write path — the same action feeding the low-stock calculation, so the
 * tracker can never desync from real stock numbers.
 */
export function PurchaseEntryModal({ opened, onClose }: PurchaseEntryModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const events = useEventsStore((state) => state.events);
  const loadEvents = useEventsStore((state) => state.loadEvents);
  const addPurchaseEntry = useStockLedgerStore((state) => state.addPurchaseEntry);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { ingredientId: "", qty: 1, price: 0, date: todayLocalISO(), note: "", eventId: "" },
  });

  useEffect(() => {
    if (!opened) return;
    void loadEvents();
    reset({ ingredientId: "", qty: 1, price: 0, date: todayLocalISO(), note: "", eventId: "" });
  }, [opened, reset, loadEvents]);

  const onSubmit = (values: PurchaseFormValues) => {
    addPurchaseEntry({
      ingredientId: values.ingredientId,
      qty: values.qty,
      price: values.price,
      date: values.date,
      note: values.note,
      eventId: values.eventId || null,
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Bilingual label={ui.tracker.logTitle} />} {...sheet}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Controller
            name="ingredientId"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.tracker.selectIngredient} />}
                placeholder={preferredText(ui.tracker.selectIngredient, uiLanguage)}
                data={ingredients.map((ingredient) => ({
                  value: ingredient.id,
                  label:
                    uiLanguage === "ta" && ingredient.tamilName
                      ? ingredient.tamilName
                      : ingredient.name,
                }))}
                searchable
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  // Autofill the price from the ingredient master; unknown or
                  // cleared selections leave the price input empty (stored as 0).
                  const match = ingredients.find((item) => item.id === value);
                  setValue("price", match?.globalPrice ?? 0, { shouldValidate: true });
                }}
                error={errors.ingredientId ? preferredText(ui.tracker.selectIngredient, uiLanguage) : undefined}
              />
            )}
          />
          <Controller
            name="qty"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.common.qty} />}
                value={field.value}
                min={0}
                allowNegative={false}
                onChange={field.onChange}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.qty ? preferredText(ui.tracker.qtyMin, uiLanguage) : undefined}
              />
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.common.price} />}
                placeholder={preferredText(ui.tracker.pricePlaceholder, uiLanguage)}
                value={field.value || ""}
                min={0}
                allowNegative={false}
                decimalScale={2}
                leftSection="₹"
                onChange={field.onChange}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.price ? preferredText(ui.tracker.priceMin, uiLanguage) : undefined}
              />
            )}
          />
          <TextInput
            label={<Bilingual label={ui.common.date} />}
            type="date"
            max={todayLocalISO()}
            error={errors.date ? preferredText(ui.tracker.dateRequired, uiLanguage) : undefined}
            {...register("date")}
          />
          <TextInput
            label={<Bilingual label={ui.ingredients.note} />}
            placeholder={preferredText(ui.ingredients.notePlaceholder, uiLanguage)}
            {...register("note")}
          />
          <Controller
            name="eventId"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.tracker.linkEvent} />}
                placeholder={preferredText(ui.tracker.noEvent, uiLanguage)}
                data={[
                  { value: "", label: preferredText(ui.tracker.noEvent, uiLanguage) },
                  ...events.map((event) => ({
                    value: event.id,
                    label: event.date
                      ? `${event.name} (${formatIndianDate(event.date)})`
                      : event.name,
                  })),
                ]}
                searchable
                clearable
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
              />
            )}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Bilingual label={ui.common.save} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
