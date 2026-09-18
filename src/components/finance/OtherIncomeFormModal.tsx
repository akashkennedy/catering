"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { todayLocalISO } from "@/lib/date";
import { useFinanceStore } from "@/store/finance";

const otherIncomeSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  date: z.string().min(1, "Date is required"),
  note: z.string().trim(),
});

type OtherIncomeFormValues = z.infer<typeof otherIncomeSchema>;

type OtherIncomeFormModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function OtherIncomeFormModal({ opened, onClose }: OtherIncomeFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const addOtherIncome = useFinanceStore((state) => state.addOtherIncome);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<OtherIncomeFormValues>({
    resolver: zodResolver(otherIncomeSchema),
    defaultValues: {
      amount: 0,
      date: todayLocalISO(),
      note: "",
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      amount: 0,
      date: todayLocalISO(),
      note: "",
    });
  }, [opened, reset]);

  const onSubmit = (values: OtherIncomeFormValues) => {
    addOtherIncome(values);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.finance.addOtherIncome} />}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.finance.amount} />}
                placeholder={preferredText(ui.finance.amountPlaceholder, uiLanguage)}
                min={0}
                allowNegative={false}
                decimalScale={2}
                leftSection="₹"
                withAsterisk
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.amount?.message}
              />
            )}
          />
          <TextInput
            label={<Bilingual label={ui.common.date} />}
            type="date"
            withAsterisk
            {...register("date")}
            error={errors.date?.message}
          />
          <TextInput
            label={<Bilingual label={ui.finance.note} />}
            placeholder={preferredText(ui.finance.notePlaceholder, uiLanguage)}
            {...register("note")}
            error={errors.note?.message}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit">
              <Bilingual label={ui.finance.addOtherIncome} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}