"use client";

import { MantineProvider } from "@mantine/core";

import { themeColorSchemeManager } from "@/lib/themeColorSchemeManager";
import { theme } from "@/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      colorSchemeManager={themeColorSchemeManager}
      defaultColorScheme="light"
    >
      {children}
    </MantineProvider>
  );
}