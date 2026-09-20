"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useAuthStore } from "@/store/auth";
import { useHydrated } from "@/hooks/useHydrated";
import { CardSkeleton } from "@/components/LoadingSkeletons";
import { LoginForm } from "./LoginForm";

/** Public landing page bypasses the login gate entirely. */
export function isPublicSitePath(pathname: string): boolean {
  return pathname === "/site" || pathname.startsWith("/site/");
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const status = useAuthStore((state) => state.status);
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  if (isPublicSitePath(pathname ?? "")) {
    return <>{children}</>;
  }

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
