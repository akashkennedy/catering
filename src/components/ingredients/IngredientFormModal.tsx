"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, labelText } from "@/lib/i18n";
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
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

type IngredientFormModalProps = {
  opened: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
};

export function IngredientFormModal({ opened, ingredient, onClose }: IngredientFormModalProps) {
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
            placeholder={labelText(ui.ingredients.namePlaceholder)}
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label={<Bilingual label={ui.ingredients.tamilName} />}
            placeholder={labelText(ui.ingredients.tamilNamePlaceholder)}
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
                  placeholder={labelText(ui.ingredients.selectUnit)}
                  data={UNITS}
                  allowDeselect={false}
                  withAsterisk
                  style={{ flex: 1, minWidth: 140 }}
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
                  placeholder={labelText(ui.ingredients.qtyPlaceholder)}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  style={{ width: 140 }}
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
                placeholder={labelText(ui.ingredients.globalPricePlaceholder)}
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