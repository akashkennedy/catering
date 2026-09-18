"use client";

import { useAuthStore } from "@/store/auth";
import { useHydrated } from "@/hooks/useHydrated";
import { CardSkeleton } from "@/components/LoadingSkeletons";
import { LoginForm } from "./LoginForm";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const authed = useAuthStore((state) => state.authed);

  if (!hydrated) {
    return (
      <div style={{ padding: 16 }}>
        <CardSkeleton />
      </div>
    );
  }

  if (!authed) {
    return <LoginForm />;
  }

  return <>{children}</>;
}
