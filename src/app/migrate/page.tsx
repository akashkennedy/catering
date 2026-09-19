"use client";

import { MigrateManager } from "@/components/settings/MigrateManager";
import { useHydrated } from "@/hooks/useHydrated";

export default function MigratePage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <MigrateManager />;
}
