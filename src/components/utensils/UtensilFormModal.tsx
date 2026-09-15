"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import {
  useUtensilsStore,
  type Utensil,
  type UtensilInput,
} from "@/store/utensils";

const utensilSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  rentPrice: z.coerce.number().min(0, "Price must be 0 or more"),
});

type UtensilFormValues = z.infer<typeof utensilSchema>;

type UtensilFormModalProps = {
  opened: boolean;
  utensil: Utensil | null;
  onClose: () => void;
};

export function UtensilFormModal({ opened, utensil, onClose }: UtensilFormModalProps) {
  const addUtensil = useUtensilsStore((state) => state.addUtensil);
  const updateUtensil = useUtensilsStore((state) => state.updateUtensil);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UtensilFormValues>({
    resolver: zodResolver(utensilSchema),
    defaultValues: {
      name: "",
      rentPrice: 0,
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: utensil?.name ?? "",
      rentPrice: utensil?.rentPrice ?? 0,
    });
  }, [opened, utensil, reset]);

  const onSubmit = (values: UtensilFormValues) => {
    const input: UtensilInput = values;
    if (utensil) {
      updateUtensil(utensil.id, input);
    } else {
      addUtensil(input);
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={utensil ? "Edit Utensil" : "Add Utensil"}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Steel plate"
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <Controller
            name="rentPrice"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Reference rent price"
                placeholder="e.g. 20"
                min={0}
                allowNegative={false}
                decimalScale={2}
                leftSection="₹"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.rentPrice?.message}
              />
            )}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{utensil ? "Save" : "Add"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}