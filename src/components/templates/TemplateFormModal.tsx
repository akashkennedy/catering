"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Link2Off, Plus, Trash } from "lucide-react";
import {
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
import {
  courseDisplayName,
  useCoursesStore,
  type Course,
} from "@/store/courses";
import { CourseFormModal } from "./CourseFormModal";
import {
  useTemplatesStore,
  type FoodTemplate,
  type FoodTemplateInput,
} from "@/store/templates";

const dishLinkSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  nameEn: z.string(),
  nameTa: z.string(),
});

const templateSchema = z.object({
  nameEn: z.string().trim().min(1, "Name is required"),
  nameTa: z.string(),
  dishes: z.array(dishLinkSchema),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

function toFormValues(template: FoodTemplate | null): TemplateFormValues {
  return {
    nameEn: template?.nameEn ?? "",
    nameTa: template?.nameTa ?? "",
    dishes:
      template?.dishes.map((dish) => ({
        id: dish.id,
        courseId: dish.courseId ?? "",
        nameEn: dish.nameEn,
        nameTa: dish.nameTa,
      })) ?? [],
  };
}

type TemplateFormModalProps = {
  opened: boolean;
  template: FoodTemplate | null;
  onClose: () => void;
};

export function TemplateFormModal({ opened, template, onClose }: TemplateFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("full", "xl");
  const addTemplate = useTemplatesStore((state) => state.addTemplate);
  const updateTemplate = useTemplatesStore((state) => state.updateTemplate);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const loadIngredients = useIngredientsStore((state) => state.loadIngredients);
  const courses = useCoursesStore((state) => state.courses);
  const loadCourses = useCoursesStore((state) => state.loadCourses);
  const addCourse = useCoursesStore((state) => state.addCourse);

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

  const ingredientOptions = courses.map((course) => ({
    value: course.id,
    label: courseDisplayName(course, uiLanguage),
  }));
  const masterById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const watchedNameEn = useWatch({ control, name: "nameEn" }) ?? "";
  const watchedDishes = useWatch({ control, name: "dishes" }) ?? [];
  const [translatingName, setTranslatingName] = useState(false);
  const [courseFormOpened, setCourseFormOpened] = useState(false);
  const [coursePick, setCoursePick] = useState<string | null>(null);
  const nameRequestId = useRef(0);

  useEffect(() => {
    if (!opened) return;
    void loadCourses();
    void loadIngredients();
  }, [opened, loadCourses, loadIngredients]);

  const autoFillTamil = (englishValue: string) => {
    const current = getValues("nameTa");
    if (current && current.trim()) return;
    const suggestion = suggestTamilName(englishValue);
    if (suggestion) setValue("nameTa", suggestion, { shouldValidate: false });
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
        .map((dish) => {
          const course = coursesById.get(dish.courseId);
          return {
            id: dish.id,
            courseId: dish.courseId,
            nameEn: (course?.nameEn ?? dish.nameEn).trim(),
            nameTa: (course?.nameTa ?? dish.nameTa).trim(),
            ingredients: course?.ingredients ?? [],
          };
        })
        .filter((dish) => dish.courseId !== "" || dish.nameEn !== ""),
    };
    if (template) {
      updateTemplate(template.id, input);
    } else {
      addTemplate(input);
    }
    onClose();
  };

  const templateNameEnRegister = register("nameEn", {
    onChange: (e) => autoFillTamil(e.target.value),
  });

  const linkCourse = (course: Course) => {
    appendDish({
      id: crypto.randomUUID(),
      courseId: course.id,
      nameEn: course.nameEn,
      nameTa: course.nameTa,
    });
  };

  const saveLegacyAsCourse = async (dishIndex: number) => {
    const dish = getValues(`dishes.${dishIndex}`);
    if (!dish || !dish.nameEn.trim()) return;
    const created = await addCourse({
      nameEn: dish.nameEn.trim(),
      nameTa: dish.nameTa.trim() || suggestTamilName(dish.nameEn.trim()),
      ingredients: [],
    });
    setValue(`dishes.${dishIndex}.courseId`, created.id, { shouldValidate: false });
    setValue(`dishes.${dishIndex}.nameEn`, created.nameEn, { shouldValidate: false });
    setValue(`dishes.${dishIndex}.nameTa`, created.nameTa, { shouldValidate: false });
  };

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
            const dish = watchedDishes?.[dishIndex] as
              | { courseId?: string; nameEn?: string; nameTa?: string }
              | undefined;
            const courseId = dish?.courseId ?? "";
            const course = courseId ? coursesById.get(courseId) : undefined;
            const lines = course?.ingredients ?? [];
            const dishCost = lines.reduce((sum, row) => {
              const masterItem = masterById.get(row.ingredientId);
              if (!masterItem) return sum;
              return sum + (Number(row.qtyPer100) || 0) * masterItem.globalPrice;
            }, 0);
            const title = course
              ? courseDisplayName(course, uiLanguage)
              : dish?.nameEn?.trim() || preferredText(ui.templates.unknownCourse, uiLanguage);
            return (
              <Card key={field.id} withBorder padding="sm">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={0}>
                      <Text fw={600}>{title}</Text>
                      <Text size="xs" c="dimmed">
                        <Bilingual label={ui.ingredientsCount(lines.length)} />
                        {dishCost > 0 ? ` · ≈ ${formatINR(Math.round(dishCost * 100) / 100)} / 100` : ""}
                      </Text>
                    </Stack>
                    <Group gap={4} wrap="nowrap">
                      {course && (
                        <ActionIcon
                          variant="subtle"
                          aria-label="Unlink course"
                          title={preferredText(ui.templates.unlinkCourse, uiLanguage)}
                          onClick={() => {
                            setValue(`dishes.${dishIndex}.courseId`, "", {
                              shouldValidate: false,
                            });
                          }}
                        >
                          <Link2Off size={16} />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        variant="subtle"
                        color="kumkum"
                        aria-label="Remove course"
                        onClick={() => removeDish(dishIndex)}
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  {!course && (
                    <Text size="xs" c="dimmed">
                      <Bilingual label={ui.templates.unknownCourse} />
                    </Text>
                  )}
                  {lines.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      <Bilingual label={ui.templates.noIngredientsOnCourse} />
                    </Text>
                  ) : (
                    <Stack gap={2}>
                      {lines.map((row) => {
                        const masterItem = masterById.get(row.ingredientId);
                        const name = masterItem ? masterItem.name : row.ingredientId;
                        const unit = masterItem ? normalizeUnit(masterItem.unit) : "";
                        const lineCost = masterItem
                          ? Math.round(Number(row.qtyPer100 || 0) * masterItem.globalPrice * 100) / 100
                          : null;
                        return (
                          <Group key={row.ingredientId} justify="space-between" gap="xs">
                            <Text size="sm">
                              {name} · {row.qtyPer100}
                              {unit ? ` ${unit}` : ""}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {lineCost !== null && lineCost > 0 ? `≈ ${formatINR(lineCost)}` : "—"}
                            </Text>
                          </Group>
                        );
                      })}
                    </Stack>
                  )}
                  {!courseId && (dish?.nameEn?.trim() ?? "") !== "" && (
                    <Button variant="light" size="xs" onClick={() => void saveLegacyAsCourse(dishIndex)}>
                      <Bilingual label={ui.templates.saveAsCourse} />
                    </Button>
                  )}
                </Stack>
              </Card>
            );
          })}

          <Text size="sm" c="dimmed">
            <Bilingual label={ui.templates.pickCourseNote} />
          </Text>
          <Group align="flex-end" gap="xs" wrap="wrap">
            <Select
              placeholder={preferredText(ui.templates.selectCourse, uiLanguage)}
              data={ingredientOptions}
              searchable
              clearable
              style={{ flex: 1, minWidth: 180 }}
              value={coursePick}
              onChange={setCoursePick}
            />
            <Button
              variant="light"
              leftSection={<Plus size={16} />}
              disabled={!coursePick}
              onClick={() => {
                const course = coursePick ? coursesById.get(coursePick) : undefined;
                if (!course) return;
                linkCourse(course);
                setCoursePick(null);
              }}
            >
              <Bilingual label={ui.templates.addCourse} />
            </Button>
            <Button variant="light" onClick={() => setCourseFormOpened(true)}>
              <Bilingual label={ui.templates.createCourse} />
            </Button>
          </Group>

          <CourseFormModal
            opened={courseFormOpened}
            course={null}
            onClose={() => setCourseFormOpened(false)}
            onSaved={(created) => linkCourse(created)}
          />

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
