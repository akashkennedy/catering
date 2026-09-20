"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Loader, Stack, Text, Title } from "@mantine/core";

import { useAuthStore } from "@/store/auth";
import { useHydrated } from "@/hooks/useHydrated";
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
      <Stack align="center" justify="center" mih="100dvh" gap="md" p="md">
        <Title order={2}>Catering</Title>
        <Loader size="lg" />
        <Text size="sm" c="dimmed">
          Loading…
        </Text>
      </Stack>
    );
  }

  if (status !== "authenticated") {
    return <LoginForm />;
  }

  return <>{children}</>;
}
