"use client";

import { IngredientsManager } from "@/components/ingredients/IngredientsManager";
import { useHydrated } from "@/hooks/useHydrated";

export default function IngredientsPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <IngredientsManager />;
}