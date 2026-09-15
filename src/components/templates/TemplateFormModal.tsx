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
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dishes.${dishIndex}.ingredients`,
  });

  return (
    <Stack gap="xs">
      {fields.length === 0 && (
        <Text size="sm" c="dimmed">
          No ingredients on this dish yet.
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
          <Group key={field.id} align="flex-end" gap="xs" wrap="nowrap">
            <Controller
              name={`dishes.${dishIndex}.ingredients.${fieldIndex}.ingredientId`}
              control={control}
              render={({ field: selectField }) => (
                <Select
                  label={fieldIndex === 0 ? "Ingredient" : undefined}
                  placeholder="Select ingredient"
                  data={ingredients}
                  searchable
                  clearable
                  style={{ flex: 1, minWidth: 160 }}
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
                  label={fieldIndex === 0 ? "Qty / 100" : undefined}
                  placeholder="Qty"
                  min={0}
                  allowNegative={false}
                  style={{ width: 110 }}
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
              color="red"
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
        Add ingredient
      </Button>
    </Stack>
  );
}

export function TemplateFormModal({ opened, template, onClose }: TemplateFormModalProps) {
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
      title={template ? "Edit Template" : "Add Template"}
      centered
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Wedding lunch"
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />

          {dishFields.length === 0 && (
            <Text size="sm" c="dimmed">
              No dishes yet. Add one to start attaching ingredients.
            </Text>
          )}

          {dishFields.map((field, dishIndex) => (
            <Card key={field.id} withBorder padding="sm">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600}>Dish {dishIndex + 1}</Text>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label="Remove dish"
                    onClick={() => removeDish(dishIndex)}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
                <TextInput
                  label="Dish name"
                  placeholder="e.g. Chicken biryani"
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
            Add dish
          </Button>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{template ? "Save" : "Add"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
