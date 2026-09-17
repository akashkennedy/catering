"use client";

import { Group, Switch, Text } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { useTheme } from "@/hooks/useTheme";
import { ui } from "@/lib/i18n";

export function ThemeControl() {
  const { mode, toggleTheme, resolved } = useTheme();

  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" fw={500}>
        <Bilingual label={ui.settings.dark} />
      </Text>
      <Switch
        checked={mode === "dark"}
        onChange={toggleTheme}
        disabled={!resolved}
        aria-label="Toggle dark mode"
      />
    </Group>
  );
}
