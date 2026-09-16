"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, labelText } from "@/lib/i18n";
import { validatePhone, formatPhone } from "@/lib/phone";
import { useEventsStore, type CateringEventInput } from "@/store/events";

const todayISO = () => new Date().toISOString().slice(0, 10);

const quickAddEventSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z
    .string()
    .trim()
    .refine((val) => val === "" || validatePhone(val), "Enter a valid 10-digit Indian mobile number"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => val >= todayISO(), "Cannot select a date in the past"),
});

type QuickAddEventValues = z.infer<typeof quickAddEventSchema>;

type QuickAddEventModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function QuickAddEventModal({ opened, onClose }: QuickAddEventModalProps) {
  const addEvent = useEventsStore((state) => state.addEvent);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickAddEventValues>({
    resolver: zodResolver(quickAddEventSchema),
    defaultValues: { name: "", phone: "", date: "" },
  });

  useEffect(() => {
    if (opened) reset({ name: "", phone: "", date: "" });
  }, [opened, reset]);

  const onSubmit = (values: QuickAddEventValues) => {
    const input: CateringEventInput = {
      ...values,
      phone: formatPhone(values.phone),
      location: "",
      headcount: 100,
      status: "planned",
      templateId: null,
      clientPaymentStatus: "pending",
      totalQuoted: 0,
      ingredients: [],
      employees: [],
      utensils: [],
    };
    addEvent(input);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.events.addEvent} />}
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.common.name} />}
            placeholder={labelText(ui.events.namePlaceholder)}
            withAsterisk
            autoFocus
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label={<Bilingual label={ui.common.phone} />}
            placeholder={labelText(ui.events.phonePlaceholder)}
            {...register("phone")}
            error={errors.phone?.message}
          />
          <TextInput
            label={<Bilingual label={ui.common.date} />}
            type="date"
            withAsterisk
            {...register("date")}
            min={todayISO()}
            error={errors.date?.message}
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