"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Stack, Text, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, labelText } from "@/lib/i18n";
import { todayLocalISO } from "@/lib/date";
import { formatStock, remainingStock } from "@/lib/stock";
import {
  useIngredientsStore,
  type Ingredient,
} from "@/store/ingredients";
import { useStockLedgerStore } from "@/store/stockLedger";

const purchaseSchema = z.object({
  qty: z.coerce.number().min(1, "Qty must be 1 or more"),
  date: z.string().min(1, "Date is required"),
  note: z.string().trim(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

type PurchaseModalProps = {
  opened: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
};

export function PurchaseModal({ opened, ingredient, onClose }: PurchaseModalProps) {
  const addPurchaseEntry = useStockLedgerStore((state) => state.addPurchaseEntry);
  const ledgerEntries = useStockLedgerStore((state) => state.entries);
  const ingredients = useIngredientsStore((state) => state.ingredients);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      qty: 0,
      date: todayLocalISO(),
      note: "",
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      qty: 0,
      date: todayLocalISO(),
      note: "",
    });
  }, [opened, reset]);

  const currentIngredient = ingredient
    ? (ingredients.find((item) => item.id === ingredient.id) ?? ingredient)
    : null;

  const remaining = currentIngredient
    ? remainingStock(currentIngredient, ledgerEntries)
    : 0;

  const onSubmit = (values: PurchaseFormValues) => {
    if (!ingredient) return;
    addPurchaseEntry({
      ingredientId: ingredient.id,
      qty: values.qty,
      date: values.date,
      note: values.note,
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.ingredients.purchaseTitle} />}
      centered
    >
      {currentIngredient ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Text fw={600}>{currentIngredient.name}</Text>
            <Text size="sm">
              <Bilingual label={ui.ingredients.inStock} />{" "}
              {formatStock(remaining, currentIngredient.unit)}
            </Text>
            <Controller
              name="qty"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.ingredients.purchaseQty} />}
                  placeholder={labelText(ui.ingredients.qtyPlaceholder)}
                  description={<Bilingual label={ui.ingredients.purchaseNote} />}
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
              placeholder={labelText(ui.ingredients.notePlaceholder)}
              {...register("note")}
              error={errors.note?.message}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                <Bilingual label={ui.common.cancel} />
              </Button>
              <Button type="submit">
                <Bilingual label={ui.ingredients.logPurchase} />
              </Button>
            </Group>
          </Stack>
        </form>
      ) : null}
    </Modal>
  );
}