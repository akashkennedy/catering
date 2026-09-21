"use client";

import { useEffect, useState } from "react";
import { Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { ClipboardList, CreditCard, IndianRupee, TrendingDown } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { LoadingSpinner } from "@/components/LoadingSkeletons";
import { ui } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { currentMonthKey, financeSummary } from "@/lib/financeReport";
import {
  clientPendingAmount,
  eventEmployeePending,
  eventTotalAmount,
} from "@/lib/eventFinances";
import { useAuthStore } from "@/store/auth";
import { useEventsStore } from "@/store/events";
import { useFinanceStore } from "@/store/finance";

type OverviewFilter = "month" | "all";

function StatCard({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Group gap="xs">
        {icon}
        <Text size="sm" fw={600} c="dimmed">
          {title}
        </Text>
      </Group>
      <div className="dash-stat">
        <span className="dash-stat__value">{value}</span>
        {sub ? <span className="dash-stat__label">{sub}</span> : null}
      </div>
    </div>
  );
}

const iconStyle = { color: "var(--ink-muted)" } as const;

export function OverviewGrid() {
  const events = useEventsStore((state) => state.events);
  const eventsLoaded = useEventsStore((state) => state.loaded);
  const expenses = useFinanceStore((state) => state.expenses);
  const otherIncomes = useFinanceStore((state) => state.otherIncomes);
  const financeLoaded = useFinanceStore((state) => state.loaded);
  const loadFinance = useFinanceStore((state) => state.loadFinance);
  const canViewFinance = useAuthStore((state) => state.permissions.canViewFinance);
  const [filter, setFilter] = useState<OverviewFilter>("month");

  useEffect(() => {
    void loadFinance();
  }, [loadFinance]);

  const monthKey = filter === "month" ? currentMonthKey() : null;
  const visibleEvents = monthKey
    ? events.filter((event) => (event.date ?? "").startsWith(monthKey))
    : events;
  const summary = financeSummary(events, otherIncomes, expenses, monthKey);
  const totalAmount = visibleEvents.reduce((sum, event) => sum + eventTotalAmount(event), 0);
  const pendingAmount = visibleEvents.reduce(
    (sum, event) => sum + clientPendingAmount(event) + eventEmployeePending(event),
    0
  );

  const loaded = eventsLoaded && financeLoaded;

  return (
    <Stack gap="md">
      <Group>
        <SegmentedControl
          size="xs"
          value={filter}
          onChange={(value) => setFilter(value as OverviewFilter)}
          data={[
            { label: <Bilingual label={ui.dashboard.earningsThisMonth} />, value: "month" },
            { label: <Bilingual label={ui.dashboard.earningsAllTime} />, value: "all" },
          ]}
        />
      </Group>
      {!loaded ? (
        <LoadingSpinner />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          <StatCard
            icon={<ClipboardList size={18} style={iconStyle} />}
            title={<Bilingual label={ui.dashboard.totalOrders} />}
            value={String(visibleEvents.length)}
          />
          {canViewFinance ? (
            <>
              <StatCard
                icon={<IndianRupee size={18} style={iconStyle} />}
                title={<Bilingual label={ui.dashboard.totalAmount} />}
                value={formatINR(totalAmount)}
              />
              <StatCard
                icon={<TrendingDown size={18} style={iconStyle} />}
                title={<Bilingual label={ui.dashboard.totalExpenses} />}
                value={formatINR(summary.expense)}
              />
              <StatCard
                icon={<CreditCard size={18} style={iconStyle} />}
                title={<Bilingual label={ui.dashboard.pendingAmount} />}
                value={formatINR(pendingAmount)}
              />
            </>
          ) : null}
        </div>
      )}
    </Stack>
  );
}
