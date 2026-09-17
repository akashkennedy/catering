import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DefaultLanguage = "en" | "ta";
export type UiLanguage = "en" | "ta" | "both";

type SettingsState = {
  defaultLanguage: DefaultLanguage;
  setDefaultLanguage: (language: DefaultLanguage) => void;
  uiLanguage: UiLanguage;
  setUiLanguage: (language: UiLanguage) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultLanguage: "en",
      setDefaultLanguage: (language) => set({ defaultLanguage: language }),
      uiLanguage: "en",
      setUiLanguage: (language) => set({ uiLanguage: language }),
    }),
    {
      name: "catering-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);