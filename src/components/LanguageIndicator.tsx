"use client";

import { Group, Text } from "@mantine/core";
import { Languages } from "lucide-react";

import { ui } from "@/lib/i18n";

export function LanguageIndicator() {
  return (
    <Group gap={8} wrap="nowrap">
      <Languages size={16} aria-hidden />
      <Text size="sm" fw={600}>
        {ui.settings.english.en}
      </Text>
      <Text size="sm" c="dimmed" aria-hidden>
        ·
      </Text>
      <Text size="sm" fw={600}>
        {ui.settings.tamil.ta}
      </Text>
    </Group>
  );
}