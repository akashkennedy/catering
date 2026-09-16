"use client";

import { SimpleGrid, Stack } from "@mantine/core";

import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { EarningsWidget } from "./EarningsWidget";
import { PaymentStatusWidget } from "./PaymentStatusWidget";
import { InventoryAlertsWidget } from "./InventoryAlertsWidget";
import { UtensilsNotReturnedWidget } from "./UtensilsNotReturnedWidget";
import { RemindersWidget } from "./RemindersWidget";
import { QuickAddWidget } from "./QuickAddWidget";

export function Dashboard() {
  return (
    <Stack>
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="md"
        verticalSpacing="md"
      >
        <UpcomingEventsWidget />
        <EarningsWidget />
        <PaymentStatusWidget />
        <InventoryAlertsWidget />
        <UtensilsNotReturnedWidget />
        <RemindersWidget />
        <QuickAddWidget />
      </SimpleGrid>
    </Stack>
  );
}