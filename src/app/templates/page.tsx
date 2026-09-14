"use client";

import { TemplatesManager } from "@/components/templates/TemplatesManager";
import { useHydrated } from "@/hooks/useHydrated";

export default function TemplatesPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <TemplatesManager />;
}