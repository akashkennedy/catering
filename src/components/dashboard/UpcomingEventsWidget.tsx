"use client";

import { Anchor, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatIndianDate } from "@/lib/date";
import { useEventsStore } from "@/store/events";

const UPCOMING_COUNT = 3;
const CLOSED_STATUSES = ["completed", "paid"];

function todayAtMidnight(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString().slice(0, 10);
}

export function UpcomingEventsWidget() {
  const events = useEventsStore((state) => state.events);
  const today = todayAtMidnight();

  const upcoming = events
    .filter(
      (event) =>
        !CLOSED_STATUSES.includes(event.status) && event.date && event.date >= today
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, UPCOMING_COUNT);

  return (
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
      <Group gap="xs" justify="space-between">
        <Group gap="xs">
          <CalendarDays size={18} style={{ color: "var(--ink-muted)" }} />
          <Text size="sm" fw={600} c="dimmed">
            <Bilingual label={ui.dashboard.upcomingEvents} />
          </Text>
        </Group>
        <span className="dash-pill dash-pill--leaf">
          {upcoming.length}
        </span>
      </Group>
      {upcoming.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.upcomingEmpty} />
        </Text>
      ) : (
        <Stack gap="lg" style={{ flex: 1 }}>
          {upcoming.map((event) => (
            <Stack key={event.id} gap={8}>
              <Anchor
                component={Link}
                href={`/events/${event.id}`}
                fw={600}
                size="sm"
                lineClamp={1}
                style={{ color: "var(--ink)" }}
              >
                {event.name}
              </Anchor>
              <Group gap="sm" wrap="wrap">
                <Text size="xs" c="dimmed" component="span">
                  {formatIndianDate(event.date)}
                </Text>
                <Group gap={4} wrap="nowrap">
                  <Users size={12} style={{ color: "var(--ink-muted)" }} />
                  <Text size="xs" c="dimmed" component="span">
                    {event.headcount}
                  </Text>
                </Group>
                {event.venue ? (
                  <Group gap={4} wrap="nowrap">
                    <MapPin size={12} style={{ color: "var(--ink-muted)" }} />
                    <Text size="xs" c="dimmed" component="span" lineClamp={1}>
                      {event.venue}
                    </Text>
                  </Group>
                ) : null}
              </Group>
            </Stack>
          ))}
        </Stack>
      )}
    </div>
  );
}