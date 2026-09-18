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
  useEmployeesStore,
  type Employee,
  type EmployeeInput,
} from "@/store/employees";
import { validatePhone, formatPhone } from "@/lib/phone";

const employeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().refine(
    (val) => val === "" || validatePhone(val),
    "Enter a valid 10-digit Indian mobile number"
  ),
  defaultRate: z.coerce.number().min(0, "Rate must be 0 or more"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

type EmployeeFormModalProps = {
  opened: boolean;
  employee: Employee | null;
  onClose: () => void;
};

export function EmployeeFormModal({ opened, employee, onClose }: EmployeeFormModalProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const addEmployee = useEmployeesStore((state) => state.addEmployee);
  const updateEmployee = useEmployeesStore((state) => state.updateEmployee);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      phone: "",
      defaultRate: 0,
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: employee?.name ?? "",
      phone: employee?.phone ?? "",
      defaultRate: employee?.defaultRate ?? 0,
    });
  }, [opened, employee, reset]);

  const onSubmit = (values: EmployeeFormValues) => {
    const input: EmployeeInput = { ...values, phone: formatPhone(values.phone) };
    if (employee) {
      updateEmployee(employee.id, input);
    } else {
      addEmployee(input);
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={employee ? ui.employees.editTitle : ui.employees.addEmployee} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.common.name} />}
            placeholder={preferredText(ui.employees.namePlaceholder, uiLanguage)}
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label={<Bilingual label={ui.common.phone} />}
            placeholder={preferredText(ui.employees.phonePlaceholder, uiLanguage)}
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Controller
            name="defaultRate"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={ui.employees.defaultRate} />}
                placeholder={preferredText(ui.employees.ratePlaceholder, uiLanguage)}
                min={0}
                allowNegative={false}
                decimalScale={2}
                leftSection="₹"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.defaultRate?.message}
              />
            )}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit">
              <Bilingual label={employee ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}