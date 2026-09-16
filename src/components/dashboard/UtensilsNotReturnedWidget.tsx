"use client";

import { Anchor, Card, Divider, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { Truck } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatIndianDate } from "@/lib/date";
import { useEventsStore } from "@/store/events";

const MAX_ITEMS = 8;
const CLOSED_STATUSES = ["completed", "paid"];

export function UtensilsNotReturnedWidget() {
  const events = useEventsStore((state) => state.events);

  const rows: {
    eventId: string;
    eventName: string;
    eventDate: string;
    utensilName: string;
    qty: number;
  }[] = [];

  for (const event of events) {
    if (CLOSED_STATUSES.includes(event.status)) continue;
    for (const line of event.utensils ?? []) {
      if (!line.returned) {
        rows.push({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          utensilName: line.utensilName,
          qty: line.qty,
        });
      }
    }
  }

  rows.sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  const visible = rows.slice(0, MAX_ITEMS);
  const hiddenCount = rows.length - MAX_ITEMS;

  return (
    <Card withBorder padding="md" radius="md" h="100%">
      <Group gap="xs" mb="xs">
        <Truck size={18} />
        <Text fw={600}>
          <Bilingual label={ui.dashboard.utensilsNotReturned} />
        </Text>
      </Group>
      <Divider mb="sm" />
      {visible.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.utensilsEmpty} />
        </Text>
      ) : (
        <Stack gap="xs">
          {visible.map((row, index) => (
            <Stack key={`${row.eventId}-${index}`} gap={0}>
              <Group justify="space-between" gap="sm">
                <Anchor
                  component={Link}
                  href={`/events/${row.eventId}`}
                  fw={600}
                  size="sm"
                  lineClamp={1}
                >
                  {row.utensilName}
                </Anchor>
                <Text size="xs" c="dimmed" component="span">
                  {row.qty}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {row.eventName} ·{" "}
                {row.eventDate ? formatIndianDate(row.eventDate) : <Bilingual label={ui.common.noDate} />}
              </Text>
            </Stack>
          ))}
          {hiddenCount > 0 ? (
            <Text size="xs" c="dimmed">
              <Bilingual label={ui.moreItems(hiddenCount)} />
            </Text>
          ) : null}
        </Stack>
      )}
    </Card>
  );
}