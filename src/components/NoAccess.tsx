"use client";

import { Stack, Text } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";

/** Shown when the signed-in user lacks permission for a whole section. */
export function NoAccess() {
  return (
    <div className="dash-card">
      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.common.noAccess} />
        </Text>
      </Stack>
    </div>
  );
}
