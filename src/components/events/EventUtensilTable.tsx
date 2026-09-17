"use client";

import { ActionIcon, NumberInput, Switch, Table, Text } from "@mantine/core";
import { X } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatIndianDate } from "@/lib/date";
import type { EventUtensilLine } from "@/store/events";

type EventUtensilTableProps = {
  lines: EventUtensilLine[];
  onLineChange: (
    lineId: string,
    patch: { qty?: number; rentalPrice?: number }
  ) => void;
  onToggleReturned: (lineId: string) => void;
  onRemove: (lineId: string) => void;
};

export function EventUtensilTable({
  lines,
  onLineChange,
  onToggleReturned,
  onRemove,
}: EventUtensilTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.events.utensil} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.qty} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.price} /></Table.Th>
            <Table.Th><Bilingual label={ui.events.duration} /></Table.Th>
            <Table.Th><Bilingual label={ui.events.returned} /></Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((line) => (
            <Table.Tr key={line.id}>
              <Table.Td>
                <Text fw={500}>{line.utensilName}</Text>
              </Table.Td>
              <Table.Td>
                <NumberInput
                  value={line.qty}
                  min={1}
                  allowNegative={false}
                  w={90}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  onChange={(value) =>
                    onLineChange(line.id, {
                      qty: typeof value === "number" ? value : 1,
                    })
                  }
                />
              </Table.Td>
              <Table.Td>
                <NumberInput
                  value={line.rentalPrice}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  w={130}
                  leftSection="₹"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  onChange={(value) =>
                    onLineChange(line.id, {
                      rentalPrice: typeof value === "number" ? value : 0,
                    })
                  }
                />
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {line.dateFrom ? formatIndianDate(line.dateFrom) : "—"} –{" "}
                  {line.dateTo ? formatIndianDate(line.dateTo) : "—"}
                </Text>
              </Table.Td>
              <Table.Td>
                <Switch
                  checked={line.returned}
                  onChange={() => onToggleReturned(line.id)}
                  size="sm"
                />
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
                  aria-label={`Remove ${line.utensilName}`}
                  onClick={() => onRemove(line.id)}
                >
                  <X size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}