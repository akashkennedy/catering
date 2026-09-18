"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import {
  useUtensilsStore,
  type Utensil,
  type UtensilInput,
} from "@/store/utensils";

const utensilSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  rentPrice: z.coerce.number().min(0, "Price must be 0 or more"),
  openingStock: z.coerce.number().min(0, "Qty must be 0 or more"),
  lowStockThreshold: z.coerce.number().min(0, "Qty must be 0 or more"),
});

type UtensilFormValues = z.infer<typeof utensilSchema>;

type UtensilFormModalProps = {
  opened: boolean;
  utensil: Utensil | null;
  onClose: () => void;
};

export function UtensilFormModal({ opened, utensil, onClose }: UtensilFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
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
      openingStock: 0,
      lowStockThreshold: 0,
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: utensil?.name ?? "",
      rentPrice: utensil?.rentPrice ?? 0,
      openingStock: utensil?.openingStock ?? 0,
      lowStockThreshold: utensil?.lowStockThreshold ?? 0,
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
      title={<Bilingual label={utensil ? ui.utensils.editTitle : ui.utensils.addUtensil} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.common.name} />}
            placeholder={preferredText(ui.utensils.namePlaceholder, uiLanguage)}
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <Controller
            name="rentPrice"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.utensils.rentPrice} />}
                placeholder={preferredText(ui.utensils.rentPricePlaceholder, uiLanguage)}
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
          <Group gap="sm" align="flex-end" wrap="wrap">
            <Controller
              name="openingStock"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.utensils.openingStock} />}
                  placeholder={preferredText(ui.utensils.openingStockPlaceholder, uiLanguage)}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  style={{ flex: 1, minWidth: 150 }}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  error={errors.openingStock?.message}
                />
              )}
            />
            <Controller
              name="lowStockThreshold"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.utensils.lowStockThreshold} />}
                  placeholder={preferredText(ui.utensils.thresholdPlaceholder, uiLanguage)}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  style={{ flex: 1, minWidth: 150 }}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  error={errors.lowStockThreshold?.message}
                />
              )}
            />
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit">
              <Bilingual label={utensil ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}