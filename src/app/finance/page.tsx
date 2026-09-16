"use client";

import { FinanceReport } from "@/components/finance/FinanceReport";
import { useHydrated } from "@/hooks/useHydrated";

export default function FinancePage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <FinanceReport />;
}