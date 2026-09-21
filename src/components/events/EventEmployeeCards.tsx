"use client";

import { ActionIcon, Card, Group, NumberInput, Stack, Text } from "@mantine/core";
import { X } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ToggleSwitch } from "@/components/CheckRow";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import type { EventEmployeeLine } from "@/store/events";
import { formatINR } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

type EventEmployeeCardsProps = {
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

export function EventEmployeeCards({ lines, onLineChange, onRemove, visiblePayFor }: EventEmployeeCardsProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  return (
    <Stack gap="sm" className="sm:hidden">
      {lines.map((line) => {
        const showPay = canSeePay(line, visiblePayFor);
        const isPaid = line.toPay - line.paid <= 0;
        return (
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
                color="kumkum"
                aria-label={`Remove ${line.name}`}
                onClick={() => onRemove(line.id)}
              >
                <X size={16} />
              </ActionIcon>
            </Group>
            {showPay && (
              <>
                <NumberInput
                  label={<Bilingual label={ui.events.toPay} />}
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
                  label={<Bilingual label={ui.events.paid} />}
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
                  <Bilingual label={ui.events.pending} />: {formatINR(line.toPay - line.paid)}
                </Text>
                <Group gap="xs">
                  <ToggleSwitch
                    checked={isPaid}
                    onChange={(next) =>
                      onLineChange(line.id, { paid: next ? line.toPay : 0 })
                    }
                    ariaLabel={preferredText(
                      isPaid ? ui.events.markUnpaid : ui.events.markPaid,
                      uiLanguage,
                    )}
                  />
                  <Text size="sm" fw={600}>
                    <Bilingual label={isPaid ? ui.events.paid : ui.events.pending} />
                  </Text>
                </Group>
              </>
            )}
          </Stack>
        </Card>
        );
      })}
    </Stack>
  );
}