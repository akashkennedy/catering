"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Plus, Trash } from "lucide-react";
import {
  Controller,
  get,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { useIngredientsStore, type Ingredient } from "@/store/ingredients";
import { formatINR } from "@/lib/format";
import { normalizeUnit } from "@/lib/units";
import { suggestTamilName } from "@/lib/ingredientTranslations";
import { fetchOnlineTamil, getCachedOnlineTamil } from "@/lib/translateTamil";
import {
  useTemplatesStore,
  type FoodTemplate,
  type FoodTemplateInput,
} from "@/store/templates";

const dishIngredientSchema = z.object({
  id: z.string(),
  ingredientId: z.string().min(1, "Select an ingredient"),
  qtyPer100: z.coerce.number().min(0, "Qty must be 0 or more"),
});

const dishSchema = z.object({
  id: z.string(),
  nameEn: z.string().trim().min(1, "Dish name is required"),
  nameTa: z.string(),
});

const dishFullSchema = dishSchema.extend({
  ingredients: z.array(dishIngredientSchema),
});

const templateSchema = z.object({
  nameEn: z.string().trim().min(1, "Name is required"),
  nameTa: z.string(),
  dishes: z.array(dishFullSchema),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

function toFormValues(template: FoodTemplate | null): TemplateFormValues {
  return {
    nameEn: template?.nameEn ?? "",
    nameTa: template?.nameTa ?? "",
    dishes:
      template?.dishes.map((dish) => ({
        id: dish.id,
        nameEn: dish.nameEn,
        nameTa: dish.nameTa,
        ingredients: dish.ingredients.map((ingredient) => ({
          id: crypto.randomUUID(),
          ingredientId: ingredient.ingredientId,
          qtyPer100: ingredient.qtyPer100,
        })),
      })) ?? [],
  };
}

type TemplateFormModalProps = {
  opened: boolean;
  template: FoodTemplate | null;
  onClose: () => void;
};

type DishIngredientFieldsProps = {
  control: Control<TemplateFormValues>;
  errors: FieldErrors<TemplateFormValues>;
  dishIndex: number;
  ingredients: { value: string; label: string }[];
  master: Ingredient[];
};

function DishIngredientFields({
  control,
  errors,
  dishIndex,
  ingredients,
  master,
}: DishIngredientFieldsProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dishes.${dishIndex}.ingredients`,
  });
  const rows = useWatch({ control, name: `dishes.${dishIndex}.ingredients` }) ?? [];
  const masterById = new Map(master.map((item) => [item.id, item]));

  return (
    <Stack gap="xs">
      {fields.length === 0 && (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.templates.noIngredientsOnDish} />
        </Text>
      )}
      {fields.map((field, fieldIndex) => {
        const ingredientError = get(
          errors,
          `dishes.${dishIndex}.ingredients.${fieldIndex}.ingredientId`
        ) as { message?: string } | undefined;
        const qtyError = get(
          errors,
          `dishes.${dishIndex}.ingredients.${fieldIndex}.qtyPer100`
        ) as { message?: string } | undefined;
        const row = rows[fieldIndex] as { ingredientId?: string; qtyPer100?: number } | undefined;
        const masterItem = row?.ingredientId ? masterById.get(row.ingredientId) : undefined;
        const qty = Number(row?.qtyPer100) || 0;
        const lineCost = masterItem ? Math.round(qty * masterItem.globalPrice * 100) / 100 : null;

        return (
          <Stack key={field.id} gap={2}>
            <Group align="flex-end" gap="xs" wrap="wrap">
              <Controller
                name={`dishes.${dishIndex}.ingredients.${fieldIndex}.ingredientId`}
                control={control}
                render={({ field: selectField }) => (
                  <Select
                    label={fieldIndex === 0 ? <Bilingual label={ui.templates.ingredient} /> : undefined}
                    placeholder={preferredText(ui.templates.selectIngredient, uiLanguage)}
                    data={ingredients}
                    searchable
                    clearable
                    style={{ flex: 1, minWidth: 140 }}
                    {...selectField}
                    error={ingredientError?.message}
                  />
                )}
              />
              <Controller
                name={`dishes.${dishIndex}.ingredients.${fieldIndex}.qtyPer100`}
                control={control}
                render={({ field: qtyField }) => (
                  <NumberInput
                    label={fieldIndex === 0 ? <Bilingual label={ui.templates.qtyPer100} /> : undefined}
                    placeholder={preferredText(ui.templates.qtyPlaceholder, uiLanguage)}
                    min={0}
                    allowNegative={false}
                    style={{ width: "100%", maxWidth: 110 }}
                    {...qtyField}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                    }}
                    error={qtyError?.message}
                  />
                )}
              />
              <ActionIcon
                variant="subtle"
                color="kumkum"
                aria-label="Remove ingredient"
                onClick={() => remove(fieldIndex)}
              >
                <Trash size={16} />
              </ActionIcon>
            </Group>
            {masterItem && (
              <Text size="xs" c="dimmed">
                {normalizeUnit(masterItem.unit)} · {formatINR(masterItem.globalPrice)}/
                {normalizeUnit(masterItem.unit)}
                {lineCost !== null && qty > 0 ? ` · ≈ ${formatINR(lineCost)} / 100` : ""}
              </Text>
            )}
          </Stack>
        );
      })}
      <Button
        variant="light"
        size="xs"
        leftSection={<Plus size={14} />}
        onClick={() => append({ id: crypto.randomUUID(), ingredientId: "", qtyPer100: 0 })}
      >
        <Bilingual label={ui.templates.addIngredient} />
      </Button>
    </Stack>
  );
}

export function TemplateFormModal({ opened, template, onClose }: TemplateFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("full", "xl");
  const addTemplate = useTemplatesStore((state) => state.addTemplate);
  const updateTemplate = useTemplatesStore((state) => state.updateTemplate);
  const ingredients = useIngredientsStore((state) => state.ingredients);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: toFormValues(null),
  });

  const {
    fields: dishFields,
    append: appendDish,
    remove: removeDish,
  } = useFieldArray({
    control,
    name: "dishes",
  });

  useEffect(() => {
    if (!opened) return;
    reset(toFormValues(template));
  }, [opened, template, reset]);

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: ingredient.id,
    label: ingredient.unit
      ? `${ingredient.name} (${normalizeUnit(ingredient.unit)})`
      : ingredient.name,
  }));
  const masterById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const watchedNameEn = useWatch({ control, name: "nameEn" }) ?? "";
  const watchedDishes = useWatch({ control, name: "dishes" }) ?? [];
  const [translatingName, setTranslatingName] = useState(false);
  const nameRequestId = useRef(0);
  const dishesRequestId = useRef(0);

  const autoFillTamil = (path: "nameTa" | `dishes.${number}.nameTa`, englishValue: string) => {
    const current = getValues(path);
    if (current && current.trim()) return;
    const suggestion = suggestTamilName(englishValue);
    if (suggestion) setValue(path, suggestion, { shouldValidate: false });
  };

  // Keep Tamil in sync while the user hasn't manually edited it.
  // Empty-check alone goes stale after the first keystroke, so gate on dirtyFields.
  // Never clobber saved Tamil when editing: only live-sync for new templates/dishes.
  useEffect(() => {
    if (!opened) return;
    if (dirtyFields.nameTa) return;
    const englishValue = (watchedNameEn ?? "").trim();
    if (!englishValue) return;
    const current = (getValues("nameTa") ?? "").trim();
    if (template?.nameTa?.trim() && current) return;
    const suggestion = suggestTamilName(englishValue);
    if (suggestion && suggestion !== current) {
      setValue("nameTa", suggestion, { shouldValidate: false });
    }
  }, [watchedNameEn, dirtyFields.nameTa, opened, template, getValues, setValue]);

  useEffect(() => {
    if (!opened) return;
    const originalTaByDishId = new Map(
      (template?.dishes ?? []).map((dish) => [dish.id, (dish.nameTa ?? "").trim()])
    );
    watchedDishes.forEach((dish, dishIndex) => {
      const dishDirty = (dirtyFields.dishes?.[dishIndex] as { nameTa?: boolean } | undefined)
        ?.nameTa;
      if (dishDirty) return;
      const englishValue = (dish?.nameEn ?? "").trim();
      if (!englishValue) return;
      const path = `dishes.${dishIndex}.nameTa` as const;
      const current = (getValues(path) ?? "").trim();
      const dishId = (dish as { id?: string } | undefined)?.id;
      if (dishId && originalTaByDishId.get(dishId) && current) return;
      const suggestion = suggestTamilName(englishValue);
      if (suggestion && suggestion !== current) {
        setValue(path, suggestion, { shouldValidate: false });
      }
    });
  }, [watchedDishes, dirtyFields.dishes, opened, template, setValue, getValues]);

  // Online-first enhancement: offline dict paints instantly above; this
  // replaces the auto value with the wider-coverage API translation.
  // Never touches manually edited or previously saved Tamil.
  useEffect(() => {
    if (!opened) return;
    if (dirtyFields.nameTa) return;
    const englishValue = (watchedNameEn ?? "").trim();
    if (englishValue.length < 2) return;
    if (template?.nameTa?.trim() && (getValues("nameTa") ?? "").trim()) return;
    const cached = getCachedOnlineTamil(englishValue);
    if (cached?.tamil) {
      const current = (getValues("nameTa") ?? "").trim();
      if (!current || current === suggestTamilName(englishValue)) {
        setValue("nameTa", cached.tamil, { shouldValidate: false });
      }
      return;
    }
    const requestId = ++nameRequestId.current;
    const timer = setTimeout(() => {
      void (async () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) return;
        setTranslatingName(true);
        try {
          const result = await fetchOnlineTamil(englishValue);
          if (requestId !== nameRequestId.current) return;
          if (!result?.tamil) return;
          if ((getValues("nameEn") ?? "").trim() !== englishValue) return;
          const current = (getValues("nameTa") ?? "").trim();
          if (!current || current === suggestTamilName(englishValue)) {
            setValue("nameTa", result.tamil, { shouldValidate: false });
          }
        } finally {
          if (requestId === nameRequestId.current) setTranslatingName(false);
        }
      })();
    }, 600);
    return () => clearTimeout(timer);
  }, [watchedNameEn, dirtyFields.nameTa, opened, template, getValues, setValue]);

  useEffect(() => {
    if (!opened) return;
    const snapshot = watchedDishes.map((dish) => ({
      id: (dish as { id?: string } | undefined)?.id,
      nameEn: (dish?.nameEn ?? "").trim(),
    }));
    if (snapshot.every((dish) => dish.nameEn.length < 2)) return;
    const requestId = ++dishesRequestId.current;
    const timer = setTimeout(() => {
      void (async () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) return;
        const originalTaByDishId = new Map(
          (template?.dishes ?? []).map((dish) => [dish.id, (dish.nameTa ?? "").trim()])
        );
        await Promise.all(
          snapshot.map(async (dish, dishIndex) => {
            if (!dish.nameEn || dish.nameEn.length < 2) return;
            const path = `dishes.${dishIndex}.nameTa` as const;
            const dishDirty = (
              dirtyFields.dishes?.[dishIndex] as { nameTa?: boolean } | undefined
            )?.nameTa;
            if (dishDirty) return;
            const current = (getValues(path) ?? "").trim();
            if (dish.id && originalTaByDishId.get(dish.id) && current) return;
            if (current && current !== suggestTamilName(dish.nameEn)) return;
            const result = await fetchOnlineTamil(dish.nameEn);
            if (requestId !== dishesRequestId.current) return;
            const latest = (getValues(path) ?? "").trim();
            if (!latest || latest === suggestTamilName(dish.nameEn)) {
              if (result?.tamil && result.tamil !== latest) {
                setValue(path, result.tamil, { shouldValidate: false });
              }
            }
          })
        );
      })();
    }, 700);
    return () => clearTimeout(timer);
  }, [watchedDishes, dirtyFields.dishes, opened, template, getValues, setValue]);

  const backfillTamil = (englishValue: string, tamilValue: string): string => {
    const ta = (tamilValue ?? "").trim();
    if (ta) return ta;
    return suggestTamilName((englishValue ?? "").trim());
  };

  const onSubmit = (values: TemplateFormValues) => {
    const input: FoodTemplateInput = {
      nameEn: values.nameEn.trim(),
      nameTa: backfillTamil(values.nameEn, values.nameTa),
      dishes: values.dishes
        .map((dish) => ({
          ...dish,
          nameEn: dish.nameEn.trim(),
          nameTa: backfillTamil(dish.nameEn, dish.nameTa),
        }))
        .filter((dish) => dish.nameEn !== ""),
    };
    if (template) {
      updateTemplate(template.id, input);
    } else {
      addTemplate(input);
    }
    onClose();
  };

  const dishNameEnError = (index: number) => {
    const error = get(errors, `dishes.${index}.nameEn`) as { message?: string } | undefined;
    return error?.message;
  };

  const templateNameEnRegister = register("nameEn", {
    onChange: (e) => autoFillTamil("nameTa", e.target.value),
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={template ? ui.templates.editTitle : ui.templates.addTemplate} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Group grow align="flex-start">
            <TextInput
              label={<Bilingual label={ui.templates.englishName} />}
              placeholder={preferredText(ui.templates.englishNamePlaceholder, uiLanguage)}
              withAsterisk
              {...templateNameEnRegister}
              error={errors.nameEn?.message}
            />
            <TextInput
              label={<Bilingual label={ui.templates.tamilName} />}
              placeholder={preferredText(ui.templates.tamilNamePlaceholder, uiLanguage)}
              dir="auto"
              {...register("nameTa")}
              error={errors.nameTa?.message}
            />
          </Group>
          {translatingName && (
            <Text size="xs" c="dimmed" mt={-8}>
              Translating…
            </Text>
          )}

          {dishFields.length === 0 && (
            <Text size="sm" c="dimmed">
              <Bilingual label={ui.templates.noDishes} />
            </Text>
          )}

          {dishFields.map((field, dishIndex) => {
            const dishNameRegister = register(`dishes.${dishIndex}.nameEn`, {
              onChange: (e) =>
                autoFillTamil(`dishes.${dishIndex}.nameTa`, e.target.value),
            });
            const liveDish = watchedDishes?.[dishIndex] as
              | { ingredients?: { ingredientId?: string; qtyPer100?: number }[] }
              | undefined;
            const liveRows = liveDish?.ingredients ?? [];
            const dishCount = liveRows.length;
            const dishCost = liveRows.reduce((sum, row) => {
              const masterItem = row?.ingredientId
                ? masterById.get(row.ingredientId)
                : undefined;
              if (!masterItem) return sum;
              return sum + (Number(row?.qtyPer100) || 0) * masterItem.globalPrice;
            }, 0);
            return (
              <Card key={field.id} withBorder padding="sm">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={0}>
                      <Text fw={600}>
                        <Bilingual label={ui.dishNumber(dishIndex + 1)} />
                      </Text>
                      <Text size="xs" c="dimmed">
                        <Bilingual label={ui.ingredientsCount(dishCount)} />
                        {dishCost > 0 ? ` · ≈ ${formatINR(Math.round(dishCost * 100) / 100)} / 100` : ""}
                      </Text>
                    </Stack>
                    <ActionIcon
                      variant="subtle"
                      color="kumkum"
                      aria-label="Remove dish"
                      onClick={() => removeDish(dishIndex)}
                    >
                      <Trash size={16} />
                    </ActionIcon>
                  </Group>
                  <Group grow align="flex-start">
                    <TextInput
                      label={<Bilingual label={ui.templates.englishName} />}
                      placeholder={preferredText(ui.templates.dishEnglishPlaceholder, uiLanguage)}
                      withAsterisk
                      {...dishNameRegister}
                      error={dishNameEnError(dishIndex)}
                    />
                    <TextInput
                      label={<Bilingual label={ui.templates.tamilName} />}
                      placeholder={preferredText(ui.templates.dishTamilPlaceholder, uiLanguage)}
                      dir="auto"
                      {...register(`dishes.${dishIndex}.nameTa`)}
                    />
                  </Group>
                  <DishIngredientFields
                    control={control}
                    errors={errors}
                    dishIndex={dishIndex}
                    ingredients={ingredientOptions}
                    master={ingredients}
                  />
                </Stack>
              </Card>
            );
          })}

          <Button
            variant="light"
            leftSection={<Plus size={16} />}
            onClick={() =>
              appendDish({ id: crypto.randomUUID(), nameEn: "", nameTa: "", ingredients: [] })
            }
          >
            <Bilingual label={ui.templates.addDish} />
          </Button>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Bilingual label={template ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
