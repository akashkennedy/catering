import type { MantineColorSchemeManager } from "@mantine/core";

import { useThemeStore, type ThemeMode } from "@/store/theme";

const STORAGE_KEY = "catering-theme";

function readPersistedMode(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { mode?: ThemeMode } };
    const mode = parsed?.state?.mode;
    return mode === "light" || mode === "dark" ? mode : null;
  } catch {
    return null;
  }
}

let unsubscribeStore: (() => void) | undefined;

export const themeColorSchemeManager: MantineColorSchemeManager = {
  get: (defaultValue) => readPersistedMode() ?? defaultValue,
  set: (value) => {
    useThemeStore.getState().setMode(value === "dark" ? "dark" : "light");
  },
  subscribe: (onUpdate) => {
    unsubscribeStore = useThemeStore.subscribe((state) => {
      onUpdate(state.mode);
    });
  },
  unsubscribe: () => {
    unsubscribeStore?.();
    unsubscribeStore = undefined;
  },
  clear: () => {
    useThemeStore.getState().setMode("light");
  },
};