"use client";

import { VendorsManager } from "@/components/vendors/VendorsManager";
import { useHydrated } from "@/hooks/useHydrated";

export default function VendorsPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <VendorsManager />;
}