"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Bilingual } from "@/components/Bilingual";
import { ui, preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { validatePhone, formatPhone } from "@/lib/phone";
import { todayLocalISO as todayISO } from "@/lib/date";
import { useEventsStore, type CateringEventInput } from "@/store/events";

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
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
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
      venue: "",
      address: "",
      functionType: "",
      headcount: 100,
      status: "enquiry",
      templateId: null,
      ratePerPerson: 0,
      totalAmount: 0,
      totalAmountOverridden: false,
      advancePaid: 0,
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
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label={<Bilingual label={ui.common.name} />}
            placeholder={preferredText(ui.events.namePlaceholder, uiLanguage)}
            withAsterisk
            autoFocus
            {...register("name")}
            error={errors.name?.message}
          />
          <TextInput
            label={<Bilingual label={ui.common.phone} />}
            placeholder={preferredText(ui.events.phonePlaceholder, uiLanguage)}
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