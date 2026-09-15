import type { Metadata } from "next";
import { Stack, Title, Text } from "@mantine/core";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <Stack align="center" gap="md" p="xl">
      <Title order={2}>You are offline</Title>
      <Text c="dimmed">
        The app shell is available. Your localStorage data can still be accessed.
      </Text>
      <Text c="dimmed" size="sm">
        Reconnect to the network to load all features.
      </Text>
    </Stack>
  );
}
