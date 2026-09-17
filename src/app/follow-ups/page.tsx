"use client";

import { RemindersWidget } from "@/components/dashboard/RemindersWidget";
import { useHydrated } from "@/hooks/useHydrated";

export default function FollowUpsPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <RemindersWidget />;
}
