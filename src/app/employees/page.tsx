"use client";

import { EmployeesManager } from "@/components/employees/EmployeesManager";
import { useHydrated } from "@/hooks/useHydrated";

export default function EmployeesPage() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <EmployeesManager />;
}