"use client";

import { Anchor, Card, Divider, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { CreditCard } from "lucide-react";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { clientPendingAmount, eventEmployeePending } from "@/lib/eventFinances";
import { useEventsStore } from "@/store/events";

export function PaymentStatusWidget() {
  const events = useEventsStore((state) => state.events);

  const eligible = events.filter((event) => event.status !== "cancelled");
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
    <Card withBorder padding="md" radius="md" h="100%">
      <Group gap="xs" mb="xs">
        <CreditCard size={18} />
        <Text fw={600}>
          <Bilingual label={ui.dashboard.paymentOverview} />
        </Text>
      </Group>
      <Divider mb="sm" />
      {withPending.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.dashboard.paymentEmpty} />
        </Text>
      ) : (
        <Stack gap="sm">
          <Stack gap={6}>
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm">
                <Bilingual label={ui.dashboard.clientPending} />
              </Text>
              <Text size="sm" fw={600}>
                {formatINR(totalClientPending)}
              </Text>
            </Group>
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm">
                <Bilingual label={ui.dashboard.employeePending} />
              </Text>
              <Text size="sm" fw={600}>
                {formatINR(totalEmployeePending)}
              </Text>
            </Group>
          </Stack>
          <Divider />
          <Stack gap="sm">
            {withPending.map(({ event, clientPending, employeePending }) => (
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
                <Stack gap={0}>
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
          <Text size="xs" c="dimmed">
            <Bilingual label={ui.dashboard.paymentPartialHint} />
          </Text>
        </Stack>
      )}
    </Card>
  );
}