"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { useEmployeesStore } from "@/store/employees";

const eventEmployeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim(),
  toPay: z.coerce.number().min(0, "Amount must be 0 or more"),
  saveToMaster: z.boolean(),
});

type EventEmployeeFormValues = z.infer<typeof eventEmployeeSchema>;

type EventEmployeeFormModalProps = {
  opened: boolean;
  onClose: () => void;
  onAdd: (input: { employeeId: string | null; name: string; phone: string; toPay: number }) => void;
};

export function EventEmployeeFormModal({ opened, onClose, onAdd }: EventEmployeeFormModalProps) {
  const addEmployee = useEmployeesStore((state) => state.addEmployee);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EventEmployeeFormValues>({
    resolver: zodResolver(eventEmployeeSchema),
    defaultValues: {
      name: "",
      phone: "",
      toPay: 0,
      saveToMaster: false,
    },
  });

  useEffect(() => {
    if (!opened) return;
    reset({
      name: "",
      phone: "",
      toPay: 0,
      saveToMaster: false,
    });
  }, [opened, reset]);

  const onSubmit = (values: EventEmployeeFormValues) => {
    const employeeId = values.saveToMaster
      ? addEmployee({
          name: values.name,
          phone: values.phone,
          defaultRate: values.toPay,
        })
      : null;
    onAdd({
      employeeId,
      name: values.name,
      phone: values.phone,
      toPay: values.toPay,
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add one-off employee" centered>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Mani"
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
            name="toPay"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Amount to pay"
                placeholder="e.g. 1200"
                min={0}
                allowNegative={false}
                decimalScale={2}
                leftSection="₹"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                error={errors.toPay?.message}
              />
            )}
          />
          <Checkbox
            label="Save to master list"
            description="Add this employee to the master list for future events"
            {...register("saveToMaster")}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}