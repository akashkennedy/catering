"use client";

import { useState } from "react";
import { Button, Card, Divider, Stack, Text } from "@mantine/core";
import { CalendarPlus } from "lucide-react";

import { QuickAddEventModal } from "./QuickAddEventModal";
import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";

export function QuickAddWidget() {
  const [eventOpened, setEventOpened] = useState(false);

  return (
    <Card withBorder padding="md" radius="md" h="100%">
      <Stack gap="xs">
        <Text fw={600}>
          <Bilingual label={ui.dashboard.quickAdd} />
        </Text>
        <Text size="xs" c="dimmed">
          <Bilingual label={ui.dashboard.quickAddHint} />
        </Text>
        <Divider mb="xs" />
        <Button
          leftSection={<CalendarPlus size={18} />}
          h={48}
          fullWidth
          onClick={() => setEventOpened(true)}
        >
          <Bilingual label={ui.events.addEvent} />
        </Button>
      </Stack>

      <QuickAddEventModal opened={eventOpened} onClose={() => setEventOpened(false)} />
    </Card>
  );
}