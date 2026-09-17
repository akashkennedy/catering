import type { Metadata } from "next";
import { Stack, Title, Text } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";

export const metadata: Metadata = {
  title: ui.offline.title.en,
};

export default function OfflinePage() {
  return (
    <Stack align="center" gap="md" p="xl">
      <Title order={2}>
        <Bilingual label={ui.offline.title} />
      </Title>
      <Text c="dimmed">
        <Bilingual label={ui.offline.line1} />
      </Text>
      <Text c="dimmed" size="sm">
        <Bilingual label={ui.offline.line2} />
      </Text>
    </Stack>
  );
}