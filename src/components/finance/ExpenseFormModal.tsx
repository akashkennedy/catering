"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Select, Stack, Text, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { todayLocalISO } from "@/lib/date";
import { EXPENSE_CATEGORIES, useFinanceStore } from "@/store/finance";

const expenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  date: z.string().min(1, "Date is required"),
  note: z.string().trim(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

type ExpenseFormModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function ExpenseFormModal({ opened, onClose }: ExpenseFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const addExpense = useFinanceStore((state) => state.addExpense);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: EXPENSE_CATEGORIES[0],
      amount: 0,
      date: todayLocalISO(),
      note: "",
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      category: EXPENSE_CATEGORIES[0],
      amount: 0,
      date: todayLocalISO(),
      note: "",
    });
  }, [opened, reset]);

  const onSubmit = (values: ExpenseFormValues) => {
    addExpense(values);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.finance.addExpense} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.finance.category} />}
                placeholder={preferredText(ui.finance.selectCategory, uiLanguage)}
                data={EXPENSE_CATEGORIES.map((category) => ({
                  value: category,
                  label: preferredText(ui.finance.categories[category], uiLanguage),
                }))}
                allowDeselect={false}
                withAsterisk
                {...field}
                error={errors.category?.message}
              />
            )}
          />
          <Text size="xs" c="dimmed">
            <Bilingual label={ui.finance.salaryNote} />
          </Text>
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
              <Bilingual label={ui.finance.addExpense} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}