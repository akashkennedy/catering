"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { lookupIngredient } from "@/lib/ingredientTranslations";
import { INGREDIENT_TAGS } from "@/lib/ingredientTags";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { UNITS, normalizeUnit } from "@/lib/units";
import {
  useIngredientsStore,
  type Ingredient,
  type IngredientInput,
} from "@/store/ingredients";

const ingredientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  tamilName: z.string().trim(),
  tag: z.enum(INGREDIENT_TAGS),
  unit: z.string().trim().min(1, "Unit is required"),
  globalPrice: z.coerce.number().min(0, "Price must be 0 or more"),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

type IngredientFormModalProps = {
  opened: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
};

export function IngredientFormModal({ opened, ingredient, onClose }: IngredientFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const addIngredient = useIngredientsStore((state) => state.addIngredient);
  const updateIngredient = useIngredientsStore((state) => state.updateIngredient);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      tamilName: "",
      tag: "grocery",
      unit: "",
      globalPrice: 0,
    },
  });

  const watchedName = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: ingredient?.name ?? "",
      tamilName: ingredient?.tamilName ?? "",
      tag: ingredient?.tag ?? "grocery",
      unit: normalizeUnit(ingredient?.unit) || UNITS[0],
      globalPrice: ingredient?.globalPrice ?? 0,
    });
  }, [opened, ingredient, reset]);

  useEffect(() => {
    if (ingredient) return;
    const name = watchedName?.trim();
    if (!name) return;
    const suggestion = lookupIngredient(name);
    if (!suggestion) return;
    if (!dirtyFields.tamilName) {
      setValue("tamilName", suggestion.tamilName);
    }
    if (!dirtyFields.tag) {
      setValue("tag", suggestion.tag);
    }
  }, [watchedName, ingredient, dirtyFields.tamilName, dirtyFields.tag, setValue]);

  const onSubmit = (values: IngredientFormValues) => {
    const input: IngredientInput = {
      name: values.name,
      tamilName: values.tamilName,
      tag: values.tag,
      unit: normalizeUnit(values.unit),
      qty: 0,
      globalPrice: values.globalPrice,
      openingStock: 0,
      lowStockThreshold: 0,
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
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.ingredients.englishName} />}
            description={<Bilingual label={ui.ingredients.autoFillHint} />}
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
          <Controller
            name="tag"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.ingredients.category} />}
                placeholder={preferredText(ui.ingredients.selectTag, uiLanguage)}
                data={INGREDIENT_TAGS.map((tag) => ({
                  value: tag,
                  label: preferredText(ui.ingredients.tags[tag], uiLanguage),
                }))}
                allowDeselect={false}
                withAsterisk
                {...field}
                error={errors.tag?.message}
              />
            )}
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
                  style={{ flex: "1 1 160px" }}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  error={errors.globalPrice?.message}
                />
              )}
            />
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Bilingual label={ingredient ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}