import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "auto";

const CYCLE: ThemeMode[] = ["light", "dark", "auto"];

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "auto",
      setMode: (mode) =>
        set((state) => (state.mode === mode ? state : { mode })),
      toggleTheme: () =>
        set((state) => {
          const next = CYCLE[(CYCLE.indexOf(state.mode) + 1) % CYCLE.length];
          return state.mode === next ? state : { mode: next };
        }),
    }),
    {
      name: "catering-theme",
      storage: createJSONStorage(() => localStorage),
    }
  )
);