"use client";

import { Anchor, Group, Stack, Text } from "@mantine/core";
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
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <Group gap="xs" justify="space-between">
        <Group gap="xs">
          <Truck size={18} style={{ color: "var(--ink-muted)" }} />
          <Text size="sm" fw={600} c="dimmed">
            <Bilingual label={ui.dashboard.utensilsNotReturned} />
          </Text>
        </Group>
        {rows.length > 0 ? (
          <span className="dash-pill dash-pill--kumkum">
            {rows.length}
          </span>
        ) : null}
      </Group>
      {visible.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.utensilsEmpty} />
        </Text>
      ) : (
        <Stack gap="xs" style={{ flex: 1 }}>
          {visible.map((row, index) => (
            <Stack key={`${row.eventId}-${index}`} gap={0}>
              <Group justify="space-between" gap="sm">
                <Anchor
                  component={Link}
                  href={`/events/${row.eventId}`}
                  fw={600}
                  size="sm"
                  lineClamp={1}
                  style={{ color: "var(--ink)" }}
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
    </div>
  );
}