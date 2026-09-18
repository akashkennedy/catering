"use client";

import { Anchor, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { CreditCard } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { clientPendingAmount, eventEmployeePending } from "@/lib/eventFinances";
import { useEventsStore } from "@/store/events";

export function PaymentStatusWidget() {
  const events = useEventsStore((state) => state.events);

  const eligible = events;
  const withPending = eligible
    .map((event) => ({
      event,
      clientPending: clientPendingAmount(event),
      employeePending: eventEmployeePending(event),
    }))
    .filter((row) => row.clientPending > 0 || row.employeePending > 0);

  const totalClientPending = withPending.reduce((sum, row) => sum + row.clientPending, 0);
  const totalEmployeePending = withPending.reduce((sum, row) => sum + row.employeePending, 0);

  return (
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
      <Group gap="xs" justify="space-between">
        <Group gap="xs">
          <CreditCard size={18} style={{ color: "var(--ink-muted)" }} />
          <Text size="sm" fw={600} c="dimmed">
            <Bilingual label={ui.dashboard.paymentOverview} />
          </Text>
        </Group>
        {withPending.length > 0 ? (
          <span className="dash-pill dash-pill--kumkum">
            {withPending.length}
          </span>
        ) : null}
      </Group>
      {withPending.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.paymentEmpty} />
        </Text>
      ) : (
        <Stack gap="lg" style={{ flex: 1 }}>
          <Stack gap={12}>
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm" c="dimmed">
                <Bilingual label={ui.dashboard.clientPending} />
              </Text>
              <span className="dash-pill dash-pill--kumkum">
                {formatINR(totalClientPending)}
              </span>
            </Group>
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm" c="dimmed">
                <Bilingual label={ui.dashboard.employeePending} />
              </Text>
              <span className="dash-pill dash-pill--kumkum">
                {formatINR(totalEmployeePending)}
              </span>
            </Group>
          </Stack>
          <Stack gap="lg" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            {withPending.map(({ event, clientPending, employeePending }) => (
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
                <Stack gap={4}>
                  {clientPending > 0 ? (
                    <Group gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed" component="span">
                        <Bilingual label={ui.dashboard.clientPending} />
                      </Text>
                      <Text size="xs" fw={500} component="span">
                        {formatINR(clientPending)}
                      </Text>
                    </Group>
                  ) : null}
                  {employeePending > 0 ? (
                    <Group gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed" component="span">
                        <Bilingual label={ui.dashboard.employeePending} />
                      </Text>
                      <Text size="xs" fw={500} component="span">
                        {formatINR(employeePending)}
                      </Text>
                    </Group>
                  ) : null}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </div>
  );
}