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

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useEmployeesStore } from "@/store/employees";
import { validatePhone, formatPhone } from "@/lib/phone";

const eventEmployeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().refine(
    (val) => val === "" || validatePhone(val),
    "Enter a valid 10-digit Indian mobile number"
  ),
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
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
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
    const formatted = formatPhone(values.phone);
    const employeeId = values.saveToMaster
      ? addEmployee({
          name: values.name,
          phone: formatted,
          defaultRate: values.toPay,
        })
      : null;
    onAdd({
      employeeId,
      name: values.name,
      phone: formatted,
      toPay: values.toPay,
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.events.addOneOffEmployee} />}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.common.name} />}
            placeholder={preferredText(ui.events.oneOffNamePlaceholder, uiLanguage)}
            withAsterisk
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label={<Bilingual label={ui.common.phone} />}
            placeholder={preferredText(ui.events.phonePlaceholder, uiLanguage)}
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Controller
            name="toPay"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={<Bilingual label={{ en: "Amount to pay", ta: "செலுத்த வேண்டிய தொகை" }} />}
                placeholder={preferredText(ui.events.amountToPayPlaceholder, uiLanguage)}
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
            label={<Bilingual label={ui.events.saveToMaster} />}
            description={<Bilingual label={ui.events.saveToMasterDesc} />}
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