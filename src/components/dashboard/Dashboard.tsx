"use client";

import { useEffect } from "react";
import { Stack } from "@mantine/core";

import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { EarningsWidget } from "./EarningsWidget";
import { PaymentStatusWidget } from "./PaymentStatusWidget";
import { useEventsStore } from "@/store/events";

export function Dashboard() {
  const loadEvents = useEventsStore((state) => state.loadEvents);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <Stack gap={40}>
      <UpcomingEventsWidget />
      <EarningsWidget />
      <PaymentStatusWidget />
    </Stack>
  );
}
