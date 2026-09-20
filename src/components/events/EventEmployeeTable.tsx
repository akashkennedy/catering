"use client";

import { ActionIcon, NumberInput, Table, Text } from "@mantine/core";
import { X } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import type { EventEmployeeLine } from "@/store/events";
import { formatINR } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

type EventEmployeeTableProps = {
  lines: EventEmployeeLine[];
  onLineChange: (lineId: string, patch: { toPay?: number; paid?: number }) => void;
  onRemove: (lineId: string) => void;
  /** Null = viewer may see every line's pay; otherwise only these employeeIds. */
  visiblePayFor: Set<string> | null;
};

function canSeePay(line: EventEmployeeLine, visiblePayFor: Set<string> | null): boolean {
  if (visiblePayFor === null) return true;
  return !!line.employeeId && visiblePayFor.has(line.employeeId);
}

export function EventEmployeeTable({ lines, onLineChange, onRemove, visiblePayFor }: EventEmployeeTableProps) {
  return (
    <div className="hidden sm:block">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th><Bilingual label={ui.common.name} /></Table.Th>
            <Table.Th><Bilingual label={ui.common.phone} /></Table.Th>
            <Table.Th><Bilingual label={{ en: "To Pay", ta: "செலுத்த வேண்டியது" }} /></Table.Th>
            <Table.Th><Bilingual label={{ en: "Paid", ta: "செலுத்தியது" }} /></Table.Th>
            <Table.Th><Bilingual label={{ en: "Pending", ta: "நிலுவை" }} /></Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((line) => {
            const showPay = canSeePay(line, visiblePayFor);
            return (
            <Table.Tr key={line.id}>
              <Table.Td>
                <Text fw={500}>{line.name}</Text>
              </Table.Td>
              <Table.Td>{line.phone ? formatPhone(line.phone) : "—"}</Table.Td>
              <Table.Td>
                {showPay ? (
                <NumberInput
                  value={line.toPay}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  w={130}
                  leftSection="₹"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  onChange={(value) =>
                    onLineChange(line.id, { toPay: typeof value === "number" ? value : 0 })
                  }
                />
                ) : (
                  "—"
                )}
              </Table.Td>
              <Table.Td>
                {showPay ? (
                <NumberInput
                  value={line.paid}
                  min={0}
                  allowNegative={false}
                  decimalScale={2}
                  w={130}
                  leftSection="₹"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  onChange={(value) =>
                    onLineChange(line.id, { paid: typeof value === "number" ? value : 0 })
                  }
                />
                ) : (
                  "—"
                )}
              </Table.Td>
              <Table.Td>
                <Text fw={600}>{showPay ? formatINR(line.toPay - line.paid) : "—"}</Text>
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => onRemove(line.id)}
                >
                  <X size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}