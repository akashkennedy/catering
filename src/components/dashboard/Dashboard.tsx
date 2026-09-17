"use client";

import { useState } from "react";
import { Button, SimpleGrid, Stack } from "@mantine/core";
import { CalendarPlus } from "lucide-react";

import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { EarningsWidget } from "./EarningsWidget";
import { PaymentStatusWidget } from "./PaymentStatusWidget";
import { QuickAddEventModal } from "./QuickAddEventModal";
import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";

export function Dashboard() {
  const [eventOpened, setEventOpened] = useState(false);

  return (
    <Stack gap="xl">
      <Button
        leftSection={<CalendarPlus size={18} />}
        onClick={() => setEventOpened(true)}
      >
        <Bilingual label={ui.events.addEvent} />
      </Button>
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="lg"
        verticalSpacing="lg"
      >
        <UpcomingEventsWidget />
        <EarningsWidget />
        <PaymentStatusWidget />
      </SimpleGrid>
      <QuickAddEventModal opened={eventOpened} onClose={() => setEventOpened(false)} />
    </Stack>
  );
}
