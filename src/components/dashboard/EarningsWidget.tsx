"use client";

import { useState } from "react";
import { Card, Divider, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { IndianRupee } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { eventEarnings } from "@/lib/eventFinances";
import { useEventsStore } from "@/store/events";

type EarningsFilter = "month" | "all";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function EarningsWidget() {
  const events = useEventsStore((state) => state.events);
  const [filter, setFilter] = useState<EarningsFilter>("month");

  const monthKey = currentMonthKey();
  const eligible = events.filter((event) => event.status !== "cancelled");
  const filtered =
    filter === "month" ? eligible.filter((event) => (event.date ?? "").startsWith(monthKey)) : eligible;
  const total = filtered.reduce((sum, event) => sum + eventEarnings(event), 0);

  return (
    <Card withBorder padding="md" radius="md" h="100%">
      <Group gap="xs" mb="xs" justify="space-between">
        <Group gap="xs">
          <IndianRupee size={18} />
          <Text fw={600}>
            <Bilingual label={ui.dashboard.totalEarnings} />
          </Text>
        </Group>
        <SegmentedControl
          size="xs"
          value={filter}
          onChange={(value) => setFilter(value as EarningsFilter)}
          data={[
            { label: <Bilingual label={ui.dashboard.earningsThisMonth} />, value: "month" },
            { label: <Bilingual label={ui.dashboard.earningsAllTime} />, value: "all" },
          ]}
        />
      </Group>
      <Divider mb="sm" />
      {filtered.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.earningsEmpty} />
        </Text>
      ) : (
        <Stack gap={4}>
          <Text fw={700} size="xl">
            {formatINR(total)}
          </Text>
          <Text size="xs" c="dimmed">
            <Bilingual label={ui.eventsCount(filtered.length)} />
          </Text>
        </Stack>
      )}
    </Card>
  );
}