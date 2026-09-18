"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { useUtensilsStore } from "@/store/utensils";
import { formatINR } from "@/lib/format";

const eventUtensilSchema = z.object({
  utensilId: z.string().nullable(),
  utensilName: z.string().trim().min(1, "Utensil name is required"),
  qty: z.coerce.number().min(1, "Quantity must be 1 or more"),
  rentalPrice: z.coerce.number().min(0, "Price must be 0 or more"),
  dateFrom: z.string().min(1, "Start date is required"),
  dateTo: z.string().min(1, "End date is required"),
  saveToMaster: z.boolean(),
});

type EventUtensilFormValues = z.infer<typeof eventUtensilSchema>;

type EventUtensilFormModalProps = {
  opened: boolean;
  onClose: () => void;
  onAdd: (input: {
    utensilId: string | null;
    utensilName: string;
    qty: number;
    rentalPrice: number;
    dateFrom: string;
    dateTo: string;
  }) => void;
};

export function EventUtensilFormModal({
  opened,
  onClose,
  onAdd,
}: EventUtensilFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const masterUtensils = useUtensilsStore((state) => state.utensils);
  const addUtensil = useUtensilsStore((state) => state.addUtensil);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventUtensilFormValues>({
    resolver: zodResolver(eventUtensilSchema),
    defaultValues: {
      utensilId: null,
      utensilName: "",
      qty: 1,
      rentalPrice: 0,
      dateFrom: "",
      dateTo: "",
      saveToMaster: false,
    },
  });

  const selectedUtensilId = watch("utensilId");

  useEffect(() => {
    if (!opened) return;
    reset({
      utensilId: null,
      utensilName: "",
      qty: 1,
      rentalPrice: 0,
      dateFrom: "",
      dateTo: "",
      saveToMaster: false,
    });
  }, [opened, reset]);

  useEffect(() => {
    if (!selectedUtensilId) return;
    const utensil = masterUtensils.find((u) => u.id === selectedUtensilId);
    if (utensil) {
      setValue("utensilName", utensil.name);
      setValue("rentalPrice", utensil.rentPrice);
    }
  }, [selectedUtensilId, masterUtensils, setValue]);

  const onSubmit = (values: EventUtensilFormValues) => {
    const utensilId = values.saveToMaster
      ? addUtensil({
          name: values.utensilName,
          rentPrice: values.rentalPrice,
          openingStock: 0,
          lowStockThreshold: 0,
        })
      : values.utensilId;
    onAdd({
      utensilId: utensilId ?? null,
      utensilName: values.utensilName,
      qty: values.qty,
      rentalPrice: values.rentalPrice,
      dateFrom: values.dateFrom,
      dateTo: values.dateTo,
    });
    onClose();
  };

  const utensilOptions = masterUtensils.map((u) => ({
    value: u.id,
    label: `${u.name} (${formatINR(u.rentPrice)})`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.events.addUtensil} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Controller
            name="utensilId"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.events.selectUtensil} />}
                placeholder={preferredText(ui.events.pickFromMaster, uiLanguage)}
                data={utensilOptions}
                searchable
                clearable
                {...field}
                value={field.value ?? null}
                onChange={(value) => {
                  field.onChange(value ?? null);
                  if (!value) {
                    setValue("utensilName", "");
                    setValue("rentalPrice", 0);
                  }
                }}
              />
            )}
          />
          <TextInput
            label={<Bilingual label={ui.events.utensilName} />}
            placeholder={preferredText(ui.events.utensilNamePlaceholder, uiLanguage)}
            withAsterisk
            {...register("utensilName")}
            error={errors.utensilName?.message}
          />
          <Controller
            name="qty"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={{ en: "Quantity", ta: "அளவு" }} />}
                placeholder={preferredText(ui.events.quantityPlaceholder, uiLanguage)}
                min={1}
                allowNegative={false}
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.qty?.message}
              />
            )}
          />
          <Controller
            name="rentalPrice"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.events.rentalPrice} />}
                placeholder={preferredText(ui.events.rentalPricePlaceholder, uiLanguage)}
                min={0}
                allowNegative={false}
                decimalScale={2}
                leftSection="₹"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.rentalPrice?.message}
              />
            )}
          />
          <TextInput
            label={<Bilingual label={ui.events.rentalFrom} />}
            type="date"
            withAsterisk
            {...register("dateFrom")}
            error={errors.dateFrom?.message}
          />
          <TextInput
            label={<Bilingual label={ui.events.rentalTo} />}
            type="date"
            withAsterisk
            {...register("dateTo")}
            error={errors.dateTo?.message}
          />
          <Checkbox
            label={<Bilingual label={ui.events.saveUtensilToMaster} />}
            description={<Bilingual label={ui.events.saveUtensilToMasterDesc} />}
            {...register("saveToMaster")}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit">
              <Bilingual label={ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}