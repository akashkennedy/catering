"use client";

import { Text } from "@mantine/core";

import type { Label } from "@/lib/i18n";

type BilingualProps = {
  label: Label;
};

export function Bilingual({ label }: BilingualProps) {
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