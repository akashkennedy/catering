"use client";

import { PricingCalculator } from "@/components/calculator/PricingCalculator";
import { useHydrated } from "@/hooks/useHydrated";

export default function CalculatorPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <PricingCalculator />;
}