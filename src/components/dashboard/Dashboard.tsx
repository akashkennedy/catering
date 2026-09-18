"use client";

import { Stack } from "@mantine/core";

import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { EarningsWidget } from "./EarningsWidget";
import { PaymentStatusWidget } from "./PaymentStatusWidget";

export function Dashboard() {
  return (
    <Stack gap={40}>
      <UpcomingEventsWidget />
      <EarningsWidget />
      <PaymentStatusWidget />
    </Stack>
  );
}
