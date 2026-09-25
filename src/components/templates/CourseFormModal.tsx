"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
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
} from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { useIngredientsStore } from "@/store/ingredients";
import { formatINR } from "@/lib/format";
import { normalizeUnit } from "@/lib/units";
import { suggestTamilName } from "@/lib/ingredientTranslations";
import { fetchOnlineTamil, getCachedOnlineTamil } from "@/lib/translateTamil";
import { useCoursesStore, type Course, type CourseInput } from "@/store/courses";

const courseIngredientSchema = z.object({
  id: z.string(),
  ingredientId: z.string().min(1, "Select an ingredient"),
  qtyPer100: z.coerce.number().min(0, "Qty must be 0 or more"),
});

const courseSchema = z.object({
  nameEn: z.string().trim().min(1, "Name is required"),
  nameTa: z.string(),
  ingredients: z.array(courseIngredientSchema),
});

type CourseFormValues = z.infer<typeof courseSchema>;

function toFormValues(course: Course | null): CourseFormValues {
  return {
    nameEn: course?.nameEn ?? "",
    nameTa: course?.nameTa ?? "",
    ingredients:
      course?.ingredients.map((item) => ({
        id: crypto.randomUUID(),
        ingredientId: item.ingredientId,
        qtyPer100: item.qtyPer100,
      })) ?? [],
  };
}

type CourseFormModalProps = {
  opened: boolean;
  course: Course | null;
  onClose: () => void;
  /** Called with the saved course (useful for immediately linking it). */
  onSaved?: (course: Course) => void;
};

