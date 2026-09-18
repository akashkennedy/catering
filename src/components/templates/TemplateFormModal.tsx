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
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useIngredientsStore } from "@/store/ingredients";
import { normalizeUnit } from "@/lib/units";
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
  name: z.string().trim().min(1, "Dish name is required"),
  ingredients: z.array(dishIngredientSchema),
});

const templateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  dishes: z.array(dishSchema),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

function toFormValues(template: FoodTemplate | null): TemplateFormValues {
  return {
    name: template?.name ?? "",
    dishes:
      template?.dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
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
};

function DishIngredientFields({
  control,
  errors,
  dishIndex,
  ingredients,
}: DishIngredientFieldsProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dishes.${dishIndex}.ingredients`,
  });

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

        return (
          <Group key={field.id} align="flex-end" gap="xs" wrap="wrap">
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
  const addTemplate = useTemplatesStore((state) => state.addTemplate);
  const updateTemplate = useTemplatesStore((state) => state.updateTemplate);
  const ingredients = useIngredientsStore((state) => state.ingredients);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
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

  const onSubmit = (values: TemplateFormValues) => {
    const input: FoodTemplateInput = {
      name: values.name.trim(),
      dishes: values.dishes
        .map((dish) => ({
          ...dish,
          name: dish.name.trim(),
        }))
        .filter((dish) => dish.name !== ""),
    };
    if (template) {
      updateTemplate(template.id, input);
    } else {
      addTemplate(input);
    }
    onClose();
  };

  const dishNameError = (index: number) => {
    const error = get(errors, `dishes.${index}.name`) as { message?: string } | undefined;
    return error?.message;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={template ? ui.templates.editTitle : ui.templates.addTemplate} />}
      centered
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.common.name} />}
            placeholder={preferredText(ui.templates.namePlaceholder, uiLanguage)}
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />

          {dishFields.length === 0 && (
            <Text size="sm" c="dimmed">
              <Bilingual label={ui.templates.noDishes} />
            </Text>
          )}

          {dishFields.map((field, dishIndex) => (
            <Card key={field.id} withBorder padding="sm">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600}>
                    <Bilingual label={ui.dishNumber(dishIndex + 1)} />
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="kumkum"
                    aria-label="Remove dish"
                    onClick={() => removeDish(dishIndex)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
                <TextInput
                  label={<Bilingual label={ui.templates.dishName} />}
                  placeholder={preferredText(ui.templates.dishNamePlaceholder, uiLanguage)}
                  withAsterisk
                  {...register(`dishes.${dishIndex}.name`)}
                  error={dishNameError(dishIndex)}
                />
                <DishIngredientFields
                  control={control}
                  errors={errors}
                  dishIndex={dishIndex}
                  ingredients={ingredientOptions}
                />
              </Stack>
            </Card>
          ))}

          <Button
            variant="light"
            leftSection={<Plus size={16} />}
            onClick={() =>
              appendDish({ id: crypto.randomUUID(), name: "", ingredients: [] })
            }
          >
            <Bilingual label={ui.templates.addDish} />
          </Button>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit">
              <Bilingual label={template ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}