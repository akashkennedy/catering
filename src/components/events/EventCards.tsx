"use client";

import { ActionIcon, Anchor, Badge, Card, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { Pencil, Trash } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatIndianDate } from "@/lib/date";
import { formatINR } from "@/lib/format";
import { eventBalance } from "@/lib/eventFinances";
import type { CateringEvent, EventStatus } from "@/store/events";
import { EVENT_STATUS_OPTIONS } from "./EventFormModal";

const STATUS_COLORS: Record<EventStatus, string> = {
  enquiry: "blue",
  confirmed: "cyan",
  preparing: "violet",
  completed: "teal",
  paid: "green",
};

type EventCardsProps = {
  events: CateringEvent[];
  onEdit: (event: CateringEvent) => void;
  onDelete: (event: CateringEvent) => void;
};

export function EventCards({ events, onEdit, onDelete }: EventCardsProps) {
  const statusLabel = (status: EventStatus) =>
    EVENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? { en: status, ta: "" };

  return (
    <Stack gap="sm" className="sm:hidden">
      {events.map((event) => (
        <Card key={event.id} withBorder padding="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
              <Anchor component={Link} href={`/events/${event.id}`} fw={600}>
                {event.name}
              </Anchor>
              <Group gap="xs">
                <Badge color={STATUS_COLORS[event.status]} variant="light" size="sm">
                  <Bilingual label={statusLabel(event.status)} />
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {event.date ? formatIndianDate(event.date) : <Bilingual label={ui.common.noDate} />} ·{" "}
                <Bilingual label={ui.guests(event.headcount)} />
              </Text>
              {event.venue && (
                <Text size="sm" c="dimmed">
                  {event.venue}
                </Text>
              )}
              <Text size="sm" fw={600}>
                <Bilingual label={ui.events.balance} />: {formatINR(eventBalance(event))}
              </Text>
            </Stack>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                aria-label={`Edit ${event.name}`}
                onClick={() => onEdit(event)}
              >
                <Pencil size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Delete ${event.name}`}
                onClick={() => onDelete(event)}
              >
                <Trash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}