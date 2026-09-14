import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DefaultLanguage = "en" | "ta";

type SettingsState = {
  defaultLanguage: DefaultLanguage;
  setDefaultLanguage: (language: DefaultLanguage) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultLanguage: "en",
      setDefaultLanguage: (language) => set({ defaultLanguage: language }),
    }),
    {
      name: "catering-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);