"use client";

import { Anchor, Card, Divider, Group, Stack, Text } from "@mantine/core";
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
    <Card withBorder padding="md" radius="md" h="100%">
      <Group gap="xs" mb="xs">
        <CalendarDays size={18} />
        <Text fw={600}>
          <Bilingual label={ui.dashboard.upcomingEvents} />
        </Text>
      </Group>
      <Divider mb="sm" />
      {upcoming.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.upcomingEmpty} />
        </Text>
      ) : (
        <Stack gap="sm">
          {upcoming.map((event) => (
            <Stack key={event.id} gap={2}>
              <Anchor
                component={Link}
                href={`/events/${event.id}`}
                fw={600}
                size="sm"
                lineClamp={1}
              >
                {event.name}
              </Anchor>
              <Group gap="sm" wrap="wrap">
                <Text size="xs" c="dimmed" component="span">
                  {formatIndianDate(event.date)}
                </Text>
                <Group gap={4} wrap="nowrap">
                  <Users size={12} />
                  <Text size="xs" c="dimmed" component="span">
                    {event.headcount}
                  </Text>
                </Group>
                {event.venue ? (
                  <Group gap={4} wrap="nowrap">
                    <MapPin size={12} />
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
    </Card>
  );
}