"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { lookupIngredient, suggestTamilName } from "@/lib/ingredientTranslations";
import { fetchOnlineTamil, getCachedOnlineTamil } from "@/lib/translateTamil";
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
    getValues,
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

  const [translating, setTranslating] = useState(false);
  const requestId = useRef(0);

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

  // Dictionary tag auto-fill (kept): only the offline dictionary/catalog can
  // infer a category — online translation returns Tamil text, never a tag.
  useEffect(() => {
    if (ingredient) return;
    const name = watchedName?.trim();
    if (!name) return;
    const suggestion = lookupIngredient(name);
    if (!suggestion) return;
    if (!dirtyFields.tag) {
      setValue("tag", suggestion.tag);
    }
  }, [watchedName, ingredient, dirtyFields.tag, setValue]);

  // Instant offline Tamil fill while the Tamil field is untouched (same as
  // CourseFormModal). suggestTamilName always returns something non-empty via
  // dictionary + transliteration, so unknown names work without hardcoding.
  useEffect(() => {
    if (!opened) return;
    if (dirtyFields.tamilName) return;
    const name = (watchedName ?? "").trim();
    if (!name) return;
    const current = (getValues("tamilName") ?? "").trim();
    if (ingredient?.tamilName?.trim() && current) return;
    const suggestion = suggestTamilName(name);
    if (suggestion && suggestion !== current) {
      setValue("tamilName", suggestion, { shouldValidate: false });
    }
  }, [watchedName, dirtyFields.tamilName, opened, ingredient, getValues, setValue]);

  // Online enhancement with wider coverage (same as CourseFormModal).
  useEffect(() => {
    if (!opened) return;
    if (dirtyFields.tamilName) return;
    const name = (watchedName ?? "").trim();
    if (name.length < 2) return;
    if (ingredient?.tamilName?.trim() && (getValues("tamilName") ?? "").trim()) return;
    const cached = getCachedOnlineTamil(name);
    if (cached?.tamil) {
      const current = (getValues("tamilName") ?? "").trim();
      if (!current || current === suggestTamilName(name)) {
        setValue("tamilName", cached.tamil, { shouldValidate: false });
      }
      return;
    }
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      void (async () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) return;
        setTranslating(true);
        try {
          const result = await fetchOnlineTamil(name);
          if (id !== requestId.current) return;
          if (!result?.tamil) return;
          if ((getValues("name") ?? "").trim() !== name) return;
          const current = (getValues("tamilName") ?? "").trim();
          if (!current || current === suggestTamilName(name)) {
            setValue("tamilName", result.tamil, { shouldValidate: false });
          }
        } finally {
          if (id === requestId.current) setTranslating(false);
        }
      })();
    }, 600);
    return () => clearTimeout(timer);
  }, [watchedName, dirtyFields.tamilName, opened, ingredient, getValues, setValue]);

  const nameRegister = register("name", {
    onChange: (e) => {
      const current = getValues("tamilName");
      if (current && current.trim()) return;
      const suggestion = suggestTamilName(e.target.value);
      if (suggestion) setValue("tamilName", suggestion, { shouldValidate: false });
    },
  });

  const onSubmit = async (values: IngredientFormValues) => {
    const name = values.name.trim();
    const input: IngredientInput = {
      name,
      tamilName: values.tamilName.trim() || suggestTamilName(name),
      tag: values.tag,
      unit: normalizeUnit(values.unit),
      qty: 0,
      globalPrice: values.globalPrice,
      openingStock: 0,
      lowStockThreshold: 0,
    };
    if (ingredient) {
      await updateIngredient(ingredient.id, input);
    } else {
      await addIngredient(input);
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
            {...nameRegister}
            error={errors.name?.message}
          />
          <TextInput
            label={<Bilingual label={ui.ingredients.tamilName} />}
            placeholder={preferredText(ui.ingredients.tamilNamePlaceholder, uiLanguage)}
            dir="auto"
            {...register("tamilName")}
            error={errors.tamilName?.message}
          />
          {translating && (
            <p style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: -8 }}>
              Translating…
            </p>
          )}
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