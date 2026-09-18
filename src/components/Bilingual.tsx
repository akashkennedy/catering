"use client";

import type { Label } from "@/lib/i18n";
import { preferredText } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";

type BilingualProps = {
  label: Label;
};

export function Bilingual({ label }: BilingualProps) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);

  return <>{preferredText(label, uiLanguage)}</>;
}