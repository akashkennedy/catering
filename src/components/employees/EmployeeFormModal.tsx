"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import {
  useEmployeesStore,
  type Employee,
  type EmployeeInput,
} from "@/store/employees";

const employeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim(),
  defaultRate: z.coerce.number().min(0, "Rate must be 0 or more"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

type EmployeeFormModalProps = {
  opened: boolean;
  employee: Employee | null;
  onClose: () => void;
};

export function EmployeeFormModal({ opened, employee, onClose }: EmployeeFormModalProps) {
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
    const input: EmployeeInput = values;
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
      title={employee ? "Edit Employee" : "Add Employee"}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Ravi"
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label="Phone"
            placeholder="e.g. 9876543210"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Controller
            name="defaultRate"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Default rate"
                placeholder="e.g. 1500"
                min={0}
                allowNegative={false}
                {...field}
                error={errors.defaultRate?.message}
              />
            )}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{employee ? "Save" : "Add"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
