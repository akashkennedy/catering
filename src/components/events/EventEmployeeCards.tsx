"use client";

import { ActionIcon, Card, Group, NumberInput, Stack, Text } from "@mantine/core";
import { X } from "lucide-react";

import type { EventEmployeeLine } from "@/store/events";
import { formatINR } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

type EventEmployeeCardsProps = {
  lines: EventEmployeeLine[];
  onLineChange: (lineId: string, patch: { toPay?: number; paid?: number }) => void;
  onRemove: (lineId: string) => void;
};

export function EventEmployeeCards({ lines, onLineChange, onRemove }: EventEmployeeCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {lines.map((line) => (
        <Card key={line.id} withBorder padding="sm">
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2}>
                <Text fw={600}>{line.name}</Text>
                {line.phone && (
                  <Text size="sm" c="dimmed">
                    {formatPhone(line.phone)}
                  </Text>
                )}
              </Stack>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Remove ${line.name}`}
                onClick={() => onRemove(line.id)}
              >
                <X size={16} />
              </ActionIcon>
            </Group>
            <NumberInput
              label="To pay"
              value={line.toPay}
              min={0}
              allowNegative={false}
              decimalScale={2}
              leftSection="₹"
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
              }}
              onChange={(value) =>
                onLineChange(line.id, { toPay: typeof value === "number" ? value : 0 })
              }
            />
            <NumberInput
              label="Paid"
              value={line.paid}
              min={0}
              allowNegative={false}
              decimalScale={2}
              leftSection="₹"
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
              }}
              onChange={(value) =>
                onLineChange(line.id, { paid: typeof value === "number" ? value : 0 })
              }
            />
            <Text size="sm" fw={600}>
              Pending: {formatINR(line.toPay - line.paid)}
            </Text>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}