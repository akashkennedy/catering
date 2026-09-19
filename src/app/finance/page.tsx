"use client";

import { Text } from "@mantine/core";

import { FinanceReport } from "@/components/finance/FinanceReport";
import { Bilingual } from "@/components/Bilingual";
import { ui } from "@/lib/i18n";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuthStore } from "@/store/auth";

export default function FinancePage() {
  const hydrated = useHydrated();
  const canViewFinance = useAuthStore((state) => state.permissions.canViewFinance);

  if (!hydrated) {
    return null;
  }

  if (!canViewFinance) {
    return (
      <Text c="dimmed">
        <Bilingual label={ui.finance.noAccess} />
      </Text>
    );
  }

  return <FinanceReport />;
}
