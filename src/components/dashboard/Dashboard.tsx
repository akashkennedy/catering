"use client";

import { useEffect } from "react";
import { Stack } from "@mantine/core";

import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { OverviewGrid } from "./OverviewGrid";
import { PaymentStatusWidget } from "./PaymentStatusWidget";
import { useEventsStore } from "@/store/events";

/** Renders the dashboard overview and upcoming-event widgets. */
export function Dashboard() {
  const loadEvents = useEventsStore((state) => state.loadEvents);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <Stack gap={40}>
      <OverviewGrid />
      <UpcomingEventsWidget />
      <PaymentStatusWidget />
    </Stack>
  );
}
