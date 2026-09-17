"use client";

import { useState } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { CalendarPlus } from "lucide-react";

import { QuickAddEventModal } from "./QuickAddEventModal";
import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";

export function QuickAddWidget() {
  const [eventOpened, setEventOpened] = useState(false);

  return (
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <Stack gap="xs" style={{ flex: 1 }}>
        <Text size="sm" fw={600} c="dimmed">
          <Bilingual label={ui.dashboard.quickAdd} />
        </Text>
        <Text size="xs" c="dimmed">
          <Bilingual label={ui.dashboard.quickAddHint} />
        </Text>
        <div style={{ flex: 1 }} />
        <Button
          leftSection={<CalendarPlus size={18} />}
          h={48}
          fullWidth
          onClick={() => setEventOpened(true)}
          variant="filled"
          color="turmeric"
        >
          <Bilingual label={ui.events.addEvent} />
        </Button>
      </Stack>

      <QuickAddEventModal opened={eventOpened} onClose={() => setEventOpened(false)} />
    </div>
  );
}