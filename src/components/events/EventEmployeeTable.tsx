"use client";

import { ActionIcon, NumberInput, Table, Text } from "@mantine/core";
import { X } from "lucide-react";

import type { EventEmployeeLine } from "@/store/events";
import { formatINR } from "@/lib/format";

type EventEmployeeTableProps = {
  lines: EventEmployeeLine[];
  onLineChange: (lineId: string, patch: { toPay?: number; paid?: number }) => void;
  onRemove: (lineId: string) => void;
};

export function EventEmployeeTable({ lines, onLineChange, onRemove }: EventEmployeeTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>To Pay</Table.Th>
            <Table.Th>Paid</Table.Th>
            <Table.Th>Pending</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((line) => (
            <Table.Tr key={line.id}>
              <Table.Td>
                <Text fw={500}>{line.name}</Text>
              </Table.Td>
              <Table.Td>{line.phone || "—"}</Table.Td>
              <Table.Td>
                <NumberInput
                  value={line.toPay}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  w={130}
                  leftSection="₹"
                  onChange={(value) =>
                    onLineChange(line.id, { toPay: typeof value === "number" ? value : 0 })
                  }
                />
              </Table.Td>
              <Table.Td>
                <NumberInput
                  value={line.paid}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  w={130}
                  leftSection="₹"
                  onChange={(value) =>
                    onLineChange(line.id, { paid: typeof value === "number" ? value : 0 })
                  }
                />
              </Table.Td>
              <Table.Td>
                <Text fw={600}>{formatINR(line.toPay - line.paid)}</Text>
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={`Remove ${line.name}`}
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