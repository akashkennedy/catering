"use client";

import { SegmentedControl } from "@mantine/core";

import { Bilingual } from "@/components/Bilingual";
import { useTheme } from "@/hooks/useTheme";
import { ui } from "@/lib/i18n";
import type { ThemeMode } from "@/store/theme";

export function ThemeControl() {
  const { mode, setMode, resolved } = useTheme();

  return (
    <SegmentedControl
      fullWidth
      size="xs"
      value={mode}
      onChange={(value) => setMode(value as ThemeMode)}
      disabled={!resolved}
      data={[
        { label: <Bilingual label={ui.settings.light} />, value: "light" },
        { label: <Bilingual label={ui.settings.dark} />, value: "dark" },
        { label: <Bilingual label={ui.settings.auto} />, value: "auto" },
      ]}
    />
  );
}