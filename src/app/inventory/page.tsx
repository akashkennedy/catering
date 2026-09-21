"use client";

import { InventoryTracker } from "@/components/tracker/InventoryTracker";
import { useHydrated } from "@/hooks/useHydrated";

export default function InventoryTrackerPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <InventoryTracker />;
}
