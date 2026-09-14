"use client";

import { EventDetail } from "@/components/events/EventDetail";
import { useHydrated } from "@/hooks/useHydrated";

export default function EventDetailPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <EventDetail />;
}