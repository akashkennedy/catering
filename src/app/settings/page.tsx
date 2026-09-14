"use client";

import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useHydrated } from "@/hooks/useHydrated";

export default function SettingsPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <SettingsPanel />;
}