"use client";

import { useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Bell, Check, Plus } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui, labelText } from "@/lib/i18n";
import { formatPhone, validatePhone } from "@/lib/phone";
import { useRemindersStore } from "@/store/reminders";

type RemindIn = "30min" | "1hr" | "custom";

function resolveRemindAt(remindIn: RemindIn, customTime: string): Date {
  const base = new Date();

  if (remindIn === "30min") {
    return new Date(base.getTime() + 30 * 60 * 1000);
  }

  if (remindIn === "1hr") {
    return new Date(base.getTime() + 60 * 60 * 1000);
  }

  const match = /^(\d{2}):(\d{2})$/.exec(customTime.trim());
  if (!match) return base;
  const date = new Date(base);
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  if (date.getTime() <= base.getTime()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function formatRemindAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RemindersWidget() {
  const reminders = useRemindersStore((state) => state.reminders);
  const addReminder = useRemindersStore((state) => state.addReminder);
  const dismissReminder = useRemindersStore((state) => state.dismissReminder);

  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [remindIn, setRemindIn] = useState<RemindIn>("30min");
  const [customTime, setCustomTime] = useState("09:00");
  const [phoneError, setPhoneError] = useState(false);

  const active = [...reminders]
    .filter((reminder) => !reminder.dismissed)
    .sort((a, b) => a.remindAt.localeCompare(b.remindAt));

  const handleAdd = () => {
    const trimmed = phone.trim();
    if (!trimmed || !validatePhone(trimmed)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    const remindAt = resolveRemindAt(remindIn, customTime);
    addReminder({
      customerName: null,
      phone: trimmed,
      note: note.trim() || null,
      remindAt: remindAt.toISOString(),
      eventId: null,
      dismissed: false,
      notified: false,
    });

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }

    setPhone("");
    setNote("");
    setCustomTime("09:00");
  };

  return (
    <Card withBorder padding="md" radius="md" h="100%">
      <Group gap="xs" mb="xs">
        <Bell size={18} />
        <Text fw={600}>
          <Bilingual label={ui.dashboard.customerFollowUp} />
        </Text>
      </Group>
      <Divider mb="sm" />

      <Stack gap="sm">
        <TextInput
          label={<Bilingual label={ui.reminders.phone} />}
          placeholder={labelText(ui.reminders.phonePlaceholder)}
          value={phone}
          error={phoneError ? <Bilingual label={ui.reminders.invalidPhone} /> : undefined}
          onChange={(event) => {
            setPhone(event.currentTarget.value);
            if (phoneError) setPhoneError(false);
          }}
        />
        <TextInput
          label={<Bilingual label={ui.reminders.note} />}
          placeholder={labelText(ui.reminders.notePlaceholder)}
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
        />
        <Group gap="xs" align="flex-end" wrap="wrap">
          <Select
            label={<Bilingual label={ui.reminders.remindIn} />}
            data={[
              { label: ui.reminders.in30min.en, value: "30min" },
              { label: ui.reminders.in1hr.en, value: "1hr" },
              { label: ui.reminders.customTime.en, value: "custom" },
            ]}
            value={remindIn}
            onChange={(value) => setRemindIn((value as RemindIn) ?? "30min")}
            w={160}
          />
          {remindIn === "custom" ? (
            <TextInput
              label={<Bilingual label={ui.reminders.time} />}
              type="time"
              value={customTime}
              onChange={(event) => setCustomTime(event.currentTarget.value)}
              w={140}
            />
          ) : null}
          <Button leftSection={<Plus size={16} />} onClick={handleAdd}>
            <Bilingual label={ui.reminders.add} />
          </Button>
        </Group>
      </Stack>

      <Divider my="sm" />

      {active.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.remindersEmpty} />
        </Text>
      ) : (
        <Stack gap="xs">
          {active.map((reminder) => (
            <Group key={reminder.id} justify="space-between" wrap="nowrap" gap="sm">
              <Stack gap={0}>
                <Text size="sm" fw={500}>
                  {formatPhone(reminder.phone)}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatRemindAt(reminder.remindAt)}
                </Text>
                {reminder.note ? (
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {reminder.note}
                  </Text>
                ) : null}
              </Stack>
              <ActionIcon
                variant="subtle"
                color="green"
                aria-label={ui.reminders.dismiss.en}
                onClick={() => dismissReminder(reminder.id)}
              >
                <Check size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}

      <Text size="xs" c="dimmed" mt="sm">
        <Bilingual label={ui.dashboard.notificationNote} />
      </Text>
    </Card>
  );
}