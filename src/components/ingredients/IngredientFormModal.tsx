"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { lookupTamilName } from "@/lib/ingredientTranslations";
import { UNITS, normalizeUnit } from "@/lib/units";
import {
  useIngredientsStore,
  type Ingredient,
  type IngredientInput,
} from "@/store/ingredients";

const ingredientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  tamilName: z.string().trim(),
  unit: z.string().trim().min(1, "Unit is required"),
  qty: z.coerce.number().min(0, "Qty must be 0 or more"),
  globalPrice: z.coerce.number().min(0, "Price must be 0 or more"),
  openingStock: z.coerce.number().min(0, "Qty must be 0 or more"),
  lowStockThreshold: z.coerce.number().min(0, "Qty must be 0 or more"),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

type IngredientFormModalProps = {
  opened: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
};

export function IngredientFormModal({ opened, ingredient, onClose }: IngredientFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const addIngredient = useIngredientsStore((state) => state.addIngredient);
  const updateIngredient = useIngredientsStore((state) => state.updateIngredient);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      tamilName: "",
      unit: "",
      qty: 0,
      globalPrice: 0,
      openingStock: 0,
      lowStockThreshold: 0,
    },
  });

  const watchedName = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: ingredient?.name ?? "",
      tamilName: ingredient?.tamilName ?? "",
      unit: normalizeUnit(ingredient?.unit) || UNITS[0],
      qty: ingredient?.qty ?? 0,
      globalPrice: ingredient?.globalPrice ?? 0,
      openingStock: ingredient?.openingStock ?? 0,
      lowStockThreshold: ingredient?.lowStockThreshold ?? 0,
    });
  }, [opened, ingredient, reset]);

  useEffect(() => {
    if (ingredient) return;
    const name = watchedName?.trim();
    if (!name) return;
    const translation = lookupTamilName(name);
    if (!translation) return;
    if (dirtyFields.tamilName) return;
    setValue("tamilName", translation);
  }, [watchedName, ingredient, dirtyFields.tamilName, setValue]);

  const onSubmit = (values: IngredientFormValues) => {
    const input: IngredientInput = {
      ...values,
      unit: normalizeUnit(values.unit),
    };
    if (ingredient) {
      updateIngredient(ingredient.id, input);
    } else {
      addIngredient(input);
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ingredient ? ui.ingredients.editTitle : ui.ingredients.addIngredient} />}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.common.name} />}
            placeholder={preferredText(ui.ingredients.namePlaceholder, uiLanguage)}
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label={<Bilingual label={ui.ingredients.tamilName} />}
            placeholder={preferredText(ui.ingredients.tamilNamePlaceholder, uiLanguage)}
            {...register("tamilName")}
            error={errors.tamilName?.message}
          />
          <Group gap="sm" align="flex-end" wrap="wrap">
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select
                  label={<Bilingual label={ui.common.unit} />}
                  placeholder={preferredText(ui.ingredients.selectUnit, uiLanguage)}
                  data={UNITS}
                  allowDeselect={false}
                  withAsterisk
                  style={{ flex: "1 1 140px" }}
                  {...field}
                  error={errors.unit?.message}
                />
              )}
            />
            <Controller
              name="qty"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.common.qty} />}
                  placeholder={preferredText(ui.ingredients.qtyPlaceholder, uiLanguage)}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  style={{ flex: "1 1 120px" }}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  error={errors.qty?.message}
                />
              )}
            />
          </Group>
          <Controller
            name="globalPrice"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.ingredients.globalPrice} />}
                placeholder={preferredText(ui.ingredients.globalPricePlaceholder, uiLanguage)}
                min={0}
                allowNegative={false}
                decimalScale={2}
                leftSection="₹"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.globalPrice?.message}
              />
            )}
          />
          <Group gap="sm" align="flex-end" wrap="wrap">
            <Controller
              name="openingStock"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.ingredients.openingStock} />}
                  placeholder={preferredText(ui.ingredients.openingStockPlaceholder, uiLanguage)}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  style={{ flex: "1 1 140px" }}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  error={errors.openingStock?.message}
                />
              )}
            />
            <Controller
              name="lowStockThreshold"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.ingredients.lowStockThreshold} />}
                  placeholder={preferredText(ui.ingredients.thresholdPlaceholder, uiLanguage)}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  style={{ flex: "1 1 140px" }}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  error={errors.lowStockThreshold?.message}
                />
              )}
            />
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit">
              <Bilingual label={ingredient ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}