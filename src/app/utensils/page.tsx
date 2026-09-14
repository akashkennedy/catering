"use client";

import { UtensilsManager } from "@/components/utensils/UtensilsManager";
import { useHydrated } from "@/hooks/useHydrated";

export default function UtensilsPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <UtensilsManager />;
}