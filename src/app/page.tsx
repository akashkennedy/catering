import { Button, Group, Stack, Text, Title } from "@mantine/core";

export default function HomePage() {
  return (
    <Stack gap="md">
      <Title order={1}>Dashboard</Title>
      <Text c="dimmed">Home page placeholder for the Catering CRM dashboard.</Text>
      <Group>
        <Button color="blue">Mantine styled button</Button>
        <button className="rounded bg-blue-600 px-4 py-2 font-medium text-white">
          Tailwind styled button
        </button>
      </Group>
    </Stack>
  );
}