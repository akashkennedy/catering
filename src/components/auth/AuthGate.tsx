"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";
import { useHydrated } from "@/hooks/useHydrated";
import { CardSkeleton } from "@/components/LoadingSkeletons";
import { LoginForm } from "./LoginForm";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const status = useAuthStore((state) => state.status);
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  if (!hydrated || status === "loading") {
    return (
      <div style={{ padding: 16 }}>
        <CardSkeleton />
      </div>
    );
  }

  if (status !== "authenticated") {
    return <LoginForm />;
  }

  return <>{children}</>;
}