export function CourseFormModal({ opened, course, onClose, onSaved }: CourseFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const addCourse = useCoursesStore((state) => state.addCourse);
  const updateCourse = useCoursesStore((state) => state.updateCourse);
  const ingredients = useIngredientsStore((state) => state.ingredients);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: toFormValues(null),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const [translating, setTranslating] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (!opened) return;
    reset(toFormValues(course));
  }, [opened, course, reset]);

  const watchedNameEn = useWatch({ control, name: "nameEn" }) ?? "";

  // Instant offline fill while the Tamil field is untouched.
  useEffect(() => {
    if (!opened) return;
    if (dirtyFields.nameTa) return;
    const englishValue = (watchedNameEn ?? "").trim();
    if (!englishValue) return;
    const current = (getValues("nameTa") ?? "").trim();
    if (course?.nameTa?.trim() && current) return;
    const suggestion = suggestTamilName(englishValue);
    if (suggestion && suggestion !== current) {
      setValue("nameTa", suggestion, { shouldValidate: false });
    }
  }, [watchedNameEn, dirtyFields.nameTa, opened, course, getValues, setValue]);

  // Online-first enhancement with wider coverage.
  useEffect(() => {
    if (!opened) return;
    if (dirtyFields.nameTa) return;
    const englishValue = (watchedNameEn ?? "").trim();
    if (englishValue.length < 2) return;
    if (course?.nameTa?.trim() && (getValues("nameTa") ?? "").trim()) return;
    const cached = getCachedOnlineTamil(englishValue);
    if (cached?.tamil) {
      const current = (getValues("nameTa") ?? "").trim();
      if (!current || current === suggestTamilName(englishValue)) {
        setValue("nameTa", cached.tamil, { shouldValidate: false });
      }
      return;
    }
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      void (async () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) return;
        setTranslating(true);
        try {
          const result = await fetchOnlineTamil(englishValue);
          if (id !== requestId.current) return;
          if (!result?.tamil) return;
          if ((getValues("nameEn") ?? "").trim() !== englishValue) return;
          const current = (getValues("nameTa") ?? "").trim();
          if (!current || current === suggestTamilName(englishValue)) {
            setValue("nameTa", result.tamil, { shouldValidate: false });
          }
        } finally {
          if (id === requestId.current) setTranslating(false);
        }
      })();
    }, 600);
    return () => clearTimeout(timer);
  }, [watchedNameEn, dirtyFields.nameTa, opened, course, getValues, setValue]);

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: ingredient.id,
    label: ingredient.unit
      ? `${ingredient.name} (${normalizeUnit(ingredient.unit)})`
      : ingredient.name,
  }));
  const masterById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const watchedRows = useWatch({ control, name: "ingredients" }) ?? [];
  const totalCost = watchedRows.reduce((sum, row) => {
    const masterItem = row?.ingredientId ? masterById.get(row.ingredientId) : undefined;
    if (!masterItem) return sum;
    return sum + (Number(row?.qtyPer100) || 0) * masterItem.globalPrice;
  }, 0);

  const nameEnRegister = register("nameEn", {
    onChange: (e) => {
      const current = getValues("nameTa");
      if (current && current.trim()) return;
      const suggestion = suggestTamilName(e.target.value);
      if (suggestion) setValue("nameTa", suggestion, { shouldValidate: false });
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    const input: CourseInput = {
      nameEn: values.nameEn.trim(),
      nameTa: (values.nameTa ?? "").trim() || suggestTamilName(values.nameEn.trim()),
      ingredients: values.ingredients
        .filter((row) => row.ingredientId !== "")
        .map((row) => ({
          ingredientId: row.ingredientId,
          qtyPer100: Number(row.qtyPer100) || 0,
        })),
    };
    let saved: Course | null = null;
    if (course) {
      await updateCourse(course.id, input);
      saved = { ...course, ...input };
    } else {
      saved = await addCourse(input);
    }
    onSaved?.(saved);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={course ? ui.templates.editCourse : ui.templates.createCourse} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Group grow align="flex-start">
            <TextInput
              label={<Bilingual label={ui.templates.englishName} />}
              placeholder={preferredText(ui.templates.englishNamePlaceholder, uiLanguage)}
              withAsterisk
              {...nameEnRegister}
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
          {translating && (
            <Text size="xs" c="dimmed" mt={-8}>
              Translating…
            </Text>
          )}

          <Group justify="space-between" align="center">
            <Text fw={600}>
              <Bilingual label={ui.templates.ingredients} />
            </Text>
            {totalCost > 0 && (
              <Text size="sm" c="dimmed">
                ≈ {formatINR(Math.round(totalCost * 100) / 100)} / 100
              </Text>
            )}
          </Group>

          {fields.length === 0 && (
            <Text size="sm" c="dimmed">
              <Bilingual label={ui.templates.noIngredientsOnCourse} />
            </Text>
          )}

          {fields.map((field, fieldIndex) => {
            const ingredientError = get(
              errors,
              `ingredients.${fieldIndex}.ingredientId`
            ) as { message?: string } | undefined;
            const qtyError = get(errors, `ingredients.${fieldIndex}.qtyPer100`) as
              | { message?: string }
              | undefined;
            const row = watchedRows[fieldIndex] as
              | { ingredientId?: string; qtyPer100?: number }
              | undefined;
            const masterItem = row?.ingredientId ? masterById.get(row.ingredientId) : undefined;
            const qty = Number(row?.qtyPer100) || 0;
            const lineCost = masterItem ? Math.round(qty * masterItem.globalPrice * 100) / 100 : null;
            return (
              <Stack key={field.id} gap={2}>
                <Group align="flex-end" gap="xs" wrap="wrap">
                  <Controller
                    name={`ingredients.${fieldIndex}.ingredientId`}
                    control={control}
                    render={({ field: selectField }) => (
                      <Select
                        label={fieldIndex === 0 ? <Bilingual label={ui.templates.ingredient} /> : undefined}
                        placeholder={preferredText(ui.templates.selectIngredient, uiLanguage)}
                        data={ingredientOptions}
                        searchable
                        clearable
                        style={{ flex: 1, minWidth: 140 }}
                        {...selectField}
                        error={ingredientError?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`ingredients.${fieldIndex}.qtyPer100`}
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

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Bilingual label={course ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
