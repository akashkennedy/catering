import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DefaultLanguage = "en" | "ta";
export type UiLanguage = "en" | "ta";

export type AlertKey =
  | "enquiryMenus"
  | "confirmInvoice"
  | "paymentReceived"
  | "feedbackRequest"
  | "eventEve"
  | "paymentOverdue";

export const DEFAULT_ALERTS: Record<AlertKey, boolean> = {
  enquiryMenus: true,
  confirmInvoice: true,
  paymentReceived: true,
  feedbackRequest: true,
  eventEve: true,
  paymentOverdue: true,
};

const ALERT_KEYS = Object.keys(DEFAULT_ALERTS) as AlertKey[];

type SettingsState = {
  defaultLanguage: DefaultLanguage;
  setDefaultLanguage: (language: DefaultLanguage) => void;
  uiLanguage: UiLanguage;
  setUiLanguage: (language: UiLanguage) => void;
  alerts: Record<AlertKey, boolean>;
  setAlert: (key: AlertKey, value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultLanguage: "en",
      setDefaultLanguage: (language) => set({ defaultLanguage: language }),
      uiLanguage: "en",
      setUiLanguage: (language) => set({ uiLanguage: language }),
      alerts: { ...DEFAULT_ALERTS },
      setAlert: (key, value) =>
        set((state) => ({ alerts: { ...state.alerts, [key]: value } })),
    }),
    {
      name: "catering-settings",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted: unknown) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        if (state.uiLanguage !== "ta" && state.uiLanguage !== "en") {
          state.uiLanguage = "en";
        }
        if (state.defaultLanguage !== "ta" && state.defaultLanguage !== "en") {
          state.defaultLanguage = "en";
        }
        const stored = state.alerts as Record<string, unknown> | undefined;
        const alerts: Record<string, boolean> = {};
        for (const key of ALERT_KEYS) {
          alerts[key] = stored?.[key] === false ? false : true;
        }
        state.alerts = alerts;
        return state;
      },
    }
  )
);