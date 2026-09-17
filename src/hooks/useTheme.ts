"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useThemeStore, type ThemeMode } from "@/store/theme";

export function useTheme() {
  const hydrated = useHydrated();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return {
    mode: hydrated ? mode : "light",
    setMode,
    toggleTheme,
    resolved: hydrated,
  } as const satisfies {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
    resolved: boolean;
  };
}