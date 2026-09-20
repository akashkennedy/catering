"use client";

import { EmployeesManager } from "@/components/employees/EmployeesManager";
import { NoAccess } from "@/components/NoAccess";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuthStore } from "@/store/auth";

export default function EmployeesPage() {
  const hydrated = useHydrated();
  const canViewEmployees = useAuthStore((state) => state.permissions.canViewEmployees);

  if (!hydrated) {
    return null;
  }

  if (!canViewEmployees) {
    return <NoAccess />;
  }

  return <EmployeesManager />;
}