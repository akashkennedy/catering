import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "light",
      setMode: (mode) =>
        set((state) => (state.mode === mode ? state : { mode })),
      toggleTheme: () =>
        set((state) => ({ mode: state.mode === "dark" ? "light" : "dark" })),
    }),
    {
      name: "catering-theme",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted: unknown) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        if (state.mode !== "dark" && state.mode !== "light") {
          state.mode = "light";
        }
        return state;
      },
    }
  )
);
