"use client";

import { Text } from "@mantine/core";

import type { Label } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";

type BilingualProps = {
  label: Label;
};

export function Bilingual({ label }: BilingualProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);

  if (uiLanguage === "ta") {
    return <>{label.ta || label.en}</>;
  }

  if (uiLanguage === "en") {
    return <>{label.en}</>;
  }

  return (
    <>
      {label.en}
      {label.ta ? (
        <Text component="span" size="xs" fw={400} style={{ opacity: 0.75, marginInlineStart: 6 }}>
          {label.ta}
        </Text>
      ) : null}
    </>
  );
}