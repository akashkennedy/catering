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
      setMode: (mode) => set({ mode }),
      toggleTheme: () =>
        set((state) => ({ mode: state.mode === "light" ? "dark" : "light" })),
    }),
    {
      name: "catering-theme",
      storage: createJSONStorage(() => localStorage),
    }
  )
);