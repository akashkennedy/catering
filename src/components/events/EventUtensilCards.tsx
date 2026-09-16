"use client";

import {
  ActionIcon,
  Card,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { X } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatIndianDate } from "@/lib/date";
import type { EventUtensilLine } from "@/store/events";

type EventUtensilCardsProps = {
  lines: EventUtensilLine[];
  onLineChange: (
    lineId: string,
    patch: { qty?: number; rentalPrice?: number }
  ) => void;
  onToggleReturned: (lineId: string) => void;
  onRemove: (lineId: string) => void;
};

export function EventUtensilCards({
  lines,
  onLineChange,
  onToggleReturned,
  onRemove,
}: EventUtensilCardsProps) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {lines.map((line) => (
        <Card key={line.id} withBorder padding="sm">
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2}>
                <Text fw={600}>{line.utensilName}</Text>
                <Text size="sm" c="dimmed">
                  {line.dateFrom ? formatIndianDate(line.dateFrom) : "—"} –{" "}
                  {line.dateTo ? formatIndianDate(line.dateTo) : "—"}
                </Text>
              </Stack>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Remove ${line.utensilName}`}
                onClick={() => onRemove(line.id)}
              >
                <X size={16} />
              </ActionIcon>
            </Group>
            <Group gap="xs" wrap="wrap">
              <NumberInput
                label={<Bilingual label={ui.common.qty} />}
                value={line.qty}
                min={1}
                allowNegative={false}
                w={100}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                }}
                onChange={(value) =>
                  onLineChange(line.id, {
                    qty: typeof value === "number" ? value : 1,
                  })
                }
              />
              <NumberInput
                label={<Bilingual label={ui.common.price} />}
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
            </Group>
            <Switch
              label={<Bilingual label={ui.events.returned} />}
              checked={line.returned}
              onChange={() => onToggleReturned(line.id)}
              size="sm"
            />
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}