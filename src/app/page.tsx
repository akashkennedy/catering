import { Button, Group, Stack, Text, Title } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";

export default function HomePage() {
  return (
    <Stack gap="md">
      <Title order={1}>
        <Bilingual label={ui.dashboard.title} />
      </Title>
      <Text c="dimmed">
        <Bilingual label={ui.dashboard.subtitle} />
      </Text>
      <Group>
        <Button color="blue">
          <Bilingual label={ui.dashboard.mantineButton} />
        </Button>
        <button className="rounded bg-blue-600 px-4 py-2 font-medium text-white">
          <Bilingual label={ui.dashboard.tailwindButton} />
        </button>
      </Group>
    </Stack>
  );
}