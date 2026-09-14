"use client";

import { ActionIcon, Badge, Group, Table } from "@mantine/core";
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

type EventTableProps = {
  events: CateringEvent[];
  onEdit: (event: CateringEvent) => void;
  onDelete: (event: CateringEvent) => void;
};

export function EventTable({ events, onEdit, onDelete }: EventTableProps) {
  const statusLabel = (status: EventStatus) =>
    EVENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
  const paymentLabel = (status: ClientPaymentStatus) =>
    CLIENT_PAYMENT_OPTIONS.find((option) => option.value === status)?.label ?? status;

  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Headcount</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Payment</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map((event) => (
            <Table.Tr key={event.id}>
              <Table.Td>{event.name}</Table.Td>
              <Table.Td>{event.date || "—"}</Table.Td>
              <Table.Td>{event.headcount}</Table.Td>
              <Table.Td>
                <Badge color={STATUS_COLORS[event.status]} variant="light">
                  {statusLabel(event.status)}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Badge color={PAYMENT_COLORS[event.clientPaymentStatus]} variant="light">
                  {paymentLabel(event.clientPaymentStatus)}
                </Badge>
              </Table.Td>
              <Table.Td>
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
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}