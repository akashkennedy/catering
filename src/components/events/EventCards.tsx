"use client";

import { ActionIcon, Anchor, Badge, Card, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { Pencil, Trash } from "lucide-react";

import type { CateringEvent, ClientPaymentStatus, EventStatus } from "@/store/events";
import { CLIENT_PAYMENT_OPTIONS, EVENT_STATUS_OPTIONS } from "./EventFormModal";

const PAYMENT_COLORS: Record<ClientPaymentStatus, string> = {
  pending: "yellow",
  partial: "orange",
  paid: "green",
};

const STATUS_COLORS: Record<EventStatus, string> = {
  planned: "blue",
  confirmed: "cyan",
  completed: "green",
  cancelled: "gray",
};

type EventCardsProps = {
  events: CateringEvent[];
  onEdit: (event: CateringEvent) => void;
  onDelete: (event: CateringEvent) => void;
};

export function EventCards({ events, onEdit, onDelete }: EventCardsProps) {
  const statusLabel = (status: EventStatus) =>
    EVENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
  const paymentLabel = (status: ClientPaymentStatus) =>
    CLIENT_PAYMENT_OPTIONS.find((option) => option.value === status)?.label ?? status;

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
                  {statusLabel(event.status)}
                </Badge>
                <Badge
                  color={PAYMENT_COLORS[event.clientPaymentStatus]}
                  variant="light"
                  size="sm"
                >
                  {paymentLabel(event.clientPaymentStatus)}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {event.date || "No date"} · {event.headcount} guests
              </Text>
              {event.location && (
                <Text size="sm" c="dimmed">
                  {event.location}
                </Text>
              )}
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