"use client";

import { ActionIcon, Anchor, Badge, Group, Table } from "@mantine/core";
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

type EventTableProps = {
  events: CateringEvent[];
  onEdit: (event: CateringEvent) => void;
  onDelete: (event: CateringEvent) => void;
};

export function EventTable({ events, onEdit, onDelete }: EventTableProps) {
  const statusLabel = (status: EventStatus) =>
    EVENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? { en: status, ta: "" };

  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.common.name} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.date} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.headcount} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.status} /></Table.Th>
            <Table.Th><Bilingual label={ui.events.balance} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.actions} /></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map((event) => (
            <Table.Tr key={event.id}>
              <Table.Td>
                <Anchor component={Link} href={`/events/${event.id}`} fw={500}>
                  {event.name}
                </Anchor>
              </Table.Td>
              <Table.Td>
                {event.date ? formatIndianDate(event.date) : <Bilingual label={ui.common.noDate} />}
              </Table.Td>
              <Table.Td>{event.headcount}</Table.Td>
              <Table.Td>
                <Badge color={STATUS_COLORS[event.status]} variant="light">
                  <Bilingual label={statusLabel(event.status)} />
                </Badge>
              </Table.Td>
              <Table.Td>{formatINR(eventBalance(event))}</Table.Td>
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
                    color="kumkum"
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