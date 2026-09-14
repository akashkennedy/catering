"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import {
  useIngredientsStore,
  type Ingredient,
  type IngredientInput,
} from "@/store/ingredients";

const ingredientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  tamilName: z.string().trim(),
  unit: z.string().trim().min(1, "Unit is required"),
  globalPrice: z
    .coerce.number()
    .finite("Price must be a finite number")
    .min(0, "Price must be 0 or more"),
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
    setError,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      tamilName: "",
      unit: "",
      globalPrice: 0,
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: ingredient?.name ?? "",
      tamilName: ingredient?.tamilName ?? "",
      unit: ingredient?.unit ?? "",
      globalPrice: ingredient?.globalPrice ?? 0,
    });
  }, [opened, ingredient, reset]);

  const onSubmit = (values: IngredientFormValues) => {
    if (!Number.isFinite(values.globalPrice)) {
      setError("globalPrice", {
        type: "validate",
        message: "Price must be a finite number",
      });
      return;
    }

    const input: IngredientInput = values;
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
      title={ingredient ? "Edit Ingredient" : "Add Ingredient"}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Rice"
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label="Tamil name"
            placeholder="e.g. அரிசி"
            {...register("tamilName")}
            error={errors.tamilName?.message}
          />
          <TextInput
            label="Unit"
            placeholder="e.g. kg"
            withAsterisk
            {...register("unit")}
            error={errors.unit?.message}
          />
          <Controller
            name="globalPrice"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Global price"
                placeholder="e.g. 150"
                min={0}
                allowNegative={false}
                {...field}
                error={errors.globalPrice?.message}
              />
            )}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{ingredient ? "Save" : "Add"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
