"use client";

import { useState } from "react";
import { Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { IndianRupee } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { currentMonthKey, eventCollected } from "@/lib/financeReport";
import { useAuthStore } from "@/store/auth";
import { useEventsStore } from "@/store/events";

type EarningsFilter = "month" | "all";

export function EarningsWidget() {
  const events = useEventsStore((state) => state.events);
  const canViewFinance = useAuthStore((state) => state.permissions.canViewFinance);
  const [filter, setFilter] = useState<EarningsFilter>("month");

  const monthKey = filter === "month" ? currentMonthKey() : null;
  const filtered = monthKey
    ? events.filter((event) => (event.date ?? "").startsWith(monthKey))
    : [...events];
  const total = filtered.reduce((sum, event) => sum + eventCollected(event), 0);

  if (!canViewFinance) {
    return null;
  }

  return (
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
      <Group gap="xs" justify="space-between">
        <Group gap="xs">
          <IndianRupee size={18} style={{ color: "var(--ink-muted)" }} />
          <Text size="sm" fw={600} c="dimmed">
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
      {filtered.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.earningsEmpty} />
        </Text>
      ) : (
        <Stack gap={12}>
          <div className="dash-stat">
            <span className="dash-stat__value">{formatINR(total)}</span>
            <span className="dash-stat__label">
              <Bilingual label={ui.eventsCount(filtered.length)} />
            </span>
          </div>
        </Stack>
      )}
    </div>
  );
}