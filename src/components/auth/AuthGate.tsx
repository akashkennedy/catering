"use client";

import { useEffect } from "react";

import { Loader, Stack } from "@mantine/core";

import { useAuthStore } from "@/store/auth";
import { useHydrated } from "@/hooks/useHydrated";
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
      <Stack align="center" justify="center" mih="100dvh" p="md">
        <Loader size="xl" variant="oval" aria-label="Loading" />
      </Stack>
    );
  }

  if (status !== "authenticated") {
    return <LoginForm />;
  }

  return <>{children}</>;
}
